import { Scene, GameObjects } from 'phaser';
import { EventBus } from '../EventBus';
import { SceneContext } from './SceneContext';
import {
  BattleManager,
  Critter,
  MoveDatabase,
  CritterSpeciesDatabase,
  ICritter,
  ItemDatabase,
  TrainerDatabase,
} from '../models';
import { AnimationManager, PoolManager, DamageNumber, AudioManager } from '../managers';
import { BattleBackground, CaptureOrb, BattleUIManager, BattleStateMachine } from '../battle';

/**
 * Battle Scene - Full-featured turn-based battle system with UI
 * Ported from legacy battle-scene.js with TypeScript architecture
 * Manages battle flow, UI, animations, and state transitions
 */
export class Battle extends Scene {
  private battleManager: BattleManager | null = null;
  private gameStateManager = SceneContext.getInstance().getGameStateManager();
  private animationManager: AnimationManager | null = null;
  private poolManager: PoolManager | null = null;
  private audioManager: AudioManager | null = null;
  private uiManager: BattleUIManager | null = null;
  private background: BattleBackground | null = null;
  private captureOrb: CaptureOrb | null = null;
  private stateMachine: BattleStateMachine | null = null;

  private battleState: 'menu' | 'selecting-move' | 'executing-turn' | 'selecting-party' | 'selecting-item' | 'ended' = 'menu';
  private selectedMoveIndex: number = 0;
  private selectedPartyIndex: number = 0;
  private selectedItemIndex: number = 0;
  private encounterData: any = null;
  private skipAnimations: boolean = false;

  constructor() {
    super('Battle');
  }

  init(data: any) {
    this.encounterData = data || {};
  }

  create() {
    try {
      const width = this.game.config.width as number;
      const height = this.game.config.height as number;

      this.setupManagers();
      this.setupBattle();
      this.setupBackground();
      this.setupUI(width, height);
      this.setupStateMachine();
      this.setupInput();

      if (!this.scene.isActive('HUD')) {
        this.scene.launch('HUD');
      }

      EventBus.emit('battle:start', {
        isWildEncounter: this.battleManager?.getBattle().isWildEncounter || false,
      });
      EventBus.emit('current-scene-ready', this);
    } catch (error) {
      console.error('Error creating Battle scene:', error);
      this.returnToOverworld();
    }
  }

  /**
   * Setup all manager instances
   */
  private setupManagers(): void {
    this.animationManager = new AnimationManager(this);
    this.poolManager = new PoolManager(this);
    this.poolManager.createPool('damageNumber', DamageNumber, { maxSize: 20 });
    this.audioManager = new AudioManager(this);
  }

  /**
   * Initialize battle with participants
   */
  private setupBattle(): void {
    const party = this.gameStateManager.getParty();
    if (party.length === 0) {
      throw new Error('No critters in party');
    }

    if (!this.battleManager) {
      const playerParty = party;
      let opponentParty: ICritter[] = [];
      let isWildEncounter = false;

      if (this.encounterData?.wildCritter) {
        isWildEncounter = true;
        opponentParty = [this.encounterData.wildCritter];
      } else if (this.encounterData?.trainerId) {
        isWildEncounter = false;
        TrainerDatabase.initialize();
        const trainer = TrainerDatabase.getTrainer(this.encounterData.trainerId);
        opponentParty = TrainerDatabase.getTrainerParty(this.encounterData.trainerId);

        if (trainer?.badge) {
          this.encounterData.trainer = trainer;
          this.encounterData.badgeName = trainer.badge;
        }
      } else {
        isWildEncounter = false;
        opponentParty = [new Critter('sparkit', 5)];
      }

      const battle = BattleManager.createBattle(
        'player-1',
        this.gameStateManager.getPlayerState().name,
        playerParty,
        this.encounterData?.trainerId || 'wild-1',
        this.encounterData?.trainerName || 'Wild Critter',
        opponentParty,
        isWildEncounter
      );

      this.battleManager = new BattleManager(battle);
      MoveDatabase.initialize();
    }
  }

