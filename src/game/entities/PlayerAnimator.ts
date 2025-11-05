/**
 * PlayerAnimator - Manages all player animations
 * Handles animation creation and playback
 */

import { Scene } from 'phaser';
import { PlayerAssetConfig, AnimationDefinition } from '../config/PlayerConfig';

export class PlayerAnimator {
  private scene: Scene;
  private config: PlayerAssetConfig;
  private currentAnimation: string = 'idle';

  constructor(scene: Scene, config: PlayerAssetConfig) {
    this.scene = scene;
    this.config = config;
    this.createAnimations();
  }

  private createAnimations() {
    for (const animDef of this.config.animations) {
      this.createAnimation(animDef);
    }
  }

  private createAnimation(animDef: AnimationDefinition) {
    if (this.scene.anims.exists(animDef.key)) {
      return;
    }

    this.scene.anims.create({
      key: animDef.key,
      frames: this.scene.anims.generateFrameNumbers(this.config.textureKey, {
        frames: animDef.frames,
      }),
      frameRate: animDef.frameRate,
      repeat: animDef.repeat,
      repeatDelay: animDef.repeatDelay || 0,
    });
  }

  public play(sprite: Phaser.Physics.Arcade.Sprite, animationKey: string) {
    if (!this.scene.anims.exists(animationKey)) {
      console.warn(`Animation '${animationKey}' does not exist`);
      return;
    }

    this.currentAnimation = animationKey;
    sprite.play(animationKey, true);
  }

  public playOnce(sprite: Phaser.Physics.Arcade.Sprite, animationKey: string) {
    if (!this.scene.anims.exists(animationKey)) {
      console.warn(`Animation '${animationKey}' does not exist`);
      return;
    }

    this.currentAnimation = animationKey;
    sprite.play(animationKey, false);
  }

  public getCurrentAnimation(): string {
    return this.currentAnimation;
  }

  public getConfig(): PlayerAssetConfig {
    return this.config;
  }

  public getAvailableAnimations(): string[] {
    return this.config.animations.map((a: AnimationDefinition) => a.key);
  }

  public updateConfig(newConfig: Partial<PlayerAssetConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}
