import { Character, CharacterConfig, Direction, Coordinate } from './Character';

export type NPCMovementPattern = 'IDLE' | 'CLOCKWISE' | 'SET_PATH';

export type NPCPath = { [key: number]: Coordinate };

export interface NpcEvent {
  type: string;
  [key: string]: any;
}

export interface NPCConfig extends Omit<CharacterConfig, 'assetKey' | 'idleFrameConfig'> {
  frame: number;
  npcPath: NPCPath;
  movementPattern: NPCMovementPattern;
  events: NpcEvent[];
  animationKeyPrefix: string;
  id: number;
  npcId: string;
  name: string;
  dialogue: string[];
}

export class NPC extends Character {
  private _talkingToPlayer: boolean;
  private _npcPath: NPCPath;
  private _currentPathIndex: number;
  private _movementPattern: NPCMovementPattern;
  private _lastMovementTime: number;
  private _events: NpcEvent[];
  private _animationKeyPrefix: string;
  private _id: number;
  private _npcId: string;
  private _name: string;
  private _dialogue: string[];

  constructor(config: NPCConfig) {
    super({
      ...config,
      assetKey: 'NPC',
      origin: { x: 0, y: 0 },
      idleFrameConfig: {
        DOWN: config.frame,
        UP: config.frame + 1,
        NONE: config.frame,
        LEFT: config.frame + 2,
        RIGHT: config.frame + 2,
      },
    });

    this._talkingToPlayer = false;
    this._npcPath = config.npcPath;
    this._currentPathIndex = 0;
    this._movementPattern = config.movementPattern;
    this._lastMovementTime = Phaser.Math.Between(3500, 5000);
    this._phaserGameObject.setScale(4);
    this._events = config.events;
    this._animationKeyPrefix = config.animationKeyPrefix;
    this._id = config.id;
    this._npcId = config.npcId;
    this._name = config.name;
    this._dialogue = config.dialogue;
  }

  get events(): NpcEvent[] {
    return [...this._events];
  }

  get isTalkingToPlayer(): boolean {
    return this._talkingToPlayer;
  }

  set isTalkingToPlayer(val: boolean) {
    this._talkingToPlayer = val;
  }

  get id(): number {
    return this._id;
  }

  get npcId(): string {
    return this._npcId;
  }

  get name(): string {
    return this._name;
  }

  get dialogue(): string[] {
    return this._dialogue;
  }

  get npcPath(): NPCPath {
    return this._npcPath;
  }

  set npcPath(val: NPCPath) {
    this._npcPath = val;
  }

  set npcMovementPattern(val: NPCMovementPattern) {
    this._movementPattern = val;
  }

  set finishedMovementCallback(val: (() => void) | undefined) {
    this._spriteGridMovementFinishedCallback = val;
  }

  resetMovementTime(): void {
    this._lastMovementTime = 0;
  }

  facePlayer(playerDirection: Direction): void {
    switch (playerDirection) {
      case 'DOWN':
        this._phaserGameObject.setFrame(this._idleFrameConfig.UP).setFlipX(false);
        break;
      case 'LEFT':
        this._phaserGameObject.setFrame(this._idleFrameConfig.RIGHT).setFlipX(false);
        break;
      case 'RIGHT':
        this._phaserGameObject.setFrame(this._idleFrameConfig.LEFT).setFlipX(true);
        break;
      case 'UP':
        this._phaserGameObject.setFrame(this._idleFrameConfig.DOWN).setFlipX(false);
        break;
      case 'NONE':
        break;
    }
  }

  update(time: number): void {
    if (this._isMoving) {
      return;
    }
    if (this._talkingToPlayer) {
      return;
    }
    super.update(time);

    if (this._movementPattern === 'IDLE') {
      return;
    }

    if (this._lastMovementTime < time) {
      let characterDirection: Direction = 'NONE';
      let nextPosition = this._npcPath[this._currentPathIndex + 1];

      // validate if we actually moved to the next position, if not, skip updating index
      const prevPosition = this._npcPath[this._currentPathIndex];
      if (prevPosition.x !== this._phaserGameObject.x || prevPosition.y !== this._phaserGameObject.y) {
        nextPosition = this._npcPath[this._currentPathIndex];
      } else {
        if (nextPosition === undefined) {
          // if npc is following a set path, once we reach the end, stop moving the npc
          if (this._movementPattern === 'SET_PATH') {
            this._movementPattern = 'IDLE';
            this._currentPathIndex = 0;
            return;
          }
          nextPosition = this._npcPath[0];
          this._currentPathIndex = 0;
        } else {
          this._currentPathIndex = this._currentPathIndex + 1;
        }
      }

      if (nextPosition.x > this._phaserGameObject.x) {
        characterDirection = 'RIGHT';
      } else if (nextPosition.x < this._phaserGameObject.x) {
        characterDirection = 'LEFT';
      } else if (nextPosition.y < this._phaserGameObject.y) {
        characterDirection = 'UP';
      } else if (nextPosition.y > this._phaserGameObject.y) {
        characterDirection = 'DOWN';
      }

      this.moveCharacter(characterDirection);
      if (this._movementPattern === 'SET_PATH') {
        this._lastMovementTime = time;
      } else {
        this._lastMovementTime = time + Phaser.Math.Between(2000, 5000);
      }
    }
  }

  moveCharacter(direction: Direction): void {
    super.moveCharacter(direction);

    switch (this._direction) {
      case 'DOWN':
      case 'RIGHT':
      case 'UP':
        if (
          !this._phaserGameObject.anims.isPlaying ||
          this._phaserGameObject.anims.currentAnim?.key !== `${this._animationKeyPrefix}_${this._direction}`
        ) {
          this._phaserGameObject.play(`${this._animationKeyPrefix}_${this._direction}`);
          this._phaserGameObject.setFlipX(false);
        }
        break;
      case 'LEFT':
        if (
          !this._phaserGameObject.anims.isPlaying ||
          this._phaserGameObject.anims.currentAnim?.key !== `${this._animationKeyPrefix}_RIGHT`
        ) {
          this._phaserGameObject.play(`${this._animationKeyPrefix}_RIGHT`);
          this._phaserGameObject.setFlipX(true);
        }
        break;
      case 'NONE':
        break;
    }
  }
}