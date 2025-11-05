import { Scene, GameObjects, Math as PhaserMath } from 'phaser';
import { Coordinate, Direction, getTargetPositionFromDirection, snapToGrid } from './GridUtils';

const TILE_SIZE = 32;
const MOVEMENT_SPEED = 100; // pixels per second

/**
 * Abstract base class for all characters (Player, NPCs)
 * Handles grid-based movement, animations, and collisions
 */
export abstract class Character {
  protected scene: Scene;
  protected sprite: GameObjects.Sprite;
  protected direction: Direction = 'DOWN';
  protected isMoving: boolean = false;
  protected targetPosition: Coordinate;
  protected collisionLayer?: Phaser.Tilemaps.TilemapLayer;
  protected otherCharacters: Character[] = [];

  private moveStartTime: number = 0;
  private moveDuration: number = (TILE_SIZE / MOVEMENT_SPEED) * 1000; // ms for one tile

  constructor(config: {
    scene: Scene;
    x: number;
    y: number;
    key: string;
    frame?: string | number;
    collisionLayer?: Phaser.Tilemaps.TilemapLayer;
  }) {
    this.scene = config.scene;
    this.sprite = config.scene.add.sprite(config.x, config.y, config.key, config.frame ?? 0);
    this.targetPosition = { x: config.x, y: config.y };
    this.collisionLayer = config.collisionLayer;
  }

  /**
   * Get the sprite object
   */
  getSprite(): GameObjects.Sprite {
    return this.sprite;
  }

  /**
   * Get current position
   */
  getPosition(): Coordinate {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  /**
   * Set position directly
   */
  setPosition(x: number, y: number): void {
    this.sprite.setPosition(x, y);
    this.targetPosition = { x, y };
  }

  /**
   * Get current direction
   */
  getDirection(): Direction {
    return this.direction;
  }

  /**
   * Set direction without moving
   */
  setDirection(direction: Direction): void {
    this.direction = direction;
    this.updateFrame();
  }

  /**
   * Check if character is moving
   */
  getIsMoving(): boolean {
    return this.isMoving;
  }

  /**
   * Move character in a direction
   */
  moveInDirection(direction: Direction): void {
    if (this.isMoving || direction === 'NONE') {
      return;
    }

    // Check collision
    if (!this.canMove(direction)) {
      this.setDirection(direction);
      return;
    }

    this.direction = direction;
    this.targetPosition = getTargetPositionFromDirection(this.getPosition(), direction, TILE_SIZE);
    this.isMoving = true;
    this.moveStartTime = this.scene.time.now;

    this.playMoveAnimation();
  }

  /**
   * Update character (called every frame)
   */
  update(time: number): void {
    if (!this.isMoving) {
      return;
    }

    const elapsedTime = time - this.moveStartTime;
    const progress = Math.min(elapsedTime / this.moveDuration, 1);

    // Interpolate position
    const startPos = this.getStartPositionForCurrentMove();
    this.sprite.x = PhaserMath.Linear(startPos.x, this.targetPosition.x, progress);
    this.sprite.y = PhaserMath.Linear(startPos.y, this.targetPosition.y, progress);

    // Movement complete
    if (progress === 1) {
      this.sprite.setPosition(this.targetPosition.x, this.targetPosition.y);
      this.isMoving = false;
      this.onMovementComplete();
    }
  }

  /**
   * Add another character to check collisions with
   */
  addCharacterToCheckCollisionsWith(character: Character): void {
    if (!this.otherCharacters.includes(character)) {
      this.otherCharacters.push(character);
    }
  }

  /**
   * Cleanup when done
   */
  destroy(): void {
    this.sprite.destroy();
  }

  /**
   * Check if character can move in direction (collision detection)
   */
  protected canMove(direction: Direction): boolean {
    const nextPos = getTargetPositionFromDirection(this.getPosition(), direction, TILE_SIZE);

    // Check collision layer
    if (this.collisionLayer) {
      const tile = this.collisionLayer.getTileAtWorldXY(nextPos.x, nextPos.y);
      if (tile && tile.collideDown && tile.collideUp && tile.collideLeft && tile.collideRight) {
        return false;
      }
    }

    // Check other characters
    for (const character of this.otherCharacters) {
      const charPos = character.getPosition();
      if (Math.abs(charPos.x - nextPos.x) < TILE_SIZE && Math.abs(charPos.y - nextPos.y) < TILE_SIZE) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get starting position for current movement (for interpolation)
   */
  protected getStartPositionForCurrentMove(): Coordinate {
    return {
      x: this.targetPosition.x - getTargetPositionFromDirection({ x: 0, y: 0 }, this.direction, TILE_SIZE).x,
      y: this.targetPosition.y - getTargetPositionFromDirection({ x: 0, y: 0 }, this.direction, TILE_SIZE).y,
    };
  }

  /**
   * Play movement animation
   */
  protected playMoveAnimation(): void {
    const animKey = this.getAnimationKeyForDirection();
    if (this.sprite.anims.exists(animKey)) {
      this.sprite.play(animKey);
    }
  }

  /**
   * Update idle frame based on direction
   */
  protected updateFrame(): void {
    // Override in subclass
  }

  /**
   * Get animation key for current direction
   */
  protected getAnimationKeyForDirection(): string {
    return `IDLE_${this.direction}`;
  }

  /**
   * Called when movement completes
   */
  protected onMovementComplete(): void {
    // Override in subclass
  }
}
