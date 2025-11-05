import { Scene, GameObjects, Physics, Input } from 'phaser';
import { EventBus } from '../EventBus';
import { SceneContext } from './SceneContext';
import MapManager, { IMapData, IMapObject, IPointOfInterest } from '../managers/MapManager';
import MapRenderer from '../managers/MapRenderer';
import { PlayerController } from '../managers/PlayerController';
import { EncounterSystem } from '../managers/EncounterSystem';
import { DataLoader } from '../data/loader';
import { IArea } from '../models/types';
import { AudioManager, PoolManager, PerformanceMonitor } from '../managers';
import { SaveManager, LegacyDataManager } from '../services';
import {
  Player,
  NPC,
  Item,
  WorldMenu,
  EventZoneManager,
  type Direction,
  type Coordinate,
  calculateDistance,
} from '../world';

/**
 * Overworld Scene - Main exploration and navigation scene
 * Handles player movement, tilemap rendering, collisions, wild encounters, NPC interactions
 */
export class Overworld extends Scene {
  private player: Physics.Arcade.Sprite | null = null;
  private playerController: PlayerController | null = null;
  private gameStateManager = SceneContext.getInstance().getGameStateManager();
  private mapId: string = 'starter-town';
  private mapData: IMapData | null = null;
  private collisionGroup: Physics.Arcade.StaticGroup | null = null;
  private encounterSystem: EncounterSystem | null = null;
  private npcSprites: Map<string, Physics.Arcade.Sprite> = new Map();
  private trainerSprites: Map<string, Physics.Arcade.Sprite> = new Map();
  private areas: Map<string, IArea> = new Map();
  private currentArea: IArea | null = null;
  private poiSprites: Map<string, Phaser.GameObjects.Rectangle> = new Map();
  private objectSprites: Map<string, Phaser.GameObjects.Rectangle> = new Map();
  private worldMenu: WorldMenu | null = null;
  private eventZoneManager: EventZoneManager | null = null;
  private npcs: NPC[] = [];
  private items: Item[] = [];
  private lastInteractionTime: number = 0;
  private interactionCooldown: number = 500;

  constructor() {
    super('Overworld');
  }

  init(data: any) {
    if (data?.mapId) {
      this.mapId = data.mapId;
    }
  }

  async create() {
    try {
      // Setup modern managers
      this.setupManagers();

      // Load areas data
      await this.loadAreasData();

      // Load map data
      this.mapData = await MapManager.loadMap(this.mapId);

      // Setup world with tilemap
      this.setupWorld();

      // Setup player
      this.setupPlayer();

      // Setup collisions
      this.setupCollisions();

      // Setup encounters
      this.setupEncounters();

      // Setup NPCs and trainers
      this.setupNPCsAndTrainers();

      // Setup objects and POIs
      this.setupObjectsAndPOIs();

      // Setup event zones
      this.setupEventZones();

      // Setup world menu
      this.setupWorldMenu();

      // Setup input
      this.setupInput();

      // Setup event listeners
      this.setupEventListeners();

      // Launch HUD
      this.launchHUD();

      EventBus.emit('current-scene-ready', this);
    } catch (error) {
      console.error('Error creating Overworld scene:', error);
      // Fallback to title
      this.scene.start('Title');
    }
  }

  private async loadAreasData() {
    try {
      const areasData = await DataLoader.loadAreas();
      for (const area of areasData) {
        this.areas.set(area.id, area);
      }

      const playerArea = this.areas.get(this.mapId);
      if (playerArea) {
        this.currentArea = playerArea;
      }
    } catch (error) {
      console.error('Error loading areas data:', error);
    }
  }