  /**
   * Setup background
   */
  private setupBackground(): void {
    this.background = new BattleBackground(this);
    this.background.showForest();
  }

  /**
   * Setup UI elements
   */
  private setupUI(width: number, height: number): void {
    if (!this.battleManager) return;

    this.uiManager = new BattleUIManager(this, { width, height });

    const battle = this.battleManager.getBattle();
    const playerCritter = this.battleManager.getActiveCritter(battle.player.id);
    const opponentCritter = this.battleManager.getActiveCritter(battle.opponent.id);

    if (playerCritter && opponentCritter) {
      this.uiManager.setupBattleSprites(playerCritter, opponentCritter);
      this.uiManager.setupHealthBars(playerCritter, opponentCritter);
      this.uiManager.setupMessageText();
      this.uiManager.setupActionMenu();

      this.createMainActionMenu();
    }
  }

  /**
   * Setup state machine for battle flow
   */
  private setupStateMachine(): void {
    this.stateMachine = new BattleStateMachine();
  }

  /**
   * Setup input handlers (keyboard + mouse)
   */
  private setupInput(): void {
    if (!this.input.keyboard) return;

    this.input.keyboard.on('keydown-UP', () => this.handleUpInput());
    this.input.keyboard.on('keydown-DOWN', () => this.handleDownInput());
    this.input.keyboard.on('keydown-LEFT', () => this.handleLeftInput());
    this.input.keyboard.on('keydown-RIGHT', () => this.handleRightInput());
    this.input.keyboard.on('keydown-Z', () => this.handleConfirmInput());
    this.input.keyboard.on('keydown-X', () => this.handleCancelInput());
  }

  private handleUpInput(): void {
    if (this.battleState === 'selecting-move' || this.battleState === 'selecting-party' || this.battleState === 'selecting-item') {
      this.selectedMoveIndex = Math.max(0, this.selectedMoveIndex - 1);
      this.updateMenuDisplay();
    }
  }

  private handleDownInput(): void {
    if (this.battleState === 'selecting-move' || this.battleState === 'selecting-party' || this.battleState === 'selecting-item') {
      this.selectedMoveIndex = Math.min(3, this.selectedMoveIndex + 1);
      this.updateMenuDisplay();
    }
  }

  private handleLeftInput(): void {
    if (this.battleState === 'selecting-move' && this.selectedMoveIndex >= 2) {
      this.selectedMoveIndex -= 2;
      this.updateMenuDisplay();
    }
  }

  private handleRightInput(): void {
    if (this.battleState === 'selecting-move' && this.selectedMoveIndex < 2) {
      this.selectedMoveIndex += 2;
      this.updateMenuDisplay();
    }
  }

  private handleConfirmInput(): void {
    if (this.battleState === 'menu') {
      const action = this.getActionAtIndex(this.selectedMoveIndex);
      if (action) {
        this.handleActionSelect(action);
      }
    } else if (this.battleState === 'selecting-move') {
      this.handleMoveSelect(this.selectedMoveIndex);
    } else if (this.battleState === 'selecting-party') {
      this.switchPartyMember(this.selectedMoveIndex);
    } else if (this.battleState === 'selecting-item') {
      if (!this.battleManager) return;
      const battle = this.battleManager.getBattle();
      const inventory = this.gameStateManager.getPlayerState().inventory;
      const items = Array.from(inventory.items.entries());
      if (this.selectedMoveIndex < items.length) {
        const [itemId] = items[this.selectedMoveIndex];
        this.handleItemSelect(itemId);
      }
    }
  }

  private handleCancelInput(): void {
    if (this.battleState !== 'menu' && this.battleState !== 'executing-turn' && this.battleState !== 'ended') {
      this.createMainActionMenu();
    }
  }

  private getActionAtIndex(index: number): string | null {
    if (!this.battleManager) return null;
    const battle = this.battleManager.getBattle();
    const isWildEncounter = battle?.isWildEncounter || false;
    const actions = isWildEncounter ? ['Fight', 'Bag', 'Party', 'Flee'] : ['Fight', 'Bag', 'Party', 'Switch'];
    return actions[index] || null;
  }

