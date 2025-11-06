import { BaseScene } from './common/BaseScene';
import { SceneKeys } from '../assets';
import { TextureKeys } from '../assets/TextureKeys';
import { FontKeys } from '../assets/FontKeys';
import { Direction } from '../models/common';
import { DataManager, DataManagerStoreKeys } from '../services/DataManager';
import { NineSlice } from '../ui/NineSlice';
import { EventBus } from '../EventBus';
import { Shop, ShopItem } from '../models/shop';
import { dataLoader } from '../data/DataLoader';

const SHOP_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  color: '#000000',
  fontSize: '24px',
};

const SHOP_TITLE_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  color: '#ffffff',
  fontSize: '32px',
};

const SHOP_INFO_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  color: '#ffffff',
  fontSize: '20px',
};

export interface ShopSceneData {
  shopId: string;
}

interface ShopItemDisplay {
  shopItem: ShopItem;
  itemName: Phaser.GameObjects.Text;
  price: Phaser.GameObjects.Text;
  quantity: Phaser.GameObjects.Text;
}

export class ShopScene extends BaseScene {
  private shop: Shop | undefined;
  private nineSliceMainContainer: NineSlice;
  private userInputCursor: Phaser.GameObjects.Image;
  private items: ShopItemDisplay[] = [];
  private selectedItemIndex: number = 0;
  private moneyText: Phaser.GameObjects.Text;
  private dataManager: DataManager;
  private messageText: Phaser.GameObjects.Text;
  private messageTimeout: NodeJS.Timeout | undefined;

  constructor() {
    super(SceneKeys.SHOP);
    this.dataManager = new DataManager();
    this.nineSliceMainContainer = new NineSlice({
      cornerCutSize: 32,
      textureManager: this.sys.textures,
      assetKeys: [TextureKeys.MENU_BACKGROUND],
    });
  }

  init(data: ShopSceneData): void {
    super.init(data);

    if (!data || !data.shopId) {
      console.error('[ShopScene:init] No shop ID provided');
      return;
    }

    this.shop = dataLoader.getShopById(data.shopId);
    if (!this.shop) {
      console.error(`[ShopScene:init] Shop not found: ${data.shopId}`);
      return;
    }

    this.selectedItemIndex = 0;
  }

  create(): void {
    super.create();

    if (!this.shop) {
      console.error('[ShopScene:create] Shop not initialized');
      return;
    }

    this.createUI();
    this.setupEventListeners();
  }

  update(time: number, delta: number): void {
    super.update(time, delta);

    if (this.isInputLocked()) {
      return;
    }

    if (this.inputManager.wasBackKeyPressed()) {
      this.closeShop();
      return;
    }

    const wasSpaceKeyPressed = this.inputManager.wasSpaceKeyPressed();
    if (wasSpaceKeyPressed) {
      this.attemptPurchase();
      return;
    }

    const selectedDirection = this.inputManager.getDirectionKeyJustPressed();
    if (selectedDirection !== Direction.NONE) {
      this.moveSelection(selectedDirection);
    }
  }

  private createUI(): void {
    if (!this.shop) {
      return;
    }

    this.add.image(0, 0, TextureKeys.MENU_BACKGROUND_GREEN).setOrigin(0).setAlpha(0.3);

    const container = this.nineSliceMainContainer
      .createNineSliceContainer(this, 800, 600, TextureKeys.MENU_BACKGROUND)
      .setPosition(112, 84);
    const containerBackground = this.add.rectangle(4, 4, 792, 592, 0xccddff).setOrigin(0).setAlpha(0.7);
    container.add(containerBackground);

    const titleText = this.add.text(0, 20, this.shop.name, SHOP_TITLE_TEXT_STYLE).setOrigin(0.5);
    container.add(titleText);

    const itemsContainerHeight = 350;
    const itemsContainer = this.nineSliceMainContainer
      .createNineSliceContainer(this, 700, itemsContainerHeight, TextureKeys.MENU_BACKGROUND)
      .setPosition(50, 80);
    const itemsContainerBackground = this.add.rectangle(4, 4, 692, itemsContainerHeight - 8, 0xffffcc).setOrigin(0).setAlpha(0.6);
    itemsContainer.add(itemsContainerBackground);

    this.shop.items.forEach((shopItem, index) => {
      const itemData = dataLoader.getItemById(shopItem.itemId);
      if (!itemData) {
        return;
      }

      const y = 20 + index * 45;
      const itemName = this.add.text(20, y, itemData.name, SHOP_TEXT_STYLE);
      const priceText = this.add.text(400, y, `¥${shopItem.price}`, SHOP_TEXT_STYLE);
      const quantityText = this.add.text(620, y, `x${shopItem.quantity}`, SHOP_TEXT_STYLE);

      itemsContainer.add([itemName, priceText, quantityText]);

      this.items.push({
        shopItem,
        itemName,
        price: priceText,
        quantity: quantityText,
      });
    });

    this.userInputCursor = this.add.image(10, 40, TextureKeys.CURSOR).setScale(2.5);
    itemsContainer.add(this.userInputCursor);

    this.moneyText = this.add.text(50, 470, '', SHOP_INFO_TEXT_STYLE);
    container.add(this.moneyText);

    this.messageText = this.add.text(50, 520, '', {
      ...SHOP_INFO_TEXT_STYLE,
      color: '#ffcc00',
      fontSize: '18px',
    });
    container.add(this.messageText);

    this.updateMoneyDisplay();
  }

