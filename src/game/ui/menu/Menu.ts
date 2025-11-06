import { Scene } from 'phaser';
import { TextureKeys } from '../../assets/TextureKeys';
import { FontKeys } from '../../assets/FontKeys';
import { Direction } from '../../models/common';
import { DataManager, DataManagerStoreKeys } from '../../services/DataManager';
import { MENU_COLOR } from './MenuConfig';

/** @type {Phaser.Types.GameObjects.Text.TextStyle} */
const MENU_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  color: '#FFFFFF',
  fontSize: '32px',
};

export class Menu {
  protected scene: Scene;
  protected padding: number;
  protected width: number;
  protected height: number;
  protected graphics: Phaser.GameObjects.Graphics;
  protected container: Phaser.GameObjects.Container;
  private _isVisible: boolean;
  protected availableMenuOptions: string[];
  protected menuOptionsTextGameObjects: Phaser.GameObjects.Text[];
  protected selectedMenuOptionIndex: number;
  protected selectedMenuOption: string | undefined;
  protected userInputCursor: Phaser.GameObjects.Image;
  protected dataManager: DataManager;

  /**
   * @param scene - The Phaser scene
   * @param menuOptions - Array of menu option strings
   * @param dataManager - DataManager instance for accessing options
   */
  constructor(scene: Scene, menuOptions: string[], dataManager: DataManager) {
    this.scene = scene;
    this.dataManager = dataManager;
    this.padding = 4;
    this.width = 300;
    this.availableMenuOptions = menuOptions;
    this.menuOptionsTextGameObjects = [];
    this.selectedMenuOptionIndex = 0;

    // calculate height based on currently available options
    this.height = 10 + this.padding * 2 + this.availableMenuOptions.length * 50;

    this.graphics = this.createGraphics();
    this.container = this.scene.add.container(0, 0, [this.graphics]);

    // update menu container with menu options
    for (let i = 0; i < this.availableMenuOptions.length; i += 1) {
      const y = 10 + 50 * i + this.padding;
      const textObj = this.scene.add.text(40 + this.padding, y, this.availableMenuOptions[i], MENU_TEXT_STYLE);
      this.menuOptionsTextGameObjects.push(textObj);
      this.container.add(textObj);
    }

    // add player input cursor
    this.userInputCursor = this.scene.add.image(20 + this.padding, 28 + this.padding, TextureKeys.CURSOR_WHITE);
    this.userInputCursor.setScale(2.5);
    this.container.add(this.userInputCursor);

    this.hide();
  }

  get isVisible(): boolean {
    return this._isVisible;
  }

  get selectedMenuOptionValue(): string | undefined {
    return this.selectedMenuOption;
  }

  /**
   * Shows the menu at the top-right of the screen
   */
  show(): void {
    const { right, top } = this.scene.cameras.main.worldView;
    const startX = right - this.padding * 2 - this.width;
    const startY = top + this.padding * 2;

    this.container.setPosition(startX, startY);
    this.container.setAlpha(1);
    this._isVisible = true;
  }

  /**
   * Hides the menu and resets selection
   */
  hide(): void {
    this.container.setAlpha(0);
    this.selectedMenuOptionIndex = 0;
    this.selectedMenuOption = undefined;
    this.moveMenuCursor(Direction.NONE);
    this._isVisible = false;
  }

  /**
   * Handles player input for menu navigation
   * @param input - Direction input or action commands
   */
  handlePlayerInput(input: Direction | 'OK' | 'CANCEL'): void {
    if (input === 'CANCEL') {
      this.hide();
      return;
    }

    if (input === 'OK') {
      this.handleSelectedMenuOption();
      return;
    }

    // update selected menu option based on player input
    this.moveMenuCursor(input);
  }

  /**
   * Creates the menu graphics with current theme colors
   * @returns Phaser.GameObjects.Graphics
   */
  protected createGraphics(): Phaser.GameObjects.Graphics {
    const g = this.scene.add.graphics();
    const menuColor = this.getMenuColorsFromDataManager();

    g.fillStyle(menuColor.main, 1);
    g.fillRect(1, 0, this.width - 1, this.height - 1);
    g.lineStyle(8, menuColor.border, 1);
    g.strokeRect(0, 0, this.width, this.height);
    g.setAlpha(0.9);

    return g;
  }

  /**
   * Updates the menu colors when theme changes
   */
  updateMenuTheme(): void {
    this.graphics.clear();
    const menuColor = this.getMenuColorsFromDataManager();
    
    this.graphics.fillStyle(menuColor.main, 1);
    this.graphics.fillRect(1, 0, this.width - 1, this.height - 1);
    this.graphics.lineStyle(8, menuColor.border, 1);
    this.graphics.strokeRect(0, 0, this.width, this.height);
    this.graphics.setAlpha(0.9);
  }

  /**
   * Moves the menu cursor based on direction input
   * @param direction - Direction to move cursor
   */
  protected moveMenuCursor(direction: Direction): void {
    switch (direction) {
      case Direction.UP:
        this.selectedMenuOptionIndex -= 1;
        if (this.selectedMenuOptionIndex < 0) {
          this.selectedMenuOptionIndex = this.availableMenuOptions.length - 1;
        }
        break;
      case Direction.DOWN:
        this.selectedMenuOptionIndex += 1;
        if (this.selectedMenuOptionIndex > this.availableMenuOptions.length - 1) {
          this.selectedMenuOptionIndex = 0;
        }
        break;
      case Direction.LEFT:
      case Direction.RIGHT:
        return;
      case Direction.NONE:
        break;
      default:
        console.warn(`[Menu:moveMenuCursor] Unknown direction: ${direction}`);
    }
    const x = 20 + this.padding;
    const y = 28 + this.padding + this.selectedMenuOptionIndex * 50;

    this.userInputCursor.setPosition(x, y);
  }

  /**
   * Handles selection of the current menu option
   */
  protected handleSelectedMenuOption(): void {
    this.selectedMenuOption = this.availableMenuOptions[this.selectedMenuOptionIndex];
  }

  /**
   * Gets menu colors from DataManager options
   * @returns Menu color scheme
   */
  protected getMenuColorsFromDataManager(): { main: number; border: number } {
    const chosenMenuColor = this.dataManager.dataStore.get(DataManagerStoreKeys.OPTIONS_MENU_COLOR) as number;
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
        console.warn(`[Menu:getMenuColorsFromDataManager] Unknown menu color option: ${chosenMenuColor}`);
        return MENU_COLOR[1];
    }
  }

  /**
   * Cleanup method to destroy menu objects
   */
  destroy(): void {
    this.container.destroy();
    this.graphics.destroy();
    this.userInputCursor.destroy();
    this.menuOptionsTextGameObjects.forEach(textObj => textObj.destroy());
  }
}