  private updateMenuDisplay(): void {
    if (this.battleState === 'menu') {
      this.createMainActionMenu();
    } else if (this.battleState === 'selecting-move') {
      this.createMoveMenu();
    } else if (this.battleState === 'selecting-party') {
      this.createPartyMenu();
    } else if (this.battleState === 'selecting-item') {
      this.createItemMenu();
    }
  }

  /**
   * Create main action menu (Fight, Bag, Party, Flee/Switch)
   */
  private createMainActionMenu(): void {
    if (!this.uiManager || !this.battleManager) return;

    this.uiManager.clearActionMenu();
    const container = this.uiManager.getActionMenuContainer();
    if (!container) return;

    const battle = this.battleManager.getBattle();
    const isWildEncounter = battle?.isWildEncounter || false;
    const actions = isWildEncounter ? ['Fight', 'Bag', 'Party', 'Flee'] : ['Fight', 'Bag', 'Party', 'Switch'];

    actions.forEach((action, index) => {
      const x = (index % 2) * 200;
      const y = Math.floor(index / 2) * 40;

      const button = this.add.rectangle(x + 90, y + 20, 180, 35, 0x4444ff);
      button.setInteractive();
      button.on('pointerdown', () => this.handleActionSelect(action));
      button.on('pointerover', () => button.setFillStyle(0x6666ff));
      button.on('pointerout', () => button.setFillStyle(0x4444ff));

      const text = this.add.text(x + 90, y + 20, action, {
        font: 'bold 14px Arial',
        color: '#ffffff',
      });
      text.setOrigin(0.5);

      container.add([button, text]);
    });

    this.battleState = 'menu';
    this.selectedMoveIndex = 0;
  }

  /**
   * Create move selection menu
   */
  private createMoveMenu(): void {
    if (!this.uiManager || !this.battleManager) return;

    const battle = this.battleManager.getBattle();
    const playerCritter = this.battleManager.getActiveCritter(battle.player.id);
    if (!playerCritter) return;

    this.uiManager.clearActionMenu();
    const container = this.uiManager.getActionMenuContainer();
    if (!container) return;

    const moves = playerCritter.moves.slice(0, 4);

    moves.forEach((moveInstance, index) => {
      const move = MoveDatabase.getMove(moveInstance.moveId);
      if (!move) return;

      const x = (index % 2) * 200;
      const y = Math.floor(index / 2) * 40;

      const isSelected = index === this.selectedMoveIndex;
      const color = isSelected ? 0x6666ff : 0x4444ff;

      const button = this.add.rectangle(x + 90, y + 20, 180, 35, color);
      button.setInteractive();
      button.on('pointerdown', () => this.handleMoveSelect(index));
      button.on('pointerover', () => button.setFillStyle(0x6666ff));
      button.on('pointerout', () => button.setFillStyle(color));

      const ppText = moveInstance.currentPP > 0 ? `${moveInstance.currentPP}/${moveInstance.maxPP}` : 'PP: 0';
      const text = this.add.text(x + 90, y + 20, `${move.name}\n${ppText}`, {
        font: 'bold 12px Arial',
        color: '#ffffff',
        align: 'center',
      });
      text.setOrigin(0.5);

      container.add([button, text]);
    });

    const backButton = this.add.rectangle(90, 160, 180, 35, 0xff4444);
    backButton.setInteractive();
    backButton.on('pointerdown', () => this.createMainActionMenu());
    backButton.on('pointerover', () => backButton.setFillStyle(0xff6666));
    backButton.on('pointerout', () => backButton.setFillStyle(0xff4444));

    const backText = this.add.text(90, 160, 'Back', {
      font: 'bold 14px Arial',
      color: '#ffffff',
    });
    backText.setOrigin(0.5);

    container.add([backButton, backText]);

    this.battleState = 'selecting-move';
    this.selectedMoveIndex = 0;
  }

