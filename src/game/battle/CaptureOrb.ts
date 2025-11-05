import { Scene, Curves, Math as PhaserMath } from 'phaser';

/**
 * Configuration for CaptureOrb
 */
export interface ICaptureOrbConfig {
  startX?: number;
  startY?: number;
  targetX?: number;
  targetY?: number;
  scale?: number;
  skipAnimations?: boolean;
}

/**
 * CaptureOrb - Animated capture orb for catching Critters
 * Replaces legacy Ball.js with TypeScript implementation
 */
export class CaptureOrb {
  private scene: Scene;
  private orb: Phaser.GameObjects.Sprite | null = null;
  private orbPath: Curves.Path | null = null;
  private orbPathGraphics: Phaser.GameObjects.Graphics | null = null;
  private skipAnimations: boolean;
  private scale: number;
  private currentAnimation: Phaser.Tweens.Tween | null = null;

  constructor(scene: Scene, config: ICaptureOrbConfig = {}) {
    this.scene = scene;
    this.scale = config.scale ?? 1;
    this.skipAnimations = config.skipAnimations ?? false;

    this.createOrbPath(
      config.startX ?? 0,
      config.startY ?? 500,
      config.targetX ?? 725,
      config.targetY ?? 180
    );
  }

  /**
   * Create curved path for orb to follow
   */
  private createOrbPath(startX: number, startY: number, endX: number, endY: number): void {
    const startPoint = new PhaserMath.Vector2(startX, startY);
    const controlPoint1 = new PhaserMath.Vector2(startX + 200, 100);
    const controlPoint2 = new PhaserMath.Vector2(endX - 100, 180);
    const endPoint = new PhaserMath.Vector2(endX, endY);

    const curve = new Curves.CubicBezier(startPoint, controlPoint1, controlPoint2, endPoint);
    this.orbPath = new Curves.Path(startX, startY).add(curve);

    this.orbPathGraphics = this.scene.add.graphics();
    this.orbPathGraphics.clear();
    this.orbPathGraphics.lineStyle(2, 0x00ff00, 0);
    this.orbPath.draw(this.orbPathGraphics);
    this.orbPathGraphics.setAlpha(0);

    this.orb = this.scene.add
      .sprite(startX, startY, 'star')
      .setScale(this.scale * 0.8)
      .setAlpha(0)
      .setTint(0xffaa00);
  }

  /**
   * Play throw animation
   */
  playThrowAnimation(): Promise<void> {
    return new Promise(resolve => {
      if (this.skipAnimations || !this.orb || !this.orbPath) {
        if (this.orb) {
          const endPoint = this.orbPath?.getEndPoint();
          this.orb.setPosition(endPoint?.x ?? 725, endPoint?.y ?? 180);
          this.orb.setAlpha(1);
        }
        resolve();
        return;
      }

      this.orb.setAlpha(1);
      const startPoint = this.orbPath.getStartPoint();
      const endPoint = this.orbPath.getEndPoint();

      this.currentAnimation = this.scene.tweens.add({
        targets: this.orb,
        x: { from: startPoint.x, to: endPoint.x },
        y: { from: startPoint.y, to: endPoint.y },
        duration: 500,
        ease: 'Quad.InOut',
        onComplete: () => {
          resolve();
        },
      });
    });
  }

  /**
   * Play shake animation for failed catch
   */
  playShakeAnimation(): Promise<void> {
    return new Promise(resolve => {
      if (this.skipAnimations || !this.orb) {
        resolve();
        return;
      }

      const startX = this.orb.x;
      const startY = this.orb.y;

      this.currentAnimation = this.scene.tweens.add({
        targets: this.orb,
        x: { value: startX, duration: 100 },
        duration: 400,
        repeat: 2,
        onComplete: () => {
          if (this.orb) {
            this.orb.setPosition(startX, startY);
          }
          resolve();
        },
      });
    });
  }

  /**
   * Show the orb path (for debugging)
   */
  showPath(): void {
    if (this.orbPathGraphics) {
      this.orbPathGraphics.setAlpha(1);
    }
  }

  /**
   * Hide the orb path
   */
  hidePath(): void {
    if (this.orbPathGraphics) {
      this.orbPathGraphics.setAlpha(0);
    }
  }

  /**
   * Hide the orb
   */
  hide(): void {
    if (this.orb) {
      this.orb.setAlpha(0);
    }
  }

  /**
   * Show the orb
   */
  show(): void {
    if (this.orb) {
      this.orb.setAlpha(1);
    }
  }

  /**
   * Reset orb to starting position
   */
  reset(startX: number = 0, startY: number = 500): void {
    if (this.orb) {
      this.orb.setPosition(startX, startY);
      this.orb.setAlpha(0);
    }
    if (this.currentAnimation) {
      this.currentAnimation.stop();
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.currentAnimation) {
      this.currentAnimation.stop();
    }
    if (this.orb) {
      this.orb.destroy();
    }
    if (this.orbPath) {
      this.orbPath.destroy();
    }
    if (this.orbPathGraphics) {
      this.orbPathGraphics.destroy();
    }
  }
}
