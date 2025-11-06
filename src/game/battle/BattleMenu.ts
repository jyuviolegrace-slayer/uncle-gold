import { Scene } from 'phaser';
import { BattleMonster } from './BattleMonster';

export interface BattleMenuConfig {
  scene: Scene;
  playerMonster: BattleMonster;
  skipAnimations?: boolean;
}

export type BattleMenuInput = 'OK' | 'CANCEL' | 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export enum BattleMenuOption {
  FIGHT = 'FIGHT',
  BAG = 'BAG',
  CRITTER = 'CRITTER',
  RUN = 'RUN'
}

/**
 * Battle Menu System
 * Handles player input and menu navigation during battles
 */
export class BattleMenu {
  private scene: Scene;
  private playerMonster: BattleMonster;
  private skipAnimations: boolean;
  private menuContainer: Phaser.GameObjects.Container;
  private mainMenuTexts: Phaser.GameObjects.Text[] = [];
  private currentMenuIndex: number = 0;
  private isVisible: boolean = false;

  constructor(config: BattleMenuConfig) {
    this.scene = config.scene;
    this.playerMonster = config.playerMonster;
    this.skipAnimations = config.skipAnimations || false;
    
    this.createMenu();
  }

  /**
   * Create the battle menu UI
   */
  private createMenu(): void {
    this.menuContainer = this.scene.add.container(0, 0);

    // Create main menu options
    const menuOptions = [
      { text: 'FIGHT', x: 220, y: 160 },
      { text: 'BAG', x: 300, y: 160 },
      { text: 'CRITTER', x: 220, y: 190 },
      { text: 'RUN', x: 300, y: 190 }
    ];

    menuOptions.forEach((option) => {
      const text = this.scene.add.text(option.x, option.y, option.text, {
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 4, y: 2 }
      }).setOrigin(0);
      
      this.mainMenuTexts.push(text);
      this.menuContainer.add(text);
    });

    // Initially hide the menu
    this.hideMenu();
  }

  /**
   * Show the main battle menu
   */
  showMenu(): Promise<void> {
    if (this.skipAnimations) {
      this.menuContainer.setAlpha(1);
      this.isVisible = true;
      this.updateMenuSelection();
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.menuContainer.setAlpha(0);
      this.isVisible = true;
      
      this.scene.tweens.add({
        targets: this.menuContainer,
        alpha: 1,
        duration: 300,
        onComplete: () => {
          this.updateMenuSelection();
          resolve();
        }
      });
    });
  }

  /**
   * Hide the battle menu
   */
  hideMenu(): void {
    this.menuContainer.setAlpha(0);
    this.isVisible = false;
  }

  /**
   * Handle player input
   */
  handlePlayerInput(input: BattleMenuInput): void {
    if (!this.isVisible) {
      return;
    }

    switch (input) {
      case 'UP':
        this.currentMenuIndex = this.currentMenuIndex === 2 ? 0 : this.currentMenuIndex - 2;
        if (this.currentMenuIndex < 0) this.currentMenuIndex += 4;
        break;
      case 'DOWN':
        this.currentMenuIndex = this.currentMenuIndex === 0 ? 2 : this.currentMenuIndex + 2;
        if (this.currentMenuIndex >= 4) this.currentMenuIndex -= 4;
        break;
      case 'LEFT':
        this.currentMenuIndex = this.currentMenuIndex % 2 === 1 ? this.currentMenuIndex - 1 : this.currentMenuIndex + 1;
        break;
      case 'RIGHT':
        this.currentMenuIndex = this.currentMenuIndex % 2 === 0 ? this.currentMenuIndex + 1 : this.currentMenuIndex - 1;
        break;
      case 'OK':
        this.selectMenuOption();
        return;
      case 'CANCEL':
        // Handle cancel if needed
        return;
    }

    this.updateMenuSelection();
  }

  /**
   * Update menu selection visual
   */
  private updateMenuSelection(): void {
    this.mainMenuTexts.forEach((text, index) => {
      if (index === this.currentMenuIndex) {
        text.setStyle({ color: '#ffff00' });
      } else {
        text.setStyle({ color: '#ffffff' });
      }
    });
  }

  /**
   * Handle menu selection
   */
  private selectMenuOption(): void {
    const selectedOption = Object.values(BattleMenuOption)[this.currentMenuIndex];
    
    // Emit event for the selected option
    this.scene.events.emit('menu:selected', selectedOption);
  }

  /**
   * Get current selected option
   */
  getSelectedOption(): BattleMenuOption {
    return Object.values(BattleMenuOption)[this.currentMenuIndex];
  }

  /**
   * Reset menu to first option
   */
  resetMenu(): void {
    this.currentMenuIndex = 0;
    this.updateMenuSelection();
  }

  /**
   * Check if menu is visible
   */
  isMenuVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.menuContainer.destroy();
  }
}