  /**
   * Create party selection menu
   */
  private createPartyMenu(): void {
    if (!this.uiManager) return;

    const party = this.gameStateManager.getParty();
    const battle = this.battleManager?.getBattle();
    const currentCritterIndex = battle?.player.currentCritterIndex || 0;

    this.uiManager.clearActionMenu();
    const container = this.uiManager.getActionMenuContainer();
    if (!container) return;

    party.forEach((critter, index) => {
      const x = 0;
      const y = index * 40;

      const isCurrent = index === currentCritterIndex;
      const isFainted = critter.isFainted;
      const color = isCurrent ? 0x6666ff : isFainted ? 0x444444 : 0x4444ff;

      const button = this.add.rectangle(x + 90, y + 20, 180, 35, color);
      button.setInteractive();
      if (!isCurrent && !isFainted) {
        button.on('pointerdown', () => this.switchPartyMember(index));
        button.on('pointerover', () => button.setFillStyle(0x6666ff));
        button.on('pointerout', () => button.setFillStyle(color));
      }

      const statusText = isCurrent ? ' (Active)' : isFainted ? ' (Fainted)' : '';
      const text = this.add.text(x + 90, y + 20, `${critter.nickname || 'Critter'} Lv.${critter.level}${statusText}`, {
        font: 'bold 12px Arial',
        color: isFainted ? '#888888' : '#ffffff',
      });
      text.setOrigin(0.5);

      container.add([button, text]);
    });

    const backButton = this.add.rectangle(90, party.length * 40 + 20, 180, 35, 0xff4444);
    backButton.setInteractive();
    backButton.on('pointerdown', () => this.createMainActionMenu());
    backButton.on('pointerover', () => backButton.setFillStyle(0xff6666));
    backButton.on('pointerout', () => backButton.setFillStyle(0xff4444));

    const backText = this.add.text(90, party.length * 40 + 20, 'Back', {
      font: 'bold 14px Arial',
      color: '#ffffff',
    });
    backText.setOrigin(0.5);

    container.add([backButton, backText]);

    this.battleState = 'selecting-party';
    this.selectedMoveIndex = 0;
  }

  /**
   * Create item selection menu
   */
  private createItemMenu(): void {
    if (!this.uiManager || !this.battleManager) return;

    const battle = this.battleManager.getBattle();
    const isWildEncounter = battle.isWildEncounter;

    if (!isWildEncounter) {
      this.uiManager.setMessageText('Cannot use items against trainers!');
      return;
    }

    this.uiManager.clearActionMenu();
    const container = this.uiManager.getActionMenuContainer();
    if (!container) return;

    const inventory = this.gameStateManager.getPlayerState().inventory;
    const items = Array.from(inventory.items.entries());

    if (items.length === 0) {
      this.uiManager.setMessageText('No items in bag!');
      this.createMainActionMenu();
      return;
    }

    items.slice(0, 6).forEach((entry, index) => {
      const [itemId, quantity] = entry;
      const item = ItemDatabase.getItem(itemId);
      if (!item) return;

      const x = (index % 2) * 200;
      const y = Math.floor(index / 2) * 40;

      const isSelected = index === this.selectedItemIndex;
      const color = isSelected ? 0x6666ff : 0x4444ff;

      const button = this.add.rectangle(x + 90, y + 20, 180, 35, color);
      button.setInteractive();
      button.on('pointerdown', () => this.handleItemSelect(itemId));
      button.on('pointerover', () => button.setFillStyle(0x6666ff));
      button.on('pointerout', () => button.setFillStyle(color));

      const text = this.add.text(x + 90, y + 20, `${item.name}\n×${quantity}`, {
        font: 'bold 12px Arial',
        color: '#ffffff',
        align: 'center',
      });
      text.setOrigin(0.5);

      container.add([button, text]);
    });

    const backButton = this.add.rectangle(90, (items.length > 3 ? 120 : 80) + 40, 180, 35, 0xff4444);
    backButton.setInteractive();
    backButton.on('pointerdown', () => this.createMainActionMenu());
    backButton.on('pointerover', () => backButton.setFillStyle(0xff6666));
    backButton.on('pointerout', () => backButton.setFillStyle(0xff4444));

    const backText = this.add.text(90, (items.length > 3 ? 120 : 80) + 40, 'Back', {
      font: 'bold 14px Arial',
      color: '#ffffff',
    });
    backText.setOrigin(0.5);

    container.add([backButton, backText]);

    this.battleState = 'selecting-item';
    this.selectedItemIndex = 0;
  }

