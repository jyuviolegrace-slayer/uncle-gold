import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { Player, NPC } from '../world/characters';
import { Item } from '../world';
import { WorldMenu } from '../world/WorldMenu';
import { DATA_MANAGER_STORE_KEYS, dataManager } from '../utils/data-manager';

/**
 * Overworld Scene - Exact replica of legacy WorldScene functionality
 * Handles player movement, tilemap rendering, collisions, wild encounters, NPC interactions
 */
export class Overworld extends Scene {
  private player: Player | null = null;
  private npcs: NPC[] = [];
  private items: Item[] = [];
  private menu: WorldMenu | null = null;
  private mapId: string = 'MAIN_1_LEVEL';
  private collisionLayer: Phaser.Tilemaps.TilemapLayer | null = null;
  private encounterLayers: Phaser.Tilemaps.TilemapLayer[] = [];
  private wildMonsterEncountered: boolean = false;
  private isProcessingNpcEvent: boolean = false;
  private lastNpcEventHandledIndex: number = -1;
  private npcPlayerIsInteractingWith: NPC | null = null;

  constructor() {
    super('Overworld');
  }

  init(data: any) {
    if (data?.mapId) {
      this.mapId = data.mapId;
    }

    // Initialize game state similar to legacy
    this.wildMonsterEncountered = false;
    this.npcPlayerIsInteractingWith = null;
    this.items = [];
    this.lastNpcEventHandledIndex = -1;
    this.isProcessingNpcEvent = false;
    this.encounterLayers = [];
  }

  create() {
    try {
      // Create map similar to legacy WorldScene
      this.createMap();
      
      // Create player
      this.createPlayer();
      
      // Create NPCs
      this.createNPCs();
      
      // Create items
      this.createItems();
      
      // Create menu
      this.createMenu();
      
      // Setup input
      this.setupInput();
      
      // Setup event listeners
      this.setupEventListeners();

      EventBus.emit('current-scene-ready', this);
    } catch (error) {
      console.error('Error creating Overworld scene:', error);
      this.scene.start('Title');
    }
  }

  private createMap() {
    // Load tilemap similar to legacy approach
    const map = this.make.tilemap({ key: this.mapId });
    
    // Add tilesets
    const tileset = map.addTilesetImage('collision', 'WORLD_COLLISION');
    if (!tileset) {
      console.error('Failed to load collision tileset');
      return;
    }

    // Create collision layer
    this.collisionLayer = map.createLayer('Collision', tileset, 0, 0);
    if (this.collisionLayer) {
      this.collisionLayer.setAlpha(0.5).setDepth(2);
    }

    // Create encounter areas
    this.createEncounterAreas(map);

    // Set camera bounds
    if (!this.mapId.includes('INTERIOR')) {
      this.cameras.main.setBounds(0, 0, 2560, 5184);
    }
    this.cameras.main.setZoom(0.8);

    // Add background
    this.add.image(0, 0, `${this.mapId.replace('_LEVEL', '')}_BACKGROUND`, 0).setOrigin(0);

    // Add foreground
    this.add.image(0, 0, `${this.mapId.replace('_LEVEL', '')}_FOREGROUND`, 0).setOrigin(0);
  }

  private createPlayer() {
    if (!this.collisionLayer) return;

    const playerPosition = dataManager.store.get(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION) || { x: 400, y: 300 };
    const playerDirection = dataManager.store.get(DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION) || 'DOWN';

    this.player = new Player({
      scene: this,
      position: playerPosition,
      direction: playerDirection,
      collisionLayer: this.collisionLayer,
      spriteGridMovementFinishedCallback: () => {
        this.handlePlayerMovementUpdate();
      },
      spriteChangedDirectionCallback: () => {
        this.handlePlayerDirectionUpdate();
      },
      otherCharactersToCheckForCollisionsWith: this.npcs,
      objectsToCheckForCollisionsWith: this.items,
      spriteGridMovementStartedCallback: (position) => {
        this.handlePlayerMovementStarted(position);
      },
    });

    this.cameras.main.startFollow(this.player.sprite);
  }

