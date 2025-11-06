import { Scene } from 'phaser';
import { Menu } from './Menu';
import { SceneKeys } from '../../assets/SceneKeys';
import { EventBus } from '../../EventBus';
import { DataManager } from '../../services/DataManager';

/**
 * World menu options enum - Mirrors archive/src/world-menu.js
 */
export const MENU_OPTIONS = Object.freeze({
  MONSTERDEX: 'MONSTERDEX',
  MONSTERS: 'MONSTERS',
  BAG: 'BAG',
  SAVE: 'SAVE',
  OPTIONS: 'OPTIONS',
  EXIT: 'EXIT',
} as const);

export type WorldMenuOption = typeof MENU_OPTIONS[keyof typeof MENU_OPTIONS];

/**
 * WorldMenu - Main game menu accessible from the overworld
 * Extends base Menu class with world-specific menu options and actions
 */
export class WorldMenu extends Menu {
  private isMenuOpen: boolean = false;

  /**
   * @param scene - The Phaser scene
   * @param dataManager - DataManager instance for accessing options
   */
  constructor(scene: Scene, dataManager: DataManager) {
    // Simplified menu options for MVP - can be expanded later
    super(scene, [MENU_OPTIONS.MONSTERS, MENU_OPTIONS.BAG, MENU_OPTIONS.SAVE, MENU_OPTIONS.EXIT], dataManager);
  }

  /**
   * Shows the world menu and locks input
   */
  show(): void {
    super.show();
    this.isMenuOpen = true;
    
    // Emit menu open event for React HUD integration
    EventBus.emit('world-menu:opened');
  }

  /**
   * Hides the world menu and unlocks input
   */
  hide(): void {
    super.hide();
    this.isMenuOpen = false;
    
    // Emit menu close event for React HUD integration
    EventBus.emit('world-menu:closed');
  }

  /**
   * Check if the world menu is currently open
   */
  get isOpen(): boolean {
    return this.isMenuOpen;
  }

  /**
   * Handles the selected menu option with appropriate scene transitions
   */
  protected handleSelectedMenuOption(): void {
    super.handleSelectedMenuOption();
    
    if (!this.selectedMenuOptionValue) {
      return;
    }

    // Play menu selection sound
    if (this.scene && 'audioManager' in this.scene) {
      (this.scene as any).audioManager?.playSoundFx('SELECT');
    }

    switch (this.selectedMenuOptionValue) {
      case MENU_OPTIONS.MONSTERS:
        // Launch Party/Inventory scene - will be implemented in future tickets
        EventBus.emit('scene:launch', { sceneKey: SceneKeys.MONSTER_PARTY });
        break;
        
      case MENU_OPTIONS.BAG:
        // Launch Inventory scene - will be implemented in future tickets
        EventBus.emit('scene:launch', { sceneKey: SceneKeys.INVENTORY });
        break;
        
      case MENU_OPTIONS.SAVE:
        // Trigger save dialog - will be implemented in future tickets
        EventBus.emit('save:requested');
        break;
        
      case MENU_OPTIONS.OPTIONS:
        // Launch Options scene
        EventBus.emit('scene:launch', { sceneKey: SceneKeys.OPTIONS });
        break;
        
      case MENU_OPTIONS.EXIT:
        // Close the menu
        this.hide();
        break;
        
      default:
        console.warn(`[WorldMenu:handleSelectedMenuOption] Unknown menu option: ${this.selectedMenuOptionValue}`);
    }
  }

  /**
   * Updates menu theme when options change
   */
  updateTheme(): void {
    this.updateMenuTheme();
  }
}