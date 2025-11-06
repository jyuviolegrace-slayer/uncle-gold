import { BaseScene } from './common/BaseScene';
import { SceneKeys } from '../assets';
import { Direction, Coordinate, NpcEventType, GameEventType, EncounterTileType } from '../models/common';
import { Player, MapManager, NPC, Item, EventZoneManager, NpcMovementPattern } from '../world';
import { DataManager, DataManagerStoreKeys } from '../services/DataManager';
import { EventBus } from '../EventBus';
import { TextureKeys } from '../assets/TextureKeys';
import { TILE_SIZE } from '../world/constants';
import { dataLoader } from '../data/DataLoader';
import { weightedRandom } from '../utils/weightedRandom';
import { getTargetPositionFromGameObjectPositionAndDirection } from '../world/utils/gridUtils';

export interface OverworldSceneData {
  isPlayerKnockedOut?: boolean;
  area?: string;
  isInterior?: boolean;
}

export class Overworld extends BaseScene {
  private player: Player | undefined;
  private mapManager: MapManager | undefined;
  private collisionLayer: Phaser.Tilemaps.TilemapLayer | undefined;
  private entranceLayer: Phaser.Tilemaps.ObjectLayer | undefined;
  private sceneData: OverworldSceneData;
  private npcs: NPC[] = [];
  private items: Item[] = [];
  private eventZoneManager: EventZoneManager | undefined;
  private npcPlayerIsInteractingWith: NPC | undefined;
  private lastNpcEventHandledIndex: number = -1;
  private isProcessingNpcEvent: boolean = false;
  private currentCutSceneId: number | undefined;
  private isProcessingCutSceneEvent: boolean = false;
  private lastCutSceneEventHandledIndex: number = -1;
  private encounterLayers: Phaser.Tilemaps.TilemapLayer[] = [];
  private encounterZonePlayerIsEntering: Phaser.Tilemaps.TilemapLayer | undefined;
  private specialEncounterTileImageGameObjectGroup: Phaser.GameObjects.Group;
  private signLayer: Phaser.Tilemaps.ObjectLayer | undefined;
  private rectangleForOverlapCheck1: Phaser.Geom.Rectangle;
  private rectangleForOverlapCheck2: Phaser.Geom.Rectangle;
  private rectangleOverlapResult: Phaser.Geom.Rectangle;
  private debugEnabled: boolean = false;

  constructor() {
    super(SceneKeys.WORLD);
    this.sceneData = {};
    this.debugEnabled = false; // This should come from config in a real implementation
    this.rectangleForOverlapCheck1 = new Phaser.Geom.Rectangle();
    this.rectangleForOverlapCheck2 = new Phaser.Geom.Rectangle();
    this.rectangleOverlapResult = new Phaser.Geom.Rectangle();
  }

  init(data?: OverworldSceneData): void {
    super.init(data);
    this.sceneData = data || {};

    // Initialize DataManager for this scene
    if (!this.registry.get('dataManager')) {
      const dataManager = new DataManager();
      this.registry.set('dataManager', dataManager);
    }

    // Handle scene data defaults and knockout logic
    const dataManager = this.registry.get('dataManager') as DataManager;
    
    const area = this.sceneData?.area || dataManager.dataStore.get(DataManagerStoreKeys.PLAYER_LOCATION).area;
    const isInterior = this.sceneData?.isInterior !== undefined 
      ? this.sceneData.isInterior 
      : dataManager.dataStore.get(DataManagerStoreKeys.PLAYER_LOCATION).isInterior;
    const isPlayerKnockedOut = this.sceneData?.isPlayerKnockedOut || false;

    this.sceneData = {
      area,
      isInterior,
      isPlayerKnockedOut,
    };

    // Update player location and handle knockout respawn
    if (this.sceneData.isPlayerKnockedOut && this.sceneData.area) {
      this.handleKnockoutRespawn();
    }

    // Handle new game setup
    const isNewGame = !(dataManager.dataStore.get(DataManagerStoreKeys.GAME_STARTED) || false);
    if (isNewGame && this.sceneData.area) {
      this.handleNewGameSetup();
    }

    // Update stored player location
    dataManager.dataStore.set(DataManagerStoreKeys.PLAYER_LOCATION, {
      area: this.sceneData.area,
      isInterior: this.sceneData.isInterior,
    });
  }