  private createNPCs() {
    // Create NPCs similar to legacy approach
    const npcData = [
      { id: 'npc1', x: 500, y: 400, name: 'Villager', dialogue: ['Hello, traveler!'] },
      { id: 'npc2', x: 600, y: 350, name: 'Merchant', dialogue: ['Welcome to our town!'] },
    ];

    npcData.forEach((data, index) => {
      const npc = new NPC({
        scene: this,
        position: { x: data.x, y: data.y },
        direction: 'DOWN',
        npcId: data.id,
        name: data.name,
        movementPattern: 'IDLE',
        dialogue: data.dialogue,
        frame: 0,
        npcPath: { 0: { x: data.x, y: data.y } },
        events: [],
        animationKeyPrefix: 'NPC',
        id: index,
        collisionLayer: this.collisionLayer!,
      });
      
      this.npcs.push(npc);
      
      if (this.player) {
        npc.addCharacterToCheckForCollisionsWith(this.player);
      }
    });
  }

  private createItems() {
    // Create items similar to legacy approach
    const itemData = [
      { id: 'potion1', x: 450, y: 380, name: 'Potion' },
      { id: 'potion2', x: 550, y: 420, name: 'Super Potion' },
    ];

    itemData.forEach((data, index) => {
      const item = new Item({
        scene: this,
        position: { x: data.x, y: data.y },
        itemId: data.id,
        id: index,
        name: data.name,
      });
      
      this.items.push(item);
    });
  }

  private createMenu() {
    this.menu = new WorldMenu(this);
  }

  private createEncounterAreas(map: Phaser.Tilemaps.Tilemap) {
    // Create encounter layers similar to legacy
    const encounterLayerNames = ['Grass', 'Water', 'Cave'];
    
    encounterLayerNames.forEach(layerName => {
      const layer = map.getLayer(layerName);
      if (layer) {
        this.encounterLayers.push(layer.tilemapLayer);
      }
    });
  }

  private setupInput() {
    // Keyboard input handling similar to legacy
    const cursors = this.input.keyboard?.createCursorKeys();
    
    // Movement
    this.input.keyboard?.on('keydown-UP', () => {
      if (this.player && !this.isPlayerInputLocked()) {
        this.player.moveCharacter('UP', cursors?.shift?.isDown || false);
      }
    });

    this.input.keyboard?.on('keydown-DOWN', () => {
      if (this.player && !this.isPlayerInputLocked()) {
        this.player.moveCharacter('DOWN', cursors?.shift?.isDown || false);
      }
    });

    this.input.keyboard?.on('keydown-LEFT', () => {
      if (this.player && !this.isPlayerInputLocked()) {
        this.player.moveCharacter('LEFT', cursors?.shift?.isDown || false);
      }
    });

    this.input.keyboard?.on('keydown-RIGHT', () => {
      if (this.player && !this.isPlayerInputLocked()) {
        this.player.moveCharacter('RIGHT', cursors?.shift?.isDown || false);
      }
    });

    // Interaction
    this.input.keyboard?.on('keydown-SPACE', () => {
      if (this.player && !this.player.isMoving && !this.menu?.isVisible) {
        this.handlePlayerInteraction();
      }
    });

    // Menu
    this.input.keyboard?.on('keydown-ENTER', () => {
      if (this.player && !this.player.isMoving) {
        if (this.menu?.isVisible) {
          this.menu.hide();
        } else {
          this.menu?.show();
        }
      }
    });

    // Menu navigation
    this.input.keyboard?.on('keydown-Z', () => {
      if (this.menu?.isVisible) {
        this.menu.handlePlayerInput('OK');
        this.handleMenuSelection();
      }
    });

    this.input.keyboard?.on('keydown-X', () => {
      if (this.menu?.isVisible) {
        this.menu.hide();
      }
    });
  }

  private handlePlayerInteraction() {
    if (!this.player) return;

    // Get target position based on player direction
    const targetPosition = this.getTargetPosition(this.player.sprite.x, this.player.sprite.y, this.player.direction);

    // Check for nearby NPCs
    const nearbyNpc = this.npcs.find(npc => 
      Math.abs(npc.sprite.x - targetPosition.x) < 32 && 
      Math.abs(npc.sprite.y - targetPosition.y) < 32
    );

    if (nearbyNpc) {
      nearbyNpc.facePlayer(this.player.direction);
      nearbyNpc.isTalkingToPlayer = true;
      this.npcPlayerIsInteractingWith = nearbyNpc;
      this.handleNpcInteraction();
      return;
    }

    // Check for nearby items
    const nearbyItem = this.items.find(item => 
      Math.abs(item.position.x - targetPosition.x) < 32 && 
      Math.abs(item.position.y - targetPosition.y) < 32
    );

    if (nearbyItem) {
      this.handleItemCollection(nearbyItem);
    }
  }

