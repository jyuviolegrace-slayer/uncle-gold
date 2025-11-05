import { Scene, GameObjects } from 'phaser';
import { Coordinate } from './GridUtils';

export interface ItemConfig {
  id: string;
  scene: Scene;
  x: number;
  y: number;
  itemId: string;
  itemName: string;
}

/**
 * World item - collectable items on the map
 */
export class Item {
  private id: string;
  private itemId: string;
  private itemName: string;
  private sprite: GameObjects.Image;
  private scene: Scene;

  constructor(config: ItemConfig) {
    this.id = config.id;
    this.itemId = config.itemId;
    this.itemName = config.itemName;
    this.scene = config.scene;

    // Create sprite for the item
    this.sprite = this.scene.add.image(config.x, config.y, 'star');
    this.sprite.setScale(0.75);
    this.sprite.setTint(0xFFD700); // Gold tint for items
    this.sprite.setData('itemId', this.itemId);
    this.sprite.setData('type', 'item');
  }

  /**
   * Get item ID
   */
  getId(): string {
    return this.id;
  }

  /**
   * Get item type ID
   */
  getItemId(): string {
    return this.itemId;
  }

  /**
   * Get item name
   */
  getItemName(): string {
    return this.itemName;
  }

  /**
   * Get position
   */
  getPosition(): Coordinate {
    return {
      x: this.sprite.x,
      y: this.sprite.y,
    };
  }

  /**
   * Get sprite
   */
  getSprite(): GameObjects.Image {
    return this.sprite;
  }

  /**
   * Set visible
   */
  setVisible(visible: boolean): void {
    this.sprite.setVisible(visible);
  }

  /**
   * Remove item from world
   */
  remove(): void {
    this.sprite.destroy();
  }

  /**
   * Get display name (can be customized per item type)
   */
  getDisplayName(): string {
    return this.itemName;
  }
}
