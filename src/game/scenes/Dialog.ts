import { BaseScene } from './common/BaseScene';
import { SceneKeys } from '../assets/SceneKeys';
import { FontKeys } from '../assets/FontKeys';
import { TextureKeys } from '../assets/TextureKeys';
import { animateText, AnimateTextConfig } from '../utils/text-utils';
import { exhaustiveGuard } from '../utils/guard';
import { DataManager, DataManagerStoreKeys, TextSpeedOptions } from '../services/DataManager';
import { EventBus } from '../EventBus';

/** @type {Phaser.Types.GameObjects.Text.TextStyle} */
const UI_TEXT_STYLE = Object.freeze({
  fontFamily: FontKeys.KENNEY_FUTURE_NARROW,
  color: 'white',
  fontSize: '32px',
  wordWrap: { width: 0 },
} as Phaser.Types.GameObjects.Text.TextStyle);

const MENU_COLOR = [
  { main: 0x000000, border: 0xffffff }, // Not used (maps to index 1)
  { main: 0x2d5016, border: 0x89ef47 }, // Green
  { main: 0x2d1850, border: 0x8b47ef }, // Purple
  { main: 0x502d16, border: 0xef8947 }, // Orange
];

export interface DialogSceneData {
  messages: string[];
}

export class Dialog extends BaseScene {
  private padding: number = 90;
  private width: number = 1280;
  private height: number = 124;
  private container: Phaser.GameObjects.Container | undefined;
  private _isVisible: boolean = false;
  private userInputCursor: Phaser.GameObjects.Image | undefined;
  private userInputCursorTween: Phaser.Tweens.Tween | undefined;
  private uiText: Phaser.GameObjects.Text | undefined;
  private textAnimationPlaying: boolean = false;
  private messagesToShow: string[] = [];
  private dataManager: DataManager | undefined;

  constructor() {
    super(SceneKeys.DIALOG);
  }

  get isVisible(): boolean {
    return this._isVisible;
  }

  get isAnimationPlaying(): boolean {
    return this.textAnimationPlaying;
  }

  get moreMessagesToShow(): boolean {
    return this.messagesToShow.length > 0;
  }

  init(data?: DialogSceneData): void {
    super.init(data);
    
    if (data) {
      this.messagesToShow = [...data.messages];
    }
  }

  create(): void {
    super.create();
    
    this.width = this.scale.width - this.padding * 2;
    this.height = 124;
    this.textAnimationPlaying = false;
    this.messagesToShow = [];
    this.cameras.main.setZoom(0.8);

    // Get DataManager from registry
    this.dataManager = this.registry.get('dataManager') as DataManager;

    const menuColor = this.getMenuColorsFromDataManager();
    const panel = this.add
      .rectangle(0, 0, this.width, this.height, menuColor.main, 0.9)
      .setOrigin(0)
      .setStrokeStyle(8, menuColor.border, 1);
    
    this.container = this.add.container(0, 0, [panel]);
    
    this.uiText = this.add.text(18, 12, '', {
      ...UI_TEXT_STYLE,
      wordWrap: { width: this.width - 18 },
    });
    
    this.container.add(this.uiText);
    this.createUserInputCursor();
    this.hideDialogModal();
    this.scene.bringToTop();

    // Setup input handling
    this.setupInputHandling();
  }

  private setupInputHandling(): void {
    // Handle space/enter for advancing dialogue
    const spaceKey = this.input.keyboard?.addKey('SPACE');
    const enterKey = this.input.keyboard?.addKey('ENTER');
    
    const advanceDialog = () => {
      if (!this._isVisible) return;
      
      if (this.textAnimationPlaying) {
        // Skip to end of current message
        this.skipToEndOfMessage();
      } else {
        // Show next message or close if no more messages
        this.showNextMessage();
        // Dialog completion is handled by EventBus.emit('dialog:closed')
      }
    };

    spaceKey?.on('down', advanceDialog);
    enterKey?.on('down', advanceDialog);
  }