  private handleNpcInteraction() {
    if (!this.npcPlayerIsInteractingWith) return;

    const npc = this.npcPlayerIsInteractingWith;
    
    // Show NPC dialogue
    EventBus.emit('dialog:show', {
      messages: npc.dialogue,
      onComplete: () => {
        npc.isTalkingToPlayer = false;
        this.npcPlayerIsInteractingWith = null;
      }
    });
  }

  private handleItemCollection(item: Item) {
    // Add item to player inventory
    EventBus.emit('item:collected', {
      itemId: item.itemId,
      itemName: item.name
    });

    // Remove item from world
    const itemIndex = this.items.indexOf(item);
    if (itemIndex > -1) {
      this.items.splice(itemIndex, 1);
    }

    // Show collection message
    EventBus.emit('dialog:show', {
      messages: [`You found a ${item.name}!`]
    });
  }

  private handleMenuSelection() {
    if (!this.menu) return;

    switch (this.menu.selectedMenuOption) {
      case 'SAVE':
        this.menu.hide();
        dataManager.saveData();
        EventBus.emit('dialog:show', {
          messages: ['Game progress has been saved']
        });
        break;

      case 'MONSTERS':
        this.menu.hide();
        this.scene.pause();
        this.scene.launch('Party', { previousScene: 'Overworld' });
        break;

      case 'BAG':
        this.menu.hide();
        this.scene.pause();
        this.scene.launch('Inventory', { previousScene: 'Overworld' });
        break;

      case 'EXIT':
        this.menu.hide();
        this.scene.start('Title');
        break;
    }
  }

  private getTargetPosition(x: number, y: number, direction: string): { x: number; y: number } {
    const tileSize = 32;
    switch (direction) {
      case 'UP':
        return { x, y: y - tileSize };
      case 'DOWN':
        return { x, y: y + tileSize };
      case 'LEFT':
        return { x: x - tileSize, y };
      case 'RIGHT':
        return { x: x + tileSize, y };
      default:
        return { x, y };
    }
  }

  private isPlayerInputLocked(): boolean {
    return this.wildMonsterEncountered || this.isProcessingNpcEvent;
  }

  private handlePlayerMovementUpdate() {
    // Check for wild encounters
    if (this.encounterLayers.length > 0 && Math.random() < 0.1) {
      this.startWildEncounter();
    }
  }

  private handlePlayerDirectionUpdate() {
    // Handle direction-specific logic
  }

  private handlePlayerMovementStarted(position: { x: number; y: number }) {
    // Save player position
    dataManager.store.set(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION, position);
  }

  private startWildEncounter() {
    this.wildMonsterEncountered = true;
    
    // Transition to battle scene
    this.scene.pause();
    this.scene.launch('Battle', {
      previousScene: 'Overworld',
      encounterType: 'wild'
    });
  }

  private setupEventListeners() {
    // Listen for battle end
    EventBus.on('battle:ended', () => {
      this.wildMonsterEncountered = false;
      this.scene.resume();
    });

    // Listen for scene transitions
    EventBus.on('world:change-area', (data: { mapId: string }) => {
      this.mapId = data.mapId;
      this.scene.restart();
    });
  }

  update(time: number, delta: number) {
    if (!this.player) return;

    // Update player
    this.player.update(time);

    // Update NPCs
    this.npcs.forEach(npc => {
      npc.update(time);
    });

    // Update items
    this.items.forEach(item => {
      item.update(time);
    });
  }

  shutdown() {
    EventBus.off('battle:ended');
    EventBus.off('world:change-area');
    
    if (this.player) {
      this.player.destroy();
    }
    
    this.npcs.forEach(npc => npc.destroy());
    this.items.forEach(item => item.destroy());
    
    if (this.menu) {
      this.menu.destroy();
    }
  }
}