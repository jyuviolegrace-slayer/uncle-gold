/**
 * PlayerController - Manages player movement and input
 * Handles keyboard, arrow keys, and gamepad input
 */

import Phaser from 'phaser';

export interface IPlayerControlConfig {
  speed?: number;
  enableKeyboard?: boolean;
  enableGamepad?: boolean;
  enableAnalog?: boolean;
  enableTouch?: boolean;
}

export class PlayerController {
  private scene: Phaser.Scene;
  private sprite: Phaser.Physics.Arcade.Sprite;
  private speed: number;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null;
  private wasdKeys: Record<string, Phaser.Input.Keyboard.Key> | null;
  private config: IPlayerControlConfig;
  private direction: 'up' | 'down' | 'left' | 'right' = 'down';
  private touchInput: { x: number; y: number } | null = null;

  constructor(
    scene: Phaser.Scene,
    sprite: Phaser.Physics.Arcade.Sprite,
    config: IPlayerControlConfig = {}
  ) {
    this.scene = scene;
    this.sprite = sprite;
    this.speed = config.speed || 200;
    this.config = {
      enableKeyboard: true,
      enableGamepad: false,
      enableAnalog: false,
      enableTouch: true,
      ...config,
    };

    this.cursors = null;
    this.wasdKeys = null;

    if (this.config.enableKeyboard) {
      this.setupKeyboardInput();
    }

    if (this.config.enableTouch) {
      this.setupTouchInput();
    }
  }

  /**
   * Setup keyboard input
   */
  private setupKeyboardInput(): void {
    this.cursors = this.scene.input.keyboard?.createCursorKeys() || null;

    if (this.scene.input.keyboard) {
      this.wasdKeys = this.scene.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
      }) as Record<string, Phaser.Input.Keyboard.Key>;
    }
  }

  /**
   * Setup touch input for mobile
   */
  private setupTouchInput(): void {
    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) {
        this.touchInput = { x: pointer.x, y: pointer.y };
      }
    });

    this.scene.input.on('pointerup', () => {
      this.touchInput = null;
    });
  }

  /**
   * Update player movement based on input
   */
  update(): void {
    let velocityX = 0;
    let velocityY = 0;

    // Arrow keys
    if (this.cursors) {
      if (this.cursors.left.isDown) {
        velocityX = -this.speed;
        this.direction = 'left';
      } else if (this.cursors.right.isDown) {
        velocityX = this.speed;
        this.direction = 'right';
      }

      if (this.cursors.up.isDown) {
        velocityY = -this.speed;
        this.direction = 'up';
      } else if (this.cursors.down.isDown) {
        velocityY = this.speed;
        this.direction = 'down';
      }
    }

    // WASD keys
    if (this.wasdKeys) {
      if (this.wasdKeys.left.isDown) {
        velocityX = -this.speed;
        this.direction = 'left';
      } else if (this.wasdKeys.right.isDown) {
        velocityX = this.speed;
        this.direction = 'right';
      }

      if (this.wasdKeys.up.isDown) {
        velocityY = -this.speed;
        this.direction = 'up';
      } else if (this.wasdKeys.down.isDown) {
        velocityY = this.speed;
        this.direction = 'down';
      }
    }

    // Touch input
    if (this.touchInput) {
      const width = this.scene.game.config.width as number;
      const height = this.scene.game.config.height as number;
      const centerX = width / 2;
      const centerY = height / 2;
      const dx = this.touchInput.x - centerX;
      const dy = this.touchInput.y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 10) {
        velocityX = (dx / distance) * this.speed;
        velocityY = (dy / distance) * this.speed;

        // Determine direction
        if (Math.abs(dx) > Math.abs(dy)) {
          this.direction = dx > 0 ? 'right' : 'left';
        } else {
          this.direction = dy > 0 ? 'down' : 'up';
        }
      }
    }

    // Prevent diagonal movement at full speed (only if both X and Y are non-zero)
    if (velocityX !== 0 && velocityY !== 0 && !this.touchInput) {
      velocityX *= 0.7071; // sqrt(2)/2
      velocityY *= 0.7071;
    }

    this.sprite.setVelocity(velocityX, velocityY);
  }

  /**
   * Get current direction
   */
  getDirection(): 'up' | 'down' | 'left' | 'right' {
    return this.direction;
  }

  /**
   * Set player speed
   */
  setSpeed(speed: number): void {
    this.speed = speed;
  }

  /**
   * Get player speed
   */
  getSpeed(): number {
    return this.speed;
  }

  /**
   * Enable/disable movement
   */
  setEnabled(enabled: boolean): void {
    if (enabled) {
      this.sprite.setActive(true);
    } else {
      this.sprite.setVelocity(0, 0);
      this.sprite.setActive(false);
    }
  }

  /**
   * Stop movement
   */
  stop(): void {
    this.sprite.setVelocity(0, 0);
  }

  /**
   * Get current velocity
   */
  getVelocity(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.sprite.body!.velocity.x, this.sprite.body!.velocity.y);
  }

  /**
   * Check if player is moving
   */
  isMoving(): boolean {
    return this.sprite.body!.velocity.length() > 0;
  }

  /**
   * Cleanup
   */
  shutdown(): void {
    if (this.cursors) {
      this.cursors = null;
    }
    if (this.wasdKeys) {
      this.wasdKeys = null;
    }
  }
}

export default PlayerController;
