import { BaseScene } from './common/BaseScene';
import { SceneKeys } from '../assets/SceneKeys';
import { TextureKeys } from '../assets/TextureKeys';
import { FontKeys } from '../assets/FontKeys';
import { Direction, ItemEffect } from '../models/common';
import { CritterInstance } from '../models/critter';
import { Item } from '../models/item';
import { HealthBar } from '../ui/HealthBar';
import { DataManager, DataManagerStoreKeys } from '../services/DataManager';
import { EventBus } from '../EventBus';

const UI_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  color: '#FFFFFF',
  fontSize: '24px',
};

const MONSTER_PARTY_POSITIONS = Object.freeze({
  EVEN: {
    x: 0,
    y: 10,
  },
  ODD: {
    x: 510,
    y: 40,
  },
  increment: 150,
});

export interface MonsterPartySceneData {
  previousSceneName: string;
  itemSelected?: Item;
  activeBattleMonsterPartyIndex?: number; // The current active monster's party index if we are attempting to switch monsters
  activeMonsterKnockedOut?: boolean; // Flag to indicate if the current active monster was knocked out during battle, which means player has to choose a new monster before going back to the battle scene
}

export interface MonsterPartySceneResumeData {
  wasItemUsed: boolean;
  selectedMonsterIndex?: number;
  wasMonsterSelected: boolean;
}

export enum MonsterPartyMenuOptions {
  DETAILS = 'DETAILS',
  SWITCH = 'SWITCH',
  ITEM = 'ITEM',
  CANCEL = 'CANCEL',
}

/**
 * MonsterPartyScene - Manages the player's monster party
 * Ported from archive/src/scenes/monster-party-scene.js to TypeScript
 */
export class MonsterPartyScene extends BaseScene {
  private monsterPartyBackgrounds: Phaser.GameObjects.Image[];
  private cancelButton: Phaser.GameObjects.Image;
  private infoTextGameObject: Phaser.GameObjects.Text;
  private healthBars: HealthBar[];
  private healthBarTextGameObjects: Phaser.GameObjects.Text[];
  private selectedPartyMonsterIndex: number;
  private monsters: CritterInstance[];
  private sceneData: MonsterPartySceneData;
  private waitingForInput: boolean;
  private isMovingMonster: boolean;
  private monsterToBeMovedIndex?: number;
  private monsterContainers: Phaser.GameObjects.Container[];
  private dataManager: DataManager;

  constructor() {
    super(SceneKeys.MONSTER_PARTY);
    this.dataManager = new DataManager();
  }

  init(data: MonsterPartySceneData): void {
    super.init(data);

    if (!data || !data.previousSceneName) {
      data.previousSceneName = SceneKeys.WORLD;
    }

    this.sceneData = data;
    this.monsterPartyBackgrounds = [];
    this.healthBars = [];
    this.healthBarTextGameObjects = [];
    this.selectedPartyMonsterIndex = 0;
    this.monsters = this.dataManager.getParty();
    this.waitingForInput = false;
    this.isMovingMonster = false;
    this.monsterToBeMovedIndex = undefined;
    this.monsterContainers = [];
  }

  create(): void {
    super.create();

    // Create custom background
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 1).setOrigin(0);
    this.add
      .tileSprite(0, 0, this.scale.width, this.scale.height, TextureKeys.PARTY_BACKGROUND, 0)
      .setOrigin(0)
      .setAlpha(0.7);

    // Create button
    const buttonContainer = this.add.container(883, 519, []);
    this.cancelButton = this.add.image(0, 0, TextureKeys.BLUE_BUTTON, 0).setOrigin(0).setScale(0.7, 1).setAlpha(0.7);
    const cancelText = this.add.text(66.5, 20.6, 'cancel', UI_TEXT_STYLE).setOrigin(0.5);
    buttonContainer.add([this.cancelButton, cancelText]);

    // Create info container
    const infoContainer = this.add.container(4, this.scale.height - 69, []);
    const infoDisplay = this.add.rectangle(0, 0, 867, 65, 0xede4f3, 1).setOrigin(0).setStrokeStyle(8, 0x905ac2, 1);
    this.infoTextGameObject = this.add.text(15, 14, '', {
      fontFamily: 'Arial, Helvetica, sans-serif',
      color: '#000000',
      fontSize: '32px',
    });
    infoContainer.add([infoDisplay, this.infoTextGameObject]);
    this.updateInfoContainerText();

