/**
 * Player - Main player entity with animations and behavior
 * Encapsulates player sprite, animations, and movement
 */

import { Physics, Scene } from 'phaser';
import { PlayerAnimator } from './PlayerAnimator';
import { PlayerAssetConfig, DEFAULT_PLAYER_CONFIG } from '../config/PlayerConfig';

export class Player {
  private sprite: Physics.Arcade.Sprite;
  private animator: PlayerAnimator;
  private currentState: 'idle' | 'moving' | 'jumping' | 'acting' = 'idle';
  private velocityX: number = 0;
  private velocityY: number = 0;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    config: PlayerAssetConfig = DEFAULT_PLAYER_CONFIG
  ) {
    // Create sprite
    this.sprite = scene.physics.add.sprite(x, y, config.textureKey);
    this.sprite.setScale(config.scale);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setBounce(0);

    // Create animator
    this.animator = new PlayerAnimator(scene, config);

    // Play idle animation by default
    this.animator.play(this.sprite, 'idle');
  }

  /**
   * Get the underlying Phaser sprite
   */
  public getSprite(): Physics.Arcade.Sprite {
    return this.sprite;
  }

  /**
   * Get the animator for manual animation control
   */
  public getAnimator(): PlayerAnimator {
    return this.animator;
  }

  /**
   * Set player position
   */
  public setPosition(x: number, y: number) {
    this.sprite.setPosition(x, y);
  }

  /**
   * Get player position
   */
  public getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  /**
   * Set player velocity
   */
  public setVelocity(x: number, y: number) {
    this.velocityX = x;
    this.velocityY = y;
    this.sprite.setVelocity(x, y);

    // Update animation based on movement
    if (x !== 0 || y !== 0) {
      if (this.currentState !== 'moving') {
        this.currentState = 'moving';
        this.animator.play(this.sprite, 'walk');
      }
    } else {
      if (this.currentState === 'moving') {
        this.currentState = 'idle';
        this.animator.play(this.sprite, 'idle');
      }
    }
  }

  /**
   * Get current velocity
   */
  public getVelocity(): { x: number; y: number } {
    return { x: this.velocityX, y: this.velocityY };
  }

  /**
   * Stop all movement
   */
  public stop() {
    this.setVelocity(0, 0);
  }

  /**
   * Play a specific animation
   */
  public playAnimation(animationKey: string) {
    this.currentState = 'acting';
    this.animator.play(this.sprite, animationKey);
  }

  /**
   * Play an animation once and return to idle
   */
  public playAnimationOnce(animationKey: string) {
    this.currentState = 'acting';
    this.animator.playOnce(this.sprite, animationKey);
  }

  /**
   * Get current animation state
   */
  public getCurrentState(): string {
    return this.currentState;
  }

  /**
   * Set camera follow (for scene integration)
   */
  public setCameraFollow(camera: Phaser.Cameras.Scene2D.Camera) {
    camera.startFollow(this.sprite);
  }

  /**
   * Destroy player and clean up
   */
  public destroy() {
    this.sprite.destroy();
  }
}