  create(): void {
    super.create();
    
    if (!this.sceneData.area) {
      console.error('[Overworld:create] No area specified in scene data');
      return;
    }

    // Initialize MapManager
    this.mapManager = new MapManager(this);

    // Load the map
    const mapConfig = this.mapManager.getMapConfiguration(this.sceneData.area);
    if (!mapConfig) {
      console.error(`[Overworld:create] No map configuration found for area: ${this.sceneData.area}`);
      return;
    }

    const map = this.mapManager.getTilemap(mapConfig.mapKey);
    
    // Create collision layer
    this.collisionLayer = this.createCollisionLayer(map);
    if (!this.collisionLayer) {
      console.error('[Overworld:create] Failed to create collision layer');
      return;
    }

    // Create entrance layer
    this.entranceLayer = map.getObjectLayer('Scene-Transitions') || undefined;

    // Create sign layer
    this.signLayer = map.getObjectLayer('Sign') || undefined;

    // Create encounter areas
    this.createEncounterAreas(map);

    // Setup camera
    this.setupCamera(mapConfig);

    // Create background
    if (mapConfig.backgroundKey) {
      this.add.image(0, 0, mapConfig.backgroundKey, 0).setOrigin(0);
    }

    // Create items
    this.createItems(map);

    // Create NPCs
    this.createNPCs(map);

    // Create player
    this.createPlayer();

    // Create event zones
    this.eventZoneManager = new EventZoneManager(this, this.debugEnabled);
    this.createEventZones(map);

    // Create foreground (depth layering)
    if (mapConfig.foregroundKey) {
      this.add.image(0, 0, mapConfig.foregroundKey, 0).setOrigin(0);
    }

    // Create special encounter tile group
    this.specialEncounterTileImageGameObjectGroup = this.add.group({ classType: Phaser.GameObjects.Image });

    // Emit area change event for React HUD
    EventBus.emit('area:changed', {
      area: this.sceneData.area,
      isInterior: this.sceneData.isInterior,
    });

    // Mark game as started
    const dataManager = this.registry.get('dataManager') as DataManager;
    dataManager.dataStore.set(DataManagerStoreKeys.GAME_STARTED, true);

    // Start background music
    this.audioManager.playBackgroundMusic('MAIN');

    // Fade in
    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }

  update(time: number, delta: number): void {
    super.update(time, delta);

    if (!this.player || this.isInputLocked()) {
      return;
    }

    // Get input from InputManager
    const inputState = this.inputManager.getInputState();
    
    // Handle movement
    if (inputState.directionDown !== Direction.NONE) {
      this.player.moveCharacter(inputState.directionDown, inputState.shiftDown);
    }

    // Handle interactions
    if (inputState.confirmPressed && !this.player.moving) {
      this.handlePlayerInteraction();
    }

    // Update player
    this.player.update(time);

    // Update NPCs
    this.npcs.forEach(npc => {
      npc.update(time);
    });

    // Handle cutscene events
    if (this.currentCutSceneId !== undefined && !this.isProcessingCutSceneEvent) {
      this.handleCutSceneInteraction();
    }
  }

  private createCollisionLayer(map: Phaser.Tilemaps.Tilemap): Phaser.Tilemaps.TilemapLayer | undefined {
    try {
      const collisionTiles = map.addTilesetImage('collision', TextureKeys.WORLD_COLLISION);
      if (!collisionTiles) {
        console.warn('[Overworld:createCollisionLayer] No collision tileset found');
        return undefined;
      }

      const collisionLayer = map.createLayer('Collision', collisionTiles, 0, 0);
      if (!collisionLayer) {
        console.warn('[Overworld:createCollisionLayer] No Collision layer found in map');
        return undefined;
      }

      collisionLayer.setAlpha(0).setDepth(2); // Set alpha to 0 for invisible collision
      return collisionLayer;
    } catch (error) {
      console.error('[Overworld:createCollisionLayer] Error creating collision layer:', error);
      return undefined;
    }
  }

