import { Scene } from 'phaser';
import { Menu } from './Menu';
import { DataManager } from '../../services/DataManager';

/**
 * Confirmation menu options enum
 */
export const CONFIRMATION_MENU_OPTIONS = Object.freeze({
  YES: 'YES',
  NO: 'NO',
} as const);

export type ConfirmationMenuOption = typeof CONFIRMATION_MENU_OPTIONS[keyof typeof CONFIRMATION_MENU_OPTIONS];

/**
 * ConfirmationMenu - Specialized menu for yes/no confirmation dialogs
 * Extends base Menu class with predefined confirmation options
 */
export class ConfirmationMenu extends Menu {
  /**
   * @param scene - The Phaser scene
   * @param dataManager - DataManager instance for accessing options
   */
  constructor(scene: Scene, dataManager: DataManager) {
    super(scene, [CONFIRMATION_MENU_OPTIONS.YES, CONFIRMATION_MENU_OPTIONS.NO], dataManager);
  }

  /**
   * Gets the selected confirmation option
   * @returns The selected confirmation option or undefined
   */
  getSelectedOption(): ConfirmationMenuOption | undefined {
    return this.selectedMenuOptionValue as ConfirmationMenuOption | undefined;
  }

  /**
   * Checks if the user selected YES
   * @returns True if YES is selected
   */
  isConfirmed(): boolean {
    return this.selectedMenuOptionValue === CONFIRMATION_MENU_OPTIONS.YES;
  }

  /**
   * Checks if the user selected NO
   * @returns True if NO is selected
   */
  isCancelled(): boolean {
    return this.selectedMenuOptionValue === CONFIRMATION_MENU_OPTIONS.NO;
  }
}