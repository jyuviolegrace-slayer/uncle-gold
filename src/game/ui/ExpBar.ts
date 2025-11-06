import { Scene } from 'phaser';
import { AnimatedBar, BarConfig } from './AnimatedBar';
import { CritterInstance } from '../models/critter';
import { calculateExpBarCurrentValue } from '../utils/leveling-utils';

export interface ExpBarConfig extends Omit<BarConfig, 'value'> {
  critter: CritterInstance;
  showText?: boolean;
  showLevelText?: boolean;
  textColor?: number;
  levelTextColor?: number;
  fontSize?: number;
  levelFontSize?: number;
  fontFamily?: string;
}

/**
 * Experience bar component specifically for critters
 * Provides automatic EXP calculation and optional text displays
 */
export class ExpBar extends AnimatedBar {
  private critter: CritterInstance;
  private showText: boolean;
  private showLevelText: boolean;
  private expText: Phaser.GameObjects.Text | null = null;
  private levelText: Phaser.GameObjects.Text | null = null;
  private textColor: number;
  private levelTextColor: number;
  private fontSize: number;
  private levelFontSize: number;
  private fontFamily: string;

  constructor(scene: Scene, config: ExpBarConfig) {
    const initialExpRatio = calculateExpBarCurrentValue(config.critter.currentLevel, config.critter.currentExp);
    
    super(scene, {
      ...config,
      value: initialExpRatio,
    });

    this.critter = config.critter;
    this.showText = config.showText ?? false;
    this.showLevelText = config.showLevelText ?? false;
    this.textColor = config.textColor ?? 0xffffff;
    this.levelTextColor = config.levelTextColor ?? 0xffd700;
    this.fontSize = config.fontSize ?? 10;
    this.levelFontSize = config.levelFontSize ?? 12;
    this.fontFamily = config.fontFamily ?? 'Arial';

    if (this.showText) {
      this.createExpText();
    }

    if (this.showLevelText) {
      this.createLevelText();
    }

    this.updateTexts();
  }

  /**
   * Update the experience bar based on critter's current EXP and level
   */
  updateExp(animate: boolean = true): void {
    const expRatio = calculateExpBarCurrentValue(this.critter.currentLevel, this.critter.currentExp);
    this.setValue(expRatio, animate);
    this.updateTexts();
  }

  /**
   * Set the critter instance this experience bar is tracking
   */
  setCritter(critter: CritterInstance): void {
    this.critter = critter;
    this.updateExp(false);
  }

  /**
   * Get the current critter instance
   */
  getCritter(): CritterInstance {
    return this.critter;
  }

  /**
   * Get current level
   */
  getCurrentLevel(): number {
    return this.critter.currentLevel;
  }

  /**
   * Get current EXP
   */
  getCurrentExp(): number {
    return this.critter.currentExp;
  }

  /**
   * Get EXP progress as percentage (0-100)
   */
  getExpProgress(): number {
    return calculateExpBarCurrentValue(this.critter.currentLevel, this.critter.currentExp) * 100;
  }

  /**
   * Check if critter is at max level
   */
  isMaxLevel(): boolean {
    return this.critter.currentLevel >= 100;
  }

  /**
   * Add experience to critter and animate the bar
   */
  addExp(expAmount: number, animate: boolean = true): void {
    this.critter.currentExp += expAmount;
    this.updateExp(animate);
    
    if (expAmount > 0) {
      this.pulse(1.1, 300);
    }
  }

  /**
   * Set experience directly (for debugging or special cases)
   */
  setExp(expAmount: number, animate: boolean = true): void {
    this.critter.currentExp = expAmount;
    this.updateExp(animate);
  }

  /**
   * Show or hide EXP text
   */
  setShowText(show: boolean): void {
    this.showText = show;
    
    if (show && !this.expText) {
      this.createExpText();
    } else if (!show && this.expText) {
      this.expText.destroy();
      this.expText = null;
    }
  }

  /**
   * Show or hide level text
   */
  setShowLevelText(show: boolean): void {
    this.showLevelText = show;
    
    if (show && !this.levelText) {
      this.createLevelText();
    } else if (!show && this.levelText) {
      this.levelText.destroy();
      this.levelText = null;
    }
  }

