import { Scene } from 'phaser';
import { Direction } from '../models/common';

export interface InputState {
  directionPressed: Direction;
  directionDown: Direction;
  confirmPressed: boolean;
  cancelPressed: boolean;
  menuPressed: boolean;
  shiftDown: boolean;
}

export class InputManager {
  private scene: Scene;
  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  private enterKey: Phaser.Input.Keyboard.Key | undefined;
  private escapeKey: Phaser.Input.Keyboard.Key | undefined;
  private spaceKey: Phaser.Input.Keyboard.Key | undefined;
  private fKey: Phaser.Input.Keyboard.Key | undefined;
  private inputLocked: boolean = false;
  private syntheticInputEnabled: boolean = false;
  private syntheticDirection: Direction = Direction.NONE;

  constructor(scene: Scene) {
    this.scene = scene;
    this.setupKeyboardControls();
    this.setupEventListeners();
  }

  /**
   * Check if input is currently locked
   */
  get isInputLocked(): boolean {
    return this.inputLocked;
  }

  /**
   * Lock input to prevent player actions
   */
  lockInput(): void {
    this.inputLocked = true;
  }

  /**
   * Unlock input to allow player actions
   */
  unlockInput(): void {
    this.inputLocked = false;
  }

  /**
   * Get current input state
   */
  getInputState(): InputState {
    if (this.inputLocked) {
      return {
        directionPressed: Direction.NONE,
        directionDown: Direction.NONE,
        confirmPressed: false,
        cancelPressed: false,
        menuPressed: false,
        shiftDown: false,
      };
    }

    return {
      directionPressed: this.getDirectionKeyJustPressed(),
      directionDown: this.getDirectionKeyPressedDown(),
      confirmPressed: this.wasConfirmKeyPressed(),
      cancelPressed: this.wasCancelKeyPressed(),
      menuPressed: this.wasMenuKeyPressed(),
      shiftDown: this.isShiftKeyDown(),
    };
  }

  /**
   * Check if confirm key (Enter/Space) was just pressed
   */
  wasConfirmKeyPressed(): boolean {
    if (this.inputLocked) {
      return false;
    }

    const enterPressed = this.enterKey ? Phaser.Input.Keyboard.JustDown(this.enterKey) : false;
    const spacePressed = this.spaceKey ? Phaser.Input.Keyboard.JustDown(this.spaceKey) : false;
    
    return enterPressed || spacePressed;
  }

  /**
   * Check if cancel key (Escape) was just pressed
   */
  wasCancelKeyPressed(): boolean {
    if (this.inputLocked) {
      return false;
    }

    return this.escapeKey ? Phaser.Input.Keyboard.JustDown(this.escapeKey) : false;
  }

  /**
   * Check if menu key (F) was just pressed
   */
  wasMenuKeyPressed(): boolean {
    if (this.inputLocked) {
      return false;
    }

    return this.fKey ? Phaser.Input.Keyboard.JustDown(this.fKey) : false;
  }

  /**
   * Check if Enter key was specifically pressed (for dialog handling)
   */
  wasEnterKeyPressed(): boolean {
    if (this.inputLocked || !this.enterKey) {
      return false;
    }
    return Phaser.Input.Keyboard.JustDown(this.enterKey);
  }

  /**
   * Check if Space key was specifically pressed
   */
  wasSpaceKeyPressed(): boolean {
    if (this.inputLocked || !this.spaceKey) {
      return false;
    }
    return Phaser.Input.Keyboard.JustDown(this.spaceKey);
  }

  /**
   * Check if Back/Shift key was just pressed
   */
  wasBackKeyPressed(): boolean {
    if (this.inputLocked || !this.cursorKeys) {
      return false;
    }
    return Phaser.Input.Keyboard.JustDown(this.cursorKeys.shift);
  }

  /**
   * Check if Shift key is currently held down
   */
  isShiftKeyDown(): boolean {
    if (this.inputLocked || !this.cursorKeys) {
      return false;
    }
    return this.cursorKeys.shift.isDown;
  }

