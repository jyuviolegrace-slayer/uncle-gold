import { Scene, GameObjects } from 'phaser';
import { EventBus } from '../EventBus';
import { LegacyDataManager } from '../services/LegacyDataManager';
import { UI_ASSET_KEYS, MONSTER_PARTY_ASSET_KEYS } from '../assets/AssetKeys';
import { ICritter, IItem, IMoveInstance } from '../models/types';
import { CritterSpeciesDatabase, MoveDatabase } from '../models';

/**
 * Party menu options
 */
enum MonsterPartyMenuOptions {
  SUMMARY = 'SUMMARY',
  SWITCH = 'SWITCH',
  ITEM = 'ITEM',
  CANCEL = 'CANCEL',
}

/**
 * Scene data for monster party
 */
interface MonsterPartySceneData {
  previousSceneName: string;
  itemSelected?: IItem;
  activeBattleMonsterPartyIndex?: number;
  activeMonsterKnockedOut?: boolean;
}

/**
 * Data passed when party scene is resumed
 */
interface MonsterPartySceneResumeData {
  wasItemUsed?: boolean;
  switchedMonster?: boolean;
}

/**
 * Monster Party Scene - Enhanced party management
 * Allows viewing, managing, and using items on party critters
 */
export class MonsterParty extends Scene {
  private sceneData: MonsterPartySceneData;
  private monsterPartyBackgrounds: GameObjects.Image[] = [];
  private cancelButton: GameObjects.Image | null = null;
  private infoTextGameObject: GameObjects.Text | null = null;
  private healthBars: GameObjects.Container[] = [];
  private healthBarTextGameObjects: GameObjects.Text[] = [];
  private selectedPartyMonsterIndex: number = 0;
  private monsters: ICritter[] = [];
  private waitingForInput: boolean = false;
  private menu: GameObjects.Container | null = null;
  private isMovingMonster: boolean = false;
  private monsterToBeMovedIndex: number | undefined;
  private monsterContainers: GameObjects.Container[] = [];
  private legacyDataManager: LegacyDataManager;

  // Layout constants
  private readonly MONSTER_PARTY_POSITIONS = {
    EVEN: { x: 0, y: 10 },
    ODD: { x: 510, y: 40 },
    increment: 150,
  };

  private readonly UI_TEXT_STYLE = {
    fontFamily: 'Arial',
    color: '#FFFFFF',
    fontSize: '24px',
  };

  constructor() {
    super('MonsterParty');
    this.legacyDataManager = new LegacyDataManager();
    this.sceneData = { previousSceneName: 'Overworld' };
  }

  init(data: MonsterPartySceneData) {
    if (!data || !data.previousSceneName) {
      this.sceneData.previousSceneName = 'Overworld';
    } else {
      this.sceneData = data;
    }

    this.monsterPartyBackgrounds = [];
    this.healthBars = [];
    this.healthBarTextGameObjects = [];
    this.selectedPartyMonsterIndex = 0;
    this.monsters = this.legacyDataManager.getParty() as ICritter[];
    this.waitingForInput = false;
    this.isMovingMonster = false;
    this.monsterToBeMovedIndex = undefined;
    this.monsterContainers = [];
  }

  create() {
    this.createBackground();
    this.createMonsterInfo();
    this.createCancelButton();
    this.createInfoText();
    this.updateSelectedInfoText();
    this.setupInput();

    EventBus.emit('monsterParty:ready');
  }

  /**
   * Create background elements
   */
  private createBackground() {
    // Main background
    this.add.image(0, 0, MONSTER_PARTY_ASSET_KEYS.PARTY_BACKGROUND).setOrigin(0);

    // Create monster backgrounds
    for (let i = 0; i < 6; i++) {
      const isEven = i % 2 === 0;
      const position = isEven ? this.MONSTER_PARTY_POSITIONS.EVEN : this.MONSTER_PARTY_POSITIONS.ODD;
      const x = position.x + (isEven ? 0 : 0);
      const y = position.y + Math.floor(i / 2) * this.MONSTER_PARTY_POSITIONS.increment;

      const background = this.add.image(x, y, MONSTER_PARTY_ASSET_KEYS.PARTY_BACKGROUND);
      background.setOrigin(0);
      this.monsterPartyBackgrounds.push(background);
    }
  }

