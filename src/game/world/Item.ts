import { Scene } from 'phaser';

export interface WorldItemConfig {
  scene: Scene;
  position: { x: number; y: number };
  itemId: string;
  id: number;
  name: string;
}

export class WorldItem {
  public scene: Scene;
  public phaserGameObject: Phaser.GameObjects.Image;
  public itemNum: number;
  public itemKey: string;
  public displayName: string;

  constructor(config: WorldItemConfig) {
    this.itemNum = config.id;
    this.itemKey = config.itemId;
    this.displayName = config.name;
    this.scene = config.scene;
    this.phaserGameObject = this.scene.add
      .image(config.position.x, config.position.y, 'star')
      .setOrigin(0);
  }

  get gameObject(): Phaser.GameObjects.Image {
    return this.phaserGameObject;
  }

  get position(): { x: number; y: number } {
    return {
      x: this.phaserGameObject.x,
      y: this.phaserGameObject.y,
    };
  }

  get itemId(): string {
    return this.itemKey;
  }

  get id(): number {
    return this.itemNum;
  }

  get name(): string {
    return this.displayName;
  }

  update(time: number): void {
    // Item update logic
  }

  destroy(): void {
    this.phaserGameObject.destroy();
  }
}