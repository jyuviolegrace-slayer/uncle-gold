import { Scene } from 'phaser';
import { Direction } from './Direction';

export class InputManager {
  private scene: Scene;
  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private spaceKey: Phaser.Input.Keyboard.Key | null = null;
  private enterKey: Phaser.Input.Keyboard.Key | null = null;
  private shiftKey: Phaser.Input.Keyboard.Key | null = null;
  private fKey: Phaser.Input.Keyboard.Key | null = null;
  private inputLocked: boolean = false;

  constructor(scene: Scene) {
    this.scene = scene;
    this.setupKeys();
  }

  private setupKeys(): void {
    if (this.scene.input.keyboard) {
      this.cursorKeys = this.scene.input.keyboard.createCursorKeys();
      this.spaceKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.enterKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
      this.shiftKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
      this.fKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    }
  }

  get isInputLocked(): boolean {
    return this.inputLocked;
  }

  set lockInput(value: boolean) {
    this.inputLocked = value;
  }

  wasSpaceKeyPressed(): boolean {
    if (!this.spaceKey) return false;
    return Phaser.Input.Keyboard.JustDown(this.spaceKey);
  }

  wasEnterKeyPressed(): boolean {
    if (!this.enterKey) return false;
    return Phaser.Input.Keyboard.JustDown(this.enterKey);
  }

  wasBackKeyPressed(): boolean {
    if (!this.shiftKey) return false;
    return Phaser.Input.Keyboard.JustDown(this.shiftKey);
  }

  wasFKeyPressed(): boolean {
    if (!this.fKey) return false;
    return Phaser.Input.Keyboard.JustDown(this.fKey);
  }

  isShiftKeyDown(): boolean {
    if (!this.shiftKey) return false;
    return this.shiftKey.isDown;
  }

  getDirectionKeyJustPressed(): Direction {
    if (!this.cursorKeys) return Direction.NONE;

    if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.left)) {
      return Direction.LEFT;
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.right)) {
      return Direction.RIGHT;
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.up)) {
      return Direction.UP;
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.down)) {
      return Direction.DOWN;
    }

    return Direction.NONE;
  }

  getDirectionKeyDown(): Direction {
    if (!this.cursorKeys) return Direction.NONE;

    if (this.cursorKeys.left.isDown) {
      return Direction.LEFT;
    }
    if (this.cursorKeys.right.isDown) {
      return Direction.RIGHT;
    }
    if (this.cursorKeys.up.isDown) {
      return Direction.UP;
    }
    if (this.cursorKeys.down.isDown) {
      return Direction.DOWN;
    }

    return Direction.NONE;
  }

  shutdown(): void {
    this.cursorKeys = null;
    this.spaceKey = null;
    this.enterKey = null;
    this.shiftKey = null;
    this.fKey = null;
  }
}
