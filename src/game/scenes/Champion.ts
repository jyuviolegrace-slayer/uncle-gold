import { Scene, GameObjects } from 'phaser';
import { EventBus } from '../EventBus';
import { SceneContext } from './SceneContext';

/**
 * Champion Scene - End game sequence with champion battle victory
 * Displays victory cutscene and credits
 */
export class Champion extends Scene {
  private gameStateManager = SceneContext.getInstance().getGameStateManager();

  constructor() {
    super('Champion');
  }

  init(data: any) {
    // Store victory data
  }

  create() {
    const width = this.game.config.width as number;
    const height = this.game.config.height as number;

    this.cameras.main.setBackgroundColor(0x000000);

    const container = this.add.container(0, 0);

    const title = this.add.text(width / 2, 100, 'Champion!', {
      font: 'bold 64px Arial',
      color: '#FFD700',
      align: 'center',
    });
    title.setOrigin(0.5);

    const message = this.add.text(width / 2, 200, `${this.gameStateManager.getPlayerState().name} has become the Champion!`, {
      font: '24px Arial',
      color: '#FFFFFF',
      align: 'center',
      wordWrap: { width: width - 100 },
    });
    message.setOrigin(0.5);

    const badges = this.add.text(width / 2, 280, `Badges Collected: ${this.gameStateManager.getBadgeCount()}`, {
      font: 'bold 20px Arial',
      color: '#FFFF00',
      align: 'center',
    });
    badges.setOrigin(0.5);

    const stats = this.add.text(width / 2, 340, `Critters Caught: ${this.gameStateManager.getPokedexCount()}\nTrainers Defeated: ${this.gameStateManager.getDefeatedTrainerCount()}`, {
      font: '18px Arial',
      color: '#AAAAFF',
      align: 'center',
    });
    stats.setOrigin(0.5);

    const credits = this.add.text(width / 2, 450, 'Thanks for playing Critter Quest!', {
      font: '20px Arial',
      color: '#CCCCCC',
      align: 'center',
    });
    credits.setOrigin(0.5);

    const continueText = this.add.text(width / 2, height - 60, 'Press SPACE to return to Main Menu', {
      font: '16px Arial',
      color: '#88FF88',
      align: 'center',
    });
    continueText.setOrigin(0.5);

    container.add([title, message, badges, stats, credits, continueText]);

    this.input.keyboard?.on('keydown-SPACE', () => {
      this.gameStateManager.saveGame();
      this.scene.start('Title');
    });

    EventBus.emit('current-scene-ready', this);
  }
}