  private setupCamera(mapConfig: any): void {
    // Set camera bounds
    if (mapConfig.cameraBounds) {
      this.cameras.main.setBounds(
        mapConfig.cameraBounds.x,
        mapConfig.cameraBounds.y,
        mapConfig.cameraBounds.width,
        mapConfig.cameraBounds.height
      );
    }

    // Set zoom
    if (mapConfig.defaultZoom) {
      this.cameras.main.setZoom(mapConfig.defaultZoom);
    }
  }

  private createPlayer(): void {
    if (!this.mapManager || !this.sceneData.area) {
      console.error('[Overworld:createPlayer] MapManager or area not available');
      return;
    }

    const dataManager = this.registry.get('dataManager') as DataManager;
    const mapConfig = this.mapManager.getMapConfiguration(this.sceneData.area);
    
    if (!mapConfig) {
      console.error('[Overworld:createPlayer] No map configuration found');
      return;
    }

    // Get player position from DataManager or map spawn location
    let playerPosition = dataManager.dataStore.get(DataManagerStoreKeys.PLAYER_POSITION) as Coordinate;
    const playerDirection = dataManager.dataStore.get(DataManagerStoreKeys.PLAYER_DIRECTION) as Direction;

    // If position is default (0,0), try to get spawn location from map
    if (playerPosition.x === 0 && playerPosition.y === 0) {
      const spawnLocation = this.mapManager.getPlayerSpawnLocation(mapConfig.mapKey);
      if (spawnLocation) {
        playerPosition = spawnLocation;
        dataManager.dataStore.set(DataManagerStoreKeys.PLAYER_POSITION, playerPosition);
      }
    }

    // Create player instance
    this.player = new Player({
      scene: this,
      position: playerPosition,
      direction: playerDirection,
      collisionLayer: this.collisionLayer!,
      entranceLayer: this.entranceLayer,
      otherCharactersToCheckForCollisionsWith: this.npcs,
      objectsToCheckForCollisionsWith: this.items,
      spriteGridMovementFinishedCallback: () => {
        this.handlePlayerMovementFinished();
      },
      spriteChangedDirectionCallback: () => {
        this.handlePlayerDirectionChanged();
      },
      spriteGridMovementStartedCallback: (position) => {
        this.handlePlayerMovementStarted(position);
      },
      enterEntranceCallback: (entranceName, entranceId, isBuildingEntrance) => {
        this.handleEntranceEntered(entranceName, entranceId, isBuildingEntrance);
      },
    });

    // Start camera follow
    this.cameras.main.startFollow(this.player.sprite);
  }

  private handlePlayerMovementFinished(): void {
    // Save player position to DataManager
    if (this.player) {
      const dataManager = this.registry.get('dataManager') as DataManager;
      dataManager.dataStore.set(DataManagerStoreKeys.PLAYER_POSITION, {
        x: this.player.sprite.x,
        y: this.player.sprite.y,
      });
    }
  }

  private handlePlayerDirectionChanged(): void {
    // Save player direction to DataManager
    if (this.player) {
      const dataManager = this.registry.get('dataManager') as DataManager;
      dataManager.dataStore.set(DataManagerStoreKeys.PLAYER_DIRECTION, this.player.currentDirection);
    }
  }

  private handlePlayerMovementStarted(position: Coordinate): void {
    // Check for encounter zones
    this.handlePlayerMovementInEncounterZone(position);
    
    // Store the encounter zone player is entering for later use
    this.encounterZonePlayerIsEntering = undefined;
    
    if (this.encounterLayers.length === 0) {
      return;
    }

    let encounterTile: Phaser.Tilemaps.Tile | undefined;
    this.encounterLayers.some((encounterLayer) => {
      encounterTile = encounterLayer.getTileAtWorldXY(position.x, position.y, true);
      if (encounterTile.index === -1) {
        return false;
      }
      this.encounterZonePlayerIsEntering = encounterLayer;
      return true;
    });

    if (this.encounterZonePlayerIsEntering === undefined) {
      if (this.player && this.player.currentDirection === Direction.DOWN) {
        // If player is moving in the down direction, hide current tile so player does not move under it
        this.hideSpecialEncounterTiles();
      }
      return;
    }

    console.log(`[Overworld:handlePlayerMovementStarted] player is moving to an encounter zone`);
    // Check the tile type for the encounter layer the player is moving through and play related effects
    this.handleEncounterTileTypeEffects(this.encounterZonePlayerIsEntering, encounterTile!, this.player!.currentDirection);
  }