  /**
   * Get the direction key that was just pressed
   */
  getDirectionKeyJustPressed(): Direction {
    if (this.inputLocked) {
      return Direction.NONE;
    }

    // Check synthetic input first (for mobile controls)
    if (this.syntheticInputEnabled && this.syntheticDirection !== Direction.NONE) {
      const direction = this.syntheticDirection;
      this.syntheticDirection = Direction.NONE; // Reset after reading
      return direction;
    }

    if (!this.cursorKeys) {
      return Direction.NONE;
    }

    let selectedDirection = Direction.NONE;
    
    if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.left)) {
      selectedDirection = Direction.LEFT;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.right)) {
      selectedDirection = Direction.RIGHT;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.up)) {
      selectedDirection = Direction.UP;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.down)) {
      selectedDirection = Direction.DOWN;
    }

    return selectedDirection;
  }

  /**
   * Get the direction key that is currently held down
   */
  getDirectionKeyPressedDown(): Direction {
    if (this.inputLocked) {
      return Direction.NONE;
    }

    // Check synthetic input first (for mobile controls)
    if (this.syntheticInputEnabled && this.syntheticDirection !== Direction.NONE) {
      return this.syntheticDirection;
    }

    if (!this.cursorKeys) {
      return Direction.NONE;
    }

    let selectedDirection = Direction.NONE;
    
    if (this.cursorKeys.left.isDown) {
      selectedDirection = Direction.LEFT;
    } else if (this.cursorKeys.right.isDown) {
      selectedDirection = Direction.RIGHT;
    } else if (this.cursorKeys.up.isDown) {
      selectedDirection = Direction.UP;
    } else if (this.cursorKeys.down.isDown) {
      selectedDirection = Direction.DOWN;
    }

    return selectedDirection;
  }

  /**
   * Enable synthetic input for mobile controls
   */
  enableSyntheticInput(): void {
    this.syntheticInputEnabled = true;
  }

  /**
   * Disable synthetic input
   */
  disableSyntheticInput(): void {
    this.syntheticInputEnabled = false;
    this.syntheticDirection = Direction.NONE;
  }

  /**
   * Simulate direction key press (for mobile controls)
   */
  simulateDirectionPress(direction: Direction): void {
    if (this.syntheticInputEnabled) {
      this.syntheticDirection = direction;
    }
  }

  /**
   * Simulate confirm key press (for mobile controls)
   */
  simulateConfirmPress(): boolean {
    if (this.inputLocked || !this.syntheticInputEnabled) {
      return false;
    }
    return true; // Mobile confirm always succeeds when not locked
  }

  /**
   * Simulate cancel key press (for mobile controls)
   */
  simulateCancelPress(): boolean {
    if (this.inputLocked || !this.syntheticInputEnabled) {
      return false;
    }
    return true; // Mobile cancel always succeeds when not locked
  }

  /**
   * Setup keyboard controls
   */
  private setupKeyboardControls(): void {
    if (!this.scene.input.keyboard) {
      console.warn('[InputManager] Keyboard input not available');
      return;
    }

    this.cursorKeys = this.scene.input.keyboard.createCursorKeys();
    this.enterKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.escapeKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.spaceKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.fKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
  }

  /**
   * Setup event listeners for mobile controls integration
   */
  private setupEventListeners(): void {
    // Listen for mobile control events if they exist
    this.scene.events.on('mobile:direction', (direction: Direction) => {
      if (this.syntheticInputEnabled) {
        this.syntheticDirection = direction;
      }
    });

    this.scene.events.on('mobile:confirm', () => {
      // Mobile confirm is handled by simulateConfirmPress method
    });

    this.scene.events.on('mobile:cancel', () => {
      // Mobile cancel is handled by simulateCancelPress method
    });
  }

  /**
   * Cleanup when scene is destroyed
   */
  destroy(): void {
    this.scene.events.off('mobile:direction');
    this.scene.events.off('mobile:confirm');
    this.scene.events.off('mobile:cancel');
  }
}