  /**
   * Handle action selection (Fight, Bag, Party, Flee/Switch)
   */
  private handleActionSelect(action: string): void {
    switch (action) {
      case 'Fight':
        this.createMoveMenu();
        break;
      case 'Bag':
        this.createItemMenu();
        break;
      case 'Party':
        this.createPartyMenu();
        break;
      case 'Flee':
        this.attemptFlee();
        break;
      case 'Switch':
        this.createPartyMenu();
        break;
    }
  }

  /**
   * Handle move selection
   */
  private handleMoveSelect(moveIndex: number): void {
    this.selectedMoveIndex = moveIndex;
    this.executeTurn(moveIndex);
  }

  /**
   * Handle item selection
   */
  private handleItemSelect(itemId: string): void {
    this.selectedItemIndex = 0;
    const item = ItemDatabase.getItem(itemId);

    if (!item) return;

    if (item.type === 'Pokeball') {
      this.attemptCatch(itemId);
    } else if (item.type === 'Potion') {
      this.useHealingItem(itemId);
    } else {
      this.uiManager?.setMessageText('Cannot use this item in battle!');
    }
  }

  /**
   * Switch to a party member
   */
  private switchPartyMember(index: number): void {
    if (!this.battleManager) return;

    const battle = this.battleManager.getBattle();
    const success = this.battleManager.switchCritter(battle.player.id, index);

    if (success) {
      this.uiManager?.setMessageText(`Switched to ${this.gameStateManager.getParty()[index].nickname || 'Critter'}!`);
      this.executeTurn(-1, 'switch');
    }
  }

  /**
   * Attempt to flee from wild battle
   */
  private async attemptFlee(): Promise<void> {
    if (!this.battleManager) return;

    const battle = this.battleManager.getBattle();
    if (!battle.isWildEncounter) {
      this.uiManager?.setMessageText("Can't flee from trainer battle!");
      await this.waitMs(1500);
      this.createMainActionMenu();
      return;
    }

    this.uiManager?.setMessageText('Attempting to flee...');
    this.uiManager?.setActionMenuVisible(false);
    await this.waitMs(800);

    const fleeSuccess = Math.random() > 0.3;
    if (fleeSuccess) {
      this.uiManager?.setMessageText('Escaped successfully!');
      await this.waitMs(1000);
      EventBus.emit('battle:fled', {});
      this.endBattle('fled');
    } else {
      this.uiManager?.setMessageText('Failed to escape!');
      await this.waitMs(1000);
      await this.executeOpponentTurn();
      this.battleManager.checkBattleStatus();
      if (battle.battleStatus !== 'Active') {
        this.endBattle();
      } else {
        this.uiManager?.setActionMenuVisible(true);
        this.createMainActionMenu();
      }
    }
  }