  private handlePlayerInteraction(): void {
    if (!this.player) {
      return;
    }

    // Get players current direction and check 1 tile over in that direction to see if there is an object that can be interacted with
    const { x, y } = this.player.sprite;
    const targetPosition = getTargetPositionFromGameObjectPositionAndDirection({ x, y }, this.player.currentDirection);

    // Check for sign, and display appropriate message if player is not facing up
    const nearbySign = this.signLayer?.objects.find((object) => {
      if (!object.x || !object.y) {
        return false;
      }

      // In Tiled, the x value is how far the object starts from the left, and the y is the bottom of tiled object that is being added
      return object.x === targetPosition.x && object.y - TILE_SIZE === targetPosition.y;
    });

    if (nearbySign) {
      const signId = this.getObjectProperty(nearbySign, 'id');
      const sign = dataLoader.getSignData(signId);

      const usePlaceholderText = this.player.currentDirection !== Direction.UP;
      let textToShow = 'You cannot read this sign from this angle.';
      if (!usePlaceholderText && sign) {
        textToShow = sign.message;
      }
      
      // Show placeholder dialog for now - will be replaced with DialogScene in Ticket 11
      console.log(`[Overworld:handlePlayerInteraction] Sign: ${textToShow}`);
      EventBus.emit('dialog:show', [textToShow]);
      return;
    }

    const nearbyNpc = this.npcs.find((npc) => {
      return npc.sprite.x === targetPosition.x && npc.sprite.y === targetPosition.y;
    });
    
    if (nearbyNpc) {
      nearbyNpc.facePlayer(this.player.currentDirection);
      nearbyNpc.talkingToPlayer = true;
      this.npcPlayerIsInteractingWith = nearbyNpc;
      this.handleNpcInteraction();
      return;
    }

    // Check for a nearby item and display message about player finding the item
    let nearbyItemIndex: number | undefined;
    const nearbyItem = this.items.find((item, index) => {
      if (item.position.x === targetPosition.x && item.position.y === targetPosition.y) {
        nearbyItemIndex = index;
        return true;
      }
      return false;
    });

    if (nearbyItem && nearbyItemIndex !== undefined) {
      // Add item to inventory and display message to player
      const item = dataLoader.getLegacyItemById(nearbyItem.itemId);
      const dataManager = this.registry.get('dataManager') as DataManager;

      if (item) {
        dataManager.addLegacyItem(item, 1);
        nearbyItem.destroy();
        this.items.splice(nearbyItemIndex, 1);
        dataManager.addItemPickedUp(nearbyItem.id);

        // Emit item collected event
        EventBus.emit('item:collected', {
          itemId: nearbyItem.id,
          itemName: item.name
        });

        // Show placeholder dialog for now
        console.log(`[Overworld:handlePlayerInteraction] Item found: ${item.name}`);
        EventBus.emit('dialog:show', [`You found a ${item.name}`]);
      }
    }
  }

  private handleEntranceEntered(entranceName: string, entranceId: string, isBuildingEntrance: boolean): void {
    console.log(`[Overworld:handleEntranceEntered] Entering ${entranceName} (${entranceId})`);
    
    // Transition to new area
    this.scene.start(SceneKeys.WORLD, {
      area: entranceName,
      isInterior: isBuildingEntrance,
    });
  }