  private setupEventListeners(): void {
    EventBus.on('options:changed', this.handleOptionsChanged, this);
  }

  private handleOptionsChanged(): void {
    // Handle theme changes if needed
  }

  private moveSelection(direction: Direction): void {
    switch (direction) {
      case Direction.UP:
        this.selectedItemIndex -= 1;
        if (this.selectedItemIndex < 0) {
          this.selectedItemIndex = this.items.length - 1;
        }
        break;
      case Direction.DOWN:
        this.selectedItemIndex += 1;
        if (this.selectedItemIndex >= this.items.length) {
          this.selectedItemIndex = 0;
        }
        break;
      case Direction.LEFT:
      case Direction.RIGHT:
        return;
      case Direction.NONE:
        break;
      default:
        console.warn(`[ShopScene:moveSelection] Unknown direction: ${direction}`);
    }

    this.updateCursorPosition();
  }

  private updateCursorPosition(): void {
    const y = 20 + this.selectedItemIndex * 45;
    this.userInputCursor.setY(y);
  }

  private attemptPurchase(): void {
    if (this.selectedItemIndex >= this.items.length) {
      return;
    }

    const selectedItem = this.items[this.selectedItemIndex];
    const currentMoney = this.dataManager.getMoney();

    if (currentMoney < selectedItem.shopItem.price) {
      this.showMessage('You do not have enough money!', 2000);
      this.audioManager.playSoundFx('FLEE');
      return;
    }

    const itemData = dataLoader.getItemById(selectedItem.shopItem.itemId);
    if (!itemData) {
      console.error(`[ShopScene:attemptPurchase] Item not found: ${selectedItem.shopItem.itemId}`);
      return;
    }

    this.deductMoney(selectedItem.shopItem.price);
    this.addItemToInventory(selectedItem.shopItem.itemId);
    this.showMessage(`Bought ${itemData.name}!`, 1500);
    this.audioManager.playSoundFx('SELECT');

    EventBus.emit('shop:purchase', {
      itemId: selectedItem.shopItem.itemId,
      itemName: itemData.name,
      price: selectedItem.shopItem.price,
    });
  }

  private deductMoney(amount: number): void {
    this.dataManager.subtractMoney(amount);
    this.updateMoneyDisplay();
  }

  private addItemToInventory(itemId: string): void {
    this.dataManager.addItem({ id: itemId }, 1);
  }

  private updateMoneyDisplay(): void {
    const money = this.dataManager.getMoney();
    this.moneyText.setText(`Money: ¥${money}`);
  }

  private showMessage(message: string, duration: number): void {
    this.messageText.setText(message);

    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }

    this.messageTimeout = setTimeout(() => {
      this.messageText.setText('');
    }, duration);
  }

  private closeShop(): void {
    this.lockInput();

    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }

    EventBus.emit('shop:closed');
    this.scene.resume(SceneKeys.WORLD);
    this.scene.stop(SceneKeys.SHOP);
  }

  shutdown(): void {
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }

    EventBus.off('options:changed', this.handleOptionsChanged, this);
    super.shutdown();
  }
}
