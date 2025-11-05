import { Scene, GameObjects } from 'phaser';

export type MenuOption = 'PARTY' | 'BAG' | 'SAVE' | 'OPTIONS' | 'EXIT';

/**
 * Pause menu system for the overworld
 */
export class WorldMenu {
  private scene: Scene;
  private isVisible: boolean = false;
  private selectedIndex: number = 0;
  private menuOptions: MenuOption[] = ['PARTY', 'BAG', 'SAVE', 'OPTIONS', 'EXIT'];
  private menuContainer?: GameObjects.Container;
  private menuTexts: Map<MenuOption, GameObjects.Text> = new Map();
  private onOptionSelected?: (option: MenuOption) => void;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Show menu
   */
  show(): void {
    if (this.isVisible) return;

    this.isVisible = true;
    this.selectedIndex = 0;

    // Create menu UI if not exists
    if (!this.menuContainer) {
      this.createMenuUI();
    }

    if (this.menuContainer) {
      this.menuContainer.setVisible(true);
      this.updateMenuDisplay();
    }
  }

  /**
   * Hide menu
   */
  hide(): void {
    if (!this.isVisible) return;

    this.isVisible = false;

    if (this.menuContainer) {
      this.menuContainer.setVisible(false);
    }
  }

  /**
   * Toggle menu visibility
   */
  toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Get visible state
   */
  getIsVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Get current selected option
   */
  getSelectedOption(): MenuOption {
    return this.menuOptions[this.selectedIndex];
  }

  /**
   * Handle input
   */
  handleInput(input: 'UP' | 'DOWN' | 'CONFIRM' | 'CANCEL'): void {
    if (!this.isVisible) return;

    switch (input) {
      case 'UP':
        this.selectedIndex = (this.selectedIndex - 1 + this.menuOptions.length) % this.menuOptions.length;
        this.updateMenuDisplay();
        break;
      case 'DOWN':
        this.selectedIndex = (this.selectedIndex + 1) % this.menuOptions.length;
        this.updateMenuDisplay();
        break;
      case 'CONFIRM':
        this.onOptionSelected?.(this.menuOptions[this.selectedIndex]);
        break;
      case 'CANCEL':
        this.hide();
        break;
    }
  }

  /**
   * Set callback for option selection
   */
  setOnOptionSelected(callback: (option: MenuOption) => void): void {
    this.onOptionSelected = callback;
  }

  /**
   * Create menu UI
   */
  private createMenuUI(): void {
    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;

    // Create container for menu
    this.menuContainer = this.scene.add.container(centerX, centerY);
    this.menuContainer.setScrollFactor(0);
    this.menuContainer.setDepth(1000);

    // Background
    const bg = this.scene.add.rectangle(0, 0, 300, 300, 0x000000, 0.8);
    bg.setOrigin(0.5);
    this.menuContainer.add(bg);

    // Title
    const title = this.scene.add.text(0, -120, 'Menu', {
      font: 'bold 24px Arial',
      color: '#ffffff',
    });
    title.setOrigin(0.5);
    this.menuContainer.add(title);

    // Menu options
    const optionStartY = -60;
    const optionSpacing = 50;

    this.menuOptions.forEach((option, index) => {
      const yPos = optionStartY + index * optionSpacing;
      const text = this.scene.add.text(0, yPos, option, {
        font: '18px Arial',
        color: '#ffffff',
      });
      text.setOrigin(0.5);
      this.menuTexts.set(option, text);
      this.menuContainer!.add(text);
    });
  }

  /**
   * Update menu display (highlight selected)
   */
  private updateMenuDisplay(): void {
    this.menuTexts.forEach((text, option) => {
      if (option === this.menuOptions[this.selectedIndex]) {
        text.setColor('#ffff00');
        text.setFontSize(20);
      } else {
        text.setColor('#ffffff');
        text.setFontSize(18);
      }
    });
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.menuContainer) {
      this.menuContainer.destroy();
    }
    this.menuTexts.clear();
  }
}
