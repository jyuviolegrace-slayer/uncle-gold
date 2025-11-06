import { Direction, Coordinate } from '../models/common';
import { Character, CharacterConfig } from './Character';
import { getTargetPositionFromGameObjectPositionAndDirection } from './utils/gridUtils';
import { TILE_SIZE } from './constants';
import { TextureKeys } from '../assets/TextureKeys';

export interface PlayerConfig extends Omit<CharacterConfig, 'assetKey' | 'idleFrameConfig'> {
  collisionLayer: Phaser.Tilemaps.TilemapLayer;
  entranceLayer?: Phaser.Tilemaps.ObjectLayer;
  enterEntranceCallback: (entranceName: string, entranceId: string, isBuildingEntrance: boolean) => void;
}

export class Player extends Character {
  private entranceLayer?: Phaser.Tilemaps.ObjectLayer;
  private enterEntranceCallback: (entranceName: string, entranceId: string, isBuildingEntrance: boolean) => void;

  constructor(config: PlayerConfig) {
    super({
      ...config,
      assetKey: TextureKeys.CHARACTER_PLAYER,
      origin: { x: 0, y: 0.2 },
      idleFrameConfig: {
        DOWN: 7,
        UP: 1,
        NONE: 7,
        LEFT: 10,
        RIGHT: 4,
      },
    });
    
    // Set player depth to be above NPCs
    this.sprite.setDepth(2);
    
    this.entranceLayer = config.entranceLayer;
    this.enterEntranceCallback = config.enterEntranceCallback;
  }

  moveCharacter(direction: Direction, isRunning: boolean = false): void {
    super.moveCharacter(direction, isRunning);

    // Handle animation based on direction
    switch (direction) {
      case Direction.DOWN:
      case Direction.LEFT:
      case Direction.RIGHT:
      case Direction.UP:
        const animationKey = `PLAYER_${direction}`;
        if (
          !this.phaserGameObject.anims.isPlaying ||
          this.phaserGameObject.anims.currentAnim?.key !== animationKey
        ) {
          this.phaserGameObject.play(animationKey);
        }
        this.phaserGameObject.anims.timeScale = this.isRunning ? 2 : 1;
        break;
      case Direction.NONE:
        break;
      default:
        throw new Error(`Invalid direction: ${direction}`);
    }

    // Check for entrance interactions
    if (!this.isMoving && this.entranceLayer) {
      const targetPosition = getTargetPositionFromGameObjectPositionAndDirection(
        { x: this.phaserGameObject.x, y: this.phaserGameObject.y },
        direction
      );
      
      const nearbyEntrance = this.entranceLayer.objects.find((object) => {
        if (!object.x || !object.y) {
          return false;
        }
        return object.x === targetPosition.x && object.y - TILE_SIZE === targetPosition.y;
      });

      if (!nearbyEntrance) {
        return;
      }

      // Entrance is nearby and the player is trying to enter that location
      const entranceName = this.getEntranceProperty(nearbyEntrance, 'connects_to');
      const entranceId = this.getEntranceProperty(nearbyEntrance, 'entrance_id');
      const isBuildingEntrance = Boolean(this.getEntranceProperty(nearbyEntrance, 'is_building')) || false;
      
      if (entranceName && entranceId) {
        this.enterEntranceCallback(entranceName, entranceId, isBuildingEntrance);
      }
    }
  }

  private getEntranceProperty(object: Phaser.Types.Tilemaps.TiledObject, propertyName: string): string | undefined {
    if (!object.properties) {
      return undefined;
    }
    
    const property = object.properties.find((prop: any) => prop.name === propertyName);
    return property?.value;
  }
}