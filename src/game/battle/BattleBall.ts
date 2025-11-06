import { Scene } from 'phaser';
import { TextureKeys } from '../assets/TextureKeys';

export interface BallConfig {
  scene: Scene;
  assetKey?: string;
  assetFrame?: number;
  scale?: number;
  skipBattleAnimations?: boolean;
}

/**
 * Capture Ball System
 * Handles the capture ball animation and physics
 */
export class BattleBall {
  private scene: Scene;
  private ball: Phaser.GameObjects.PathFollower;
  private ballPath: Phaser.Curves.Path;
  private ballPathGraphics: Phaser.GameObjects.Graphics;
  private skipBattleAnimations: boolean;

  constructor(config: BallConfig) {
    this.scene = config.scene;
    this.skipBattleAnimations = config.skipBattleAnimations || false;
    
    this.createCurvePath();
    this.ball = this.scene.add
      .follower(this.ballPath, 0, 500, config.assetKey || TextureKeys.DAMAGED_BALL, config.assetFrame || 0)
      .setAlpha(0)
      .setScale(config.scale || 1);
  }

  /**
   * Create the curve path for ball animation
   */
  private createCurvePath(): void {
    this.ballPath = new Phaser.Curves.Path(0, 0);
    this.ballPath.lineTo(0, 250);
    this.ballPath.lineTo(50, 200);
    this.ballPath.lineTo(100, 250);
    this.ballPath.lineTo(120, 300);

    // Debug graphics (remove in production)
    this.ballPathGraphics = this.scene.add.graphics();
    if (process.env.NODE_ENV === 'development') {
      this.ballPathGraphics.lineStyle(1, 0xff0000, 1);
      // Simple debug line representation of the path
      this.ballPathGraphics.beginPath();
      this.ballPathGraphics.moveTo(0, 0);
      this.ballPathGraphics.lineTo(0, 250);
      this.ballPathGraphics.lineTo(50, 200);
      this.ballPathGraphics.lineTo(100, 250);
      this.ballPathGraphics.lineTo(120, 300);
      this.ballPathGraphics.strokePath();
    }
  }

  /**
   * Play the capture ball animation
   */
  async throwBall(): Promise<void> {
    if (this.skipBattleAnimations) {
      this.ball.setAlpha(1);
      this.ball.setPosition(120, 300);
      return;
    }

    return new Promise((resolve) => {
      this.ball.setAlpha(1);
      
      // Start the path follower animation
      this.ball.startFollow({
        duration: 1500,
        onComplete: () => {
          resolve();
        }
      });
    });
  }

  /**
   * Hide the ball
   */
  hide(): void {
    this.ball.setAlpha(0);
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.ball.destroy();
    this.ballPathGraphics.destroy();
  }
}