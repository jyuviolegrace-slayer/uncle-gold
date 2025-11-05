import { Scene } from 'phaser';

/**
 * Configuration for BattleHealthBar
 */
export interface IHealthBarConfig {
  x: number;
  y: number;
  width?: number;
  height?: number;
  backgroundColor?: number;
  healthColor?: number;
  textColor?: string;
}

/**
 * BattleHealthBar - Displays and animates HP bars for battle Critters
 * Combines functionality from legacy health bars with TypeScript structure
 */
export class BattleHealthBar {
  private scene: Scene;
  private container: Phaser.GameObjects.Container;
  private barBackground: Phaser.GameObjects.Rectangle;
  private healthBar: Phaser.GameObjects.Rectangle;
  private hpText: Phaser.GameObjects.Text;
  private currentHP: number = 100;
  private maxHP: number = 100;
  private width: number;
  private height: number;

  constructor(scene: Scene, config: IHealthBarConfig) {
    this.scene = scene;
    this.width = config.width ?? 120;
    this.height = config.height ?? 15;

    this.container = this.scene.add.container(config.x, config.y);

    this.barBackground = this.scene.add.rectangle(0, 0, this.width, this.height, config.backgroundColor ?? 0x333333);
    this.barBackground.setOrigin(0);

    this.healthBar = this.scene.add.rectangle(0, 0, this.width, this.height, config.healthColor ?? 0x00ff00);
    this.healthBar.setOrigin(0);

    this.hpText = this.scene.add.text(this.width + 10, 0, '100/100', {
      font: '10px Arial',
      color: config.textColor ?? '#ffffff',
    });
    this.hpText.setOrigin(0, 0);

    this.container.add([this.barBackground, this.healthBar, this.hpText]);
  }

  /**
   * Update health bar display
   */
  updateHealth(currentHP: number, maxHP: number, animateDuration: number = 300): void {
    this.currentHP = currentHP;
    this.maxHP = maxHP;

    const healthPercent = Math.max(0, currentHP / maxHP);
    const newWidth = Math.max(0, healthPercent * this.width);

    this.hpText.setText(`${currentHP}/${maxHP}`);

    if (animateDuration > 0) {
      this.scene.tweens.add({
        targets: this.healthBar,
        displayWidth: newWidth,
        duration: animateDuration,
        ease: 'Linear',
      });
    } else {
      this.healthBar.setDisplaySize(newWidth, this.healthBar.displayHeight);
    }

    this.updateHealthColor(healthPercent);
  }

  /**
   * Update color based on health percentage
   */
  private updateHealthColor(healthPercent: number): void {
    if (healthPercent > 0.5) {
      this.healthBar.setFillStyle(0x00ff00);
    } else if (healthPercent > 0.25) {
      this.healthBar.setFillStyle(0xffff00);
    } else {
      this.healthBar.setFillStyle(0xff0000);
    }
  }

  /**
   * Get container for positioning
   */
  getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  /**
   * Set position
   */
  setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }

  /**
   * Set visibility
   */
  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.container.destroy();
  }
}
