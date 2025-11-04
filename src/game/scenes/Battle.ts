import { Scene, GameObjects } from 'phaser';
import { EventBus } from '../EventBus';
import { SceneContext } from './SceneContext';
import { BattleManager, Critter } from '../models';

/**
 * Battle Scene - Turn-based battle system
 * Handles battle UI, move selection, and battle resolution
 */
export class Battle extends Scene {
  private battleManager: BattleManager | null = null;
  private gameStateManager = SceneContext.getInstance().getGameStateManager();
  private battleText: GameObjects.Text | null = null;
  private playerCritterText: GameObjects.Text | null = null;
  private enemyCritterText: GameObjects.Text | null = null;
  private actionButtonsContainer: GameObjects.Container | null = null;
  private selectedActionIndex: number = 0;

  constructor() {
    super('Battle');
  }

  init(data: any) {
    if (data?.battleManager) {
      this.battleManager = data.battleManager;
    }
  }

  create() {
    this.setupBattleUI();
    this.setupBattle();
    this.setupInput();

    if (!this.scene.isActive('HUD')) {
      this.scene.launch('HUD');
    }

    EventBus.emit('current-scene-ready', this);
  }

  private setupBattleUI() {
    const width = this.game.config.width as number;
    const height = this.game.config.height as number;

    const background = this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a1a);
    background.setScrollFactor(0).setDepth(-1);

    this.battleText = this.add.text(width / 2, 20, 'Battle Started!', {
      font: '18px Arial',
      color: '#ffffff',
    });
    this.battleText.setOrigin(0.5);

    this.playerCritterText = this.add.text(50, 200, 'Player Critter', {
      font: '14px Arial',
      color: '#00ff00',
    });

    this.enemyCritterText = this.add.text(width - 200, 200, 'Enemy Critter', {
      font: '14px Arial',
      color: '#ff0000',
    });

    this.actionButtonsContainer = this.add.container(width / 2 - 150, height - 150).setDepth(100);

    this.createActionButtons();
  }

  private createActionButtons() {
    if (!this.actionButtonsContainer) return;

    const actions = ['Fight', 'Bag', 'Party', 'Flee'];
    const width = 120;
    const height = 30;

    actions.forEach((action, index) => {
      const x = (index % 2) * (width + 20);
      const y = Math.floor(index / 2) * (height + 10);

      const button = this.add.rectangle(x + width / 2, y + height / 2, width, height, 0x4444ff);
      const text = this.add.text(x + width / 2, y + height / 2, action, {
        font: '12px Arial',
        color: '#ffffff',
      });
      text.setOrigin(0.5);

      this.actionButtonsContainer?.add([button, text]);
    });
  }

  private setupBattle() {
    const party = this.gameStateManager.getParty();
    if (party.length === 0) {
      this.battleText?.setText('No critters in party! Returning...');
      this.time.delayedCall(1500, () => {
        this.scene.start('Overworld');
      });
      return;
    }

    if (!this.battleManager) {
      const playerCritter = party[0];
      const enemyCritter = new Critter('sparkit', 5);
      
      const battle = BattleManager.createBattle(
        'player-1',
        this.gameStateManager.getPlayerState().name,
        [playerCritter],
        'wild-1',
        'Wild Critter',
        [enemyCritter],
        true
      );
      
      this.battleManager = new BattleManager(battle);
      EventBus.emit('battle:started', { battleManager: this.battleManager });
    }

    this.updateBattleDisplay();
  }

  private setupInput() {
    this.input.keyboard?.on('keydown-Z', () => {
      this.handleAction('fight');
    });

    this.input.keyboard?.on('keydown-X', () => {
      this.handleAction('bag');
    });

    this.input.keyboard?.on('keydown-C', () => {
      this.handleAction('party');
    });

    this.input.keyboard?.on('keydown-V', () => {
      this.handleAction('flee');
    });
  }

  private handleAction(action: string) {
    if (!this.battleManager) return;

    switch (action) {
      case 'fight':
        this.performAttack();
        break;
      case 'bag':
        this.battleText?.setText('Bag option - not yet implemented');
        break;
      case 'party':
        this.battleText?.setText('Party switch - not yet implemented');
        break;
      case 'flee':
        this.attemptFlee();
        break;
    }
  }

  private performAttack() {
    this.battleText?.setText('Performing attack...');
    this.time.delayedCall(1000, () => {
      this.endBattle();
    });
  }

  private attemptFlee() {
    this.battleText?.setText('Fled from battle!');
    this.time.delayedCall(1000, () => {
      EventBus.emit('battle:ended', { result: 'flee' });
      this.scene.start('Overworld');
    });
  }

  private endBattle() {
    this.battleText?.setText('Battle ended! Returning to Overworld...');
    this.time.delayedCall(1500, () => {
      EventBus.emit('battle:ended', { result: 'victory' });
      this.scene.start('Overworld');
    });
  }

  private updateBattleDisplay() {
    if (!this.battleManager) return;

    const battle = this.battleManager.getBattle();
    const playerCritter = this.battleManager.getActiveCritter(battle.player.id);
    const enemyCritter = this.battleManager.getActiveCritter(battle.opponent.id);

    if (!playerCritter || !enemyCritter) return;

    const playerHPPercent = (playerCritter.currentHP / playerCritter.maxHP) * 100;
    const enemyHPPercent = (enemyCritter.currentHP / enemyCritter.maxHP) * 100;

    if (this.playerCritterText) {
      this.playerCritterText.setText(
        `${playerCritter.nickname || 'Player Critter'}\nLvl ${playerCritter.level}\nHP: ${playerHPPercent.toFixed(0)}%`
      );
    }

    if (this.enemyCritterText) {
      this.enemyCritterText.setText(
        `${enemyCritter.nickname || 'Wild Critter'}\nLvl ${enemyCritter.level}\nHP: ${enemyHPPercent.toFixed(0)}%`
      );
    }
  }

  update() {
    this.updateBattleDisplay();
  }
}