  private handleKnockoutRespawn(): void {
    if (!this.mapManager || !this.sceneData.area) {
      return;
    }

    const dataManager = this.registry.get('dataManager') as DataManager;
    const mapConfig = this.mapManager.getMapConfiguration(this.sceneData.area);
    
    if (!mapConfig) {
      return;
    }

    // Get area metadata to find knockout spawn location
    const metadata = this.mapManager.getAreaMetadata(mapConfig.mapKey);
    const knockOutSpawnLocation = metadata?.faint_location;

    if (knockOutSpawnLocation && knockOutSpawnLocation !== this.sceneData.area) {
      // Update scene data to new spawn area
      this.sceneData.area = knockOutSpawnLocation;
      const newMapConfig = this.mapManager.getMapConfiguration(knockOutSpawnLocation);
      
      if (newMapConfig) {
        const reviveLocation = this.mapManager.getReviveLocation(newMapConfig.mapKey);
        if (reviveLocation) {
          dataManager.dataStore.set(DataManagerStoreKeys.PLAYER_POSITION, reviveLocation);
          dataManager.dataStore.set(DataManagerStoreKeys.PLAYER_DIRECTION, Direction.UP);
        }
      }
    }
  }

  private handleNewGameSetup(): void {
    if (!this.mapManager || !this.sceneData.area) {
      return;
    }

    const dataManager = this.registry.get('dataManager') as DataManager;
    const mapConfig = this.mapManager.getMapConfiguration(this.sceneData.area);
    
    if (!mapConfig) {
      return;
    }

    const spawnLocation = this.mapManager.getPlayerSpawnLocation(mapConfig.mapKey);
    if (spawnLocation) {
      dataManager.dataStore.set(DataManagerStoreKeys.PLAYER_POSITION, spawnLocation);
      dataManager.dataStore.set(DataManagerStoreKeys.PLAYER_DIRECTION, Direction.DOWN);
    }
  }

  private createNPCs(map: Phaser.Tilemaps.Tilemap): void {
    this.npcs = [];

    const npcLayers = map.getObjectLayerNames().filter((layerName) => layerName.includes('NPC'));
    npcLayers.forEach((layerName) => {
      const layer = map.getObjectLayer(layerName);
      const npcObject = layer.objects.find((obj) => {
        return obj.type === 'NPC';
      });
      
      if (!npcObject || npcObject.x === undefined || npcObject.y === undefined) {
        return;
      }

      // Get the path objects for this NPC
      const pathObjects = layer.objects.filter((obj) => {
        return obj.type === 'NPC_PATH';
      });
      
      const npcPath: Record<number, Coordinate> = {
        0: { x: npcObject.x, y: npcObject.y - TILE_SIZE },
      };
      
      pathObjects.forEach((obj) => {
        if (obj.x === undefined || obj.y === undefined) {
          return;
        }
        npcPath[parseInt(obj.name || '0', 10)] = { x: obj.x, y: obj.y - TILE_SIZE };
      });

      const npcMovement = this.getObjectProperty(npcObject, 'movement_pattern') || 'IDLE';
      const npcId = this.getObjectProperty(npcObject, 'id');
      const npcDetails = dataLoader.getNpcData(npcId);

      if (!npcDetails) {
        console.warn(`[Overworld:createNPCs] No NPC data found for ID: ${npcId}`);
        return;
      }

      // In Tiled, the x value is how far the object starts from the left, and the y is the bottom of tiled object that is being added
      const npc = new NPC({
        scene: this,
        position: { x: npcObject.x, y: npcObject.y - TILE_SIZE },
        direction: Direction.DOWN,
        frame: npcDetails.frame,
        npcPath,
        movementPattern: npcMovement as NpcMovementPattern,
        events: npcDetails.events,
        animationKeyPrefix: npcDetails.animationKeyPrefix,
        id: npcId,
      });
      
      this.npcs.push(npc);
    });

    // Update collisions with player
    this.npcs.forEach((npc) => {
      if (this.player !== undefined) {
        npc.addCharacterToCheckForCollisionsWith(this.player);
      }
    });
  }

  private createItems(map: Phaser.Tilemaps.Tilemap): void {
    const itemObjectLayer = map.getObjectLayer('Item');
    if (!itemObjectLayer) {
      return;
    }
    
    const items = itemObjectLayer.objects;
    const validItems = items.filter((item) => {
      return item.x !== undefined && item.y !== undefined;
    });

    const dataManager = this.registry.get('dataManager') as DataManager;
    const itemsPickedUp = dataManager.dataStore.get(DataManagerStoreKeys.ITEMS_PICKED_UP) || [];

    for (const tiledItem of validItems) {
      const itemId = this.getObjectProperty(tiledItem, 'item_id');
      const id = this.getObjectProperty(tiledItem, 'id');

      if (itemsPickedUp.includes(id)) {
        continue;
      }

      // Create object
      const item = new Item({
        scene: this,
        position: {
          x: tiledItem.x,
          y: tiledItem.y - TILE_SIZE,
        },
        itemId,
        id,
      });
      this.items.push(item);
    }
  }

