import { Scene } from 'phaser';
import { Character } from './Character';
import { Coordinate, Direction } from './GridUtils';

const TILE_SIZE = 32;

/**
 * Player character - controlled by keyboard input
 */
export class Player extends Character {
  private isRunning: boolean = false;
  private movementBuffer: Direction | null = null;

  constructor(config: {
    scene: Scene;
    x: number;
    y: number;
    collisionLayer?: Phaser.Tilemaps.TilemapLayer;
  }) {
    super({
      scene: config.scene,
      x: config.x,
      y: config.y,
      key: 'player',
      frame: 0,
      collisionLayer: config.collisionLayer,
    });

    // Setup initial animations if they exist
    this.setupAnimations();
  }

  /**
   * Handle input - move in direction
   */
  handleInput(direction: Direction, isRunning: boolean = false): void {
    this.isRunning = isRunning;
    this.movementBuffer = direction;

    if (!this.isMoving) {
      this.moveInDirection(direction);
    }
  }

  /**
   * Process buffered movement
   */
  update(time: number): void {
    super.update(time);

    // Process buffered movement if available
    if (this.movementBuffer && !this.isMoving) {
      this.moveInDirection(this.movementBuffer);
      this.movementBuffer = null;
    }
  }

  /**
   * Get running state
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Setup character animations
   */
  private setupAnimations(): void {
    const scene = this.scene;
    
    // Create animations if they don't exist
    if (!scene.anims.exists('PLAYER_DOWN')) {
      scene.anims.create({
        key: 'PLAYER_DOWN',
        frames: scene.anims.generateFrameNumbers('player', { start: 6, end: 8 }),
        frameRate: 10,
        repeat: 0,
      });
    }

    if (!scene.anims.exists('PLAYER_UP')) {
      scene.anims.create({
        key: 'PLAYER_UP',
        frames: scene.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
        frameRate: 10,
        repeat: 0,
      });
    }

    if (!scene.anims.exists('PLAYER_LEFT')) {
      scene.anims.create({
        key: 'PLAYER_LEFT',
        frames: scene.anims.generateFrameNumbers('player', { start: 9, end: 11 }),
        frameRate: 10,
        repeat: 0,
      });
    }

    if (!scene.anims.exists('PLAYER_RIGHT')) {
      scene.anims.create({
        key: 'PLAYER_RIGHT',
        frames: scene.anims.generateFrameNumbers('player', { start: 3, end: 5 }),
        frameRate: 10,
        repeat: 0,
      });
    }
  }

  /**
   * Get animation key for direction
   */
  protected getAnimationKeyForDirection(): string {
    return `PLAYER_${this.direction}`;
  }

  /**
   * Update idle frame based on direction
   */
  protected updateFrame(): void {
    const frameMap: Record<Direction, number> = {
      DOWN: 7,
      UP: 1,
      LEFT: 10,
      RIGHT: 4,
      NONE: 7,
    };
    this.sprite.setFrame(frameMap[this.direction]);
  }
}
