import { Scene, GameObjects, Types } from 'phaser';
import { EventBus } from '../EventBus';
import { LegacyDataManager, TEXT_SPEED } from '../services/LegacyDataManager';
import { UI_ASSET_KEYS } from '../assets/AssetKeys';

/**
 * Text animation options
 */
interface TextAnimationOptions {
  delay?: number;
  callback?: () => void;
}

/**
 * Dialog Scene - Modal text display with animated typing
 * Shows dialog messages with cursor animation and text speed options
 */
export class Dialog extends Scene {
  private padding: number = 90;
  private width: number = 1280 - 90 * 2;
  private height: number = 124;
  private container: GameObjects.Container | null = null;
  private isVisible: boolean = false;
  private userInputCursor: GameObjects.Image | null = null;
  private userInputCursorTween: Phaser.Tweens.Tween | null = null;
  private uiText: GameObjects.Text | null = null;
  private textAnimationPlaying: boolean = false;
  private messagesToShow: string[] = [];
  private legacyDataManager: LegacyDataManager;

  constructor() {
    super('Dialog');
    this.legacyDataManager = new LegacyDataManager();
  }

  get visible(): boolean {
    return this.isVisible;
  }

  get animationPlaying(): boolean {
    return this.textAnimationPlaying;
  }

  get hasMoreMessages(): boolean {
    return this.messagesToShow.length > 0;
  }

  create() {
    this.messagesToShow = [];
    this.cameras.main.setZoom(0.8);

    const menuColor = this.getMenuColors();
    const panel = this.add
      .rectangle(0, 0, this.width, this.height, menuColor.main, 0.9)
      .setOrigin(0)
      .setStrokeStyle(8, menuColor.border, 1);
    
    this.container = this.add.container(0, 0, [panel]);

    this.uiText = this.add.text(18, 12, '', {
      fontFamily: 'Arial',
      color: 'white',
      fontSize: '32px',
      wordWrap: { width: this.width - 18 },
    });
    this.container.add(this.uiText);

    this.createUserInputCursor();
    this.hideDialogModal();
    this.scene.bringToTop();

    this.setupInput();

    EventBus.emit('dialog:ready');
  }

  /**
   * Show dialog modal with messages
   */
  showDialogModal(messages: string[]) {
    this.messagesToShow = [...messages];

    const { x, bottom } = this.cameras.main.worldView;
    const startX = x + this.padding;
    const startY = bottom - this.height - this.padding / 4;

    if (this.container) {
      this.container.setPosition(startX, startY);
      this.container.setAlpha(1);
    }

    if (this.userInputCursorTween) {
      this.userInputCursorTween.restart();
    }

    this.isVisible = true;
    EventBus.emit('dialog:opened', { messageCount: messages.length });

    this.showNextMessage();
  }

  /**
   * Show the next message in the queue
   */
  showNextMessage() {
    if (this.messagesToShow.length === 0) {
      return;
    }

    if (this.uiText) {
      this.uiText.setText('').setAlpha(1);
      const message = this.messagesToShow.shift()!;
      
      this.animateText(this.uiText, message, {
        delay: this.getTextSpeed(),
        callback: () => {
          this.textAnimationPlaying = false;
          EventBus.emit('dialog:text-complete');
        },
      });
    }
    
    this.textAnimationPlaying = true;
  }

  /**
   * Hide the dialog modal
   */
  hideDialogModal() {
    if (this.container) {
      this.container.setAlpha(0);
    }
    
    if (this.userInputCursorTween) {
      this.userInputCursorTween.pause();
    }
    
    this.isVisible = false;
    EventBus.emit('dialog:closed');
  }

  update() {
    // Input is handled via event listeners
  }

  /**
   * Setup input handling
   */
  private setupInput() {
    // Confirm key handlers
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.handleConfirmKey();
    });

    this.input.keyboard?.on('keydown-ENTER', () => {
      this.handleConfirmKey();
    });

    this.input.keyboard?.on('keydown-Z', () => {
      this.handleConfirmKey();
    });
  }

  /**
   * Handle confirm key press
   */
  private handleConfirmKey() {
    if (!this.isVisible) return;

    if (this.textAnimationPlaying) {
      // Skip to end of current message
      if (this.userInputCursorTween) {
        this.userInputCursorTween.complete();
      }
      this.textAnimationPlaying = false;
      if (this.uiText) {
        this.uiText.setAlpha(1);
      }
      EventBus.emit('dialog:text-skipped');
    } else if (this.hasMoreMessages) {
      this.showNextMessage();
    } else {
      this.hideDialogModal();
    }
  }

  /**
   * Animate text character by character
   */
  private animateText(
    textObject: GameObjects.Text,
    text: string,
    options: TextAnimationOptions = {}
  ) {
    const { delay = 50, callback } = options;
    let currentIndex = 0;
    
    const timer = this.time.addEvent({
      delay,
      repeat: text.length - 1,
      callback: () => {
        currentIndex++;
        textObject.setText(text.substring(0, currentIndex));
        
        if (currentIndex >= text.length && callback) {
          callback();
        }
      },
    });

    // Store timer reference for cleanup
    textObject.setData('textTimer', timer);
  }

  /**
   * Create the animated cursor
   */
  private createUserInputCursor() {
    if (!this.container) return;

    const y = this.height - 24;
    this.userInputCursor = this.add.image(this.width - 16, y, UI_ASSET_KEYS.CURSOR);
    this.userInputCursor.setAngle(90).setScale(4.5, 2);

    this.userInputCursorTween = this.tweens.add({
      targets: this.userInputCursor,
      delay: 0,
      duration: 500,
      repeat: -1,
      y: {
        from: y,
        start: y,
        to: y + 6,
      },
    });
    this.userInputCursorTween.pause();
    this.container.add(this.userInputCursor);
  }

  /**
   * Get menu colors from legacy data manager
   */
  private getMenuColors(): { main: number; border: number } {
    const chosenMenuColor = this.legacyDataManager.getMenuColor();
    
    switch (chosenMenuColor) {
      case 0:
        return { main: 0x2a3f5f, border: 0x4a6fa5 };
      case 1:
        return { main: 0x1a4d2e, border: 0x2e7d32 };
      case 2:
        return { main: 0x4a148c, border: 0x7b1fa2 };
      default:
        return { main: 0x2a3f5f, border: 0x4a6fa5 };
    }
  }

  /**
   * Get text speed from legacy data manager
   */
  private getTextSpeed(): number {
    const textSpeed = this.legacyDataManager.getTextSpeed();
    switch (textSpeed) {
      case 'FAST':
        return TEXT_SPEED.FAST;
      case 'SLOW':
        return TEXT_SPEED.SLOW;
      default:
        return TEXT_SPEED.MEDIUM;
    }
  }

  shutdown() {
    // Clean up text animation timers
    if (this.uiText) {
      const timer = this.uiText.getData('textTimer');
      if (timer) {
        timer.destroy();
      }
    }

    // Clean up tweens
    if (this.userInputCursorTween) {
      this.userInputCursorTween.destroy();
    }

    EventBus.off('dialog:ready');
    EventBus.off('dialog:opened');
    EventBus.off('dialog:closed');
    EventBus.off('dialog:text-complete');
    EventBus.off('dialog:text-skipped');
  }
}