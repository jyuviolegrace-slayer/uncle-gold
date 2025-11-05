import { Scene, GameObjects } from 'phaser';
import { EventBus } from '../EventBus';

/**
 * Cutscene Scene - Cinematic overlay with animated bars
 * Provides letterbox effect for cutscenes and dramatic moments
 */
export class Cutscene extends Scene {
  private topBar: GameObjects.Rectangle | null = null;
  private bottomBar: GameObjects.Rectangle | null = null;
  private isActive: boolean = false;

  constructor() {
    super('Cutscene');
  }

  create() {
    const { width, height } = this.scale;

    this.topBar = this.add.rectangle(0, 0, width, 100, 0x000000, 0.8)
      .setOrigin(0)
      .setVisible(false);

    this.bottomBar = this.add.rectangle(0, height - 100, width, 100, 0x000000, 0.8)
      .setOrigin(0)
      .setVisible(false);

    this.scene.bringToTop();
    EventBus.emit('cutscene:ready');
  }

  /**
   * Start cutscene with animated bars
   */
  async startCutScene(): Promise<void> {
    if (this.isActive) return;

    this.isActive = true;

    if (this.topBar && this.bottomBar) {
      this.topBar.setY(-100).setVisible(true);
      this.bottomBar.setY(this.scale.height).setVisible(true);

      await Promise.all([
        this.animateBar(this.topBar, -100, 0),
        this.animateBar(this.bottomBar, this.scale.height, this.scale.height - 100),
      ]);
    }

    EventBus.emit('cutscene:started');
  }

  /**
   * End cutscene with animated bars
   */
  async endCutScene(): Promise<void> {
    if (!this.isActive) return;

    if (this.topBar && this.bottomBar) {
      await Promise.all([
        this.animateBar(this.topBar, 0, -100),
        this.animateBar(this.bottomBar, this.scale.height - 100, this.scale.height),
      ]);

      this.topBar.setVisible(false);
      this.bottomBar.setVisible(false);
    }

    this.isActive = false;
    EventBus.emit('cutscene:ended');
  }

  /**
   * Check if cutscene is currently active
   */
  get active(): boolean {
    return this.isActive;
  }

  /**
   * Animate bar movement
   */
  private animateBar(
    target: GameObjects.Rectangle,
    startY: number,
    endY: number
  ): Promise<void> {
    return new Promise((resolve) => {
      this.tweens.add({
        targets: target,
        delay: 0,
        duration: 800,
        y: {
          from: startY,
          start: startY,
          to: endY,
        },
        ease: 'Power2',
        onComplete: () => resolve(),
      });
    });
  }

  /**
   * Immediately show bars without animation
   */
  showBarsInstant(): void {
    if (this.topBar && this.bottomBar) {
      this.topBar.setY(0).setVisible(true);
      this.bottomBar.setY(this.scale.height - 100).setVisible(true);
      this.isActive = true;
      EventBus.emit('cutscene:instant');
    }
  }

  /**
   * Immediately hide bars without animation
   */
  hideBarsInstant(): void {
    if (this.topBar && this.bottomBar) {
      this.topBar.setVisible(false);
      this.bottomBar.setVisible(false);
      this.isActive = false;
      EventBus.emit('cutscene:hidden');
    }
  }

  shutdown() {
    EventBus.off('cutscene:ready');
    EventBus.off('cutscene:started');
    EventBus.off('cutscene:ended');
    EventBus.off('cutscene:instant');
    EventBus.off('cutscene:hidden');
  }
}