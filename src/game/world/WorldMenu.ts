import { Scene, GameObjects } from 'phaser';

export type MenuOption = 'MONSTERS' | 'BAG' | 'SAVE' | 'OPTIONS' | 'EXIT';

/**
 * World Menu - Simplified version matching legacy functionality
 */
export class WorldMenu {
  private scene: Scene;
  public isVisible: boolean = false;
  private selectedMenuOptionIndex: number = 0;
  private availableMenuOptions: MenuOption[] = ['MONSTERS', 'BAG', 'SAVE', 'OPTIONS', 'EXIT'];
  private menuOptionsTextGameObjects: GameObjects.Text[] = [];
  private container: GameObjects.Container;
  private userInputCursor: GameObjects.Image;
  public currentSelectedMenuOption: MenuOption = 'MONSTERS';

  constructor(scene: Scene) {
    this.scene = scene;
    
    const padding = 4;
    const width = 300;
    const height = 10 + padding * 2 + this.availableMenuOptions.length * 50;

    // Create graphics
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x000000, 0.9);
    graphics.fillRect(1, 0, width - 1, height - 1);
    graphics.lineStyle(8, 0xffffff, 1);
    graphics.strokeRect(0, 0, width, height);

    // Create container
    this.container = this.scene.add.container(0, 0, [graphics]);

    // Add menu options
    for (let i = 0; i < this.availableMenuOptions.length; i += 1) {
      const y = 10 + 50 * i + padding;
      const textObj = this.scene.add.text(40 + padding, y, this.availableMenuOptions[i], {
        fontFamily: 'Arial',
        color: '#FFFFFF',
        fontSize: '32px',
      });
      this.menuOptionsTextGameObjects.push(textObj);
      this.container.add(textObj);
    }

    // Add cursor
    this.userInputCursor = this.scene.add.image(20 + padding, 28 + padding, 'star');
    this.userInputCursor.setScale(2.5);
    this.container.add(this.userInputCursor);

    this.hide();
  }

  get getIsVisible(): boolean {
    return this.isVisible;
  }

  get selectedMenuOption(): MenuOption {
    return this.currentSelectedMenuOption;
  }

  show(): void {
    const { right, top } = this.scene.cameras.main.worldView;
    const startX = right - 8 - 300; // padding * 2 + width
    const startY = top + 8; // padding * 2

    this.container.setPosition(startX, startY);
    this.container.setAlpha(1);
    this.isVisible = true;
  }

  hide(): void {
    this.container.setAlpha(0);
    this.selectedMenuOptionIndex = 0;
    this.moveMenuCursor('NONE');
    this.isVisible = false;
  }

  toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  handlePlayerInput(input: 'UP' | 'DOWN' | 'OK' | 'CANCEL'): void {
    if (input === 'CANCEL') {
      this.hide();
      return;
    }

    if (input === 'OK') {
      this.handleSelectedMenuOption();
      return;
    }

    this.moveMenuCursor(input);
  }

  handleInput(input: 'UP' | 'DOWN' | 'OK' | 'CANCEL'): void {
    this.handlePlayerInput(input);
  }

  private moveMenuCursor(direction: 'UP' | 'DOWN' | 'NONE'): void {
    switch (direction) {
      case 'UP':
        this.selectedMenuOptionIndex -= 1;
        if (this.selectedMenuOptionIndex < 0) {
          this.selectedMenuOptionIndex = this.availableMenuOptions.length - 1;
        }
        break;
      case 'DOWN':
        this.selectedMenuOptionIndex += 1;
        if (this.selectedMenuOptionIndex > this.availableMenuOptions.length - 1) {
          this.selectedMenuOptionIndex = 0;
        }
        break;
      case 'NONE':
        break;
    }
    
    const x = 20 + 4; // 20 + padding
    const y = 28 + 4 + this.selectedMenuOptionIndex * 50; // 28 + padding + index * 50

    this.userInputCursor.setPosition(x, y);
  }

  private handleSelectedMenuOption(): void {
    this.currentSelectedMenuOption = this.availableMenuOptions[this.selectedMenuOptionIndex];
  }

  destroy(): void {
    this.container.destroy();
  }
}