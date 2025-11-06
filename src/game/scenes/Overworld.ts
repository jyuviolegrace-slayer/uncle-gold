import { BaseScene } from './common/BaseScene';
import { SceneKeys } from '../assets';
import { Direction, Coordinate } from '../models/common';
import { Player, MapManager } from '../world';
import { DataManager, DataManagerStoreKeys } from '../services/DataManager';
import { EventBus } from '../EventBus';
import { TextureKeys } from '../assets/TextureKeys';
import { TILE_SIZE } from '../world/constants';

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
  private npcs: any[] = []; // Placeholder for future NPC implementation
  private items: any[] = []; // Placeholder for future item implementation

  constructor() {
    super(SceneKeys.WORLD);
    this.sceneData = {};
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

    // Setup camera
    this.setupCamera(mapConfig);

    // Create background
    if (mapConfig.backgroundKey) {
      this.add.image(0, 0, mapConfig.backgroundKey, 0).setOrigin(0);
    }

    // Create player
    this.createPlayer();

    // Create foreground (depth layering)
    if (mapConfig.foregroundKey) {
      this.add.image(0, 0, mapConfig.foregroundKey, 0).setOrigin(0);
    }

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

    // Update NPCs (placeholder for future implementation)
    this.npcs.forEach(npc => {
      if (npc.update) {
        npc.update(time);
      }
    });
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
    // Handle encounter checks, sound effects, etc.
    // Placeholder for future implementation
  }

  private handlePlayerInteraction(): void {
    // Handle NPC interactions, sign reading, etc.
    // Placeholder for future implementation
    console.log('[Overworld:handlePlayerInteraction] Player interaction - placeholder');
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
}