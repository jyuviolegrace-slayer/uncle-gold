import { Scene, GameObjects } from 'phaser';
import { BattleHealthBar } from './BattleHealthBar';
import { ICritter } from '../models';
import { CritterSpeciesDatabase } from '../models';

/**
 * Configuration for battle UI
 */
export interface IBattleUIConfig {
  width: number;
  height: number;
}

/**
 * BattleUIManager - Manages all battle UI elements
 * Combines UI creation, layout, and management from legacy battle-menu.js
 */
export class BattleUIManager {
  private scene: Scene;
  private width: number;
  private height: number;

  private playerSpriteContainer: GameObjects.Container | null = null;
  private opponentSpriteContainer: GameObjects.Container | null = null;
  private playerHealthBar: BattleHealthBar | null = null;
  private opponentHealthBar: BattleHealthBar | null = null;
  private playerNameText: GameObjects.Text | null = null;
  private opponentNameText: GameObjects.Text | null = null;
  private messageText: GameObjects.Text | null = null;
  private actionMenuContainer: GameObjects.Container | null = null;

  constructor(scene: Scene, config: IBattleUIConfig) {
    this.scene = scene;
    this.width = config.width;
    this.height = config.height;
  }

  /**
   * Setup battle sprites and names
   */
  setupBattleSprites(playerCritter: ICritter, opponentCritter: ICritter): void {
    const playerSpecies = CritterSpeciesDatabase.getSpecies(playerCritter.speciesId);
    const opponentSpecies = CritterSpeciesDatabase.getSpecies(opponentCritter.speciesId);

    this.playerSpriteContainer = this.scene.add.container(100, this.height - 150);
    const playerSprite = this.scene.add.rectangle(0, 0, 80, 80, 0x4169E1);
    this.playerNameText = this.scene.add.text(0, 60, `${playerSpecies?.name}\nLv. ${playerCritter.level}`, {
      font: '12px Arial',
      color: '#ffffff',
      align: 'center',
    });
    this.playerNameText.setOrigin(0.5);
    this.playerSpriteContainer.add([playerSprite, this.playerNameText]);

    this.opponentSpriteContainer = this.scene.add.container(this.width - 100, 150);
    const opponentSprite = this.scene.add.rectangle(0, 0, 80, 80, 0xff4444);
    this.opponentNameText = this.scene.add.text(0, 60, `${opponentSpecies?.name}\nLv. ${opponentCritter.level}`, {
      font: '12px Arial',
      color: '#ffffff',
      align: 'center',
    });
    this.opponentNameText.setOrigin(0.5);
    this.opponentSpriteContainer.add([opponentSprite, this.opponentNameText]);
  }

  /**
   * Setup health bars
   */
  setupHealthBars(playerCritter: ICritter, opponentCritter: ICritter): void {
    this.playerHealthBar = new BattleHealthBar(this.scene, {
      x: 120,
      y: this.height - 100,
      width: 120,
      height: 15,
      healthColor: 0x00ff00,
    });
    this.playerHealthBar.updateHealth(playerCritter.currentHP, playerCritter.maxHP, 0);

    this.opponentHealthBar = new BattleHealthBar(this.scene, {
      x: this.width - 240,
      y: 100,
      width: 120,
      height: 15,
      healthColor: 0x00ff00,
    });
    this.opponentHealthBar.updateHealth(opponentCritter.currentHP, opponentCritter.maxHP, 0);
  }

  /**
   * Setup message display
   */
  setupMessageText(): void {
    this.messageText = this.scene.add.text(this.width / 2, 30, 'Battle Start!', {
      font: '16px Arial',
      color: '#ffffff',
      align: 'center',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 },
    });
    this.messageText.setOrigin(0.5);
    this.messageText.setScrollFactor(0);
    this.messageText.setDepth(1000);
  }

  /**
   * Setup action menu container
   */
  setupActionMenu(): void {
    this.actionMenuContainer = this.scene.add.container(this.width / 2 - 200, this.height - 200);
    this.actionMenuContainer.setDepth(100);
  }

  /**
   * Update message text
   */
  setMessageText(text: string): void {
    if (this.messageText) {
      this.messageText.setText(text);
    }
  }

  /**
   * Update health bar for player
   */
  updatePlayerHealthBar(currentHP: number, maxHP: number): void {
    this.playerHealthBar?.updateHealth(currentHP, maxHP);
  }

  /**
   * Update health bar for opponent
   */
  updateOpponentHealthBar(currentHP: number, maxHP: number): void {
    this.opponentHealthBar?.updateHealth(currentHP, maxHP);
  }

  /**
   * Get action menu container
   */
  getActionMenuContainer(): GameObjects.Container | null {
    return this.actionMenuContainer;
  }

  /**
   * Get player sprite container
   */
  getPlayerSpriteContainer(): GameObjects.Container | null {
    return this.playerSpriteContainer;
  }

  /**
   * Get opponent sprite container
   */
  getOpponentSpriteContainer(): GameObjects.Container | null {
    return this.opponentSpriteContainer;
  }

  /**
   * Get message text
   */
  getMessageText(): GameObjects.Text | null {
    return this.messageText;
  }

  /**
   * Clear action menu
   */
  clearActionMenu(): void {
    if (this.actionMenuContainer) {
      this.actionMenuContainer.removeAll(true);
    }
  }

  /**
   * Set action menu visibility
   */
  setActionMenuVisible(visible: boolean): void {
    if (this.actionMenuContainer) {
      this.actionMenuContainer.setVisible(visible);
    }
  }

  /**
   * Get action menu visibility
   */
  getActionMenuVisible(): boolean {
    return this.actionMenuContainer?.visible ?? false;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.playerSpriteContainer?.destroy();
    this.opponentSpriteContainer?.destroy();
    this.playerHealthBar?.destroy();
    this.opponentHealthBar?.destroy();
    this.messageText?.destroy();
    this.actionMenuContainer?.destroy();
  }
}
