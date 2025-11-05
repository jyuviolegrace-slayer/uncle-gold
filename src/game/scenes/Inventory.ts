import { Scene, GameObjects } from 'phaser';
import { EventBus } from '../EventBus';
import { LegacyDataManager } from '../services/LegacyDataManager';
import { UI_ASSET_KEYS, INVENTORY_ASSET_KEYS } from '../assets/AssetKeys';
import { IItem } from '../models/types';

/**
 * Inventory item with game objects
 */
interface InventoryItemWithGameObjects {
  item: IItem;
  quantity: number;
  gameObjects: {
    itemName?: GameObjects.Text;
    quantity?: GameObjects.Text;
    quantitySign?: GameObjects.Text;
  };
}

/**
 * Scene data for inventory
 */
interface InventorySceneData {
  previousSceneName: string;
  itemSelected?: IItem;
}

/**
 * Data passed when inventory is resumed
 */
interface InventorySceneResumeData {
  wasItemUsed: boolean;
}

/**
 * Data passed when item is used
 */
interface InventorySceneItemUsedData {
  wasItemUsed: boolean;
  item?: IItem;
}

/**
 * Inventory/Bag Scene - Item management and usage
 * Allows viewing and using items from the player's inventory
 */
export class Inventory extends Scene {
  private sceneData: InventorySceneData;
  private container: GameObjects.Container | null = null;
  private selectedInventoryDescriptionText: GameObjects.Text | null = null;
  private userInputCursor: GameObjects.Image | null = null;
  private inventory: InventoryItemWithGameObjects[] = [];
  private selectedInventoryOptionIndex: number = 0;
  private waitingForInput: boolean = false;
  private legacyDataManager: LegacyDataManager;

  // Layout constants
  private readonly INVENTORY_ITEM_POSITION = {
    x: 50,
    y: 14,
    space: 50,
  };

  private readonly INVENTORY_TEXT_STYLE = {
    fontFamily: 'Arial',
    color: '#000000',
    fontSize: '30px',
  };

  constructor() {
    super('Inventory');
    this.legacyDataManager = new LegacyDataManager();
    this.sceneData = { previousSceneName: 'Overworld' };
  }

  init(data: InventorySceneData) {
    this.waitingForInput = false;
    this.sceneData = data;
    this.selectedInventoryOptionIndex = 0;

    // Load inventory from legacy data manager
    const legacyInventory = this.legacyDataManager.getInventory();
    this.inventory = legacyInventory.map((inventoryItem) => {
      // Convert legacy item to new format
      const item: IItem = {
        id: String(inventoryItem.item.id),
        name: `Item ${inventoryItem.item.id}`, // This would come from item database
        description: `Description for item ${inventoryItem.item.id}`,
        type: 'Other', // This would come from item database
      };

      return {
        item,
        quantity: inventoryItem.quantity,
        gameObjects: {},
      };
    });
  }

