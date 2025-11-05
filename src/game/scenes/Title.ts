import { Scene, GameObjects } from 'phaser';
import { EventBus } from '../EventBus';
import { InputManager } from '../common/InputManager';
import { Direction } from '../common/Direction';
import { UI_ASSET_KEYS, TITLE_ASSET_KEYS, AUDIO_ASSET_KEYS, EXTERNAL_LINKS_ASSET_KEYS } from '../assets/AssetKeys';
import { SaveManager, ISaveSlot } from '../services/SaveManager';
import { LegacyDataManager } from '../services/LegacyDataManager';

enum MainMenuOption {
  NEW_GAME = 'NEW_GAME',
  CONTINUE = 'CONTINUE',
  OPTIONS = 'OPTIONS',
}

export class Title extends Scene {
  private inputManager: InputManager | null = null;
  private selectedOption: MainMenuOption = MainMenuOption.NEW_GAME;
  private isContinueEnabled: boolean = false;
  private cursorImage: GameObjects.Image | null = null;
  private fadeOutInProgress: boolean = false;

  constructor() {
    super('Title');
  }

  async create(): Promise<void> {
    const width = this.scale.width;
    const height = this.scale.height;

    this.inputManager = new InputManager(this);

    // Check if continue is available
    const saveManager = SaveManager.getInstance();
    const slots = await saveManager.getSaveSlots();
    this.isContinueEnabled = slots.some(slot => slot.exists);

    // Background
    this.add.image(0, 0, TITLE_ASSET_KEYS.BACKGROUND).setOrigin(0).setScale(0.58);

    // Title image
    this.add
      .image(width / 2, 150, TITLE_ASSET_KEYS.PANEL)
      .setScale(0.25, 0.25)
      .setAlpha(0.5);
    this.add
      .image(width / 2, 150, TITLE_ASSET_KEYS.TITLE)
      .setScale(0.55)
      .setAlpha(0.5);

    // Create menu background
    const menuBgWidth = 500;
    const menuBg = this.add.rectangle(
      width / 2 - menuBgWidth / 2 + menuBgWidth / 2,
      380,
      menuBgWidth,
      200,
      0x000000,
      0.7
    ).setStrokeStyle(2, 0xffffff);

    // Menu options text
    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'Arial',
      fontSize: '30px',
      color: '#4D4A49',
      align: 'center',
    };

    const newGameText = this.add.text(width / 2, 320, 'New Game', textStyle).setOrigin(0.5);
    const continueText = this.add.text(width / 2, 370, 'Continue', textStyle).setOrigin(0.5);
    if (!this.isContinueEnabled) {
      continueText.setAlpha(0.5);
    }
    const optionsText = this.add.text(width / 2, 420, 'Options', textStyle).setOrigin(0.5);

    // Create cursor
    this.cursorImage = this.add.image(width / 2 - 150, 325, UI_ASSET_KEYS.CURSOR)
      .setOrigin(0.5)
      .setScale(2.5);

    // Cursor animation
    this.tweens.add({
      targets: this.cursorImage,
      x: { from: width / 2 - 150, to: width / 2 - 147 },
      duration: 500,
      repeat: -1,
      yoyo: true,
    });

    // Setup input handling
    this.input.keyboard?.on('keydown-UP', () => this.moveUp());
    this.input.keyboard?.on('keydown-DOWN', () => this.moveDown());
    this.input.keyboard?.on('keydown-SPACE', () => this.selectOption());
    this.input.keyboard?.on('keydown-ENTER', () => this.selectOption());

