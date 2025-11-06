import { Scene } from 'phaser';
import { CritterInstance } from '../models/critter';
import { LegacyMonster } from '../models/critter';

export interface BattleMonsterConfig {
  scene: Scene;
  monsterDetails: CritterInstance | LegacyMonster;
  skipBattleAnimations?: boolean;
  scaleHealthBarBackgroundImageByY?: number;
}

export interface Coordinate {
  x: number;
  y: number;
}

/**
 * Base Battle Monster Class
 * Handles monster rendering, health bars, and basic battle functionality
 */
export abstract class BattleMonster {
  protected scene: Scene;
  protected monsterDetails: CritterInstance | LegacyMonster;
  protected healthBar: Phaser.GameObjects.Container;
  protected phaserGameObject: Phaser.GameObjects.Image;
  protected currentHealth: number;
  protected maxHealth: number;
  protected monsterAttacks: any[] = [];
  protected phaserHealthBarGameContainer: Phaser.GameObjects.Container;
  protected skipBattleAnimations: boolean;
  protected monsterHealthBarLevelText: Phaser.GameObjects.Text;
  protected monsterNameText: Phaser.GameObjects.Text;

  constructor(config: BattleMonsterConfig, position: Coordinate) {
    this.scene = config.scene;
    this.monsterDetails = config.monsterDetails;
    this.currentHealth = this.monsterDetails.currentHp;
    this.maxHealth = this.monsterDetails.maxHp;
    this.skipBattleAnimations = config.skipBattleAnimations || false;

    // Create the monster sprite
    this.phaserGameObject = this.scene.add
      .image(position.x, position.y, this.monsterDetails.assetKey, this.monsterDetails.assetFrame || 0)
      .setAlpha(0);

    this.createHealthBarComponents(config.scaleHealthBarBackgroundImageByY);
    this.updateHealthBarPercentage(this.currentHealth / this.maxHealth);
    this.updateMonsterInfoText();
  }

  /**
   * Create health bar components
   */
  private createHealthBarComponents(scaleHealthBarBackgroundImageByY?: number): void {
    // Create health bar background
    const healthBarBackground = this.scene.add.image(0, 0, 'HEALTH_BAR_BACKGROUND');
    if (scaleHealthBarBackgroundImageByY) {
      healthBarBackground.setScale(1, scaleHealthBarBackgroundImageByY);
    }

    // Create health bar fill
    const healthBarFill = this.scene.add.graphics();
    this.drawHealthBar(healthBarFill, 1);

    // Create container for health bar
    this.phaserHealthBarGameContainer = this.scene.add.container(0, 0, [
      healthBarBackground,
      healthBarFill
    ]);

    // Create monster name and level text
    this.monsterNameText = this.scene.add.text(0, 0, '', {
      fontSize: '12px',
      color: '#ffffff'
    }).setOrigin(0);

    this.monsterHealthBarLevelText = this.scene.add.text(0, 0, '', {
      fontSize: '10px',
      color: '#ffffff'
    }).setOrigin(0);

    this.healthBar = this.scene.add.container(0, 0, [
      this.phaserHealthBarGameContainer,
      this.monsterNameText,
      this.monsterHealthBarLevelText
    ]);
  }

  /**
   * Draw health bar
   */
  private drawHealthBar(graphics: Phaser.GameObjects.Graphics, percentage: number): void {
    graphics.clear();
    graphics.fillStyle(0x00ff00);
    graphics.fillRect(0, 0, Math.floor(48 * percentage), 6);
  }

  /**
   * Update health bar percentage
   */
  protected updateHealthBarPercentage(percentage: number): void {
    const healthBarFill = this.phaserHealthBarGameContainer.getAt(1) as Phaser.GameObjects.Graphics;
    this.drawHealthBar(healthBarFill, percentage);
  }

  /**
   * Update monster info text
   */
  private updateMonsterInfoText(): void {
    this.monsterNameText.setText(this.monsterDetails.name);
    this.monsterHealthBarLevelText.setText(`Lv${this.monsterDetails.currentLevel}`);
  }

  /**
   * Get base attack value
   */
  protected getBaseAttack(): number {
    return this.monsterDetails.baseAttack;
  }

  /**
   * Get base experience value
   */
  protected getBaseExp(): number {
    return (this.monsterDetails as any).baseExp || 0;
  }

  /**
   * Show the monster with animation
   */
  showMonster(): Promise<void> {
    if (this.skipBattleAnimations) {
      this.phaserGameObject.setAlpha(1);
      this.healthBar.setAlpha(1);
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: [this.phaserGameObject, this.healthBar],
        alpha: 1,
        duration: 500,
        onComplete: () => resolve()
      });
    });
  }

  /**
   * Hide the monster
   */
  hideMonster(): void {
    this.phaserGameObject.setAlpha(0);
    this.healthBar.setAlpha(0);
  }

  /**
   * Take damage
   */
  takeDamage(damage: number): Promise<void> {
    this.currentHealth = Math.max(0, this.currentHealth - damage);
    this.updateHealthBarPercentage(this.currentHealth / this.maxHealth);

    if (this.skipBattleAnimations) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      // Flash red effect
      this.scene.tweens.add({
        targets: this.phaserGameObject,
        tint: 0xff0000,
        duration: 100,
        yoyo: true,
        repeat: 3,
        onComplete: () => resolve()
      });
    });
  }

  /**
   * Play attack animation
   */
  playAttackAnimation(): Promise<void> {
    if (this.skipBattleAnimations) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.phaserGameObject,
        x: this.phaserGameObject.x + 20,
        duration: 200,
        yoyo: true,
        onComplete: () => resolve()
      });
    });
  }

  /**
   * Check if monster is knocked out
   */
  isKnockedOut(): boolean {
    return this.currentHealth <= 0;
  }

  /**
   * Get monster details
   */
  getMonsterDetails(): CritterInstance | LegacyMonster {
    return this.monsterDetails;
  }

  /**
   * Get current HP
   */
  getCurrentHp(): number {
    return this.currentHealth;
  }

  /**
   * Set current HP
   */
  setCurrentHp(hp: number): void {
    this.currentHealth = Math.max(0, Math.min(this.maxHealth, hp));
    this.updateHealthBarPercentage(this.currentHealth / this.maxHealth);
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.phaserGameObject.destroy();
    this.healthBar.destroy();
  }
}