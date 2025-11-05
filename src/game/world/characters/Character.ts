import { Scene } from 'phaser';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'NONE';
export type Coordinate = { x: number; y: number };

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
  protected _scene: Scene;
  protected _phaserGameObject: Phaser.GameObjects.Sprite;
  protected _direction: Direction;
  protected _isMoving: boolean;
  protected _targetPosition: Coordinate;
  protected _previousTargetPosition: Coordinate;
  protected _spriteGridMovementFinishedCallback?: () => void;
  protected _idleFrameConfig: CharacterIdleFrameConfig;
  protected _origin: Coordinate;
  protected _collisionLayer?: Phaser.Tilemaps.TilemapLayer;
  protected _otherCharactersToCheckForCollisionsWith: Character[];
  protected _spriteChangedDirectionCallback?: () => void;
  protected _objectsToCheckForCollisionsWith: { position: Coordinate }[];
  protected _spriteGridMovementStartedCallback?: (position: Coordinate) => void;
  protected _isRunning: boolean;

  constructor(config: CharacterConfig) {
    this._scene = config.scene;
    this._direction = config.direction;
    this._isMoving = false;
    this._isRunning = false;
    this._targetPosition = { ...config.position };
    this._previousTargetPosition = { ...config.position };
    this._idleFrameConfig = config.idleFrameConfig;
    this._origin = config.origin ? { ...config.origin } : { x: 0, y: 0 };
    this._collisionLayer = config.collisionLayer;
    this._otherCharactersToCheckForCollisionsWith = config.otherCharactersToCheckForCollisionsWith || [];
    this._objectsToCheckForCollisionsWith = config.objectsToCheckForCollisionsWith || [];
    
    this._phaserGameObject = this._scene.add
      .sprite(config.position.x, config.position.y, config.assetKey, this._getIdleFrame())
      .setOrigin(this._origin.x, this._origin.y);
    
    this._spriteGridMovementFinishedCallback = config.spriteGridMovementFinishedCallback;
    this._spriteChangedDirectionCallback = config.spriteChangedDirectionCallback;
    this._spriteGridMovementStartedCallback = config.spriteGridMovementStartedCallback;
  }

  get sprite(): Phaser.GameObjects.Sprite {
    return this._phaserGameObject;
  }

  get isMoving(): boolean {
    return this._isMoving;
  }

  get direction(): Direction {
    return this._direction;
  }

  moveCharacter(direction: Direction, isRunning: boolean = false): void {
    if (this._isMoving) {
      return;
    }
    this._isRunning = isRunning;
    this._moveSprite(direction);
  }

  addCharacterToCheckForCollisionsWith(character: Character): void {
    this._otherCharactersToCheckForCollisionsWith.push(character);
  }

  update(time: number): void {
    if (this._isMoving) {
      return;
    }

    // stop current animation and show idle frame
    const idleFrame = this._phaserGameObject.anims.currentAnim?.frames[1]?.frame.name;
    this._phaserGameObject.anims.stop();
    if (!idleFrame) {
      return;
    }
    
    switch (this._direction) {
      case 'DOWN':
      case 'LEFT':
      case 'RIGHT':
      case 'UP':
        this._phaserGameObject.setFrame(parseInt(idleFrame));
        break;
      case 'NONE':
        break;
    }
  }

  protected _getIdleFrame(): number {
    return this._idleFrameConfig[this._direction];
  }

  protected _moveSprite(direction: Direction): void {
    const changedDirection = this._direction !== direction;
    this._direction = direction;

    if (changedDirection) {
      if (this._spriteChangedDirectionCallback !== undefined) {
        this._spriteChangedDirectionCallback();
      }
    }

    if (this._isBlockingTile()) {
      return;
    }

    this._isMoving = true;
    this._handleSpriteMovement();
  }

  protected _isBlockingTile(): boolean {
    if (this._direction === 'NONE') {
      return false;
    }

    const targetPosition = { ...this._targetPosition };
    const updatedPosition = this.getTargetPositionFromGameObjectPositionAndDirection(targetPosition, this._direction);

    return (
      this._doesPositionCollideWithCollisionLayer(updatedPosition) ||
      this._doesPositionCollideWithOtherCharacter(updatedPosition) ||
      this._doesPositionCollideWithObject(updatedPosition)
    );
  }

  private _handleSpriteMovement(): void {
    if (this._direction === 'NONE') {
      return;
    }

    const updatedPosition = this.getTargetPositionFromGameObjectPositionAndDirection(this._targetPosition, this._direction);
    this._previousTargetPosition = { ...this._targetPosition };
    this._targetPosition.x = updatedPosition.x;
    this._targetPosition.y = updatedPosition.y;

    if (this._spriteGridMovementStartedCallback) {
      this._spriteGridMovementStartedCallback({ ...this._targetPosition });
    }

    this._scene.add.tween({
      delay: 0,
      duration: this._isRunning ? 300 : 600,
      y: {
        from: this._phaserGameObject.y,
        start: this._phaserGameObject.y,
        to: this._targetPosition.y,
      },
      x: {
        from: this._phaserGameObject.x,
        start: this._phaserGameObject.x,
        to: this._targetPosition.x,
      },
      targets: this._phaserGameObject,
      onComplete: () => {
        this._isMoving = false;
        this._isRunning = false;
        this._previousTargetPosition = { ...this._targetPosition };
        if (this._spriteGridMovementFinishedCallback) {
          this._spriteGridMovementFinishedCallback();
        }
      },
    });
  }

  protected _doesPositionCollideWithCollisionLayer(position: Coordinate): boolean {
    if (!this._collisionLayer) {
      return false;
    }

    const { x, y } = position;
    const tile = this._collisionLayer.getTileAtWorldXY(x, y, true);
    if (!tile) {
      return false;
    }
    return tile.index !== -1;
  }

  protected _doesPositionCollideWithOtherCharacter(position: Coordinate): boolean {
    const { x, y } = position;
    if (this._otherCharactersToCheckForCollisionsWith.length === 0) {
      return false;
    }

    const collidesWithACharacter = this._otherCharactersToCheckForCollisionsWith.some((character) => {
      return (
        (character._targetPosition.x === x && character._targetPosition.y === y) ||
        (character._previousTargetPosition.x === x && character._previousTargetPosition.y === y)
      );
    });
    return collidesWithACharacter;
  }

  protected _doesPositionCollideWithObject(position: Coordinate): boolean {
    const { x, y } = position;
    if (this._objectsToCheckForCollisionsWith.length === 0) {
      return false;
    }

    const collidesWithObject = this._objectsToCheckForCollisionsWith.some((object) => {
      return object.position.x === x && object.position.y === y;
    });
    return collidesWithObject;
  }

  protected getTargetPositionFromGameObjectPositionAndDirection(position: Coordinate, direction: Direction): Coordinate {
    const tileSize = 32;
    switch (direction) {
      case 'UP':
        return { x: position.x, y: position.y - tileSize };
      case 'DOWN':
        return { x: position.x, y: position.y + tileSize };
      case 'LEFT':
        return { x: position.x - tileSize, y: position.y };
      case 'RIGHT':
        return { x: position.x + tileSize, y: position.y };
      case 'NONE':
      default:
        return { x: position.x, y: position.y };
    }
  }

  destroy(): void {
    this._phaserGameObject.destroy();
  }
}