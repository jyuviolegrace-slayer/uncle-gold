import { Coordinate } from '../models/common';
import { TextureKeys } from '../assets/TextureKeys';

export interface ItemConfig {
  scene: Phaser.Scene;
  position: Coordinate;
  itemId: number;
  id: number;
}

export class Item {
  private scene: Phaser.Scene;
  private gameObject: Phaser.GameObjects.Image;
  private id: number;
  private itemId: number;

  constructor(config: ItemConfig) {
    this.id = config.id;
    this.itemId = config.itemId;
    this.scene = config.scene;
    
    // Use a placeholder sprite for now - this should be configurable based on item type
    this.gameObject = this.scene.add
      .image(config.position.x, config.position.y, TextureKeys.WORLD, 22)
      .setOrigin(0);
  }

  get itemGameObject(): Phaser.GameObjects.Image {
    return this.gameObject;
  }

  get position(): Coordinate {
    return {
      x: this.gameObject.x,
      y: this.gameObject.y,
    };
  }

  get dataItemId(): number {
    return this.itemId;
  }

  get uniqueId(): number {
    return this.id;
  }

  destroy(): void {
    this.gameObject.destroy();
  }
}