  /**
   * Create monster info displays
   */
  private createMonsterInfo() {
    this.monsters.forEach((monster, index) => {
      const isEven = index % 2 === 0;
      const position = isEven ? this.MONSTER_PARTY_POSITIONS.EVEN : this.MONSTER_PARTY_POSITIONS.ODD;
      const x = position.x + (isEven ? 0 : 0);
      const y = position.y + Math.floor(index / 2) * this.MONSTER_PARTY_POSITIONS.increment;

      const container = this.add.container(x, y);
      this.monsterContainers.push(container);

      // Monster name and level
      const species = CritterSpeciesDatabase.getSpecies(monster.speciesId);
      const displayName = monster.nickname || species?.name || 'Unknown';
      const nameText = this.add.text(5, 5, displayName, this.UI_TEXT_STYLE);
      container.add(nameText);

      const levelText = this.add.text(5, 35, `Lv:${monster.level}`, this.UI_TEXT_STYLE);
      container.add(levelText);

      // HP bar
      const hpBarContainer = this.createHealthBar(5, 65, monster.currentHP, monster.maxHP);
      container.add(hpBarContainer);

      // Status text
      const statusText = this.add.text(5, 85, monster.isFainted ? 'FAINTED' : 'OK', {
        ...this.UI_TEXT_STYLE,
        fontSize: '18px',
        color: monster.isFainted ? '#FF0000' : '#00FF00',
      });
      container.add(statusText);

      // HP text
      const hpText = this.add.text(300, 65, `${monster.currentHP}/${monster.maxHP}`, this.UI_TEXT_STYLE);
      container.add(hpText);
      this.healthBarTextGameObjects.push(hpText);
    });
  }

  /**
   * Create health bar for monster
   */
  private createHealthBar(x: number, y: number, currentHP: number, maxHP: number): GameObjects.Container {
    const container = this.add.container(x, y);

    // Background
    const background = this.add.rectangle(0, 0, 300, 20, 0x333333);
    background.setOrigin(0);
    container.add(background);

    // HP bar
    const hpRatio = Math.max(0, currentHP / maxHP);
    const hpColor = hpRatio > 0.5 ? 0x00FF00 : hpRatio > 0.25 ? 0xFFFF00 : 0xFF0000;
    const hpBar = this.add.rectangle(2, 2, 296 * hpRatio, 16, hpColor);
    hpBar.setOrigin(0);
    container.add(hpBar);

    this.healthBars.push(container);
    return container;
  }

  /**
   * Create cancel button
   */
  private createCancelButton() {
    this.cancelButton = this.add.image(500, 580, UI_ASSET_KEYS.CURSOR);
    this.cancelButton.setScale(2);
    const cancelText = this.add.text(520, 570, 'CANCEL', this.UI_TEXT_STYLE);
  }

  /**
   * Create info text
   */
  private createInfoText() {
    this.infoTextGameObject = this.add.text(25, 620, '', {
      ...this.UI_TEXT_STYLE,
      wordWrap: { width: this.scale.width - 50 },
    });
  }

  /**
   * Update selected info text
   */
  private updateSelectedInfoText() {
    if (!this.infoTextGameObject) return;

    if (this.selectedPartyMonsterIndex >= this.monsters.length) {
      this.infoTextGameObject.setText('Cancel selection and go back to previous scene.');
      return;
    }

    const selectedMonster = this.monsters[this.selectedPartyMonsterIndex];
    const species = CritterSpeciesDatabase.getSpecies(selectedMonster.speciesId);
    const displayName = selectedMonster.nickname || species?.name || 'Unknown';
    
    let infoText = `${displayName} is selected.`;
    
    if (this.sceneData.itemSelected) {
      infoText += ` Use ${this.sceneData.itemSelected.name} on ${displayName}?`;
    } else if (this.sceneData.activeBattleMonsterPartyIndex !== undefined) {
      infoText += ` Switch ${displayName} into battle?`;
    } else {
      infoText += ' Choose an action.';
    }

    this.infoTextGameObject.setText(infoText);
  }

