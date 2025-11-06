import { BaseScene } from './common/BaseScene';
import { SceneKeys } from '../assets/SceneKeys';
import { TextureKeys } from '../assets/TextureKeys';
import { FontKeys } from '../assets/FontKeys';
import { Direction, ItemCategory, ItemEffect } from '../models/common';
import { InventoryItem, Item } from '../models/item';
import { DataManager, DataManagerStoreKeys } from '../services/DataManager';
import { NineSlice } from '../ui/NineSlice';
import { EventBus } from '../EventBus';

const CANCEL_TEXT_DESCRIPTION = 'Close your bag, and go back to adventuring!';
const CANNOT_USE_ITEM_TEXT = 'That item cannot be used right now.';

const INVENTORY_ITEM_POSITION = Object.freeze({
  x: 50,
  y: 14,
  space: 50,
});

const INVENTORY_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  color: '#000000',
  fontSize: '30px',
};

export interface InventoryItemGameObjects {
  itemName?: Phaser.GameObjects.Text;
  quantitySign?: Phaser.GameObjects.Text;
  quantity?: Phaser.GameObjects.Text;
}

export interface InventoryItemWithGameObjects extends InventoryItem {
  gameObjects: InventoryItemGameObjects;
}

export interface InventorySceneData {
  previousSceneName: string;
}

export interface InventorySceneWasResumedData {
  wasItemUsed: boolean;
}

export interface InventorySceneItemUsedData {
  wasItemUsed: boolean;
  item?: Item;
}

/**
 * InventoryScene - Manages the player's inventory and item usage
 * Ported from archive/src/scenes/inventory-scene.js to TypeScript
 */
export class InventoryScene extends BaseScene {
  private sceneData: InventorySceneData;
  private nineSliceMainContainer: NineSlice;
  private selectedInventoryDescriptionText: Phaser.GameObjects.Text;
  private userInputCursor: Phaser.GameObjects.Image;
  private inventory: InventoryItemWithGameObjects[];
  private selectedInventoryOptionIndex: number;
  private waitingForInput: boolean;
  private dataManager: DataManager;

  constructor() {
    super(SceneKeys.INVENTORY);
    this.dataManager = new DataManager();
  }

  init(data: InventorySceneData): void {
    super.init(data);

    this.waitingForInput = false;
    this.sceneData = data;
    this.selectedInventoryOptionIndex = 0;
    const inventory = this.dataManager.getInventory();
    this.inventory = inventory.map((inventoryItem) => {
      return {
        item: inventoryItem.item,
        quantity: inventoryItem.quantity,
        gameObjects: {},
      };
    });
    this.nineSliceMainContainer = new NineSlice({
      cornerCutSize: 32,
      textureManager: this.sys.textures,
      assetKeys: [TextureKeys.MENU_BACKGROUND],
    });
  }

  create(): void {
    super.create();

    // Create custom background
    this.add.image(0, 0, TextureKeys.INVENTORY_BACKGROUND).setOrigin(0);
    this.add.image(40, 120, TextureKeys.INVENTORY_BAG).setOrigin(0).setScale(0.5);

    const container = this.nineSliceMainContainer
      .createNineSliceContainer(this, 700, 360, TextureKeys.MENU_BACKGROUND)
      .setPosition(300, 20);
    const containerBackground = this.add.rectangle(4, 4, 692, 352, 0xffff88).setOrigin(0).setAlpha(0.6);
    container.add(containerBackground);

    const titleContainer = this.nineSliceMainContainer
      .createNineSliceContainer(this, 240, 64, TextureKeys.MENU_BACKGROUND)
      .setPosition(64, 20);
    const titleContainerBackground = this.add.rectangle(4, 4, 232, 56, 0xffff88).setOrigin(0).setAlpha(0.6);
    titleContainer.add(titleContainerBackground);

    const textTitle = this.add.text(116, 28, 'Items', INVENTORY_TEXT_STYLE).setOrigin(0.5);
    titleContainer.add(textTitle);

    // Create inventory text from available items
    this.inventory.forEach((inventoryItem, index) => {
      const itemText = this.add.text(
        INVENTORY_ITEM_POSITION.x,
        INVENTORY_ITEM_POSITION.y + index * INVENTORY_ITEM_POSITION.space,
        inventoryItem.item.name,
        INVENTORY_TEXT_STYLE
      );
      const qty1Text = this.add.text(620, INVENTORY_ITEM_POSITION.y + 2 + index * INVENTORY_ITEM_POSITION.space, 'x', {
        color: '#000000',
        fontSize: '30px',
      });
      const qty2Text = this.add.text(
        650,
        INVENTORY_ITEM_POSITION.y + index * INVENTORY_ITEM_POSITION.space,
        `${inventoryItem.quantity}`,
        INVENTORY_TEXT_STYLE
      );
      container.add([itemText, qty1Text, qty2Text]);
      inventoryItem.gameObjects = {
        itemName: itemText,
        quantity: qty2Text,
        quantitySign: qty1Text,
      };
    });

    // Create cancel text
    const cancelText = this.add.text(
      INVENTORY_ITEM_POSITION.x,
      INVENTORY_ITEM_POSITION.y + this.inventory.length * INVENTORY_ITEM_POSITION.space,
      'Cancel',
      INVENTORY_TEXT_STYLE
    );
    container.add(cancelText);

    // Create player input cursor
    this.userInputCursor = this.add.image(30, 30, TextureKeys.CURSOR).setScale(3);
    container.add(this.userInputCursor);

    // Create inventory description text
    this.selectedInventoryDescriptionText = this.add.text(25, 420, '', {
      ...INVENTORY_TEXT_STYLE,
      wordWrap: {
        width: this.scale.width - 18,
      },
      color: '#ffffff',
    });
    this.updateItemDescriptionText();
  }

