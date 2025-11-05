import { Character, CharacterConfig, Direction } from './Character';

export interface PlayerConfig extends Omit<CharacterConfig, 'assetKey' | 'idleFrameConfig'> {
  entranceLayer?: Phaser.Tilemaps.ObjectLayer;
  enterEntranceCallback?: (entranceName: string, entranceId: string, isBuildingEntrance: boolean) => void;
}

export class Player extends Character {
  private entranceLayer?: Phaser.Tilemaps.ObjectLayer;
  private enterEntranceCallback?: (entranceName: string, entranceId: string, isBuildingEntrance: boolean) => void;

  constructor(config: PlayerConfig) {
    super({
      ...config,
      assetKey: 'PLAYER',
      origin: { x: 0, y: 0.2 },
      idleFrameConfig: {
        DOWN: 7,
        UP: 1,
        NONE: 7,
        LEFT: 10,
        RIGHT: 4,
      },
    });
    
    this.entranceLayer = config.entranceLayer;
    this.enterEntranceCallback = config.enterEntranceCallback;
  }

  moveCharacter(direction: Direction, isRunning: boolean = false): void {
    super.moveCharacter(direction, isRunning);

    switch (this._direction) {
      case 'DOWN':
      case 'LEFT':
      case 'RIGHT':
      case 'UP':
        if (
          !this._phaserGameObject.anims.isPlaying ||
          this._phaserGameObject.anims.currentAnim?.key !== `PLAYER_${this._direction}`
        ) {
          this._phaserGameObject.play(`PLAYER_${this._direction}`);
        }
        this._phaserGameObject.anims.timeScale = this._isRunning ? 2 : 1;
        break;
      case 'NONE':
        break;
    }

    // validate character is not moving and that the target position belongs to an entrance
    if (!this._isMoving && this.entranceLayer !== undefined) {
      const targetPosition = this.getTargetPositionFromGameObjectPositionAndDirection(
        { x: this._phaserGameObject.x, y: this._phaserGameObject.y },
        this._direction
      );
      
      const nearbyEntrance = this.entranceLayer.objects.find((object) => {
        if (!object.x || !object.y) {
          return false;
        }
        return object.x === targetPosition.x && object.y - 32 === targetPosition.y;
      });

      if (!nearbyEntrance) {
        return;
      }

      // entrance is nearby and the player is trying to enter that location
      const entranceName = this.getPropertyValue(nearbyEntrance, 'connects_to') || '';
      const entranceId = this.getPropertyValue(nearbyEntrance, 'entrance_id') || '';
      const isBuildingEntrance = this.getPropertyValue(nearbyEntrance, 'is_building') || false;
      
      if (this.enterEntranceCallback) {
        this.enterEntranceCallback(entranceName, entranceId, isBuildingEntrance);
      }
    }
  }

  private getPropertyValue(object: any, propertyName: string): any {
    if (!object.properties) return undefined;
    const property = object.properties.find((prop: any) => prop.name === propertyName);
    return property?.value;
  }

  private getTargetPosition(position: { x: number; y: number }, direction: Direction): { x: number; y: number } {
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
}