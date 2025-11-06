import { Scene, GameObjects, Tweens } from 'phaser';

export interface BarConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor: number;
  fillColor: number;
  value: number; // Current value (0-1)
  maxValue?: number; // Maximum value (default 1)
  borderThickness?: number;
  borderColor?: number;
  showBorder?: boolean;
}

/**
 * Base animated bar component for health bars, experience bars, etc.
 * Provides smooth animations and customizable appearance
 */
export class AnimatedBar {
  private scene: Scene;
  private container: GameObjects.Container;
  private background: GameObjects.Rectangle;
  private fill: GameObjects.Rectangle;
  private border: GameObjects.Rectangle | null = null;
  private currentValue: number;
  private targetValue: number;
  private animationSpeed: number = 0.1;
  private updateTween: Tweens.Tween | null = null;

  constructor(scene: Scene, config: BarConfig) {
    this.scene = scene;
    this.currentValue = config.value;
    this.targetValue = config.value;

    // Create container for all bar components
    this.container = scene.add.container(config.x, config.y);

    // Create background
    this.background = scene.add.rectangle(0, 0, config.width, config.height, config.backgroundColor);
    this.container.add(this.background);

    // Create fill bar
    this.fill = scene.add.rectangle(
      -config.width / 2, // Start from left edge
      0,
      config.width * config.value,
      config.height,
      config.fillColor
    ).setOrigin(0, 0.5);
    this.container.add(this.fill);

    // Create border if requested
    if (config.showBorder && config.borderThickness && config.borderColor) {
      this.border = scene.add.rectangle(
        0,
        0,
        config.width + config.borderThickness * 2,
        config.height + config.borderThickness * 2,
        config.borderColor
      ).setStrokeStyle(config.borderThickness, config.borderColor);
      this.container.add(this.border);
      this.border.setDepth(1);
    }

    // Set proper depths
    this.background.setDepth(0);
    this.fill.setDepth(2);
  }

  /**
   * Get the current value of the bar (0-1)
   */
  getValue(): number {
    return this.currentValue;
  }

  /**
   * Get the target value of the bar (0-1)
   */
  getTargetValue(): number {
    return this.targetValue;
  }

  /**
   * Set the bar value with optional animation
   */
  setValue(value: number, animate: boolean = true): void {
    // Clamp value between 0 and 1
    this.targetValue = Math.max(0, Math.min(1, value));

    if (!animate) {
      this.currentValue = this.targetValue;
      this.updateFillWidth();
      return;
    }

    // Cancel any existing animation
    if (this.updateTween) {
      this.updateTween.stop();
    }

    // Create smooth animation to new value
    this.updateTween = this.scene.tweens.add({
      targets: this,
      currentValue: this.targetValue,
      duration: 300, // 300ms animation
      ease: 'Power2.easeOut',
      onUpdate: () => {
        this.updateFillWidth();
      },
      onComplete: () => {
        this.updateTween = null;
      },
    });
  }

  /**
   * Instantly set the bar value without animation
   */
  setValueInstant(value: number): void {
    this.setValue(value, false);
  }

  /**
   * Add value to current value
   */
  addValue(delta: number, animate: boolean = true): void {
    this.setValue(this.targetValue + delta, animate);
  }

  /**
   * Subtract value from current value
   */
  subtractValue(delta: number, animate: boolean = true): void {
    this.setValue(this.targetValue - delta, animate);
  }

  /**
   * Set the animation speed for value changes
   */
  setAnimationSpeed(speed: number): void {
    this.animationSpeed = Math.max(0.01, Math.min(1, speed));
  }

  /**
   * Set the fill color of the bar
   */
  setFillColor(color: number): void {
    this.fill.setFillStyle(color);
  }

  /**
   * Set the background color of the bar
   */
  setBackgroundColor(color: number): void {
    this.background.setFillStyle(color);
  }

  /**
   * Set the border color (if border exists)
   */
  setBorderColor(color: number): void {
    if (this.border) {
      this.border.setStrokeStyle(2, color);
    }
  }

  /**
   * Show or hide the bar
   */
  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  /**
   * Get the container for positioning/manipulation
   */
  getContainer(): GameObjects.Container {
    return this.container;
  }

  /**
   * Get the fill rectangle for advanced customization
   */
  getFill(): GameObjects.Rectangle {
    return this.fill;
  }

  /**
   * Get the background rectangle for advanced customization
   */
  getBackground(): GameObjects.Rectangle {
    return this.background;
  }

  /**
   * Check if the bar is currently animating
   */
  isAnimating(): boolean {
    return this.updateTween !== null && this.updateTween.isPlaying();
  }

  /**
   * Stop any current animation
   */
  stopAnimation(): void {
    if (this.updateTween) {
      this.updateTween.stop();
      this.updateTween = null;
    }
  }

  /**
   * Create a shake effect (useful for damage)
   */
  shake(intensity: number = 2, duration: number = 200): void {
    this.scene.tweens.add({
      targets: this.container,
      x: `+=${intensity}`,
      duration: duration / 4,
      ease: 'Power2.easeInOut',
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.container.x = 0; // Reset position
      },
    });
  }

  /**
   * Create a pulse effect (useful for healing)
   */
  pulse(scale: number = 1.1, duration: number = 300): void {
    this.scene.tweens.add({
      targets: this.fill,
      scaleX: scale,
      duration: duration / 2,
      ease: 'Power2.easeOut',
      yoyo: true,
      repeat: 1,
    });
  }

  /**
   * Destroy the bar and clean up resources
   */
  destroy(): void {
    this.stopAnimation();
    this.container.destroy();
  }

  /**
   * Update the fill width based on current value
   */
  private updateFillWidth(): void {
    const backgroundWidth = this.background.width;
    const fillWidth = backgroundWidth * this.currentValue;
    this.fill.width = fillWidth;
  }
}