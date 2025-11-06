import { Scene } from 'phaser';
import { BattleMonster, BattleMonsterConfig, Coordinate } from './BattleMonster';

/**
 * Player Battle Monster
 * Handles player-controlled monster in battle
 */
export class PlayerBattleMonster extends BattleMonster {
  constructor(config: BattleMonsterConfig) {
    const position: Coordinate = { x: 180, y: 250 };
    super(config, position);
    
    // Set up player-specific positioning
    this.phaserGameObject.setFlipX(true);
    this.healthBar.setPosition(30, 140);
    this.monsterNameText.setPosition(0, 0);
    this.monsterHealthBarLevelText.setPosition(35, 0);
  }

  /**
   * Show player monster entry animation
   */
  showMonster(): Promise<void> {
    if (this.skipBattleAnimations) {
      this.phaserGameObject.setAlpha(1).setX(180);
      this.healthBar.setAlpha(1);
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      // Start from off-screen
      this.phaserGameObject.setX(300);
      
      this.scene.tweens.add({
        targets: this.phaserGameObject,
        x: 180,
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
        x: this.phaserGameObject.x - 10,
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