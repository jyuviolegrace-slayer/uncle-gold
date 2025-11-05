import { Scene } from 'phaser';

/**
 * BattleBackground - Manages the visual background for battle scenes
 * Replaces legacy Background.js with TypeScript implementation
 */
export class BattleBackground {
  private scene: Scene;
  private backgroundObject: Phaser.GameObjects.Rectangle;

  constructor(scene: Scene) {
    this.scene = scene;
    const width = scene.game.config.width as number;
    const height = scene.game.config.height as number;
    
    this.backgroundObject = this.scene.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x1a1a1a
    );
    this.backgroundObject.setDepth(-100);
  }

  /**
   * Show forest background
   */
  showForest(): void {
    this.backgroundObject.setFillStyle(0x2d5016);
  }

  /**
   * Show cave background
   */
  showCave(): void {
    this.backgroundObject.setFillStyle(0x4a4a4a);
  }

  /**
   * Show water background
   */
  showWater(): void {
    this.backgroundObject.setFillStyle(0x1a4d6d);
  }

  /**
   * Show generic background
   */
  showGeneric(): void {
    this.backgroundObject.setFillStyle(0x1a1a1a);
  }

  /**
   * Get the background game object
   */
  getBackgroundObject(): Phaser.GameObjects.Rectangle {
    return this.backgroundObject;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.backgroundObject.destroy();
  }
}