  /**
   * Execute player turn
   */
  private async executeTurn(moveIndex: number, action: string = 'move'): Promise<void> {
    if (!this.battleManager || !this.uiManager) return;

    this.battleState = 'executing-turn';
    this.uiManager.setActionMenuVisible(false);

    const battle = this.battleManager.getBattle();
    const playerCritter = this.battleManager.getActiveCritter(battle.player.id);
    const opponentCritter = this.battleManager.getActiveCritter(battle.opponent.id);

    if (!playerCritter || !opponentCritter) {
      this.endBattle();
      return;
    }

    try {
      if (action === 'move' && moveIndex >= 0) {
        const moveId = playerCritter.moves[moveIndex]?.moveId;
        if (!moveId) return;

        const move = MoveDatabase.getMove(moveId);
        if (!move) return;

        this.uiManager.setMessageText(`${playerCritter.nickname || 'Player'} used ${move.name}!`);
        await this.waitMs(800);

        const opponentSpecies = CritterSpeciesDatabase.getSpecies(opponentCritter.speciesId);
        const result = this.battleManager.resolveMoveAction(
          battle.player.id,
          moveId,
          opponentCritter.currentStats,
          opponentSpecies?.type || []
        );

        if (result.damage > 0) {
          await this.animationManager?.animateAttack(
            this.uiManager.getPlayerSpriteContainer() as any,
            this.uiManager.getOpponentSpriteContainer() as any
          );

          this.battleManager.damageActiveCritter(battle.opponent.id, result.damage);
          await this.animationManager?.damageFlash(this.uiManager.getOpponentSpriteContainer() as any);

          if (result.isSuperEffective) {
            this.uiManager.setMessageText('Super effective!');
            await this.waitMs(500);
          } else if (result.isNotVeryEffective) {
            this.uiManager.setMessageText('Not very effective...');
            await this.waitMs(500);
          }
        }

        this.uiManager.updateOpponentHealthBar(opponentCritter.currentHP, opponentCritter.maxHP);

        if (opponentCritter.isFainted) {
          await this.handleCritterFainted(battle.opponent.id);
        } else {
          await this.waitMs(800);
          await this.executeOpponentTurn();
        }
      } else if (action === 'switch') {
        await this.waitMs(500);
        await this.executeOpponentTurn();
      }

      this.battleManager.checkBattleStatus();

      if (battle.battleStatus !== 'Active') {
        this.endBattle();
      } else {
        this.uiManager.setActionMenuVisible(true);
        this.createMainActionMenu();
        this.battleState = 'menu';
      }
    } catch (error) {
      console.error('Error during turn execution:', error);
      this.battleState = 'menu';
      this.uiManager.setActionMenuVisible(true);
    }
  }

  /**
   * Execute opponent turn
   */
  private async executeOpponentTurn(): Promise<void> {
    if (!this.battleManager || !this.uiManager) return;

    const battle = this.battleManager.getBattle();
    const playerCritter = this.battleManager.getActiveCritter(battle.player.id);
    const opponentCritter = this.battleManager.getActiveCritter(battle.opponent.id);

    if (!playerCritter || !opponentCritter || opponentCritter.isFainted) return;

    const aiDecision = this.battleManager.getAIDecision(opponentCritter, playerCritter);
    if (!aiDecision.moveId) return;

    const move = MoveDatabase.getMove(aiDecision.moveId);
    if (!move) return;

    this.uiManager.setMessageText(`${opponentCritter.nickname || 'Opponent'} used ${move.name}!`);
    await this.waitMs(800);

    const playerSpecies = CritterSpeciesDatabase.getSpecies(playerCritter.speciesId);
    const result = this.battleManager.resolveMoveAction(
      battle.opponent.id,
      aiDecision.moveId,
      playerCritter.currentStats,
      playerSpecies?.type || []
    );

    if (result.damage > 0) {
      await this.animationManager?.animateAttack(
        this.uiManager.getOpponentSpriteContainer() as any,
        this.uiManager.getPlayerSpriteContainer() as any
      );

      this.battleManager.damageActiveCritter(battle.player.id, result.damage);
      await this.animationManager?.damageFlash(this.uiManager.getPlayerSpriteContainer() as any);

      if (result.isSuperEffective) {
        this.uiManager.setMessageText('Super effective!');
        await this.waitMs(500);
      } else if (result.isNotVeryEffective) {
        this.uiManager.setMessageText('Not very effective...');
        await this.waitMs(500);
      }
    }

    this.uiManager.updatePlayerHealthBar(playerCritter.currentHP, playerCritter.maxHP);

    if (playerCritter.isFainted) {
      await this.handleCritterFainted(battle.player.id);
    } else {
      await this.waitMs(500);
    }
  }

