import Phaser from 'phaser';
import { EventBus } from '../EventBus';

/**
 * AnimationManager - Handles visual feedback and animations during battle
 * Includes damage flashes, HP transitions, fainting, and status effects
 */
export class AnimationManager {
  private scene: Phaser.Scene;
  private tweens: Phaser.Tweens.Tween[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Animate damage flash on critter sprite
   */
  damageFlash(sprite: Phaser.GameObjects.Sprite, duration: number = 150): Promise<void> {
    return new Promise(resolve => {
      const tween = this.scene.tweens.add({
        targets: sprite,
        tint: 0xff0000,
        duration: 75,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          sprite.clearTint();
          resolve();
        },
      });
      this.tweens.push(tween);
    });
  }

  /**
   * Animate HP bar transition
   */
  transitionHPBar(
    hpBar: Phaser.GameObjects.Rectangle,
    fromValue: number,
    toValue: number,
    maxHP: number,
    duration: number = 500
  ): Promise<void> {
    return new Promise(resolve => {
      const fromWidth = (fromValue / maxHP) * hpBar.width;
      const toWidth = (toValue / maxHP) * hpBar.width;

      const tween = this.scene.tweens.add({
        targets: hpBar,
        width: toWidth,
        duration,
        ease: 'Quad.InOut',
        onComplete: () => {
          resolve();
        },
      });
      this.tweens.push(tween);
    });
  }

  /**
   * Animate fainting (fade out and shrink)
   */
  animateFainting(sprite: Phaser.GameObjects.Sprite, duration: number = 500): Promise<void> {
    return new Promise(resolve => {
      const tween = this.scene.tweens.add({
        targets: sprite,
        alpha: 0,
        scale: 0.5,
        duration,
        ease: 'Quad.InOut',
        onComplete: () => {
          resolve();
        },
      });
      this.tweens.push(tween);
    });
  }

  /**
   * Animate entering critter (fade in and grow)
   */
  animateEntering(sprite: Phaser.GameObjects.Sprite, duration: number = 300): Promise<void> {
    return new Promise(resolve => {
      sprite.setAlpha(0);
      sprite.setScale(0.5);

      const tween = this.scene.tweens.add({
        targets: sprite,
        alpha: 1,
        scale: 1,
        duration,
        ease: 'Quad.Out',
        onComplete: () => {
          resolve();
        },
      });
      this.tweens.push(tween);
    });
  }

  /**
   * Animate attack animation (move towards target and back)
   */
  animateAttack(
    attackerSprite: Phaser.GameObjects.Sprite,
    defenderSprite: Phaser.GameObjects.Sprite,
    distance: number = 50,
    duration: number = 300
  ): Promise<void> {
    return new Promise(resolve => {
      const startX = attackerSprite.x;

      const tween = this.scene.tweens.add({
        targets: attackerSprite,
        x: startX + distance,
        duration: duration / 2,
        yoyo: true,
        ease: 'Quad.InOut',
        onComplete: () => {
          resolve();
        },
      });
      this.tweens.push(tween);
    });
  }

  /**
   * Display floating damage text
   */
  displayDamageText(
    x: number,
    y: number,
    damage: number,
    color: string = '#ff0000'
  ): Promise<void> {
    return new Promise(resolve => {
      const text = this.scene.add.text(x, y, `-${damage}`, {
        font: 'bold 24px Arial',
        color,
      });
      text.setOrigin(0.5);

      const tween = this.scene.tweens.add({
        targets: text,
        y: y - 50,
        alpha: 0,
        duration: 1000,
        ease: 'Quad.Out',
        onComplete: () => {
          text.destroy();
          resolve();
        },
      });
      this.tweens.push(tween);
    });
  }

  /**
   * Display level up text
   */
  displayLevelUp(x: number, y: number, newLevel: number): Promise<void> {
    return new Promise(resolve => {
      const text = this.scene.add.text(x, y, `LEVEL UP!\nLv. ${newLevel}`, {
        font: 'bold 20px Arial',
        color: '#ffff00',
        align: 'center',
      });
      text.setOrigin(0.5);

      const tween = this.scene.tweens.add({
        targets: text,
        scale: 1.2,
        alpha: 0,
        duration: 1500,
        ease: 'Quad.Out',
        onComplete: () => {
          text.destroy();
          resolve();
        },
      });
      this.tweens.push(tween);
    });
  }

  /**
   * Display type effectiveness indicator
   */
  displayEffectiveness(
    x: number,
    y: number,
    effectiveness: number
  ): Promise<void> {
    return new Promise(resolve => {
      let text = '';
      let color = '#ffffff';

      if (effectiveness > 1.5) {
        text = "SUPER\nEFFECTIVE!";
        color = '#00ff00';
      } else if (effectiveness > 1.0) {
        text = 'Super\nEffective';
        color = '#00ff00';
      } else if (effectiveness < 0.5) {
        text = "NOT VERY\nEFFECTIVE";
        color = '#ff6600';
      } else if (effectiveness < 1.0) {
        text = 'Not Very\nEffective';
        color = '#ff6600';
      }

      if (!text) {
        resolve();
        return;
      }

      const textObj = this.scene.add.text(x, y, text, {
        font: 'bold 16px Arial',
        color,
        align: 'center',
      });
      textObj.setOrigin(0.5);

      const tween = this.scene.tweens.add({
        targets: textObj,
        y: y - 30,
        alpha: 0,
        duration: 1000,
        ease: 'Quad.Out',
        onComplete: () => {
          textObj.destroy();
          resolve();
        },
      });
      this.tweens.push(tween);
    });
  }

  /**
   * Display status effect indicator
   */
  displayStatusEffect(x: number, y: number, status: string): Promise<void> {
    return new Promise(resolve => {
      const text = this.scene.add.text(x, y, status, {
        font: 'bold 14px Arial',
        color: '#ff9900',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 },
      });
      text.setOrigin(0.5);

      const tween = this.scene.tweens.add({
        targets: text,
        alpha: 0,
        duration: 800,
        delay: 1000,
        ease: 'Quad.Out',
        onComplete: () => {
          text.destroy();
          resolve();
        },
      });
      this.tweens.push(tween);
    });
  }

  /**
   * Display action message
   */
  displayMessage(text: string, color: string = '#ffffff', duration: number = 2000): Promise<void> {
    return new Promise(resolve => {
      const textObj = this.scene.add.text(
        this.scene.cameras.main.width / 2,
        50,
        text,
        {
          font: '18px Arial',
          color,
          align: 'center',
          backgroundColor: '#000000',
          padding: { x: 10, y: 5 },
        }
      );
      textObj.setOrigin(0.5);
      textObj.setScrollFactor(0);

      this.scene.time.delayedCall(duration, () => {
        this.scene.tweens.add({
          targets: textObj,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            textObj.destroy();
            resolve();
          },
        });
      });
    });
  }

  /**
   * Stop all animations
   */
  stopAll(): void {
    this.tweens.forEach(tween => {
      if (tween.isPlaying()) {
        tween.stop();
      }
    });
    this.tweens = [];
  }

  /**
   * Clear and destroy manager
   */
  destroy(): void {
    this.stopAll();
  }
}