  /**
   * Setup modern managers and integrate with SceneContext
   */
  private setupManagers(): void {
    const sceneContext = SceneContext.getInstance();
    
    // Initialize save and legacy data managers if not already set
    if (!sceneContext.getSaveManager()) {
      const saveManager = SaveManager.getInstance();
      sceneContext.setSaveManager(saveManager);
    }
    
    if (!sceneContext.getLegacyDataManager()) {
      const legacyDataManager = new LegacyDataManager();
      sceneContext.setLegacyDataManager(legacyDataManager);
    }
    
    // Setup audio manager if not already available
    if (!sceneContext.getAudioManager()) {
      const audioManager = new AudioManager(this);
      sceneContext.setAudioManager(audioManager);
    }
    
    // Setup pool manager if not already available
    if (!sceneContext.getPoolManager()) {
      const poolManager = new PoolManager(this);
      sceneContext.setPoolManager(poolManager);
    }
    
    // Setup performance monitor if not already available
    if (!sceneContext.getPerformanceMonitor()) {
      const performanceMonitor = new PerformanceMonitor(this);
      sceneContext.setPerformanceMonitor(performanceMonitor);
    }
  }

  private setupWorld() {
    if (!this.mapData) return;

    const width = this.game.config.width as number;
    const height = this.game.config.height as number;

    // Set world bounds based on map size
    const worldWidth = this.mapData.width * this.mapData.tileSize;
    const worldHeight = this.mapData.height * this.mapData.tileSize;

    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // Render map tiles
    MapRenderer.renderMap(this, this.mapData);

    // Add area label
    const areaText = this.add.text(
      width / 2,
      30,
      `${this.mapData.name}`,
      {
        font: 'bold 24px Arial',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 },
      }
    );
    areaText.setOrigin(0.5);
    areaText.setScrollFactor(0);
    areaText.setDepth(100);
  }

  private setupPlayer() {
    if (!this.mapData) return;

    const tileSize = this.mapData.tileSize;
    const playerGridX = this.mapData.playerSpawn.x;
    const playerGridY = this.mapData.playerSpawn.y;
    const playerX = playerGridX * tileSize + tileSize / 2;
    const playerY = playerGridY * tileSize + tileSize / 2;

    this.player = this.physics.add.sprite(playerX, playerY, 'star');
    this.player.setScale(1.5);
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);

    // Setup camera to follow player
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, this.mapData.width * tileSize, this.mapData.height * tileSize);

    // Setup player controller
    this.playerController = new PlayerController(this, this.player, {
      speed: 200,
      enableKeyboard: true,
    });
  }

  private setupCollisions() {
    if (!this.mapData || !this.player) return;

    // Create collision bodies for all collision tiles
    this.collisionGroup = MapRenderer.createCollisionBodies(this, this.mapData);

    // Add collision between player and collision group
    this.physics.add.collider(this.player, this.collisionGroup);
  }

  private setupEncounters() {
    if (!this.mapData) return;

    this.encounterSystem = new EncounterSystem({
      encounterChance: 30,
      stepsBeforeNextEncounter: 1,
      debounceMs: 500,
    });

    this.encounterSystem.setMap(this.mapData);
  }

  private setupNPCsAndTrainers() {
    if (!this.mapData) return;

    const tileSize = this.mapData.tileSize;

    // Spawn NPCs
    this.mapData.npcs.forEach(npc => {
      const x = npc.x * tileSize + tileSize / 2;
      const y = npc.y * tileSize + tileSize / 2;

      const npcSprite = this.physics.add.sprite(x, y, 'star');
      npcSprite.setScale(1);
      npcSprite.setTint(0xFF69B4); // Pink tint for NPCs
      npcSprite.setData('type', 'npc');
      npcSprite.setData('npcData', npc);

      this.npcSprites.set(npc.id, npcSprite);

      // Add label
      const label = this.add.text(x, y - 40, npc.name, {
        font: '12px Arial',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 4, y: 2 },
      });
      label.setOrigin(0.5);
    });

    // Spawn trainers
    this.mapData.trainers.forEach(trainer => {
      const x = trainer.x * tileSize + tileSize / 2;
      const y = trainer.y * tileSize + tileSize / 2;

      const trainerSprite = this.physics.add.sprite(x, y, 'star');
      trainerSprite.setScale(1.2);
      trainerSprite.setTint(0x4169E1); // Blue tint for trainers
      trainerSprite.setData('type', 'trainer');
      trainerSprite.setData('trainerData', trainer);

      this.trainerSprites.set(trainer.id, trainerSprite);

      // Add label
      const label = this.add.text(x, y - 50, trainer.name, {
        font: 'bold 12px Arial',
        color: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 4, y: 2 },
      });
      label.setOrigin(0.5);
    });
  }

  private setupObjectsAndPOIs() {
    if (!this.mapData) return;

    const tileSize = this.mapData.tileSize;

    // Setup objects
    if (this.mapData.objects) {
      this.mapData.objects.forEach((obj: IMapObject) => {
        const width = ((obj.width || 1) * tileSize);
        const height = ((obj.height || 1) * tileSize);
        const x = obj.x * tileSize + width / 2;
        const y = obj.y * tileSize + height / 2;

        const objSprite = this.add.rectangle(x, y, width, height);
        objSprite.setVisible(false);
        objSprite.setData('objectData', obj);
        objSprite.setData('type', 'mapObject');
        this.objectSprites.set(obj.id, objSprite);
      });
    }

    // Setup POIs
    if (this.mapData.pointsOfInterest) {
      this.mapData.pointsOfInterest.forEach((poi: IPointOfInterest) => {
        const width = (poi.width * tileSize);
        const height = (poi.height * tileSize);
        const x = poi.x * tileSize + width / 2;
        const y = poi.y * tileSize + height / 2;

        const poiSprite = this.add.rectangle(x, y, width, height);
        poiSprite.setVisible(false);
        poiSprite.setData('poiData', poi);
        poiSprite.setData('type', 'poi');
        this.poiSprites.set(poi.id, poiSprite);
      });
    }
  }

  private setupEventZones() {
    this.eventZoneManager = new EventZoneManager(this, false);

    // Add entrance zones from map data
    if (this.mapData?.entrances) {
      this.mapData.entrances.forEach(entrance => {
        this.eventZoneManager?.addZone({
          id: entrance.id,
          name: entrance.name || 'Entrance',
          x: entrance.x * this.mapData!.tileSize,
          y: entrance.y * this.mapData!.tileSize,
          width: (entrance.width || 1) * this.mapData!.tileSize,
          height: (entrance.height || 1) * this.mapData!.tileSize,
          type: 'entrance',
          data: entrance,
        });
      });
    }
  }

  private setupWorldMenu() {
    this.worldMenu = new WorldMenu(this);
    this.worldMenu.setOnOptionSelected(this.handleMenuOption.bind(this));
  }

  private handleMenuOption(option: string) {
    switch (option) {
      case 'PARTY':
        if (this.worldMenu) {
          this.worldMenu.hide();
        }
        this.scene.pause();
        this.scene.launch('Party', { previousScene: 'Overworld' });
        break;
      case 'BAG':
        if (this.worldMenu) {
          this.worldMenu.hide();
        }
        // Open inventory (requires Inventory scene)
        EventBus.emit('menu:bag-open');
        break;
      case 'SAVE':
        if (this.worldMenu) {
          this.worldMenu.hide();
        }
        this.gameStateManager.saveGame();
        EventBus.emit('game:saved');
        break;
      case 'OPTIONS':
        if (this.worldMenu) {
          this.worldMenu.hide();
        }
        // Open options (requires Options scene)
        EventBus.emit('menu:options-open');
        break;
      case 'EXIT':
        if (this.worldMenu) {
          this.worldMenu.hide();
        }
        this.scene.start('MainMenu');
        break;
    }
  }

  private setupInput() {
    // Menu toggle with ENTER
    this.input.keyboard?.on('keydown-ENTER', () => {
      if (this.worldMenu) {
        this.worldMenu.toggle();
      }
    });

    // Menu navigation
    this.input.keyboard?.on('keydown-UP', () => {
      if (this.worldMenu?.getIsVisible()) {
        this.worldMenu.handleInput('UP');
      }
    });

    this.input.keyboard?.on('keydown-DOWN', () => {
      if (this.worldMenu?.getIsVisible()) {
        this.worldMenu.handleInput('DOWN');
      }
    });

    // Menu confirm with Z
    this.input.keyboard?.on('keydown-Z', () => {
      if (this.worldMenu?.getIsVisible()) {
        this.worldMenu.handleInput('CONFIRM');
      } else {
        this.checkNearbyInteractions();
      }
    });

    // Menu cancel with X
    this.input.keyboard?.on('keydown-X', () => {
      if (this.worldMenu?.getIsVisible()) {
        this.worldMenu.handleInput('CANCEL');
      }
    });

    // Legacy keybinds for quick access
    this.input.keyboard?.on('keydown-M', () => {
      this.scene.pause();
      this.scene.launch('Menu', { previousScene: 'Overworld' });
    });

    this.input.keyboard?.on('keydown-P', () => {
      this.scene.start('Party', { previousScene: 'Overworld' });
    });

    this.input.keyboard?.on('keydown-S', () => {
      this.scene.start('Shop', { previousScene: 'Overworld' });
    });

    this.input.keyboard?.on('keydown-B', () => {
      this.startBattle({ encounterType: 'test' });
    });

    // NPC/Trainer interaction (spacebar)
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.checkNearbyInteractions();
    });
  }

  private checkNearbyInteractions() {
    if (!this.player) return;

    const interactionRadius = 64;

    // Check NPCs
    this.npcSprites.forEach(npcSprite => {
      const distance = Phaser.Math.Distance.Between(
        this.player!.x,
        this.player!.y,
        npcSprite.x,
        npcSprite.y
      );

      if (distance < interactionRadius) {
        const npcData = npcSprite.getData('npcData');
        EventBus.emit('npc:interact', {
          npcId: npcData.id,
          npcName: npcData.name,
          dialogue: npcData.dialogue,
        });
      }
    });

    // Check trainers
    this.trainerSprites.forEach(trainerSprite => {
      const distance = Phaser.Math.Distance.Between(
        this.player!.x,
        this.player!.y,
        trainerSprite.x,
        trainerSprite.y
      );

      if (distance < interactionRadius) {
        const trainerData = trainerSprite.getData('trainerData');
        const alreadyDefeated = this.gameStateManager.hasDefeatedTrainer(trainerData.trainerId);

        if (alreadyDefeated) {
          EventBus.emit('trainer:defeated', {
            trainerId: trainerData.trainerId,
            trainerName: trainerData.name,
          });
        } else {
          this.initiateTrainerBattle(trainerData.trainerId, trainerData.name);
        }
      }
    });

    // Check POIs
    this.poiSprites.forEach(poiSprite => {
      const distance = Phaser.Math.Distance.Between(
        this.player!.x,
        this.player!.y,
        poiSprite.x,
        poiSprite.y
      );

      if (distance < interactionRadius) {
        const poiData = poiSprite.getData('poiData');
        EventBus.emit('poi:interact', {
          poiId: poiData.id,
          poiName: poiData.name,
          poiType: poiData.type,
          description: poiData.description,
        });
      }
    });
  }

  private initiateTrainerBattle(trainerId: string, trainerName: string) {
    const area = this.currentArea;
    if (!area) return;

    let trainerData = area.trainers.find(t => t.trainerId === trainerId);
    if (!trainerData) {
      trainerData = { trainerId, name: trainerName };
    }

    this.startBattle({
      encounterType: 'trainer',
      trainerId,
      trainerName: trainerData.name,
      isTrainerBattle: true,
    });
  }

  private checkAreaAccessible(areaId: string): boolean {
    const area = this.areas.get(areaId);
    if (!area || !area.unlockRequirements) return true;

    const reqs = area.unlockRequirements;

    if (reqs.badgeId && !this.gameStateManager.hasBadge(reqs.badgeId)) {
      return false;
    }

    if (reqs.minLevel && this.gameStateManager.getParty().some(c => c.level < reqs.minLevel!)) {
      return false;
    }

    return true;
  }

  private setupEventListeners() {
    EventBus.on('start-battle', (data: any) => {
      this.startBattle(data);
    });

    EventBus.on('battle:request', (data: any) => {
      this.startBattle(data);
    });

    EventBus.on('menu:open', () => {
      this.scene.pause();
      this.scene.launch('Menu', { previousScene: 'Overworld' });
    });

    EventBus.on('open-party', () => {
      this.scene.start('Party', { previousScene: 'Overworld' });
    });

    EventBus.on('open-shop', () => {
      this.scene.start('Shop', { previousScene: 'Overworld' });
    });

    // Handle zone events for area changes and interactions
    EventBus.on('zone:entrance-enter', (data: any) => {
      const fromArea = this.mapId;
      const toArea = data.data?.destination || data.zoneName;
      
      if (toArea && toArea !== fromArea) {
        EventBus.emit('area:changed', {
          fromArea,
          toArea
        });
      }
    });

    EventBus.on('zone:warp-trigger', (data: any) => {
      const destination = data.data?.destination;
      if (destination) {
        EventBus.emit('warp:start', { destination });
      }
    });

    EventBus.on('zone:interaction-enter', (data: any) => {
      EventBus.emit('npc:interact', { 
        npcId: data.zoneId,
        npcName: data.zoneName 
      });
    });

    EventBus.on('zone:event-trigger', (data: any) => {
      // Handle item collection from event zones
      if (data.data?.item) {
        EventBus.emit('item:collected', {
          itemId: data.data.item,
          quantity: data.data.quantity || 1
        });
      }
    });
  }

  private launchHUD() {
    if (!this.scene.isActive('HUD')) {
      this.scene.launch('HUD');
    }
  }

  private startBattle(data?: any) {
    this.playerController?.stop();
    this.scene.pause();
    this.scene.start('Battle', data || { encounterType: 'wild' });
  }

  update() {
    if (!this.player || !this.playerController || !this.encounterSystem) return;

    // Update player movement
    this.playerController.update();

    // Check for random encounters
    if (this.encounterSystem.checkEncounter(this.player.x, this.player.y)) {
      this.playerController.stop();
      
      // Emit encounter start event
      EventBus.emit('encounter:start', {
        area: this.mapId,
        encounterType: 'wild'
      });
      
      this.encounterSystem.triggerWildEncounter(this.mapId);
    }

    // Check event zones
    if (this.eventZoneManager) {
      this.eventZoneManager.checkPlayerInZone({ x: this.player.x, y: this.player.y }, 32);
    }
  }

  shutdown() {
    EventBus.off('start-battle');
    EventBus.off('battle:request');
    EventBus.off('open-menu');
    EventBus.off('open-party');
    EventBus.off('open-shop');
    EventBus.off('zone:entrance-enter');
    EventBus.off('zone:event-trigger');
    EventBus.off('zone:warp-trigger');
    EventBus.off('zone:interaction-enter');
    EventBus.off('zone:exit');
    EventBus.off('area:changed');
    EventBus.off('warp:start');
    EventBus.off('npc:interact');
    EventBus.off('item:collected');

    if (this.playerController) {
      this.playerController.shutdown();
    }

    if (this.worldMenu) {
      this.worldMenu.destroy();
    }

    if (this.eventZoneManager) {
      this.eventZoneManager.destroy();
    }

    // Clean up NPCs
    this.npcs.forEach(npc => npc.destroy());
    this.npcs = [];

    // Clean up items
    this.items.forEach(item => item.remove());
    this.items = [];

    this.npcSprites.clear();
    this.trainerSprites.clear();
    this.poiSprites.clear();
    this.objectSprites.clear();
  }
}