import { Scene } from 'phaser';
import { TextureKeys } from '../assets/TextureKeys';

/**
 * Battle Background System
 * Handles rendering different battle backgrounds based on the environment
 */
export class BattleBackground {
  private scene: Scene;
  private backgroundGameObject: Phaser.GameObjects.Image;

  constructor(scene: Scene) {
    this.scene = scene;
    this.backgroundGameObject = this.scene.add
      .image(0, 0, TextureKeys.BATTLE_FOREST)
      .setOrigin(0)
      .setAlpha(0);
  }

  /**
   * Show forest battle background
   */
  showForest(): void {
    this.backgroundGameObject.setTexture(TextureKeys.BATTLE_FOREST).setAlpha(1);
  }

  /**
   * Hide the background
   */
  hide(): void {
    this.backgroundGameObject.setAlpha(0);
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.backgroundGameObject.destroy();
  }
}