  private skipToEndOfMessage(): void {
    if (this.uiText && this.messagesToShow.length > 0) {
      const currentMessage = this.messagesToShow[0] || '';
      this.uiText.setText(currentMessage);
      this.textAnimationPlaying = false;
    }
  }

  showDialogModal(messages: string[]): void {
    this.messagesToShow = [...messages];

    const { x, bottom } = this.cameras.main.worldView;
    const startX = x + this.padding;
    const startY = bottom - this.height - this.padding / 4;

    if (this.container) {
      this.container.setPosition(startX, startY);
    }
    
    if (this.userInputCursorTween) {
      this.userInputCursorTween.restart();
    }
    
    if (this.container) {
      this.container.setAlpha(1);
    }
    
    this._isVisible = true;
    this.lockInput();

    // Emit event to pause HUD
    EventBus.emit('dialog:opened');

    this.showNextMessage();
  }

  showNextMessage(): void {
    if (this.messagesToShow.length === 0) {
      this.hideDialogModal();
      return;
    }

    if (this.uiText) {
      this.uiText.setText('').setAlpha(1);
      
      const speed = this.getAnimatedTextSpeed();
      animateText(this, this.uiText, this.messagesToShow.shift() || '', {
        delay: speed,
        callback: () => {
          this.textAnimationPlaying = false;
        },
      });
      this.textAnimationPlaying = true;
    }
  }

  hideDialogModal(): void {
    if (this.container) {
      this.container.setAlpha(0);
    }
    
    if (this.userInputCursorTween) {
      this.userInputCursorTween.pause();
    }
    
    this._isVisible = false;
    this.unlockInput();

    // Resume world scene and stop dialog scene
    this.scene.resume(SceneKeys.WORLD);
    this.scene.stop(SceneKeys.DIALOG);

    // Emit event to resume HUD
    EventBus.emit('dialog:closed');
  }

  private createUserInputCursor(): void {
    const y = this.height - 24;
    this.userInputCursor = this.add.image(this.width - 16, y, TextureKeys.CURSOR);
    this.userInputCursor.setAngle(90).setScale(4.5, 2);

    this.userInputCursorTween = this.add.tween({
      delay: 0,
      duration: 500,
      repeat: -1,
      y: {
        from: y,
        start: y,
        to: y + 6,
      },
      targets: this.userInputCursor,
    });
    
    if (this.userInputCursorTween) {
      this.userInputCursorTween.pause();
    }
    
    if (this.container) {
      this.container.add(this.userInputCursor);
    }
  }

  private getMenuColorsFromDataManager(): { main: number; border: number } {
    if (!this.dataManager) {
      return MENU_COLOR[1];
    }

    const chosenMenuColor = this.dataManager.dataStore.get(DataManagerStoreKeys.OPTIONS_MENU_COLOR);
    
    if (chosenMenuColor === undefined) {
      return MENU_COLOR[1];
    }

    switch (chosenMenuColor) {
      case 0:
        return MENU_COLOR[1];
      case 1:
        return MENU_COLOR[2];
      case 2:
        return MENU_COLOR[3];
      default:
        console.warn(`Unknown menu color option: ${chosenMenuColor}, defaulting to green`);
        return MENU_COLOR[1];
    }
  }

  private getAnimatedTextSpeed(): number {
    if (!this.dataManager) {
      return 25; // Default speed
    }

    const textSpeed = this.dataManager.dataStore.get(DataManagerStoreKeys.OPTIONS_TEXT_SPEED) as TextSpeedOptions;
    
    switch (textSpeed) {
      case TextSpeedOptions.FAST:
        return 10;
      case TextSpeedOptions.MID:
        return 25;
      case TextSpeedOptions.SLOW:
        return 50;
      default:
        console.warn(`Unknown text speed option: ${textSpeed}, defaulting to medium`);
        return 25;
    }
  }

  shutdown(): void {
    super.shutdown();
    
    // Clean up tweens
    if (this.userInputCursorTween) {
      this.userInputCursorTween.destroy();
      this.userInputCursorTween = undefined;
    }
  }
}