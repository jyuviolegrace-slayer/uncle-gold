import { Scene, GameObjects, Physics } from 'phaser';
import { EventBus } from '../EventBus';
import { SceneContext } from './SceneContext';
import MapManager, { IMapData } from '../managers/MapManager';
import MapRenderer from '../managers/MapRenderer';
import { PlayerController } from '../managers/PlayerController';
import { EncounterSystem } from '../managers/EncounterSystem';

/**
 * Overworld Scene - Main exploration and navigation scene
 * Handles player movement, tilemap rendering, collisions, wild encounters, and NPC interactions
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

      // Setup input
      this.setupInput();

      // Setup event listeners
      this.setupEventListeners();

      // Launch HUD
      this.launchHUD();

      EventBus.emit('current-scene-ready', this);
    } catch (error) {
      console.error('Error creating Overworld scene:', error);
      // Fallback to main menu
      this.scene.start('MainMenu');
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

  private setupInput() {
    this.input.keyboard?.on('keydown-M', () => {
      this.scene.start('Menu');
    });

    this.input.keyboard?.on('keydown-P', () => {
      this.scene.start('Party');
    });

    this.input.keyboard?.on('keydown-S', () => {
      this.scene.start('Shop');
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
        EventBus.emit('trainer:challenge', {
          trainerId: trainerData.trainerId,
          trainerName: trainerData.name,
        });
      }
    });
  }

  private setupEventListeners() {
    EventBus.on('start-battle', (data: any) => {
      this.startBattle(data);
    });

    EventBus.on('battle:request', (data: any) => {
      this.startBattle(data);
    });

    EventBus.on('open-menu', () => {
      this.scene.start('Menu');
    });

    EventBus.on('open-party', () => {
      this.scene.start('Party');
    });

    EventBus.on('open-shop', () => {
      this.scene.start('Shop');
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
      this.encounterSystem.triggerWildEncounter(this.mapId);
    }
  }

  shutdown() {
    EventBus.off('start-battle');
    EventBus.off('battle:request');
    EventBus.off('open-menu');
    EventBus.off('open-party');
    EventBus.off('open-shop');

    if (this.playerController) {
      this.playerController.shutdown();
    }

    this.npcSprites.clear();
    this.trainerSprites.clear();
  }
}