    EventBus.emit('current-scene-ready', this);
  }

  update(): void {
    if (!this.inputManager || this.fadeOutInProgress) return;

    if (this.inputManager.isInputLocked) return;

    const direction = this.inputManager.getDirectionKeyJustPressed();
    if (direction === Direction.UP) {
      this.moveUp();
    } else if (direction === Direction.DOWN) {
      this.moveDown();
    }

    if (this.inputManager.wasSpaceKeyPressed()) {
      this.selectOption();
    }
  }

  shutdown(): void {
    this.input.keyboard?.off('keydown-UP');
    this.input.keyboard?.off('keydown-DOWN');
    this.input.keyboard?.off('keydown-SPACE');
    this.input.keyboard?.off('keydown-ENTER');
    if (this.inputManager) {
      this.inputManager.shutdown();
      this.inputManager = null;
    }
  }

  private moveUp(): void {
    if (this.selectedOption === MainMenuOption.NEW_GAME) {
      return;
    }
    if (this.selectedOption === MainMenuOption.CONTINUE) {
      this.selectedOption = MainMenuOption.NEW_GAME;
    } else if (this.selectedOption === MainMenuOption.OPTIONS) {
      if (this.isContinueEnabled) {
        this.selectedOption = MainMenuOption.CONTINUE;
      } else {
        this.selectedOption = MainMenuOption.NEW_GAME;
      }
    }
    this.updateCursor();
  }

  private moveDown(): void {
    if (this.selectedOption === MainMenuOption.OPTIONS) {
      return;
    }
    if (this.selectedOption === MainMenuOption.NEW_GAME) {
      if (this.isContinueEnabled) {
        this.selectedOption = MainMenuOption.CONTINUE;
      } else {
        this.selectedOption = MainMenuOption.OPTIONS;
      }
    } else if (this.selectedOption === MainMenuOption.CONTINUE) {
      this.selectedOption = MainMenuOption.OPTIONS;
    }
    this.updateCursor();
  }

  private updateCursor(): void {
    if (!this.cursorImage) return;

    let y = 325; // NEW_GAME position
    if (this.selectedOption === MainMenuOption.CONTINUE) {
      y = 375;
    } else if (this.selectedOption === MainMenuOption.OPTIONS) {
      y = 425;
    }

    this.tweens.add({
      targets: this.cursorImage,
      y,
      duration: 200,
      ease: 'Quad.easeOut',
    });
  }

  private selectOption(): void {
    if (this.fadeOutInProgress || !this.inputManager) return;

    if (this.selectedOption === MainMenuOption.OPTIONS) {
      this.fadeOutInProgress = true;
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once(
        Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
        () => {
          this.scene.start('Options');
        }
      );
      return;
    }

    if (this.selectedOption === MainMenuOption.CONTINUE) {
      this.loadGame();
      return;
    }

    if (this.selectedOption === MainMenuOption.NEW_GAME) {
      this.startNewGame();
      return;
    }
  }

  private startNewGame(): void {
    if (this.fadeOutInProgress || !this.inputManager) return;

    try {
      this.fadeOutInProgress = true;
      this.inputManager.lockInput = true;

      // Initialize new game data
      const legacyDataManager = this.game.registry.get('legacyDataManager') as LegacyDataManager;
      if (legacyDataManager) {
        legacyDataManager.startNewGame();
      }

      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once(
        Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
        () => {
          EventBus.emit('game:started', { newGame: true });
          this.scene.start('Overworld', { mapId: 'starter-town' });
        }
      );
    } catch (error) {
      console.error('Error starting new game:', error);
      this.fadeOutInProgress = false;
    }
  }

  private async loadGame(): Promise<void> {
    if (this.fadeOutInProgress || !this.inputManager) return;

    try {
      this.fadeOutInProgress = true;
      this.inputManager.lockInput = true;

      const saveManager = SaveManager.getInstance();
      const slots = await saveManager.getSaveSlots();
      const mostRecentSlot = slots.find(slot => slot.exists);

      if (mostRecentSlot) {
        const result = await saveManager.loadGameFromSlot(mostRecentSlot.slot);
        if (result.success && result.data) {
          const legacyDataManager = this.game.registry.get('legacyDataManager') as LegacyDataManager;
          if (legacyDataManager) {
            legacyDataManager.loadFromSave(result.data);
          }

          this.cameras.main.fadeOut(500, 0, 0, 0);
          this.cameras.main.once(
            Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
            () => {
              EventBus.emit('game:loaded', { slot: mostRecentSlot.slot });
              const playerState = legacyDataManager.getPlayerState();
              this.scene.start('Overworld', { mapId: playerState.currentArea });
            }
          );
        } else {
          console.error('Failed to load game:', result.error);
          this.fadeOutInProgress = false;
        }
      }
    } catch (error) {
      console.error('Error loading game:', error);
      this.fadeOutInProgress = false;
    }
  }
}