  /**
   * Setup input handling
   */
  private setupInput() {
    // Direction keys
    this.input.keyboard?.on('keydown-UP', () => {
      if (this.waitingForInput) return;
      
      this.selectedPartyMonsterIndex -= 2;
      if (this.selectedPartyMonsterIndex < 0) {
        this.selectedPartyMonsterIndex = Math.max(0, this.monsters.length - 1);
        if (this.selectedPartyMonsterIndex % 2 === 0) {
          this.selectedPartyMonsterIndex = Math.min(this.monsters.length, this.selectedPartyMonsterIndex + 1);
        }
      }
      this.updateSelectedInfoText();
    });

    this.input.keyboard?.on('keydown-DOWN', () => {
      if (this.waitingForInput) return;
      
      this.selectedPartyMonsterIndex += 2;
      if (this.selectedPartyMonsterIndex > this.monsters.length) {
        this.selectedPartyMonsterIndex = this.monsters.length;
      }
      this.updateSelectedInfoText();
    });

    this.input.keyboard?.on('keydown-LEFT', () => {
      if (this.waitingForInput) return;
      
      if (this.selectedPartyMonsterIndex % 2 === 1) {
        this.selectedPartyMonsterIndex -= 1;
      }
      this.updateSelectedInfoText();
    });

    this.input.keyboard?.on('keydown-RIGHT', () => {
      if (this.waitingForInput) return;
      
      if (this.selectedPartyMonsterIndex % 2 === 0 && this.selectedPartyMonsterIndex < this.monsters.length) {
        this.selectedPartyMonsterIndex += 1;
      }
      this.updateSelectedInfoText();
    });

    // Confirm key
    this.input.keyboard?.on('keydown-ENTER', () => {
      this.handleConfirmKey();
    });

    this.input.keyboard?.on('keydown-Z', () => {
      this.handleConfirmKey();
    });

    // Cancel key
    this.input.keyboard?.on('keydown-ESC', () => {
      this.handleCancelKey();
    });

    this.input.keyboard?.on('keydown-X', () => {
      this.handleCancelKey();
    });
  }

  /**
   * Handle confirm key press
   */
  private handleConfirmKey() {
    if (this.waitingForInput) return;

    if (this.selectedPartyMonsterIndex >= this.monsters.length) {
      this.goBackToPreviousScene(false);
      return;
    }

    const selectedMonster = this.monsters[this.selectedPartyMonsterIndex];

    if (this.sceneData.itemSelected) {
      // Use item on selected monster
      this.useItemOnMonster(selectedMonster);
    } else if (this.sceneData.activeBattleMonsterPartyIndex !== undefined) {
      // Switch monster in battle
      this.switchMonsterInBattle(selectedMonster);
    } else {
      // Show monster details
      this.showMonsterDetails(selectedMonster);
    }
  }

  /**
   * Handle cancel key press
   */
  private handleCancelKey() {
    if (this.waitingForInput) {
      this.waitingForInput = false;
      this.updateSelectedInfoText();
      return;
    }

    this.goBackToPreviousScene(false);
  }

  /**
   * Use item on monster
   */
  private useItemOnMonster(monster: ICritter) {
    if (!this.sceneData.itemSelected) return;

    // For now, just mark item as used and go back
    // In a full implementation, you would apply item effects
    EventBus.emit('monsterParty:itemUsed', { 
      item: this.sceneData.itemSelected, 
      monsterId: monster.id 
    });

    this.goBackToPreviousScene(true);
  }

  /**
   * Switch monster in battle
   */
  private switchMonsterInBattle(monster: ICritter) {
    if (monster.isFainted && this.sceneData.activeMonsterKnockedOut) {
      if (this.infoTextGameObject) {
        this.infoTextGameObject.setText(`${monster.nickname || monster.speciesId} is unable to battle!`);
      }
      this.waitingForInput = true;
      return;
    }

    EventBus.emit('monsterParty:monsterSwitched', { 
      monsterId: monster.id,
      battleIndex: this.sceneData.activeBattleMonsterPartyIndex 
    });

    this.goBackToPreviousScene(true);
  }

  /**
   * Show monster details
   */
  private showMonsterDetails(monster: ICritter) {
    this.scene.launch('MonsterDetails', { monster });
    this.scene.pause('MonsterParty');
  }

  /**
   * Go back to previous scene
   */
  private goBackToPreviousScene(wasActionTaken: boolean) {
    const sceneDataToPass: MonsterPartySceneResumeData = {
      wasItemUsed: this.sceneData.itemSelected ? wasActionTaken : undefined,
      switchedMonster: this.sceneData.activeBattleMonsterPartyIndex !== undefined ? wasActionTaken : undefined,
    };

    this.scene.stop('MonsterParty');
    this.scene.resume(this.sceneData.previousSceneName, sceneDataToPass);
    
    EventBus.emit('monsterParty:closed', { 
      wasActionTaken,
      previousScene: this.sceneData.previousSceneName 
    });
  }

  /**
   * Handle scene resume
   */
  handleSceneResume(data?: MonsterPartySceneResumeData) {
    // Refresh monster data in case it changed
    this.monsters = this.legacyDataManager.getParty();
    this.updateSelectedInfoText();
  }

  shutdown() {
    EventBus.off('monsterParty:ready');
    EventBus.off('monsterParty:itemUsed');
    EventBus.off('monsterParty:monsterSwitched');
    EventBus.off('monsterParty:closed');
  }
}