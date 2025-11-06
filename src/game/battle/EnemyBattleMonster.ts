import { Scene } from 'phaser';
import { BattleMonster, BattleMonsterConfig, Coordinate } from './BattleMonster';

/**
 * Enemy Battle Monster
 * Handles enemy-controlled monster in battle
 */
export class EnemyBattleMonster extends BattleMonster {
  constructor(config: BattleMonsterConfig) {
    const position: Coordinate = { x: 100, y: 100 };
    super(config, position);
    
    // Set up enemy-specific positioning
    this.phaserGameObject.setFlipX(false);
    this.healthBar.setPosition(200, 30);
    this.monsterNameText.setPosition(0, 0);
    this.monsterHealthBarLevelText.setPosition(35, 0);
  }

  /**
   * Show enemy monster entry animation
   */
  showMonster(): Promise<void> {
    if (this.skipBattleAnimations) {
      this.phaserGameObject.setAlpha(1).setX(100);
      this.healthBar.setAlpha(1);
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      // Start from off-screen
      this.phaserGameObject.setX(-20);
      
      this.scene.tweens.add({
        targets: this.phaserGameObject,
        x: 100,
        alpha: 1,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => {
          this.healthBar.setAlpha(1);
          resolve();
        }
      });
    });
  }

  /**
   * Play hurt animation
   */
  playHurtAnimation(): Promise<void> {
    if (this.skipBattleAnimations) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.phaserGameObject,
        x: this.phaserGameObject.x + 10,
        duration: 100,
        yoyo: true,
        repeat: 3,
        onComplete: () => resolve()
      });
    });
  }

  /**
   * Play faint animation
   */
  playFaintAnimation(): Promise<void> {
    if (this.skipBattleAnimations) {
      this.phaserGameObject.setAlpha(0.5);
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.phaserGameObject,
        alpha: 0.5,
        y: this.phaserGameObject.y + 20,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => resolve()
      });
    });
  }
}