  create() {
    // Create background
    this.add.image(0, 0, INVENTORY_ASSET_KEYS.INVENTORY_BACKGROUND).setOrigin(0);
    this.add.image(40, 120, INVENTORY_ASSET_KEYS.INVENTORY_BAG).setOrigin(0).setScale(0.5);

    // Create main container
    this.container = this.add.container(300, 20);
    this.container.setSize(700, 360);

    const containerBackground = this.add.rectangle(4, 4, 692, 352, 0xffff88).setOrigin(0).setAlpha(0.6);
    this.container.add(containerBackground);

    // Create title container
    const titleContainer = this.add.container(64, 20);
    titleContainer.setSize(240, 64);

    const titleContainerBackground = this.add.rectangle(4, 4, 232, 56, 0xffff88).setOrigin(0).setAlpha(0.6);
    titleContainer.add(titleContainerBackground);

    const textTitle = this.add.text(116, 28, 'Items', this.INVENTORY_TEXT_STYLE).setOrigin(0.5);
    titleContainer.add(textTitle);

    // Create inventory items
    this.inventory.forEach((inventoryItem, index) => {
      const itemText = this.add.text(
        this.INVENTORY_ITEM_POSITION.x,
        this.INVENTORY_ITEM_POSITION.y + index * this.INVENTORY_ITEM_POSITION.space,
        inventoryItem.item.name,
        this.INVENTORY_TEXT_STYLE
      );

      const qty1Text = this.add.text(
        620,
        this.INVENTORY_ITEM_POSITION.y + 2 + index * this.INVENTORY_ITEM_POSITION.space,
        'x',
        {
          color: '#000000',
          fontSize: '30px',
        }
      );

      const qty2Text = this.add.text(
        650,
        this.INVENTORY_ITEM_POSITION.y + index * this.INVENTORY_ITEM_POSITION.space,
        `${inventoryItem.quantity}`,
        this.INVENTORY_TEXT_STYLE
      );

      this.container?.add([itemText, qty1Text, qty2Text]);
      inventoryItem.gameObjects = {
        itemName: itemText,
        quantity: qty2Text,
        quantitySign: qty1Text,
      };
    });

    // Create cancel text
    const cancelText = this.add.text(
      this.INVENTORY_ITEM_POSITION.x,
      this.INVENTORY_ITEM_POSITION.y + this.inventory.length * this.INVENTORY_ITEM_POSITION.space,
      'Cancel',
      this.INVENTORY_TEXT_STYLE
    );
    this.container?.add(cancelText);

    // Create player input cursor
    this.userInputCursor = this.add.image(30, 30, UI_ASSET_KEYS.CURSOR).setScale(3);
    this.container?.add(this.userInputCursor);

    // Create inventory description text
    this.selectedInventoryDescriptionText = this.add.text(25, 420, '', {
      ...this.INVENTORY_TEXT_STYLE,
      wordWrap: {
        width: this.scale.width - 18,
      },
      color: '#ffffff',
    });

    this.updateItemDescriptionText();
    this.setupInput();

    EventBus.emit('inventory:ready');
  }

  update() {
    // Input is handled in setupInput with event listeners
  }

  /**
   * Handle scene resume after using an item
   */
  handleSceneResume(data?: InventorySceneResumeData) {
    if (!data || !data.wasItemUsed) {
      return;
    }

    const updatedItem = this.handleItemUsed();

    // If previous scene was battle scene, switch back to that scene
    if (this.sceneData.previousSceneName === 'Battle') {
      this.goBackToPreviousScene(true, updatedItem.item);
    }
  }

  /**
   * Update item description text
   */
  private updateItemDescriptionText() {
    if (!this.selectedInventoryDescriptionText) return;

    if (this.isCancelButtonSelected()) {
      this.selectedInventoryDescriptionText.setText('Close your bag, and go back to adventuring!');
      return;
    }

    const selectedItem = this.inventory[this.selectedInventoryOptionIndex];
    if (selectedItem) {
      this.selectedInventoryDescriptionText.setText(selectedItem.item.description);
    }
  }

  /**
   * Check if cancel button is selected
   */
  private isCancelButtonSelected(): boolean {
    return this.selectedInventoryOptionIndex === this.inventory.length;
  }

  /**
   * Handle item usage
   */
  private handleItemUsed(): InventoryItemWithGameObjects {
    const selectedItem = this.inventory[this.selectedInventoryOptionIndex];
    selectedItem.quantity -= 1;
    
    if (selectedItem.gameObjects.quantity) {
      selectedItem.gameObjects.quantity.setText(`${selectedItem.quantity}`);
    }

    // Update legacy inventory
    const legacyInventory = this.inventory.map(item => ({
      item: { id: parseInt(item.item.id) },
      quantity: item.quantity,
    }));
    this.legacyDataManager.updateInventory(legacyInventory);

    EventBus.emit('inventory:itemUsed', { item: selectedItem.item, quantity: selectedItem.quantity });
    return selectedItem;
  }

