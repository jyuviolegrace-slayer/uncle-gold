/**
 * MapRenderer - Renders tile-based maps to Phaser scene
 * Creates visual representation of map tiles
 */

import Phaser from 'phaser';
import { IMapData } from './MapManager';

export interface ITileRenderConfig {
  tileSize?: number;
  showCollisions?: boolean;
}

export class MapRenderer {
  /**
   * Render a map to the given scene
   * Creates a tilemap visual using simple rectangles
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

    return container;
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