  /**
   * Handle critter fainting
   */
  private async handleCritterFainted(participantId: string): Promise<void> {
    if (!this.battleManager || !this.uiManager) return;

    const battle = this.battleManager.getBattle();
    const faintedCritter = this.battleManager.getActiveCritter(participantId);

    if (!faintedCritter) return;

    this.uiManager.setMessageText(`${faintedCritter.nickname || 'Critter'} fainted!`);

    await this.animationManager?.animateFainting(
      this.uiManager.getOpponentSpriteContainer() as any
    );

    await this.waitMs(1000);

    if (participantId === battle.opponent.id) {
      const nextIndex = battle.opponent.currentCritterIndex + 1;
      if (nextIndex < battle.opponent.party.length) {
        battle.opponent.currentCritterIndex = nextIndex;
        const nextCritter = battle.opponent.party[nextIndex];

        if (!nextCritter.isFainted) {
          this.uiManager.setMessageText(`${nextCritter.nickname || 'Opponent'} sent out ${nextCritter.nickname || 'Critter'}!`);
          await this.waitMs(1500);
        }
      }
    } else {
      const nextIndex = battle.player.currentCritterIndex + 1;
      if (nextIndex < battle.player.party.length) {
        let validIndex = nextIndex;
        while (validIndex < battle.player.party.length && battle.player.party[validIndex].isFainted) {
          validIndex++;
        }

        if (validIndex < battle.player.party.length) {
          battle.player.currentCritterIndex = validIndex;
          const nextCritter = battle.player.party[validIndex];
          this.uiManager.setMessageText(`Go! ${nextCritter.nickname || 'Critter'}!`);
          await this.waitMs(1500);
        }
      }
    }
  }

  /**
   * Attempt to catch a wild Critter
   */
  private async attemptCatch(orbId: string): Promise<void> {
    if (!this.battleManager || !this.uiManager) return;

    const item = ItemDatabase.getItem(orbId);
    if (!item) return;

    const battle = this.battleManager.getBattle();
    const wildCritter = this.battleManager.getActiveCritter(battle.opponent.id);

    if (!wildCritter) return;

    this.uiManager.setActionMenuVisible(false);
    this.uiManager.setMessageText(`Throwing ${item.name}...`);

    if (!this.captureOrb) {
      this.captureOrb = new CaptureOrb(this, { skipAnimations: this.skipAnimations });
    }

    await this.waitMs(500);
    await this.captureOrb.playThrowAnimation();

    const caught = this.battleManager.attemptCatch(wildCritter, item.catchModifier || 1.0);

    if (caught) {
      const stages = this.battleManager.simulateCatchAnimation() || 4;
      for (let i = 0; i < stages; i++) {
        this.uiManager.setMessageText(`Caught ${wildCritter.nickname || 'Critter'}!`);
        await this.waitMs(300);
      }
      this.gameStateManager.removeItem(orbId, 1);
      await this.handleCatchSuccess(wildCritter);
    } else {
      await this.captureOrb.playShakeAnimation();
      this.gameStateManager.removeItem(orbId, 1);
      this.uiManager.setMessageText("The critter broke free!");
      await this.waitMs(1500);
      this.createMainActionMenu();
    }
  }

  /**
   * Handle successful catch
   */
  private async handleCatchSuccess(wildCritter: ICritter): Promise<void> {
    const party = this.gameStateManager.getParty();
    const playerState = this.gameStateManager.getPlayerState();

    if (party.length < playerState.party.maxSize) {
      this.gameStateManager.addCritterToParty(wildCritter);
      this.gameStateManager.addToPokedex(wildCritter.speciesId);
      this.uiManager?.setMessageText(`${wildCritter.nickname || 'Critter'} was added to the party!`);
      EventBus.emit('battle:caught', { critter: wildCritter });
      await this.waitMs(2000);
    } else {
      this.uiManager?.setMessageText(`Party full! ${wildCritter.nickname || 'Critter'} stored in PC.`);
      EventBus.emit('pc:storage-needed', { critter: wildCritter });
      await this.waitMs(2000);
    }

    this.endBattle('caught');
  }