  update(time: number, delta: number): void {
    super.update(time, delta);

    if (this.isInputLocked()) {
      return;
    }

    if (this.inputManager.wasBackKeyPressed()) {
      if (this.waitingForInput) {
        // Update text description and let player select new items
        this.updateItemDescriptionText();
        this.waitingForInput = false;
        return;
      }

      this.goBackToPreviousScene(false);
      return;
    }

    const wasSpaceKeyPressed = this.inputManager.wasSpaceKeyPressed();
    if (wasSpaceKeyPressed) {
      if (this.waitingForInput) {
        // Update text description and let player select new items
        this.updateItemDescriptionText();
        this.waitingForInput = false;
        return;
      }

      if (this.isCancelButtonSelected()) {
        this.goBackToPreviousScene(false);
        return;
      }

      if (this.inventory[this.selectedInventoryOptionIndex].quantity < 1) {
        return;
      }

      const selectedItem = this.inventory[this.selectedInventoryOptionIndex].item;

      // Validate that the item can be used if we are outside battle (capture ball example)
      if (this.sceneData.previousSceneName === SceneKeys.BATTLE) {
        // Check to see if the selected item needs a target monster, example if selecting
        // a capture ball, no monster needed, vs selecting a potion, player needs to choose the
        // target monster
        if (selectedItem.effect?.type === ItemEffect.CAPTURE_1) {
          // TODO: This logic will need to be updated if we support a monster storage system
          // Validate we have room in our party before attempting capture
          if (this.dataManager.isPartyFull()) {
            this.selectedInventoryDescriptionText.setText('You have no room in your party! Cannot use that item.');
            this.waitingForInput = true;
            return;
          }

          this.handleItemUsed();
          this.goBackToPreviousScene(true, selectedItem);
          return;
        }
      }

      if (selectedItem.effect?.type === ItemEffect.CAPTURE_1) {
        // Display message to player that the item cant be used now
        this.selectedInventoryDescriptionText.setText(CANNOT_USE_ITEM_TEXT);
        this.waitingForInput = true;
        return;
      }

      this.lockInput();
      // Pause this scene and launch the monster party scene
      const sceneDataToPass = {
        previousSceneName: SceneKeys.INVENTORY,
        itemSelected: this.inventory[this.selectedInventoryOptionIndex].item,
      };
      this.launchOverlay(SceneKeys.MONSTER_PARTY, sceneDataToPass);
      this.scene.pause(SceneKeys.INVENTORY);

      // In a future update
      // TODO: Add submenu for accept/cancel after picking an item
      return;
    }

    if (this.waitingForInput) {
      return;
    }

    const selectedDirection = this.inputManager.getDirectionKeyJustPressed();
    if (selectedDirection !== Direction.NONE) {
      this.movePlayerInputCursor(selectedDirection);
      this.updateItemDescriptionText();
    }
  }

  handleSceneResume(sys: Phaser.Scenes.Systems, data?: InventorySceneWasResumedData): void {
    super.handleSceneResume(sys, data);

    if (!data || !data.wasItemUsed) {
      return;
    }

    const updatedItem = this.handleItemUsed();
    // TODO: Add logic to handle when the last of an item was just used

    // If previous scene was battle scene, switch back to that scene
    if (this.sceneData.previousSceneName === SceneKeys.BATTLE) {
      this.goBackToPreviousScene(true, updatedItem.item);
    }
  }

  private updateItemDescriptionText(): void {
    if (this.isCancelButtonSelected()) {
      this.selectedInventoryDescriptionText.setText(CANCEL_TEXT_DESCRIPTION);
      return;
    }

    this.selectedInventoryDescriptionText.setText(
      this.inventory[this.selectedInventoryOptionIndex].item.description
    );
  }

  private isCancelButtonSelected(): boolean {
    return this.selectedInventoryOptionIndex === this.inventory.length;
  }

  private goBackToPreviousScene(wasItemUsed: boolean, item?: Item): void {
    this.lockInput();
    this.scene.stop(SceneKeys.INVENTORY);
    const sceneDataToPass: InventorySceneItemUsedData = {
      wasItemUsed,
      item,
    };
    this.scene.resume(this.sceneData.previousSceneName, sceneDataToPass);
  }

  private movePlayerInputCursor(direction: Direction): void {
    switch (direction) {
      case Direction.UP:
        this.selectedInventoryOptionIndex -= 1;
        if (this.selectedInventoryOptionIndex < 0) {
          this.selectedInventoryOptionIndex = this.inventory.length;
        }
        break;
      case Direction.DOWN:
        this.selectedInventoryOptionIndex += 1;
        if (this.selectedInventoryOptionIndex > this.inventory.length) {
          this.selectedInventoryOptionIndex = 0;
        }
        break;
      case Direction.LEFT:
      case Direction.RIGHT:
        return;
      case Direction.NONE:
        break;
      default:
        console.warn(`[InventoryScene:movePlayerInputCursor] Unknown direction: ${direction}`);
    }

    const y = 30 + this.selectedInventoryOptionIndex * 50;
    this.userInputCursor.setY(y);
  }

  private handleItemUsed(): InventoryItemWithGameObjects {
    const selectedItem = this.inventory[this.selectedInventoryOptionIndex];
    selectedItem.quantity -= 1;
    if (selectedItem.gameObjects.quantity) {
      selectedItem.gameObjects.quantity.setText(`${selectedItem.quantity}`);
    }
    this.dataManager.updateInventory(this.inventory);
    return selectedItem;
  }
}