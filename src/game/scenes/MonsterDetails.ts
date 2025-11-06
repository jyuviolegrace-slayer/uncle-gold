import { BaseScene } from './common/BaseScene';
import { SceneKeys } from '../assets/SceneKeys';
import { TextureKeys } from '../assets/TextureKeys';
import { FontKeys } from '../assets/FontKeys';
import { CritterInstance } from '../models/critter';
import { ExpBar } from '../ui/ExpBar';
import { dataLoader } from '../data/DataLoader';

const UI_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  color: '#FFFFFF',
  fontSize: '24px',
};

const MONSTER_MOVE_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  color: '#000000',
  fontSize: '40px',
};

const MONSTER_EXP_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  color: '#000000',
  fontSize: '22px',
};

export interface MonsterDetailsSceneData {
  monster: CritterInstance;
}

/**
 * MonsterDetailsScene - Shows detailed information about a monster
 * Ported from archive/src/scenes/monster-details-scene.js to TypeScript
 */
export class MonsterDetailsScene extends BaseScene {
  private monsterDetails: CritterInstance;
  private monsterAttacks: any[];

  constructor() {
    super(SceneKeys.MONSTER_DETAILS);
  }

  init(data: MonsterDetailsSceneData): void {
    super.init(data);

    this.monsterDetails = data.monster;

    // Added for testing from preload scene directly
    if (this.monsterDetails === undefined) {
      // This would need to be adapted to use the new DataManager
      console.warn('[MonsterDetailsScene:init] No monster data provided');
    }

    this.monsterAttacks = [];
    this.monsterDetails.attackIds.forEach((attackId) => {
      const monsterAttack = dataLoader.getMoveById(attackId.toString());
      if (monsterAttack !== undefined) {
        this.monsterAttacks.push(monsterAttack);
      }
    });
  }

  create(): void {
    super.create();

    // Create main background and title
    this.add.image(0, 0, TextureKeys.MONSTER_DETAILS_BACKGROUND).setOrigin(0);
    this.add.text(10, 0, 'Monster Details', {
      ...UI_TEXT_STYLE,
      fontSize: '48px',
    });

    // Add monster details
    this.add.text(20, 60, `Lv. ${this.monsterDetails.currentLevel}`, {
      ...UI_TEXT_STYLE,
      fontSize: '40px',
    });
    this.add.text(200, 60, this.monsterDetails.name, {
      ...UI_TEXT_STYLE,
      fontSize: '40px',
    });
    this.add.image(160, 310, this.monsterDetails.assetKey).setOrigin(0, 1).setScale(0.7);

    // Display monster moves
    if (this.monsterAttacks[0] !== undefined) {
      this.add.text(560, 82, this.monsterAttacks[0].name, MONSTER_MOVE_TEXT_STYLE);
    }

    if (this.monsterAttacks[1] !== undefined) {
      this.add.text(560, 162, this.monsterAttacks[1].name, MONSTER_MOVE_TEXT_STYLE);
    }

    if (this.monsterAttacks[2] !== undefined) {
      this.add.text(560, 242, this.monsterAttacks[2].name, MONSTER_MOVE_TEXT_STYLE);
    }

    if (this.monsterAttacks[3] !== undefined) {
      this.add.text(560, 322, this.monsterAttacks[3].name, MONSTER_MOVE_TEXT_STYLE);
    }

    // Add monster exp details
    this.add.text(20, 340, 'Current Exp.', MONSTER_EXP_TEXT_STYLE).setOrigin(0, 0);
    this.add.text(516, 340, `${this.monsterDetails.currentExp}`, MONSTER_EXP_TEXT_STYLE).setOrigin(1, 0);
    this.add.text(20, 365, 'Exp. to next level', MONSTER_EXP_TEXT_STYLE);
    this.add
      .text(
        516,
        365,
        `${this.expNeededForNextLevel(this.monsterDetails.currentLevel, this.monsterDetails.currentExp)}`,
        MONSTER_EXP_TEXT_STYLE
      )
      .setOrigin(1, 0);
    this.add.text(108, 392, 'EXP', {
      fontFamily: 'Arial, Helvetica, sans-serif',
      color: '#6505FF',
      fontSize: '14px',
      fontStyle: 'italic',
    });
    
    const expBar = new ExpBar(this, {
      x: 70,
      y: 200,
      width: 200,
      height: 20,
      backgroundColor: 0x333333,
      fillColor: 0x2196F3,
      critter: this.monsterDetails,
    });

    this.scene.bringToTop(SceneKeys.MONSTER_DETAILS);
  }

  update(time: number, delta: number): void {
    super.update(time, delta);

    if (this.isInputLocked()) {
      return;
    }

    if (this.inputManager.wasBackKeyPressed()) {
      this.goBackToPreviousScene();
      return;
    }

    if (this.inputManager.wasSpaceKeyPressed()) {
      this.goBackToPreviousScene();
      return;
    }
  }

  private goBackToPreviousScene(): void {
    this.lockInput();
    this.scene.stop(SceneKeys.MONSTER_DETAILS);
    this.scene.resume(SceneKeys.MONSTER_PARTY);
  }

  /**
   * Calculate the current value for the exp bar as a percentage
   */
  private calculateExpBarCurrentValue(currentLevel: number, currentExp: number): number {
    // This is a simplified calculation - in a real implementation, this would use the actual leveling formula
    const expForCurrentLevel = currentLevel * 100; // Simplified formula
    const expForNextLevel = (currentLevel + 1) * 100; // Simplified formula
    const expNeeded = expForNextLevel - expForCurrentLevel;
    const expProgress = currentExp - expForCurrentLevel;
    
    return Math.max(0, Math.min(1, expProgress / expNeeded));
  }

  /**
   * Calculate experience needed for next level
   */
  private expNeededForNextLevel(currentLevel: number, currentExp: number): number {
    // Simplified calculation - in a real implementation, this would use the actual leveling formula
    const expForNextLevel = (currentLevel + 1) * 100;
    return Math.max(0, expForNextLevel - currentExp);
  }
}