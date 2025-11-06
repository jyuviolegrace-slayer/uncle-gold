import { Character, type CharacterConfig } from './Character';
import { Direction, Coordinate } from '../models/common';
import { NpcEvent, NpcDetails } from '../models/npc';
import { TextureKeys } from '../assets/TextureKeys';

export enum NpcMovementPattern {
  IDLE = 'IDLE',
  CLOCKWISE = 'CLOCKWISE',
  SET_PATH = 'SET_PATH',
}

export type NpcPath = Record<number, Coordinate>;

export interface NpcConfig extends Omit<CharacterConfig, 'assetKey' | 'idleFrameConfig'> {
  frame: number;
  npcPath: NpcPath;
  movementPattern: NpcMovementPattern;
  events: NpcEvent[];
  animationKeyPrefix: string;
  id: number;
}

export class NPC extends Character {
  private isTalkingToPlayer: boolean = false;
  private npcPath: NpcPath;
  private currentPathIndex: number = 0;
  private movementPattern: NpcMovementPattern;
  private lastMovementTime: number;
  private events: NpcEvent[];
  private animationKeyPrefix: string;
  private id: number;
  private finishedMovementCallback?: () => void;

  constructor(config: NpcConfig) {
    super({
      ...config,
      assetKey: TextureKeys.CHARACTERS,
      origin: { x: 0, y: 0 },
      idleFrameConfig: {
        DOWN: config.frame,
        UP: config.frame + 1,
        NONE: config.frame,
        LEFT: config.frame + 2,
        RIGHT: config.frame + 2,
      },
    });

    this.isTalkingToPlayer = false;
    this.npcPath = config.npcPath;
    this.currentPathIndex = 0;
    this.movementPattern = config.movementPattern;
    this.lastMovementTime = Phaser.Math.Between(3500, 5000);
    this.sprite.setScale(4);
    this.events = config.events;
    this.animationKeyPrefix = config.animationKeyPrefix;
    this.id = config.id;
  }

  get npcEvents(): NpcEvent[] {
    return [...this.events];
  }

  get talkingToPlayer(): boolean {
    return this.isTalkingToPlayer;
  }

  set talkingToPlayer(value: boolean) {
    this.isTalkingToPlayer = value;
  }

  get npcId(): number {
    return this.id;
  }

  get path(): NpcPath {
    return this.npcPath;
  }

  set path(value: NpcPath) {
    this.npcPath = value;
  }

  set npcMovementPattern(value: NpcMovementPattern) {
    this.movementPattern = value;
  }

  set onFinishedMovement(callback: () => void) {
    this.finishedMovementCallback = callback;
  }

  resetMovementTime(): void {
    this.lastMovementTime = 0;
  }

  facePlayer(playerDirection: Direction): void {
    switch (playerDirection) {
      case Direction.DOWN:
        this.sprite.setFrame(this.idleFrameConfig.UP).setFlipX(false);
        break;
      case Direction.LEFT:
        this.sprite.setFrame(this.idleFrameConfig.RIGHT).setFlipX(false);
        break;
      case Direction.RIGHT:
        this.sprite.setFrame(this.idleFrameConfig.LEFT).setFlipX(true);
        break;
      case Direction.UP:
        this.sprite.setFrame(this.idleFrameConfig.DOWN).setFlipX(false);
        break;
      case Direction.NONE:
        break;
      default:
        throw new Error(`Invalid direction: ${playerDirection}`);
    }
  }

  update(time: number): void {
    if (this.moving) {
      return;
    }
    if (this.isTalkingToPlayer) {
      return;
    }
    super.update(time);

    if (this.movementPattern === NpcMovementPattern.IDLE) {
      return;
    }

    if (this.lastMovementTime < time) {
      let characterDirection = Direction.NONE;
      let nextPosition = this.npcPath[this.currentPathIndex + 1];

      // Validate if we actually moved to the next position, if not, skip updating index
      const prevPosition = this.npcPath[this.currentPathIndex];
      if (prevPosition.x !== this.sprite.x || prevPosition.y !== this.sprite.y) {
        nextPosition = this.npcPath[this.currentPathIndex];
      } else {
        if (nextPosition === undefined) {
          // If NPC is following a set path, once we reach the end, stop moving the NPC
          if (this.movementPattern === NpcMovementPattern.SET_PATH) {
            this.movementPattern = NpcMovementPattern.IDLE;
            this.currentPathIndex = 0;
            return;
          }
          nextPosition = this.npcPath[0];
          this.currentPathIndex = 0;
        } else {
          this.currentPathIndex = this.currentPathIndex + 1;
        }
      }

      if (nextPosition.x > this.sprite.x) {
        characterDirection = Direction.RIGHT;
      } else if (nextPosition.x < this.sprite.x) {
        characterDirection = Direction.LEFT;
      } else if (nextPosition.y < this.sprite.y) {
        characterDirection = Direction.UP;
      } else if (nextPosition.y > this.sprite.y) {
        characterDirection = Direction.DOWN;
      }

      this.moveCharacter(characterDirection);
      if (this.movementPattern === NpcMovementPattern.SET_PATH) {
        this.lastMovementTime = time;
      } else {
        this.lastMovementTime = time + Phaser.Math.Between(2000, 5000);
      }
    }

    // Call finished movement callback if set
    if (this.finishedMovementCallback && !this.moving) {
      this.finishedMovementCallback();
    }
  }

  protected moveSprite(direction: Direction): void {
    super.moveSprite(direction);

    // Play animation based on direction
    switch (this.direction) {
      case Direction.DOWN:
      case Direction.RIGHT:
      case Direction.UP:
        if (
          !this.sprite.anims.isPlaying ||
          this.sprite.anims.currentAnim?.key !== `${this.animationKeyPrefix}_${this.direction}`
        ) {
          this.sprite.play(`${this.animationKeyPrefix}_${this.direction}`);
          this.sprite.setFlipX(false);
        }
        break;
      case Direction.LEFT:
        if (
          !this.sprite.anims.isPlaying ||
          this.sprite.anims.currentAnim?.key !== `${this.animationKeyPrefix}_${Direction.RIGHT}`
        ) {
          this.sprite.play(`${this.animationKeyPrefix}_${Direction.RIGHT}`);
          this.sprite.setFlipX(true);
        }
        break;
      case Direction.NONE:
        break;
      default:
        throw new Error(`Invalid direction: ${this.direction}`);
    }
  }
}