  /**
   * Use healing item
   */
  private async useHealingItem(itemId: string): Promise<void> {
    if (!this.battleManager || !this.uiManager) return;

    const item = ItemDatabase.getItem(itemId);
    if (!item || !item.effect) return;

    const battle = this.battleManager.getBattle();
    const playerCritter = this.battleManager.getActiveCritter(battle.player.id);
    if (!playerCritter) return;

    this.uiManager.setActionMenuVisible(false);

    if (item.effect.type === 'heal') {
      const healAmount = (item.effect.value as number) || 20;
      const actualHeal = Math.min(playerCritter.maxHP - playerCritter.currentHP, healAmount);
      playerCritter.currentHP += actualHeal;
      this.uiManager.setMessageText(`Used ${item.name}! Restored ${actualHeal} HP.`);
    }

    this.gameStateManager.removeItem(itemId, 1);
    this.uiManager.updatePlayerHealthBar(playerCritter.currentHP, playerCritter.maxHP);

    await this.waitMs(1000);
    await this.executeOpponentTurn();

    this.battleManager.checkBattleStatus();

    if (battle.battleStatus !== 'Active') {
      this.endBattle();
    } else {
      this.uiManager.setActionMenuVisible(true);
      this.createMainActionMenu();
    }
  }

  /**
   * End the battle
   */
  private async endBattle(outcome: string = 'victory'): Promise<void> {
    if (!this.battleManager || !this.uiManager) return;

    this.battleState = 'ended';
    this.uiManager.setActionMenuVisible(false);

    const battle = this.battleManager.getBattle();

    if (outcome === 'victory') {
      const opponentParty = battle.opponent.party;
      let totalExp = 0;

      opponentParty.forEach(opponentCritter => {
        if (opponentCritter.isFainted) return;

        const playerParty = battle.player.party;
        playerParty.forEach(playerCritter => {
          if (playerCritter.isFainted) return;

          const expGain = Math.floor((opponentCritter.level * 100) / 7 + 1);
          playerCritter.experience += expGain;
          totalExp += expGain;

          const calculateExpForLevel = (level: number): number =>
            Math.floor((4 * Math.pow(level, 3)) / 5);

          while (playerCritter.experience >= calculateExpForLevel(playerCritter.level + 1)) {
            playerCritter.level += 1;
            playerCritter.experience -= calculateExpForLevel(playerCritter.level);
            this.uiManager?.setMessageText(`${playerCritter.nickname || 'Critter'} leveled up to ${playerCritter.level}!`);
          }
        });
      });

      this.uiManager.setMessageText(`Victory! Gained ${totalExp} EXP!`);
      EventBus.emit('battle:victory', { totalExp });
    } else if (outcome === 'defeat') {
      this.uiManager.setMessageText('Defeat! You have no more critters!');
      EventBus.emit('battle:defeat', {});
    } else if (outcome === 'caught') {
      this.uiManager.setMessageText('Critter caught! Battle ended!');
    }

    await this.waitMs(2000);

    this.gameStateManager.saveGame();
    EventBus.emit('battle:end', { outcome });
    this.returnToOverworld();
  }

  /**
   * Return to overworld
   */
  private returnToOverworld(): void {
    this.scene.stop('Battle');
    this.scene.stop('HUD');
    this.scene.start('Overworld');
  }

  /**
   * Utility: wait for specified milliseconds
   */
  private waitMs(ms: number): Promise<void> {
    return new Promise(resolve => this.time.delayedCall(ms, resolve));
  }

  /**
   * Shutdown and cleanup
   */
  shutdown(): void {
    this.animationManager = null;
    this.poolManager?.clearAllPools();
    this.audioManager?.shutdown();
    this.background?.destroy();
    this.captureOrb?.destroy();
    this.uiManager?.destroy();

    if (this.input.keyboard) {
      this.input.keyboard.off('keydown-UP');
      this.input.keyboard.off('keydown-DOWN');
      this.input.keyboard.off('keydown-LEFT');
      this.input.keyboard.off('keydown-RIGHT');
      this.input.keyboard.off('keydown-Z');
      this.input.keyboard.off('keydown-X');
    }
  }
}
