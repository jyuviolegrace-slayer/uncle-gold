import Phaser from 'phaser';
import { BaseScene } from './common/BaseScene';
import { SceneKeys, TextureKeys, AudioKeys, FontKeys } from '../assets';
import { saveService } from '../services/SaveService';

const GAME_OVER_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: FontKeys.KENNEY_FUTURE_NARROW,
  color: '#FFFFFF',
  fontSize: '48px',
};

const INSTRUCTION_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: FontKeys.KENNEY_FUTURE_NARROW,
  color: '#CCCCCC',
  fontSize: '24px',
};

export class GameOver extends BaseScene {
  private gameOverText?: Phaser.GameObjects.Text;
  private instructionText?: Phaser.GameObjects.Text;

  constructor() {
    super(SceneKeys.GAME_OVER);
  }

  create(): void {
    super.create();

    this.createGameOverScreen();
    this.setupTransitions();
    this.playGameOverMusic();
    
    // Save game state after blackout
    saveService.autoSave();
  }

  update(time: number, delta: number): void {
    super.update(time, delta);

    if (this.isInputLocked()) {
      return;
    }

    if (this.inputManager.wasSpaceKeyPressed() || this.inputManager.wasConfirmKeyPressed()) {
      this.lockInput();
      this.cameras.main.fadeOut(500, 0, 0, 0);
      return;
    }
  }

  private createGameOverScreen(): void {
    const { width, height } = this.scale;

    // Darken background
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);

    // Game Over text
    this.gameOverText = this.add.text(width / 2, height / 2 - 50, 'GAME OVER', GAME_OVER_TEXT_STYLE)
      .setOrigin(0.5)
      .setAlpha(0);

    // Instruction text
    this.instructionText = this.add.text(width / 2, height / 2 + 50, 'Press SPACE or ENTER to continue', INSTRUCTION_TEXT_STYLE)
      .setOrigin(0.5)
      .setAlpha(0);

    // Fade in animations
    this.tweens.add({
      targets: this.gameOverText,
      alpha: 1,
      duration: 1000,
      ease: 'Power2',
    });

    this.tweens.add({
      targets: this.instructionText,
      alpha: 1,
      duration: 1000,
      delay: 500,
      ease: 'Power2',
    });

    // Pulsing effect for instruction text
    this.tweens.add({
      targets: this.instructionText,
      alpha: { from: 1, to: 0.3 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 1500,
    });
  }

  private setupTransitions(): void {
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.transitionToScene(SceneKeys.TITLE);
    });
  }

  private playGameOverMusic(): void {
    // Stop all current music and play game over sound if available
    this.audioManager.stopAllBackgroundMusic();
    // For now, we'll reuse the title music or have silence
    // this.audioManager.playBackgroundMusic(AudioKeys.GAME_OVER);
  }
}