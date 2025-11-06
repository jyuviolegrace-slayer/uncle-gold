import { Scene } from 'phaser';
import { AnimatedBar, BarConfig } from './AnimatedBar';
import { CritterInstance } from '../models/critter';

export interface HealthBarConfig extends Omit<BarConfig, 'value'> {
  critter: CritterInstance;
  showText?: boolean;
  textColor?: number;
  fontSize?: number;
  fontFamily?: string;
}

/**
 * Health bar component specifically for critters
 * Provides automatic HP calculation and optional text display
 */
export class HealthBar extends AnimatedBar {
  private critter: CritterInstance;
  private showText: boolean;
  private hpText: Phaser.GameObjects.Text | null = null;
  private textColor: number;
  private fontSize: number;
  private fontFamily: string;

  constructor(scene: Scene, config: HealthBarConfig) {
    const initialHpRatio = config.critter.currentHp / config.critter.maxHp;
    
    super(scene, {
      ...config,
      value: initialHpRatio,
    });

    this.critter = config.critter;
    this.showText = config.showText ?? false;
    this.textColor = config.textColor ?? 0xffffff;
    this.fontSize = config.fontSize ?? 12;
    this.fontFamily = config.fontFamily ?? 'Arial';

    if (this.showText) {
      this.createHpText();
    }

    this.updateHealthColor();
  }

  /**
   * Update the health bar based on critter's current HP
   */
  updateHp(animate: boolean = true): void {
    const hpRatio = this.critter.currentHp / this.critter.maxHp;
    this.setValue(hpRatio, animate);
    this.updateHealthColor();
    
    if (this.showText && this.hpText) {
      this.updateHpText();
    }
  }

  /**
   * Set the critter instance this health bar is tracking
   */
  setCritter(critter: CritterInstance): void {
    this.critter = critter;
    this.updateHp(false);
  }

  /**
   * Get the current critter instance
   */
  getCritter(): CritterInstance {
    return this.critter;
  }

  /**
   * Get current HP value
   */
  getCurrentHp(): number {
    return this.critter.currentHp;
  }

  /**
   * Get maximum HP value
   */
  getMaxHp(): number {
    return this.critter.maxHp;
  }

  /**
   * Get HP percentage (0-100)
   */
  getHpPercentage(): number {
    return (this.critter.currentHp / this.critter.maxHp) * 100;
  }

  /**
   * Check if critter is at full health
   */
  isFullHealth(): boolean {
    return this.critter.currentHp >= this.critter.maxHp;
  }

  /**
   * Check if critter is KO'd (0 HP)
   */
  isKo(): boolean {
    return this.critter.currentHp <= 0;
  }

  /**
   * Check if critter is in critical health (<= 20% HP)
   */
  isCriticalHealth(): boolean {
    return this.getHpPercentage() <= 20;
  }

  /**
   * Apply damage to the critter and animate the health bar
   */
  applyDamage(damage: number, animate: boolean = true): void {
    const actualDamage = Math.min(damage, this.critter.currentHp);
    this.critter.currentHp = Math.max(0, this.critter.currentHp - damage);
    this.updateHp(animate);
    
    if (actualDamage > 0) {
      this.shake(3, 300);
    }
  }

  /**
   * Apply healing to the critter and animate the health bar
   */
  applyHealing(healAmount: number, animate: boolean = true): void {
    const actualHealing = Math.min(healAmount, this.critter.maxHp - this.critter.currentHp);
    this.critter.currentHp = Math.min(this.critter.maxHp, this.critter.currentHp + healAmount);
    this.updateHp(animate);
    
    if (actualHealing > 0) {
      this.pulse(1.2, 400);
    }
  }

  /**
   * Revive critter with specified HP percentage
   */
  revive(hpPercentage: number = 0.5): void {
    this.critter.currentHp = Math.max(1, Math.floor(this.critter.maxHp * hpPercentage));
    this.updateHp(true);
    this.pulse(1.3, 500);
  }

  /**
   * Fully restore critter's HP
   */
  fullRestore(): void {
    this.critter.currentHp = this.critter.maxHp;
    this.updateHp(true);
    this.pulse(1.4, 600);
  }

  /**
   * Show or hide HP text
   */
  setShowText(show: boolean): void {
    this.showText = show;
    
    if (show && !this.hpText) {
      this.createHpText();
    } else if (!show && this.hpText) {
      this.hpText.destroy();
      this.hpText = null;
    }
  }

  /**
   * Set text color
   */
  setTextColor(color: number): void {
    this.textColor = color;
    if (this.hpText) {
      this.hpText.setColor(`#${color.toString(16).padStart(6, '0')}`);
    }
  }

  /**
   * Set font size
   */
  setFontSize(size: number): void {
    this.fontSize = size;
    if (this.hpText) {
      this.hpText.setFontSize(size);
    }
  }

  /**
   * Set font family
   */
  setFontFamily(family: string): void {
    this.fontFamily = family;
    if (this.hpText) {
      this.hpText.setFontFamily(family);
    }
  }

  /**
   * Create HP text display
   */
  private createHpText(): void {
    const container = this.getContainer();
    this.hpText = (this as any).scene.add.text(0, 0, '', {
      fontSize: `${this.fontSize}px`,
      fontFamily: this.fontFamily,
      color: `#${this.textColor.toString(16).padStart(6, '0')}`,
    }).setOrigin(0.5);
    
    if (this.hpText) {
      container.add(this.hpText);
    }
    this.updateHpText();
  }

  /**
   * Update HP text display
   */
  private updateHpText(): void {
    if (this.hpText) {
      this.hpText.setText(`${this.critter.currentHp}/${this.critter.maxHp}`);
    }
  }

  /**
   * Update health bar color based on HP percentage
   */
  private updateHealthColor(): void {
    const hpPercentage = this.getHpPercentage();
    
    if (hpPercentage > 50) {
      // Green for healthy
      this.setFillColor(0x4CAF50);
    } else if (hpPercentage > 25) {
      // Yellow for damaged
      this.setFillColor(0xFFC107);
    } else if (hpPercentage > 0) {
      // Orange for critical
      this.setFillColor(0xFF9800);
    } else {
      // Red for KO'd
      this.setFillColor(0xF44336);
    }
  }

  /**
   * Create a static health bar (non-animated) for performance
   */
  static createStatic(scene: Scene, config: HealthBarConfig): HealthBar {
    const healthBar = new HealthBar(scene, config);
    healthBar.setAnimationSpeed(0); // Disable animation
    return healthBar;
  }

  /**
   * Create health bar with default styling
   */
  static createDefault(
    scene: Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    critter: CritterInstance,
    showText: boolean = true
  ): HealthBar {
    return new HealthBar(scene, {
      x,
      y,
      width,
      height,
      backgroundColor: 0x333333,
      fillColor: 0x4CAF50,
      critter,
      showText,
      showBorder: true,
      borderThickness: 2,
      borderColor: 0x000000,
      textColor: 0xffffff,
      fontSize: 12,
    });
  }
}