  private createEventZones(map: Phaser.Tilemaps.Tilemap): void {
    const eventObjectLayer = map.getObjectLayer('Events');
    if (!eventObjectLayer) {
      return;
    }
    
    const events = eventObjectLayer.objects;
    const validEvents = events.filter((event) => {
      return event.x !== undefined && event.y !== undefined;
    });

    const dataManager = this.registry.get('dataManager') as DataManager;
    const viewedEvents = dataManager.dataStore.get(DataManagerStoreKeys.VIEWED_EVENTS) || [];

    for (const tiledEvent of validEvents) {
      const eventId = this.getObjectProperty(tiledEvent, 'id');

      if (viewedEvents.includes(eventId)) {
        continue;
      }

      const eventData = dataLoader.getEventData(eventId.toString());
      if (!eventData) {
        continue;
      }

      if (this.eventZoneManager) {
        this.eventZoneManager.createEventZone({
          id: eventId.toString(),
          x: tiledEvent.x!,
          y: tiledEvent.y! - TILE_SIZE * 2,
          width: tiledEvent.width || TILE_SIZE,
          height: tiledEvent.height || TILE_SIZE,
          eventData,
        });
      }
    }
  }

  private createEncounterAreas(map: Phaser.Tilemaps.Tilemap): void {
    const encounterLayers = map.getTileLayerNames().filter((layerName) => layerName.includes('Encounter'));
    if (encounterLayers.length > 0) {
      const encounterTiles = map.addTilesetImage('encounter', TextureKeys.WORLD_ENCOUNTER_ZONE);
      if (!encounterTiles) {
        console.log('[Overworld:createEncounterAreas] encountered error while creating encounter tiles from tiled');
        return;
      }

      encounterLayers.forEach((layerName) => {
        const layer = map.createLayer(layerName, encounterTiles, 0, 0);
        layer.setAlpha(0).setDepth(2); // Set alpha to 0 for invisible encounter zones
        this.encounterLayers.push(layer);
      });
    }
  }

  private handlePlayerMovementInEncounterZone(position: Coordinate): void {
    if (!this.eventZoneManager || !this.player) {
      return;
    }

    // Check to see if the player encountered cut scene zone
    this.player.sprite.getBounds(this.rectangleForOverlapCheck1);
    const overlappingZoneId = this.eventZoneManager.checkPlayerOverlap(position);
    
    if (overlappingZoneId) {
      this.currentCutSceneId = parseInt(overlappingZoneId, 10);
      this.startCutScene();
      return;
    }

    if (this.encounterLayers.length === 0) {
      return;
    }

    // Handle wild encounters
    this.handleWildEncounter();
  }

  private handleWildEncounter(): void {
    if (!this.encounterZonePlayerIsEntering) {
      return;
    }

    console.log('[Overworld:handlePlayerMovementInEncounterZone] player is in an encounter zone');

    const wildMonsterEncountered = Math.random() < 0.2; // 20% chance
    
    if (wildMonsterEncountered) {
      const encounterAreaId = this.getObjectProperty(this.encounterZonePlayerIsEntering.layer, 'area');
      
      if (!encounterAreaId) {
        return;
      }

      const possibleMonsters = dataLoader.getEncounterTable(encounterAreaId.toString());
      if (!possibleMonsters) {
        return;
      }

      const randomMonsterId = dataLoader.getRandomEncounter(encounterAreaId.toString());

      if (randomMonsterId) {
        console.log(`[Overworld:handlePlayerMovementInEncounterZone] player encountered a wild monster in area ${encounterAreaId} and monster id has been picked randomly ${randomMonsterId}`);
        
        // Start battle (placeholder for now - will be implemented in battle ticket)
        console.log(`[Overworld:handlePlayerMovementInEncounterZone] Starting battle with monster ID: ${randomMonsterId}`);
        EventBus.emit('battle:start', {
          enemyMonsterId: randomMonsterId,
          areaId: encounterAreaId
        });
      }
    }
  }