  /**
   * Go back to previous scene
   */
  private goBackToPreviousScene(wasItemUsed: boolean, item?: IItem) {
    const sceneDataToPass: InventorySceneItemUsedData = {
      wasItemUsed,
      item,
    };

    this.scene.stop('Inventory');
    this.scene.resume(this.sceneData.previousSceneName, sceneDataToPass);
    EventBus.emit('inventory:closed', { wasItemUsed, item });
  }

  /**
   * Move player input cursor
   */
  private movePlayerInputCursor(direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') {
    switch (direction) {
      case 'UP':
        this.selectedInventoryOptionIndex -= 1;
        if (this.selectedInventoryOptionIndex < 0) {
          this.selectedInventoryOptionIndex = this.inventory.length;
        }
        break;
      case 'DOWN':
        this.selectedInventoryOptionIndex += 1;
        if (this.selectedInventoryOptionIndex > this.inventory.length) {
          this.selectedInventoryOptionIndex = 0;
        }
        break;
      case 'LEFT':
      case 'RIGHT':
        return;
    }

    if (this.userInputCursor) {
      const y = 30 + this.selectedInventoryOptionIndex * 50;
      this.userInputCursor.setY(y);
    }
  }

  /**
   * Setup input handling
   */
  private setupInput() {
    // Back/Cancel key
    this.input.keyboard?.on('keydown-ESC', () => {
      if (this.waitingForInput) {
        this.updateItemDescriptionText();
        this.waitingForInput = false;
        return;
      }
      this.goBackToPreviousScene(false);
    });

    this.input.keyboard?.on('keydown-X', () => {
      if (this.waitingForInput) {
        this.updateItemDescriptionText();
        this.waitingForInput = false;
        return;
      }
      this.goBackToPreviousScene(false);
    });

    // Confirm key
    this.input.keyboard?.on('keydown-ENTER', () => {
      this.handleConfirmKey();
    });

    this.input.keyboard?.on('keydown-Z', () => {
      this.handleConfirmKey();
    });

    // Direction keys
    this.input.keyboard?.on('keydown-UP', () => {
      if (!this.waitingForInput) {
        this.movePlayerInputCursor('UP');
        this.updateItemDescriptionText();
      }
    });

    this.input.keyboard?.on('keydown-DOWN', () => {
      if (!this.waitingForInput) {
        this.movePlayerInputCursor('DOWN');
        this.updateItemDescriptionText();
      }
    });

    this.input.keyboard?.on('keydown-LEFT', () => {
      if (!this.waitingForInput) {
        this.movePlayerInputCursor('LEFT');
      }
    });

    this.input.keyboard?.on('keydown-RIGHT', () => {
      if (!this.waitingForInput) {
        this.movePlayerInputCursor('RIGHT');
      }
    });
  }

  /**
   * Handle confirm key press
   */
  private handleConfirmKey() {
    if (this.waitingForInput) {
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

    // Validate that the item can be used if we are outside battle
    if (this.sceneData.previousSceneName === 'Battle') {
      // Check if selected item is a capture ball
      if (selectedItem.type === 'Pokeball') {
        // Validate we have room in our party before attempting capture
        if (this.legacyDataManager.isPartyFull()) {
          if (this.selectedInventoryDescriptionText) {
            this.selectedInventoryDescriptionText.setText('You have no room in your party! Cannot use that item.');
          }
          this.waitingForInput = true;
          return;
        }

        this.handleItemUsed();
        this.goBackToPreviousScene(true, selectedItem);
        return;
      }
    }

    if (selectedItem.type === 'Pokeball') {
      // Display message to player that the item can't be used now
      if (this.selectedInventoryDescriptionText) {
        this.selectedInventoryDescriptionText.setText('That item cannot be used right now.');
      }
      this.waitingForInput = true;
      return;
    }

    // For other items, launch party selection scene
    this.scene.launch('Party', {
      previousSceneName: 'Inventory',
      itemSelected: selectedItem,
    });
    this.scene.pause('Inventory');
  }

  shutdown() {
    EventBus.off('inventory:ready');
    EventBus.off('inventory:itemUsed');
    EventBus.off('inventory:closed');
  }
}