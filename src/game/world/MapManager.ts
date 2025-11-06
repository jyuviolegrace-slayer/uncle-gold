import { Scene } from 'phaser';
import { TextureKeys } from '../assets/TextureKeys';
import { TILE_SIZE } from './constants';

export interface MapConfiguration {
  areaId: string;
  mapKey: TextureKeys;
  backgroundKey?: TextureKeys;
  foregroundKey?: TextureKeys;
  isInterior: boolean;
  cameraBounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  defaultZoom?: number;
}

export interface Entrance {
  id: string;
  name: string;
  position: { x: number; y: number };
  direction: 'up' | 'down' | 'left' | 'right';
  isBuilding: boolean;
  connectsTo: string;
}

export class MapManager {
  private scene: Scene;
  private loadedMaps: Map<string, Phaser.Tilemaps.Tilemap> = new Map();
  private mapConfigurations: Map<string, MapConfiguration> = new Map();

  constructor(scene: Scene) {
    this.scene = scene;
    this.initializeMapConfigurations();
  }

  /**
   * Get a tilemap by key, loading it from cache if necessary
   */
  getTilemap(mapKey: string): Phaser.Tilemaps.Tilemap {
    let tilemap = this.loadedMaps.get(mapKey);
    
    if (!tilemap) {
      tilemap = this.scene.make.tilemap({ key: mapKey });
      this.loadedMaps.set(mapKey, tilemap);
    }
    
    return tilemap;
  }

  /**
   * Get map configuration for an area
   */
  getMapConfiguration(areaId: string): MapConfiguration | undefined {
    return this.mapConfigurations.get(areaId);
  }

  /**
   * Get all entrances for a specific map
   */
  getEntrances(mapKey: string): Entrance[] {
    const tilemap = this.getTilemap(mapKey);
    const entranceLayer = tilemap.getObjectLayer('Scene-Transitions');
    
    if (!entranceLayer) {
      return [];
    }

    return entranceLayer.objects
      .filter(object => object.properties && Array.isArray(object.properties))
      .map(object => {
        const properties = object.properties as any[];
        const getProp = (name: string) => properties.find(prop => prop.name === name)?.value;
        
        return {
          id: getProp('entrance_id') || '',
          name: getProp('connects_to') || '',
          position: { x: object.x || 0, y: object.y || 0 },
          direction: getProp('direction') || 'down',
          isBuilding: getProp('is_building') || false,
          connectsTo: getProp('connects_to') || '',
        };
      })
      .filter(entrance => entrance.id && entrance.name);
  }

  /**
   * Find entrance by ID in a specific map
   */
  findEntranceById(mapKey: string, entranceId: string): Entrance | undefined {
    const entrances = this.getEntrances(mapKey);
    return entrances.find(entrance => entrance.id === entranceId);
  }

  /**
   * Get player spawn location from map
   */
  getPlayerSpawnLocation(mapKey: string): { x: number; y: number } | undefined {
    const tilemap = this.getTilemap(mapKey);
    const spawnLayer = tilemap.getObjectLayer('Player-Spawn-Location');
    
    if (!spawnLayer || spawnLayer.objects.length === 0) {
      return undefined;
    }

    const spawnObject = spawnLayer.objects[0];
    return {
      x: spawnObject.x || 0,
      y: (spawnObject.y || 0) - TILE_SIZE, // Adjust for sprite origin
    };
  }

  /**
   * Get revive location for knocked out player
   */
  getReviveLocation(mapKey: string): { x: number; y: number } | undefined {
    const tilemap = this.getTilemap(mapKey);
    const reviveLayer = tilemap.getObjectLayer('Revive-Location');
    
    if (!reviveLayer || reviveLayer.objects.length === 0) {
      return undefined;
    }

    const reviveObject = reviveLayer.objects[0];
    return {
      x: reviveObject.x || 0,
      y: (reviveObject.y || 0) - TILE_SIZE, // Adjust for sprite origin
    };
  }

  /**
   * Get area metadata from map
   */
  getAreaMetadata(mapKey: string): any {
    const tilemap = this.getTilemap(mapKey);
    const metadataLayer = tilemap.getObjectLayer('Area-Metadata');
    
    if (!metadataLayer || metadataLayer.objects.length === 0) {
      return {};
    }

    const metadataObject = metadataLayer.objects[0];
    if (!metadataObject.properties || !Array.isArray(metadataObject.properties)) {
      return {};
    }

    const properties: any = {};
    metadataObject.properties.forEach((prop: any) => {
      properties[prop.name] = prop.value;
    });

    return properties;
  }

  /**
   * Clear cached maps (useful for memory management)
   */
  clearCache(): void {
    this.loadedMaps.clear();
  }

  /**
   * Initialize predefined map configurations
   */
  private initializeMapConfigurations(): void {
    // Main outdoor areas
    this.mapConfigurations.set('main_1', {
      areaId: 'main_1',
      mapKey: TextureKeys.WORLD_MAIN_1_LEVEL,
      backgroundKey: TextureKeys.WORLD_MAIN_1_BACKGROUND,
      foregroundKey: TextureKeys.WORLD_MAIN_1_FOREGROUND,
      isInterior: false,
      cameraBounds: { x: 0, y: 0, width: 2560, height: 5184 },
      defaultZoom: 0.8,
    });

    this.mapConfigurations.set('forest_1', {
      areaId: 'forest_1',
      mapKey: TextureKeys.WORLD_FOREST_1_LEVEL,
      backgroundKey: TextureKeys.WORLD_FOREST_1_BACKGROUND,
      foregroundKey: TextureKeys.WORLD_FOREST_1_FOREGROUND,
      isInterior: false,
      cameraBounds: { x: 0, y: 0, width: 2560, height: 5184 },
      defaultZoom: 0.8,
    });

    // Building interiors
    this.mapConfigurations.set('building_1', {
      areaId: 'building_1',
      mapKey: TextureKeys.BUILDING_1_LEVEL,
      backgroundKey: TextureKeys.BUILDING_1_BACKGROUND,
      foregroundKey: TextureKeys.BUILDING_1_FOREGROUND,
      isInterior: true,
      cameraBounds: { x: 0, y: 0, width: 1280, height: 1280 },
      defaultZoom: 1.0,
    });

    this.mapConfigurations.set('building_2', {
      areaId: 'building_2',
      mapKey: TextureKeys.BUILDING_2_LEVEL,
      backgroundKey: TextureKeys.BUILDING_2_BACKGROUND,
      foregroundKey: TextureKeys.BUILDING_2_FOREGROUND,
      isInterior: true,
      cameraBounds: { x: 0, y: 0, width: 1280, height: 1280 },
      defaultZoom: 1.0,
    });

    this.mapConfigurations.set('building_3', {
      areaId: 'building_3',
      mapKey: TextureKeys.BUILDING_3_LEVEL,
      backgroundKey: TextureKeys.BUILDING_3_BACKGROUND,
      foregroundKey: TextureKeys.BUILDING_3_FOREGROUND,
      isInterior: true,
      cameraBounds: { x: 0, y: 0, width: 1280, height: 1280 },
      defaultZoom: 1.0,
    });
  }
}