    // Create monsters in party
    this.monsters.forEach((monster, index) => {
      // 1, 3, 5
      const isEven = index % 2 === 0;
      const x = isEven ? MONSTER_PARTY_POSITIONS.EVEN.x : MONSTER_PARTY_POSITIONS.ODD.x;
      const y =
        (isEven ? MONSTER_PARTY_POSITIONS.EVEN.y : MONSTER_PARTY_POSITIONS.ODD.y) +
        MONSTER_PARTY_POSITIONS.increment * Math.floor(index / 2);
      const monsterContainer = this.createMonster(x, y, monster);
      this.monsterContainers.push(monsterContainer);
    });
    this.movePlayerInputCursor(Direction.NONE);
  }

  update(time: number, delta: number): void {
    super.update(time, delta);

    if (this.isInputLocked()) {
      return;
    }

    const selectedDirection = this.inputManager.getDirectionKeyJustPressed();
    const wasSpaceKeyPressed = this.inputManager.wasSpaceKeyPressed();
    const wasBackKeyPressed = this.inputManager.wasBackKeyPressed();

    if (wasBackKeyPressed) {
      if (this.waitingForInput) {
        this.updateInfoContainerText();
        this.waitingForInput = false;
        return;
      }

      if (this.isMovingMonster) {
        // If we are attempting to switch monsters location, cancel action
        this.isMovingMonster = false;
        this.updateInfoContainerText();
        return;
      }

      this.goBackToPreviousScene(false, false);
      return;
    }

    if (wasSpaceKeyPressed) {
      if (this.waitingForInput) {
        this.updateInfoContainerText();
        this.waitingForInput = false;
        return;
      }

      if (this.selectedPartyMonsterIndex === -1) {
        // If we are attempting to switch monsters location, cancel action
        if (this.isMovingMonster) {
          this.isMovingMonster = false;
          this.updateInfoContainerText();
          return;
        }

        this.goBackToPreviousScene(false, false);
        return;
      }

      if (this.isMovingMonster) {
        // Make sure we select a different monster
        if (this.selectedPartyMonsterIndex === this.monsterToBeMovedIndex) {
          return;
        }

        this.moveMonsters();
        return;
      }

      // Show menu for monster actions
      this.showMonsterMenu();
      return;
    }

    if (this.waitingForInput) {
      return;
    }

    if (selectedDirection !== Direction.NONE) {
      this.movePlayerInputCursor(selectedDirection);
      // If we are attempting to move a monster, we want to leave the text up on the screen
      if (this.isMovingMonster) {
        return;
      }
      this.updateInfoContainerText();
    }
  }

  private updateInfoContainerText(): void {
    if (this.selectedPartyMonsterIndex === -1) {
      this.infoTextGameObject.setText('Go back to previous menu');
      return;
    }
    
    if (this.isMovingMonster) {
      this.infoTextGameObject.setText('Choose a monster to switch with');
      return;
    }
    
    this.infoTextGameObject.setText('Choose a monster');
  }

  private createMonster(x: number, y: number, monsterDetails: CritterInstance): Phaser.GameObjects.Container {
    const container = this.add.container(x, y, []);

    const background = this.add.image(0, 0, TextureKeys.HEALTH_BAR_BACKGROUND).setOrigin(0).setScale(1.1, 1.2);
    this.monsterPartyBackgrounds.push(background);

    const leftShadowCap = this.add.image(160, 67, TextureKeys.HEALTH_LEFT_CAP_SHADOW).setOrigin(0).setAlpha(0.5);
    const middleShadow = this.add
      .image(leftShadowCap.x + leftShadowCap.width, 67, TextureKeys.HEALTH_MIDDLE_SHADOW)
      .setOrigin(0)
      .setAlpha(0.5);
    middleShadow.displayWidth = 285;
    const rightShadowCap = this.add
      .image(middleShadow.x + middleShadow.displayWidth, 67, TextureKeys.HEALTH_RIGHT_CAP_SHADOW)
      .setOrigin(0)
      .setAlpha(0.5);

    const healthBar = new HealthBar(this, {
      x: 100,
      y: 40,
      width: 240,
      height: 40,
      backgroundColor: 0x333333,
      fillColor: 0x4CAF50,
      showBorder: true,
      borderThickness: 2,
      borderColor: 0x000000,
      critter: monsterDetails,
    });
    this.healthBars.push(healthBar);

    const monsterHpText = this.add.text(164, 66, 'HP', {
      fontFamily: 'Arial, Helvetica, sans-serif',
      color: '#FF6505',
      fontSize: '24px',
      fontStyle: 'italic',
    });

    const monsterHealthBarLevelText = this.add.text(26, 116, `Lv. ${monsterDetails.currentLevel}`, {
      fontFamily: 'Arial, Helvetica, sans-serif',
      color: '#ffffff',
      fontSize: '22px',
    });

    const monsterNameGameText = this.add.text(162, 36, monsterDetails.name, {
      fontFamily: 'Arial, Helvetica, sans-serif',
      color: '#ffffff',
      fontSize: '30px',
    });

    const healthBarTextGameObject = this.add
      .text(458, 95, `${monsterDetails.currentHp} / ${monsterDetails.maxHp}`, {
        fontFamily: 'Arial, Helvetica, sans-serif',
        color: '#ffffff',
        fontSize: '38px',
      })
      .setOrigin(1, 0);
    this.healthBarTextGameObjects.push(healthBarTextGameObject);

    const monsterImage = this.add.image(35, 20, monsterDetails.assetKey).setOrigin(0).setScale(0.35);

    container.add([
      background,
      healthBar.getContainer(),
      monsterHpText,
      monsterHealthBarLevelText,
      monsterNameGameText,
      leftShadowCap,
      middleShadow,
      rightShadowCap,
      healthBarTextGameObject,
      monsterImage,
    ]);

    return container;
  }

  private goBackToPreviousScene(wasItemUsed: boolean, wasMonsterSelected: boolean): void {
    if (
      this.sceneData.activeMonsterKnockedOut &&
      this.sceneData.previousSceneName === SceneKeys.BATTLE &&
      !wasMonsterSelected
    ) {
      // If active monster was knocked out, return early since we need to pick a new monster for battle
      this.infoTextGameObject.setText('You must select a new monster for battle.');
      this.waitingForInput = true;
      return;
    }

    this.lockInput();
    this.scene.stop(SceneKeys.MONSTER_PARTY);
    const sceneDataToPass: MonsterPartySceneResumeData = {
      wasItemUsed,
      selectedMonsterIndex: wasMonsterSelected ? this.selectedPartyMonsterIndex : undefined,
      wasMonsterSelected,
    };
    this.scene.resume(this.sceneData.previousSceneName, sceneDataToPass);
  }

  private movePlayerInputCursor(direction: Direction): void {
    switch (direction) {
      case Direction.UP:
        // If we are already at the cancel button, then reset index
        if (this.selectedPartyMonsterIndex === -1) {
          this.selectedPartyMonsterIndex = this.monsters.length;
        }
        this.selectedPartyMonsterIndex -= 1;
        // Prevent from looping to the bottom
        if (this.selectedPartyMonsterIndex < 0) {
          this.selectedPartyMonsterIndex = 0;
        }
        if (this.monsterPartyBackgrounds[this.selectedPartyMonsterIndex]) {
          this.monsterPartyBackgrounds[this.selectedPartyMonsterIndex].setAlpha(1);
        }
        this.cancelButton.setTexture(TextureKeys.BLUE_BUTTON, 0).setAlpha(0.7);
        break;
      case Direction.DOWN:
        // Already at the bottom of the menu
        if (this.selectedPartyMonsterIndex === -1) {
          break;
        }
        // Increment index and check if we are pass the threshold
        this.selectedPartyMonsterIndex += 1;
        if (this.selectedPartyMonsterIndex > this.monsters.length - 1) {
          this.selectedPartyMonsterIndex = -1;
        }
        if (this.selectedPartyMonsterIndex === -1) {
          this.cancelButton.setTexture(TextureKeys.BLUE_BUTTON_SELECTED, 0).setAlpha(1);
          break;
        }
        if (this.monsterPartyBackgrounds[this.selectedPartyMonsterIndex]) {
          this.monsterPartyBackgrounds[this.selectedPartyMonsterIndex].setAlpha(1);
        }
        break;
      case Direction.LEFT:
      case Direction.RIGHT:
      case Direction.NONE:
        break;
      default:
        console.warn(`[MonsterPartyScene:movePlayerInputCursor] Unknown direction: ${direction}`);
    }

    this.monsterPartyBackgrounds.forEach((background, index) => {
      if (index === this.selectedPartyMonsterIndex) {
        return;
      }
      background.setAlpha(0.7);
    });
  }

  private handleItemUsed(): void {
    if (!this.sceneData.itemSelected?.effect) {
      return;
    }

    switch (this.sceneData.itemSelected.effect.type) {
      case ItemEffect.HEAL_30:
        this.handleHealItemUsed(this.sceneData.itemSelected.effect.value || 30);
        break;
      case ItemEffect.CAPTURE_1:
        // These items should not be useable in this scene
        break;
      default:
        console.warn(`[MonsterPartyScene:handleItemUsed] Unknown item effect: ${this.sceneData.itemSelected.effect.type}`);
    }
  }

  private handleHealItemUsed(amount: number): void {
    // Validate that the monster is not fainted
    if (this.monsters[this.selectedPartyMonsterIndex].currentHp === 0) {
      this.infoTextGameObject.setText('Cannot heal fainted monster');
      this.waitingForInput = true;
      return;
    }

    // Validate that the monster is not already fully healed
    if (
      this.monsters[this.selectedPartyMonsterIndex].currentHp ===
      this.monsters[this.selectedPartyMonsterIndex].maxHp
    ) {
      this.infoTextGameObject.setText('Monster is already fully healed');
      this.waitingForInput = true;
      return;
    }

    // Otherwise, heal monster by the amount if we are not in a battle and show animation
    this.lockInput();
    this.monsters[this.selectedPartyMonsterIndex].currentHp += amount;
    if (
      this.monsters[this.selectedPartyMonsterIndex].currentHp > this.monsters[this.selectedPartyMonsterIndex].maxHp
    ) {
      this.monsters[this.selectedPartyMonsterIndex].currentHp = this.monsters[this.selectedPartyMonsterIndex].maxHp;
    }
    this.infoTextGameObject.setText(`Healed monster by ${amount} HP`);
    // Update the health bar with new HP values
    this.healthBars[this.selectedPartyMonsterIndex].setCritter(this.monsters[this.selectedPartyMonsterIndex]);
    
    // Update the HP text manually
    if (this.healthBarTextGameObjects[this.selectedPartyMonsterIndex]) {
      this.healthBarTextGameObjects[this.selectedPartyMonsterIndex].setText(
        `${this.monsters[this.selectedPartyMonsterIndex].currentHp} / ${
          this.monsters[this.selectedPartyMonsterIndex].maxHp
        }`
      );
    }
    
    // Update the party in DataManager
    this.dataManager.dataStore.set(DataManagerStoreKeys.CRITTERS_IN_PARTY, this.monsters);
    EventBus.emit('party:updated', this.monsters);
    
    this.time.delayedCall(300, () => {
      this.goBackToPreviousScene(true, false);
    });
  }

  private handleMonsterSelectedForSwitch(): void {
    // Validate that the monster is not fainted
    if (this.monsters[this.selectedPartyMonsterIndex].currentHp === 0) {
      this.infoTextGameObject.setText('Selected monster is not able to fight.');
      this.waitingForInput = true;
      return;
    }

    // Validate that the selected monster is not the current active monster in battle
    if (this.sceneData.activeBattleMonsterPartyIndex === this.selectedPartyMonsterIndex) {
      this.infoTextGameObject.setText('Selected monster is already battling');
      this.waitingForInput = true;
      return;
    }

    this.goBackToPreviousScene(false, true);
  }

  private moveMonsters(): void {
    const temp = this.monsters[this.monsterToBeMovedIndex!];
    this.monsters[this.monsterToBeMovedIndex!] = this.monsters[this.selectedPartyMonsterIndex];
    this.monsters[this.selectedPartyMonsterIndex] = temp;

    // Update the party in DataManager
    this.dataManager.dataStore.set(DataManagerStoreKeys.CRITTERS_IN_PARTY, this.monsters);
    EventBus.emit('party:updated', this.monsters);

    // Reset the monster containers and recreate them
    this.monsterContainers.forEach(container => container.destroy());
    this.monsterContainers = [];
    this.monsterPartyBackgrounds = [];
    this.healthBars = [];
    this.healthBarTextGameObjects = [];

    this.monsters.forEach((monster, index) => {
      const isEven = index % 2 === 0;
      const x = isEven ? MONSTER_PARTY_POSITIONS.EVEN.x : MONSTER_PARTY_POSITIONS.ODD.x;
      const y =
        (isEven ? MONSTER_PARTY_POSITIONS.EVEN.y : MONSTER_PARTY_POSITIONS.ODD.y) +
        MONSTER_PARTY_POSITIONS.increment * Math.floor(index / 2);
      const monsterContainer = this.createMonster(x, y, monster);
      this.monsterContainers.push(monsterContainer);
    });

    this.isMovingMonster = false;
    this.monsterToBeMovedIndex = undefined;
    this.selectedPartyMonsterIndex = 0;
    this.movePlayerInputCursor(Direction.NONE);
    this.updateInfoContainerText();
  }

  private showMonsterMenu(): void {
    // Simple menu implementation - in a real implementation, this would use the Menu framework
    if (this.sceneData.itemSelected) {
      // If an item is selected, use it on the monster
      this.handleItemUsed();
    } else {
      // Otherwise, show monster options (simplified for now)
      this.launchOverlay(SceneKeys.MONSTER_DETAILS, { monster: this.monsters[this.selectedPartyMonsterIndex] });
    }
  }
}