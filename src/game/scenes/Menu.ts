import { Scene, GameObjects } from 'phaser';
import { EventBus } from '../EventBus';
import { SceneContext } from './SceneContext';

/**
 * Menu Scene - Main game menu (pause screen)
 * Options: Resume, Party, Bag, Settings, Save/Load
 */
export class Menu extends Scene {
  private gameStateManager = SceneContext.getInstance().getGameStateManager();
  private menuOptionsContainer: GameObjects.Container | null = null;
  private selectedOptionIndex: number = 0;
  private infoText: GameObjects.Text | null = null;
  private previousScene: string = 'Overworld';

  constructor() {
    super('Menu');
  }

  init(data: any) {
    if (data?.previousScene) {
      this.previousScene = data.previousScene;
    }
  }

  /**
   * Handle scene resume from other UI scenes
   */
  handleSceneResume(data?: any) {
    // Resume input handling
    this.setupInput();
  }

  create() {
    const width = this.game.config.width as number;
    const height = this.game.config.height as number;

    const background = this.add.rectangle(width / 2, height / 2, width, height, 0x000000);
    background.setAlpha(0.85);
    background.setScrollFactor(0);
    background.setDepth(998);

    const titleText = this.add.text(width / 2, 40, '⚙ MENU', {
      font: 'bold 32px Arial',
      color: '#0ec3c9',
    });
    titleText.setOrigin(0.5);
    titleText.setDepth(999);

    this.menuOptionsContainer = this.add.container(width / 2 - 120, 120);
    this.menuOptionsContainer.setDepth(999);
    this.renderMenuOptions();

    this.infoText = this.add.text(width / 2, height - 50, 'Use arrows to navigate | ENTER to select | ESC to resume', {
      font: '12px Arial',
      color: '#cccccc',
    });
    this.infoText.setOrigin(0.5);
    this.infoText.setDepth(999);

    this.setupInput();
    this.setupEventListeners();

    EventBus.emit('current-scene-ready', this);
  }

  private renderMenuOptions() {
    if (!this.menuOptionsContainer) return;

    this.menuOptionsContainer.removeAll(true);

    const options = ['Resume', 'Party', 'Bag', 'Settings', 'Save Game', 'Load Game'];

    options.forEach((option, index) => {
      const y = index * 55;
      const isSelected = index === this.selectedOptionIndex;
      const bgColor = isSelected ? 0x0ec3c9 : 0x1a3a3f;
      const textColor = isSelected ? '#000000' : '#0ec3c9';
      const borderColor = isSelected ? 0x00ff00 : 0x0ec3c9;

      const bg = this.add.rectangle(120, y + 25, 240, 50, bgColor);
      bg.setAlpha(isSelected ? 1 : 0.5);
      bg.setStrokeStyle(2, borderColor);
      
      const text = this.add.text(10, y, option, {
        font: 'bold 18px Arial',
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
      this.resume();
    });

    this.input.keyboard?.on('keydown-M', () => {
      this.resume();
    });
  }

  private setupEventListeners() {
    EventBus.on('game:saved', () => {
      this.infoText?.setText('Game saved successfully!');
      this.time.delayedCall(2000, () => {
        if (this.infoText) {
          this.infoText.setText('Use arrows to navigate | ENTER to select | ESC to resume');
        }
      });
    });

    EventBus.on('game:loaded', () => {
      this.infoText?.setText('Game loaded successfully!');
      this.time.delayedCall(2000, () => {
        if (this.infoText) {
          this.infoText.setText('Use arrows to navigate | ENTER to select | ESC to resume');
        }
      });
    });

    // Handle inventory closure
    EventBus.on('inventory:closed', () => {
      this.handleSceneResume();
    });
  }

  private selectOption() {
    const options = ['Resume', 'Party', 'Bag', 'Settings', 'Save Game', 'Load Game'];
    const selected = options[this.selectedOptionIndex];

    switch (selected) {
      case 'Resume':
        this.resume();
        break;
      case 'Party':
        this.scene.start('Party', { previousScene: this.previousScene });
        break;
      case 'Bag':
        this.scene.launch('Inventory', { previousScene: this.previousScene });
        this.scene.pause('Menu');
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

  private resume() {
    this.scene.stop();
    const previousScene = this.scene.get(this.previousScene);
    if (previousScene) {
      previousScene.scene.resume();
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
        this.scene.stop();
        this.scene.start('Overworld');
      });
    } else {
      this.infoText?.setText('No save data found');
    }
  }

  shutdown() {
    EventBus.off('game:saved');
    EventBus.off('game:loaded');
    EventBus.off('inventory:closed');
  }
}
