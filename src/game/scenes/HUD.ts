import { Scene, GameObjects } from 'phaser';
import { EventBus } from '../EventBus';
import { SceneContext } from './SceneContext';

/**
 * HUD Scene - Shared UI layer displayed across game scenes
 * Shows player info: money, badges, party status
 */
export class HUD extends Scene {
  private moneyText: GameObjects.Text | null = null;
  private badgesText: GameObjects.Text | null = null;
  private partyStatusContainer: GameObjects.Container | null = null;
  private gameStateManager = SceneContext.getInstance().getGameStateManager();

  constructor() {
    super('HUD');
  }

  create() {
    const width = this.game.config.width as number;
    const height = this.game.config.height as number;

    this.moneyText = this.add
      .text(width - 150, 10, `Money: $0`, {
        font: '14px Arial',
        color: '#ffffff',
      })
      .setScrollFactor(0)
      .setDepth(1000);

    this.badgesText = this.add
      .text(10, 10, `Badges: 0`, {
        font: '14px Arial',
        color: '#ffffff',
      })
      .setScrollFactor(0)
      .setDepth(1000);

    this.partyStatusContainer = this.add.container(width - 150, 40).setScrollFactor(0).setDepth(1000);

    this.setupEventListeners();
    this.updateDisplay();

    EventBus.emit('current-scene-ready', this);
  }

  private setupEventListeners() {
    EventBus.on('money:updated', (data: { money: number }) => {
      this.updateMoneyDisplay(data.money);
    });

    EventBus.on('badge:earned', (data: { badgeId: string; totalBadges: number }) => {
      this.updateBadgesDisplay(data.totalBadges);
    });

    EventBus.on('party:updated', () => {
      this.updatePartyStatus();
    });
  }

  private updateDisplay() {
    const playerState = this.gameStateManager.getPlayerState();
    this.updateMoneyDisplay(playerState.money);
    this.updateBadgesDisplay(playerState.badges.length);
    this.updatePartyStatus();
  }

  private updateMoneyDisplay(money: number) {
    if (this.moneyText) {
      this.moneyText.setText(`Money: $${money}`);
    }
  }

  private updateBadgesDisplay(count: number) {
    if (this.badgesText) {
      this.badgesText.setText(`Badges: ${count}`);
    }
  }

  private updatePartyStatus() {
    if (this.partyStatusContainer) {
      this.partyStatusContainer.removeAll(true);
      const party = this.gameStateManager.getParty();
      
      party.forEach((critter, index) => {
        const y = index * 20;
        const healthPercent = (critter.currentHP / critter.maxHP) * 100;
        const healthColor = healthPercent > 50 ? '#00ff00' : healthPercent > 20 ? '#ffff00' : '#ff0000';
        
        this.partyStatusContainer?.add(
          this.add.text(0, y, `${critter.nickname || 'Critter'} HP: ${healthPercent.toFixed(0)}%`, {
            font: '12px Arial',
            color: healthColor,
          })
        );
      });
    }
  }

  shutdown() {
    EventBus.off('money:updated');
    EventBus.off('badge:earned');
    EventBus.off('party:updated');
  }
}
