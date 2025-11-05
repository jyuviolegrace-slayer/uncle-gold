/**
 * MapManager - Loads and manages tilemap data
 * Handles map file loading and rendering
 */

export interface IMapTile {
  id: number;
  x: number;
  y: number;
}

export interface INPCSpawn {
  id: string;
  name: string;
  x: number;
  y: number;
  dialogue: string;
}

export interface ITrainerSpawn {
  id: string;
  name: string;
  x: number;
  y: number;
  trainerId: string;
}

export interface IMapData {
  id: string;
  name: string;
  width: number;
  height: number;
  tileSize: number;
  backgroundTile: number;
  tiles: number[];
  collisions: Record<number, boolean>;
  grassTiles: number[];
  playerSpawn: { x: number; y: number };
  npcs: INPCSpawn[];
  trainers: ITrainerSpawn[];
}

export class MapManager {
  private static readonly baseUrl = '/assets/maps';
  private static mapCache: Map<string, IMapData> = new Map();

  /**
   * Load a map by ID
   */
  static async loadMap(mapId: string): Promise<IMapData> {
    if (this.mapCache.has(mapId)) {
      return this.mapCache.get(mapId)!;
    }

    try {
      const response = await fetch(`${this.baseUrl}/${mapId}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load map ${mapId}: ${response.statusText}`);
      }
      const mapData = await response.json() as IMapData;
      this.mapCache.set(mapId, mapData);
      return mapData;
    } catch (error) {
      console.error(`Error loading map ${mapId}:`, error);
      throw error;
    }
  }

  /**
   * Get tile at world coordinates
   */
  static getTileAtWorldXY(mapData: IMapData, worldX: number, worldY: number): IMapTile | null {
    const tileX = Math.floor(worldX / mapData.tileSize);
    const tileY = Math.floor(worldY / mapData.tileSize);
    return this.getTileAtGridXY(mapData, tileX, tileY);
  }

  /**
   * Get tile at grid coordinates
   */
  static getTileAtGridXY(mapData: IMapData, gridX: number, gridY: number): IMapTile | null {
    if (gridX < 0 || gridX >= mapData.width || gridY < 0 || gridY >= mapData.height) {
      return null;
    }

    const index = gridY * mapData.width + gridX;
    const tileId = mapData.tiles[index];

    return {
      id: tileId,
      x: gridX,
      y: gridY,
    };
  }

  /**
   * Check if tile is walkable
   */
  static isWalkableTile(mapData: IMapData, tileId: number): boolean {
    return !mapData.collisions[tileId];
  }

  /**
   * Check if tile is grass (can trigger encounters)
   */
  static isGrassTile(mapData: IMapData, tileId: number): boolean {
    return mapData.grassTiles.includes(tileId);
  }

  /**
   * Check if world position is walkable
   */
  static isWalkableAtWorldXY(mapData: IMapData, worldX: number, worldY: number): boolean {
    const tile = this.getTileAtWorldXY(mapData, worldX, worldY);
    if (!tile) return false;
    return this.isWalkableTile(mapData, tile.id);
  }

  /**
   * Check if world position is grass
   */
  static isGrassAtWorldXY(mapData: IMapData, worldX: number, worldY: number): boolean {
    const tile = this.getTileAtWorldXY(mapData, worldX, worldY);
    if (!tile) return false;
    return this.isGrassTile(mapData, tile.id);
  }

  /**
   * Get world bounds of the map
   */
  static getWorldBounds(mapData: IMapData): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(
      0,
      0,
      mapData.width * mapData.tileSize,
      mapData.height * mapData.tileSize
    );
  }

  /**
   * Clear map cache
   */
  static clearCache(): void {
    this.mapCache.clear();
  }
}

export default MapManager;
