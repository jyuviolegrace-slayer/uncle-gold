/**
 * MapRenderer - Renders tile-based maps to Phaser scene
 * Creates visual representation of map tiles, objects, and POIs
 */

import Phaser from 'phaser';
import { IMapData, IMapObject, IPointOfInterest } from './MapManager';

export interface ITileRenderConfig {
  tileSize?: number;
  showCollisions?: boolean;
  renderObjects?: boolean;
  renderPOIs?: boolean;
}

export class MapRenderer {
  /**
   * Render a map to the given scene
   * Creates a tilemap visual using simple rectangles, objects, and POIs
   */
  static renderMap(
    scene: Phaser.Scene,
    mapData: IMapData,
    config: ITileRenderConfig = {}
  ): Phaser.GameObjects.Container {
    const tileSize = config.tileSize || mapData.tileSize;
    const container = scene.add.container(0, 0);

    const tileColorMap: Record<number, number> = {
      1: 0x90EE90, // grass (light green)
      2: 0x8B4513, // wall (brown)
      3: 0x4169E1, // building (royal blue)
      4: 0xDAA520, // roof (goldenrod)
      5: 0x228B22, // forest floor (forest green)
      6: 0x654321, // tree trunk (dark brown)
    };

    // Create grid of tiles
    for (let y = 0; y < mapData.height; y++) {
      for (let x = 0; x < mapData.width; x++) {
        const index = y * mapData.width + x;
        const tileId = mapData.tiles[index];
        const tileColor = tileColorMap[tileId] || 0xCCCCCC;

        const rect = scene.add.rectangle(
          x * tileSize + tileSize / 2,
          y * tileSize + tileSize / 2,
          tileSize,
          tileSize,
          tileColor
        );

        rect.setStrokeStyle(1, 0x000000, 0.3);
        container.add(rect);

        // Optional: show collision boxes
        if (config.showCollisions && mapData.collisions[tileId]) {
          const collisionRect = scene.add.rectangle(
            x * tileSize + tileSize / 2,
            y * tileSize + tileSize / 2,
            tileSize - 2,
            tileSize - 2
          );
          collisionRect.setStrokeStyle(2, 0xFF0000, 0.5);
          collisionRect.setFillStyle(0x000000, 0);
          container.add(collisionRect);
        }
      }
    }

    // Render objects if enabled
    if (config.renderObjects !== false && mapData.objects) {
      MapRenderer.renderObjects(scene, mapData, tileSize, container);
    }

    // Render POIs if enabled
    if (config.renderPOIs !== false && mapData.pointsOfInterest) {
      MapRenderer.renderPointsOfInterest(scene, mapData, tileSize, container);
    }

    return container;
  }

  /**
   * Render map objects (buildings, trees, etc.)
   */
  private static renderObjects(
    scene: Phaser.Scene,
    mapData: IMapData,
    tileSize: number,
    container: Phaser.GameObjects.Container
  ): void {
    if (!mapData.objects) return;

    mapData.objects.forEach((obj: IMapObject) => {
      const color = this.parseColor(obj.color || '#808080');
      const width = ((obj.width || 1) * tileSize);
      const height = ((obj.height || 1) * tileSize);
      const x = obj.x * tileSize + width / 2;
      const y = obj.y * tileSize + height / 2;

      const rect = scene.add.rectangle(x, y, width, height, color);
      rect.setStrokeStyle(2, 0x000000, 0.8);
      rect.setData('objectData', obj);
      rect.setData('type', 'mapObject');
      container.add(rect);

      // Add icon/symbol for object type
      if (width > 20 && height > 20) {
        const symbol = this.getObjectSymbol(obj.type);
        const label = scene.add.text(x, y - 5, symbol, {
          font: '14px Arial',
          color: '#FFFFFF',
        });
        label.setOrigin(0.5);
        container.add(label);
      }
    });
  }

  /**
   * Render points of interest (POIs)
   */
  private static renderPointsOfInterest(
    scene: Phaser.Scene,
    mapData: IMapData,
    tileSize: number,
    container: Phaser.GameObjects.Container
  ): void {
    if (!mapData.pointsOfInterest) return;

    mapData.pointsOfInterest.forEach((poi: IPointOfInterest) => {
      const color = this.getPOIColor(poi.type);
      const width = (poi.width * tileSize);
      const height = (poi.height * tileSize);
      const x = poi.x * tileSize + width / 2;
      const y = poi.y * tileSize + height / 2;

      // Draw POI boundary
      const rect = scene.add.rectangle(x, y, width, height, color, 0.3);
      rect.setStrokeStyle(2, color, 1);
      rect.setData('poiData', poi);
      rect.setData('type', 'poi');
      container.add(rect);

      // Add POI label
      const label = scene.add.text(x, y, poi.name, {
        font: 'bold 12px Arial',
        color: '#FFFFFF',
        backgroundColor: `#${color.toString(16).padStart(6, '0')}`,
        padding: { x: 4, y: 2 },
        align: 'center',
      });
      label.setOrigin(0.5);
      container.add(label);
    });
  }

  /**
   * Get color for POI type
   */
  private static getPOIColor(type: string): number {
    const colorMap: Record<string, number> = {
      shop: 0xFF6347, // tomato
      pokecenter: 0x00CED1, // dark turquoise
      gym: 0xFFD700, // gold
      pokedex: 0x4169E1, // royal blue
      house: 0x8B4513, // saddle brown
      landmark: 0x696969, // dim gray
      other: 0x808080, // gray
    };
    return colorMap[type] || 0x808080;
  }

  /**
   * Get symbol for object type
   */
  private static getObjectSymbol(type: string): string {
    const symbolMap: Record<string, string> = {
      building: '🏠',
      tree: '🌲',
      rock: '🪨',
      sign: '🪧',
      door: '🚪',
      flower: '🌸',
      fence: '🚧',
      water: '💧',
      bridge: '🌉',
      other: '◼',
    };
    return symbolMap[type] || '◼';
  }

  /**
   * Parse color string (hex or named) to number
   */
  private static parseColor(colorString: string): number {
    if (colorString.startsWith('#')) {
      return parseInt(colorString.substring(1), 16);
    }
    const colorMap: Record<string, number> = {
      black: 0x000000,
      white: 0xFFFFFF,
      red: 0xFF0000,
      green: 0x00FF00,
      blue: 0x0000FF,
      yellow: 0xFFFF00,
      cyan: 0x00FFFF,
      magenta: 0xFF00FF,
      gray: 0x808080,
    };
    return colorMap[colorString.toLowerCase()] || 0x808080;
  }

  /**
   * Create collision bodies for a map
   */
  static createCollisionBodies(
    scene: Phaser.Scene,
    mapData: IMapData
  ): Phaser.Physics.Arcade.StaticGroup {
    const staticGroup = scene.physics.add.staticGroup();
    const tileSize = mapData.tileSize;

    for (let y = 0; y < mapData.height; y++) {
      for (let x = 0; x < mapData.width; x++) {
        const index = y * mapData.width + x;
        const tileId = mapData.tiles[index];

        if (mapData.collisions[tileId]) {
          const worldX = x * tileSize + tileSize / 2;
          const worldY = y * tileSize + tileSize / 2;

          const rect = scene.add.rectangle(worldX, worldY, tileSize, tileSize);
          rect.setVisible(false);
          staticGroup.add(rect);
        }
      }
    }

    return staticGroup;
  }
}

export default MapRenderer;
