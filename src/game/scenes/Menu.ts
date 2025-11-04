import { Scene, GameObjects } from 'phaser';
import { EventBus } from '../EventBus';
import { SceneContext } from './SceneContext';

/**
 * Menu Scene - Main game menu (pause screen)
 * Options: Party, Pokedex, Bag, Settings, Save/Load
 */
export class Menu extends Scene {
  private gameStateManager = SceneContext.getInstance().getGameStateManager();
  private menuOptionsContainer: GameObjects.Container | null = null;
  private selectedOptionIndex: number = 0;
  private infoText: GameObjects.Text | null = null;

  constructor() {
    super('Menu');
  }

  create() {
    const width = this.game.config.width as number;
    const height = this.game.config.height as number;

    const background = this.add.rectangle(width / 2, height / 2, width, height, 0x000000);
    background.setAlpha(0.8);
    background.setScrollFactor(0);

    const titleText = this.add.text(width / 2, 40, 'MENU', {
      font: '28px Arial',
      color: '#ffffff',
    });
    titleText.setOrigin(0.5);

    this.menuOptionsContainer = this.add.container(width / 2 - 100, 120);
    this.renderMenuOptions();

    this.infoText = this.add.text(width / 2, height - 50, 'Use arrows to navigate | ENTER to select | ESC to close', {
      font: '12px Arial',
      color: '#cccccc',
    });
    this.infoText.setOrigin(0.5);

    this.setupInput();
    this.setupEventListeners();

    EventBus.emit('current-scene-ready', this);
  }

  private renderMenuOptions() {
    if (!this.menuOptionsContainer) return;

    this.menuOptionsContainer.removeAll(true);

    const options = ['Party', 'Pokedex', 'Bag', 'Settings', 'Save Game', 'Load Game'];

    options.forEach((option, index) => {
      const y = index * 50;
      const isSelected = index === this.selectedOptionIndex;
      const bgColor = isSelected ? 0x4444ff : 0x333333;
      const textColor = isSelected ? '#ffff00' : '#ffffff';

      const bg = this.add.rectangle(100, y + 25, 200, 40, bgColor);
      const text = this.add.text(0, y, option, {
        font: '16px Arial',
        color: textColor,
      });
      text.setOrigin(0);

      this.menuOptionsContainer?.add([bg, text]);
    });
  }

  private setupInput() {
    this.input.keyboard?.on('keydown-UP_ARROW', () => {
      this.selectedOptionIndex = Math.max(0, this.selectedOptionIndex - 1);
      this.renderMenuOptions();
    });

    this.input.keyboard?.on('keydown-DOWN_ARROW', () => {
      this.selectedOptionIndex = Math.min(5, this.selectedOptionIndex + 1);
      this.renderMenuOptions();
    });

    this.input.keyboard?.on('keydown-ENTER', () => {
      this.selectOption();
    });

    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('Overworld');
    });
  }

  private setupEventListeners() {
    EventBus.on('game:saved', () => {
      this.infoText?.setText('Game saved successfully!');
    });

    EventBus.on('game:loaded', () => {
      this.infoText?.setText('Game loaded successfully!');
    });
  }

  private selectOption() {
    const options = ['Party', 'Pokedex', 'Bag', 'Settings', 'Save Game', 'Load Game'];
    const selected = options[this.selectedOptionIndex];

    switch (selected) {
      case 'Party':
        this.scene.start('Party');
        break;
      case 'Pokedex':
        this.infoText?.setText('Pokedex not yet implemented');
        break;
      case 'Bag':
        this.infoText?.setText('Bag view not yet implemented');
        break;
      case 'Settings':
        this.infoText?.setText('Settings not yet implemented');
        break;
      case 'Save Game':
        this.saveGame();
        break;
      case 'Load Game':
        this.loadGame();
        break;
    }
  }

  private saveGame() {
    const success = this.gameStateManager.saveGame();
    if (success) {
      this.infoText?.setText('Game saved successfully!');
    } else {
      this.infoText?.setText('Failed to save game');
    }
  }

  private loadGame() {
    const success = this.gameStateManager.loadGame();
    if (success) {
      this.infoText?.setText('Game loaded successfully!');
      this.time.delayedCall(1000, () => {
        this.scene.start('Overworld');
      });
    } else {
      this.infoText?.setText('No save data found');
    }
  }

  shutdown() {
    EventBus.off('game:saved');
    EventBus.off('game:loaded');
  }
}