  private handleEncounterTileTypeEffects(encounterLayer: Phaser.Tilemaps.TilemapLayer, encounterTile: Phaser.Tilemaps.Tile, playerDirection: Direction): void {
    // Check the tile type for the encounter layer the player is moving through and play related effects
    const encounterTileType = this.getObjectProperty(encounterLayer.layer, 'tile_type') || 'NONE';

    switch (encounterTileType) {
      case 'GRASS':
        // Create grass sprite for when player moves through grass
        const object = this.specialEncounterTileImageGameObjectGroup
          .getFirstDead(true, encounterTile.pixelX, encounterTile.pixelY, TextureKeys.WORLD, 1, true)
          .setOrigin(0)
          .setVisible(true)
          .setActive(true);
        
        // If player is moving up or down, don't show grass so they don't appear to be moving under it, will show after they reach the destination
        if (playerDirection === Direction.DOWN || playerDirection === Direction.UP) {
          object.visible = false;
        }
        
        this.audioManager.playSoundEffect('GRASS');
        break;
      case 'NONE':
        break;
      default:
        console.warn(`[Overworld:handleEncounterTileTypeEffects] Unknown encounter tile type: ${encounterTileType}`);
    }
  }

  private hideSpecialEncounterTiles(): void {
    // Cleanup any special tiles that are not at the player's current position
    this.specialEncounterTileImageGameObjectGroup
      .getChildren()
      .forEach((child: Phaser.GameObjects.Image) => {
        if (!child.active) {
          return;
        }
        if (this.player && child.x === this.player.sprite.x && child.y === this.player.sprite.y) {
          child.visible = true;
          return;
        }
        child.active = false;
        child.visible = false;
      });
  }

  private startCutScene(): void {
    this.isProcessingCutSceneEvent = true;
    // Placeholder for cutscene start - will be implemented in future tickets
    console.log(`[Overworld:startCutScene] Starting cutscene with ID: ${this.currentCutSceneId}`);
  }

  private handleCutSceneInteraction(): void {
    if (this.isProcessingCutSceneEvent || this.currentCutSceneId === undefined) {
      return;
    }

    const eventData = dataLoader.getEventData(this.currentCutSceneId.toString());
    if (!eventData) {
      return;
    }

    // Check to see if the cut scene has any more events to be processed
    const isMoreEventsToProcess = eventData.events.length - 1 !== this.lastCutSceneEventHandledIndex;
    
    if (!isMoreEventsToProcess) {
      // Once we are done processing the events for the cutscene, we need to do the following:
      // 1. Update our data manager to show we watched the event
      // 2. Cleanup zone game object used for the event and overlap detection
      // 3. Reset our current cut scene property
      this.lastCutSceneEventHandledIndex = -1;
      this.isProcessingCutSceneEvent = false;
      
      if (this.eventZoneManager) {
        this.eventZoneManager.markEventAsViewed(this.currentCutSceneId.toString());
        this.eventZoneManager.removeEventZone(this.currentCutSceneId.toString());
      }
      
      this.currentCutSceneId = undefined;
      return;
    }

    // Get the next event from the queue and process for this cutscene
    this.lastCutSceneEventHandledIndex += 1;
    const eventToHandle = eventData.events[this.lastCutSceneEventHandledIndex];
    const eventType = eventToHandle.type;

    this.isProcessingCutSceneEvent = true;
    
    // Handle different event types (placeholder for now)
    switch (eventType) {
      case GameEventType.ADD_NPC:
        console.log('[Overworld:handleCutSceneInteraction] ADD_NPC event');
        break;
      case GameEventType.MOVE_TO_PLAYER:
        console.log('[Overworld:handleCutSceneInteraction] MOVE_TO_PLAYER event');
        break;
      case GameEventType.RETRACE_PATH:
        console.log('[Overworld:handleCutSceneInteraction] RETRACE_PATH event');
        break;
      case GameEventType.REMOVE_NPC:
        console.log('[Overworld:handleCutSceneInteraction] REMOVE_NPC event');
        break;
      case GameEventType.TALK_TO_PLAYER:
        console.log('[Overworld:handleCutSceneInteraction] TALK_TO_PLAYER event');
        break;
      case GameEventType.GIVE_MONSTER:
        console.log('[Overworld:handleCutSceneInteraction] GIVE_MONSTER event');
        break;
      case GameEventType.ADD_FLAG:
        console.log('[Overworld:handleCutSceneInteraction] ADD_FLAG event');
        break;
      case GameEventType.REMOVE_FLAG:
        console.log('[Overworld:handleCutSceneInteraction] REMOVE_FLAG event');
        break;
      default:
        console.warn(`[Overworld:handleCutSceneInteraction] Unknown event type: ${eventType}`);
    }
  }