  /**
   * Set text color
   */
  setTextColor(color: number): void {
    this.textColor = color;
    if (this.expText) {
      this.expText.setColor(`#${color.toString(16).padStart(6, '0')}`);
    }
  }

  /**
   * Set level text color
   */
  setLevelTextColor(color: number): void {
    this.levelTextColor = color;
    if (this.levelText) {
      this.levelText.setColor(`#${color.toString(16).padStart(6, '0')}`);
    }
  }

  /**
   * Set font size
   */
  setFontSize(size: number): void {
    this.fontSize = size;
    if (this.expText) {
      this.expText.setFontSize(size);
    }
  }

  /**
   * Set level font size
   */
  setLevelFontSize(size: number): void {
    this.levelFontSize = size;
    if (this.levelText) {
      this.levelText.setFontSize(size);
    }
  }

  /**
   * Set font family
   */
  setFontFamily(family: string): void {
    this.fontFamily = family;
    if (this.expText) {
      this.expText.setFontFamily(family);
    }
    if (this.levelText) {
      this.levelText.setFontFamily(family);
    }
  }

  /**
   * Create EXP text display
   */
  private createExpText(): void {
    const container = this.getContainer();
    this.expText = (this as any).scene.add.text(0, 0, '', {
      fontSize: `${this.fontSize}px`,
      fontFamily: this.fontFamily,
      color: `#${this.textColor.toString(16).padStart(6, '0')}`,
    }).setOrigin(0.5);
    
    if (this.expText) {
      container.add(this.expText);
    }
    this.updateExpText();
  }

  /**
   * Create level text display
   */
  private createLevelText(): void {
    const container = this.getContainer();
    
    // Position level text above the bar
    const barHeight = (this.getBackground() as any).height;
    const yPos = -barHeight / 2 - 15;
    
    this.levelText = (this as any).scene.add.text(0, yPos, '', {
      fontSize: `${this.levelFontSize}px`,
      fontFamily: this.fontFamily,
      color: `#${this.levelTextColor.toString(16).padStart(6, '0')}`,
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    if (this.levelText) {
      container.add(this.levelText);
    }
    this.updateLevelText();
  }

  /**
   * Update EXP text display
   */
  private updateExpText(): void {
    if (this.expText) {
      if (this.isMaxLevel()) {
        this.expText.setText('MAX');
      } else {
        const expProgress = this.getExpProgress();
        this.expText.setText(`${Math.floor(expProgress)}%`);
      }
    }
  }

  /**
   * Update level text display
   */
  private updateLevelText(): void {
    if (this.levelText) {
      this.levelText.setText(`Lv. ${this.critter.currentLevel}`);
    }
  }

  /**
   * Update both text displays
   */
  private updateTexts(): void {
    this.updateExpText();
    this.updateLevelText();
  }

  /**
   * Create a static experience bar (non-animated) for performance
   */
  static createStatic(scene: Scene, config: ExpBarConfig): ExpBar {
    const expBar = new ExpBar(scene, config);
    expBar.setAnimationSpeed(0); // Disable animation
    return expBar;
  }

  /**
   * Create experience bar with default styling
   */
  static createDefault(
    scene: Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    critter: CritterInstance,
    showText: boolean = true,
    showLevelText: boolean = true
  ): ExpBar {
    return new ExpBar(scene, {
      x,
      y,
      width,
      height,
      backgroundColor: 0x333333,
      fillColor: 0x2196F3, // Blue for EXP
      critter,
      showText,
      showLevelText,
      showBorder: true,
      borderThickness: 1,
      borderColor: 0x000000,
      textColor: 0xffffff,
      levelTextColor: 0xffd700,
      fontSize: 10,
      levelFontSize: 12,
    });
  }

  /**
   * Create a compact experience bar for UI panels
   */
  static createCompact(
    scene: Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    critter: CritterInstance
  ): ExpBar {
    return new ExpBar(scene, {
      x,
      y,
      width,
      height: Math.min(height, 6), // Make it thin
      backgroundColor: 0x222222,
      fillColor: 0x2196F3,
      critter,
      showText: false,
      showLevelText: false,
      showBorder: false,
    });
  }
}