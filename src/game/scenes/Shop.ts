import { Scene, GameObjects } from 'phaser';
import { EventBus } from '../EventBus';
import { SceneContext } from './SceneContext';
import { ItemDatabase } from '../models';

/**
 * Shop Scene - Item trading and purchasing
 * Buy and sell items, manage inventory
 */
export class Shop extends Scene {
  private gameStateManager = SceneContext.getInstance().getGameStateManager();
  private shopItemsContainer: GameObjects.Container | null = null;
  private selectedItemIndex: number = 0;
  private infoText: GameObjects.Text | null = null;
  private moneyText: GameObjects.Text | null = null;

  constructor() {
    super('Shop');
  }

  create() {
    const width = this.game.config.width as number;
    const height = this.game.config.height as number;

    const background = this.add.rectangle(width / 2, height / 2, width, height, 0x2a2a1a);
    background.setScrollFactor(0);

    const titleText = this.add.text(width / 2, 20, 'SHOP', {
      font: '24px Arial',
      color: '#ffd700',
    });
    titleText.setOrigin(0.5);

    const playerState = this.gameStateManager.getPlayerState();
    this.moneyText = this.add.text(width - 150, 20, `Money: $${playerState.money}`, {
      font: '14px Arial',
      color: '#ffff00',
    });

    this.shopItemsContainer = this.add.container(50, 70);
    this.renderShopItems();

    this.infoText = this.add.text(width / 2, height - 80, 'Press Z to buy | ESC to exit', {
      font: '12px Arial',
      color: '#cccccc',
    });
    this.infoText.setOrigin(0.5);

    this.setupInput();
    this.setupEventListeners();

    EventBus.emit('current-scene-ready', this);
  }

  private renderShopItems() {
    if (!this.shopItemsContainer) return;

    this.shopItemsContainer.removeAll(true);

    const shopItems = ItemDatabase.getShopItems();

    shopItems.forEach((item, index) => {
      const y = index * 60;
      const isSelected = index === this.selectedItemIndex;
      const bgColor = isSelected ? 0x444400 : 0x333333;
      const bg = this.add.rectangle(200, y + 30, 300, 50, bgColor);

      const text = this.add.text(10, y + 5, `${item.name}`, {
        font: '14px Arial',
        color: '#ffffff',
      });

      const priceText = this.add.text(10, y + 25, `Price: ${item.price}`, {
        font: '12px Arial',
        color: '#ffff00',
      });

      this.shopItemsContainer?.add([bg, text, priceText]);
    });
  }

  private setupInput() {
    this.input.keyboard?.on('keydown-UP_ARROW', () => {
      this.selectedItemIndex = Math.max(0, this.selectedItemIndex - 1);
      this.renderShopItems();
    });

    this.input.keyboard?.on('keydown-DOWN_ARROW', () => {
      const maxIndex = ItemDatabase.getShopItems().length - 1;
      this.selectedItemIndex = Math.min(maxIndex, this.selectedItemIndex + 1);
      this.renderShopItems();
    });

    this.input.keyboard?.on('keydown-Z', () => {
      this.purchaseItem();
    });

    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('Overworld');
    });
  }

  private setupEventListeners() {
    EventBus.on('money:updated', (data: { money: number }) => {
      if (this.moneyText) {
        this.moneyText.setText(`Money: $${data.money}`);
      }
    });
  }

  private purchaseItem() {
    const shopItems = ItemDatabase.getShopItems();
    const selectedItem = shopItems[this.selectedItemIndex];

    if (!selectedItem || !selectedItem.price) {
      this.infoText?.setText('Cannot purchase this item!');
      return;
    }

    const playerState = this.gameStateManager.getPlayerState();

    if (playerState.money >= selectedItem.price) {
      this.gameStateManager.spendMoney(selectedItem.price);
      this.gameStateManager.addItem(selectedItem.id, 1);
      this.infoText?.setText(`Purchased ${selectedItem.name}!`);
    } else {
      this.infoText?.setText('Not enough money!');
    }
  }

  shutdown() {
    EventBus.off('money:updated');
  }
}