  private handleNpcInteraction(): void {
    if (this.isProcessingNpcEvent || !this.npcPlayerIsInteractingWith) {
      return;
    }

    // Check to see if the NPC has any events associated with them
    const isMoreEventsToProcess = this.npcPlayerIsInteractingWith.npcEvents.length - 1 !== this.lastNpcEventHandledIndex;

    if (!isMoreEventsToProcess) {
      this.npcPlayerIsInteractingWith.talkingToPlayer = false;
      this.npcPlayerIsInteractingWith = undefined;
      this.lastNpcEventHandledIndex = -1;
      this.isProcessingNpcEvent = false;
      return;
    }

    // Get the next event from the queue and process for this NPC
    this.lastNpcEventHandledIndex += 1;
    const eventToHandle = this.npcPlayerIsInteractingWith.npcEvents[this.lastNpcEventHandledIndex];
    const eventType = eventToHandle.type;

    // Check to see if this event should be handled based on story flags
    const dataManager = this.registry.get('dataManager') as DataManager;
    const currentGameFlags = dataManager.getFlags();
    const eventRequirementsMet = eventToHandle.requires.every((flag) => {
      return currentGameFlags.has(flag);
    });
    
    if (!eventRequirementsMet) {
      // Jump to next event
      this.handleNpcInteraction();
      return;
    }

    this.isProcessingNpcEvent = true;
    
    switch (eventType) {
      case NpcEventType.MESSAGE:
        console.log('[Overworld:handleNpcInteraction] MESSAGE event:', eventToHandle.data.messages);
        EventBus.emit('dialog:show', eventToHandle.data.messages);
        this.isProcessingNpcEvent = false;
        this.handleNpcInteraction();
        break;
      case NpcEventType.HEAL:
        this.healPlayerParty();
        this.isProcessingNpcEvent = false;
        this.handleNpcInteraction();
        break;
      case NpcEventType.SCENE_FADE_IN_AND_OUT:
        console.log('[Overworld:handleNpcInteraction] SCENE_FADE_IN_AND_OUT event');
        // Placeholder for fade effect
        this.isProcessingNpcEvent = false;
        this.handleNpcInteraction();
        break;
      default:
        console.warn(`[Overworld:handleNpcInteraction] Unknown NPC event type: ${eventType}`);
        this.isProcessingNpcEvent = false;
    }
  }

  private healPlayerParty(): void {
    // Heal all critters in party
    const dataManager = this.registry.get('dataManager') as DataManager;
    const crittersInParty = dataManager.dataStore.get(DataManagerStoreKeys.CRITTERS_IN_PARTY) || [];
    
    crittersInParty.forEach((critter: any) => {
      critter.currentHp = critter.maxHp;
    });
    
    dataManager.dataStore.set(DataManagerStoreKeys.CRITTERS_IN_PARTY, crittersInParty);
    
    // Emit HUD notification for healing
    EventBus.emit('hud:notification', {
      message: 'Your party has been healed!',
      type: 'heal'
    });
  }

  private getObjectProperty(object: any, propertyName: string): any {
    if (!object.properties || !Array.isArray(object.properties)) {
      return undefined;
    }
    
    const property = object.properties.find((prop: any) => prop.name === propertyName);
    return property?.value;
  }
}
}