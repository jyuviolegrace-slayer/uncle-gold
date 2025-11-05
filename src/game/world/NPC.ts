import { Scene } from 'phaser';
import { Character } from './Character';
import { Coordinate, Direction, calculatePathToTarget } from './GridUtils';

export type NPCMovementPattern = 'IDLE' | 'CLOCKWISE' | 'PATH';

export interface NPCConfig {
  id: string;
  scene: Scene;
  x: number;
  y: number;
  name: string;
  dialogueLines: string[];
  movementPattern?: NPCMovementPattern;
  path?: Coordinate[];
  collisionLayer?: Phaser.Tilemaps.TilemapLayer;
}

/**
 * NPC character - has AI movement patterns and dialogue
 */
export class NPC extends Character {
  private id: string;
  private name: string;
  private dialogueLines: string[];
  private movementPattern: NPCMovementPattern;
  private path: Coordinate[] = [];
  private pathIndex: number = 0;
  private lastMoveTime: number = 0;
  private moveDelay: number = 3000; // milliseconds between moves
  private isTalkingToPlayer: boolean = false;

  constructor(config: NPCConfig) {
    super({
      scene: config.scene,
      x: config.x,
      y: config.y,
      key: 'npc',
      frame: 0,
      collisionLayer: config.collisionLayer,
    });

    this.id = config.id;
    this.name = config.name;
    this.dialogueLines = config.dialogueLines;
    this.movementPattern = config.movementPattern ?? 'IDLE';
    this.path = config.path ?? [];
    this.sprite.setScale(1);
    this.sprite.setTint(0xFF69B4); // Pink for NPCs

    this.setupAnimations();
  }

  /**
   * Get NPC ID
   */
  getId(): string {
    return this.id;
  }

  /**
   * Get NPC name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get dialogue lines
   */
  getDialogue(): string[] {
    return [...this.dialogueLines];
  }

  /**
   * Check if talking to player
   */
  getIsTalkingToPlayer(): boolean {
    return this.isTalkingToPlayer;
  }

  /**
   * Set talking to player state
   */
  setIsTalkingToPlayer(value: boolean): void {
    this.isTalkingToPlayer = value;
  }

  /**
   * Make NPC face player
   */
  facePlayer(playerPos: Coordinate): void {
    const npcPos = this.getPosition();
    
    if (Math.abs(playerPos.x - npcPos.x) < Math.abs(playerPos.y - npcPos.y)) {
      // Player is above or below
      if (playerPos.y < npcPos.y) {
        this.setDirection('UP');
      } else {
        this.setDirection('DOWN');
      }
    } else {
      // Player is left or right
      if (playerPos.x < npcPos.x) {
        this.setDirection('LEFT');
      } else {
        this.setDirection('RIGHT');
      }
    }
  }

  /**
   * Update NPC (AI movement)
   */
  update(time: number): void {
    super.update(time);

    // Don't move if talking to player or already moving
    if (this.isTalkingToPlayer || this.isMoving) {
      return;
    }

    // Handle movement pattern
    const timeSinceLastMove = time - this.lastMoveTime;

    switch (this.movementPattern) {
      case 'IDLE':
        // Do nothing
        break;
      case 'CLOCKWISE':
        if (timeSinceLastMove >= this.moveDelay) {
          this.moveClockwise();
          this.lastMoveTime = time;
        }
        break;
      case 'PATH':
        if (timeSinceLastMove >= this.moveDelay && this.path.length > 0) {
          this.moveAlongPath();
          this.lastMoveTime = time;
        }
        break;
    }
  }

  /**
   * Move in clockwise pattern
   */
  private moveClockwise(): void {
    const directions: Direction[] = ['DOWN', 'LEFT', 'UP', 'RIGHT'];
    const currentIndex = directions.indexOf(this.direction);
    const nextDirection = directions[(currentIndex + 1) % directions.length];
    
    this.moveInDirection(nextDirection);
  }

  /**
   * Move along predefined path
   */
  private moveAlongPath(): void {
    if (this.path.length === 0) {
      return;
    }

    const targetPos = this.path[this.pathIndex];
    const { directions } = calculatePathToTarget(this.getPosition(), targetPos, 32);

    if (directions.length > 0) {
      this.moveInDirection(directions[0]);
    }

    // Check if reached waypoint
    const currentPos = this.getPosition();
    if (
      Math.abs(currentPos.x - targetPos.x) < 32 &&
      Math.abs(currentPos.y - targetPos.y) < 32
    ) {
      this.pathIndex = (this.pathIndex + 1) % this.path.length;
    }
  }

  /**
   * Set movement pattern
   */
  setMovementPattern(pattern: NPCMovementPattern, path?: Coordinate[]): void {
    this.movementPattern = pattern;
    if (path) {
      this.path = path;
      this.pathIndex = 0;
    }
  }

  /**
   * Get animation key for direction
   */
  protected getAnimationKeyForDirection(): string {
    return `NPC_${this.direction}`;
  }

  /**
   * Update idle frame based on direction
   */
  protected updateFrame(): void {
    const frameMap: Record<Direction, number> = {
      DOWN: 0,
      UP: 1,
      LEFT: 2,
      RIGHT: 3,
      NONE: 0,
    };
    this.sprite.setFrame(frameMap[this.direction]);
  }

  /**
   * Setup NPC animations
   */
  private setupAnimations(): void {
    // Animations can be added here if needed
    // For now, NPCs just use static frames
  }
}
