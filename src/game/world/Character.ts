import { Scene } from 'phaser';
import { Direction, Coordinate } from '../models/common';
import { getTargetPositionFromGameObjectPositionAndDirection } from './utils/gridUtils';

export interface CharacterIdleFrameConfig {
  LEFT: number;
  RIGHT: number;
  UP: number;
  DOWN: number;
  NONE: number;
}

export interface CharacterConfig {
  scene: Scene;
  assetKey: string;
  position: Coordinate;
  direction: Direction;
  origin?: Coordinate;
  idleFrameConfig: CharacterIdleFrameConfig;
  collisionLayer?: Phaser.Tilemaps.TilemapLayer;
  otherCharactersToCheckForCollisionsWith?: Character[];
  objectsToCheckForCollisionsWith?: { position: Coordinate }[];
  spriteGridMovementFinishedCallback?: () => void;
  spriteChangedDirectionCallback?: () => void;
  spriteGridMovementStartedCallback?: (position: Coordinate) => void;
}

export abstract class Character {
  protected scene: Scene;
  protected phaserGameObject: Phaser.GameObjects.Sprite;
  protected direction: Direction;
  protected isMoving: boolean = false;
  protected isRunning: boolean = false;
  protected targetPosition: Coordinate;
  protected previousTargetPosition: Coordinate;
  protected origin: Coordinate;
  protected collisionLayer?: Phaser.Tilemaps.TilemapLayer;
  protected otherCharactersToCheckForCollisionsWith: Character[];
  protected objectsToCheckForCollisionsWith: { position: Coordinate }[];
  protected spriteGridMovementFinishedCallback?: () => void;
  protected spriteChangedDirectionCallback?: () => void;
  protected spriteGridMovementStartedCallback?: (position: Coordinate) => void;
  protected idleFrameConfig: CharacterIdleFrameConfig;

  constructor(config: CharacterConfig) {
    if (this.constructor === Character) {
      throw new Error('Character is an abstract class and cannot be instantiated.');
    }

    this.scene = config.scene;
    this.direction = config.direction;
    this.targetPosition = { ...config.position };
    this.previousTargetPosition = { ...config.position };
    this.origin = config.origin || { x: 0, y: 0 };
    this.idleFrameConfig = config.idleFrameConfig;
    this.collisionLayer = config.collisionLayer;
    this.otherCharactersToCheckForCollisionsWith = config.otherCharactersToCheckForCollisionsWith || [];
    this.objectsToCheckForCollisionsWith = config.objectsToCheckForCollisionsWith || [];
    this.spriteGridMovementFinishedCallback = config.spriteGridMovementFinishedCallback;
    this.spriteChangedDirectionCallback = config.spriteChangedDirectionCallback;
    this.spriteGridMovementStartedCallback = config.spriteGridMovementStartedCallback;

    this.phaserGameObject = this.scene.add
      .sprite(config.position.x, config.position.y, config.assetKey, this.getIdleFrame())
      .setOrigin(this.origin.x, this.origin.y);
  }

  get sprite(): Phaser.GameObjects.Sprite {
    return this.phaserGameObject;
  }

  get moving(): boolean {
    return this.isMoving;
  }

  get currentDirection(): Direction {
    return this.direction;
  }

  moveCharacter(direction: Direction, isRunning: boolean = false): void {
    if (this.isMoving) {
      return;
    }
    this.isRunning = isRunning;
    this.moveSprite(direction);
  }

  addCharacterToCheckForCollisionsWith(character: Character): void {
    this.otherCharactersToCheckForCollisionsWith.push(character);
  }

  update(time: number): void {
    if (this.isMoving) {
      return;
    }

    // Stop current animation and show idle frame
    const currentAnim = this.phaserGameObject.anims.currentAnim;
    if (currentAnim && currentAnim.frames.length > 1) {
      const idleFrame = currentAnim.frames[1].frame.name;
      this.phaserGameObject.anims.stop();
      
      switch (this.direction) {
        case Direction.DOWN:
        case Direction.LEFT:
        case Direction.RIGHT:
        case Direction.UP:
          this.phaserGameObject.setFrame(idleFrame);
          break;
        case Direction.NONE:
          break;
        default:
          throw new Error(`Invalid direction: ${this.direction}`);
      }
    }
  }

  protected getIdleFrame(): number {
    return this.idleFrameConfig[this.direction];
  }

  protected moveSprite(direction: Direction): void {
    const changedDirection = this.direction !== direction;
    this.direction = direction;

    if (changedDirection && this.spriteChangedDirectionCallback) {
      this.spriteChangedDirectionCallback();
    }

    if (this.isBlockingTile()) {
      return;
    }

    this.isMoving = true;
    this.handleSpriteMovement();
  }

  protected isBlockingTile(): boolean {
    if (this.direction === Direction.NONE) {
      return false;
    }

    const targetPosition = { ...this.targetPosition };
    const updatedPosition = getTargetPositionFromGameObjectPositionAndDirection(targetPosition, this.direction);

    return (
      this.doesPositionCollideWithCollisionLayer(updatedPosition) ||
      this.doesPositionCollideWithOtherCharacter(updatedPosition) ||
      this.doesPositionCollideWithObject(updatedPosition)
    );
  }

  private handleSpriteMovement(): void {
    if (this.direction === Direction.NONE) {
      return;
    }

    const updatedPosition = getTargetPositionFromGameObjectPositionAndDirection(this.targetPosition, this.direction);
    this.previousTargetPosition = { ...this.targetPosition };
    this.targetPosition.x = updatedPosition.x;
    this.targetPosition.y = updatedPosition.y;

    if (this.spriteGridMovementStartedCallback) {
      this.spriteGridMovementStartedCallback({ ...this.targetPosition });
    }

    this.scene.add.tween({
      delay: 0,
      duration: this.isRunning ? 300 : 600,
      y: {
        from: this.phaserGameObject.y,
        start: this.phaserGameObject.y,
        to: this.targetPosition.y,
      },
      x: {
        from: this.phaserGameObject.x,
        start: this.phaserGameObject.x,
        to: this.targetPosition.x,
      },
      targets: this.phaserGameObject,
      onComplete: () => {
        this.isMoving = false;
        this.isRunning = false;
        this.previousTargetPosition = { ...this.targetPosition };
        if (this.spriteGridMovementFinishedCallback) {
          this.spriteGridMovementFinishedCallback();
        }
      },
    });
  }

  private doesPositionCollideWithCollisionLayer(position: Coordinate): boolean {
    if (!this.collisionLayer) {
      return false;
    }

    const { x, y } = position;
    const tile = this.collisionLayer.getTileAtWorldXY(x, y, true);
    if (!tile) {
      return false;
    }
    return tile.index !== -1;
  }

  private doesPositionCollideWithOtherCharacter(position: Coordinate): boolean {
    const { x, y } = position;
    if (this.otherCharactersToCheckForCollisionsWith.length === 0) {
      return false;
    }

    // Check if the new position that this character wants to move to is the same position that another
    // character is currently at, or was previously at and is moving towards currently
    return this.otherCharactersToCheckForCollisionsWith.some((character) => {
      return (
        (character.targetPosition.x === x && character.targetPosition.y === y) ||
        (character.previousTargetPosition.x === x && character.previousTargetPosition.y === y)
      );
    });
  }

  private doesPositionCollideWithObject(position: Coordinate): boolean {
    const { x, y } = position;
    if (this.objectsToCheckForCollisionsWith.length === 0) {
      return false;
    }

    return this.objectsToCheckForCollisionsWith.some((object) => {
      return object.position.x === x && object.position.y === y;
    });
  }
}