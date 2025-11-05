import { Scene, GameObjects, Physics, Input } from 'phaser';
import { EventBus } from '../EventBus';
import { SceneContext } from './SceneContext';
import { BattleManager, Critter, MoveDatabase, CritterSpeciesDatabase, ICritter, ItemDatabase, TrainerDatabase } from '../models';
import { AnimationManager } from '../managers/AnimationManager';

interface BattleUIElements {
  playerSpriteContainer: GameObjects.Container | null;
  opponentSpriteContainer: GameObjects.Container | null;
  playerHPBar: GameObjects.Rectangle | null;
  opponentHPBar: GameObjects.Rectangle | null;
  playerHPText: GameObjects.Text | null;
  opponentHPText: GameObjects.Text | null;
  playerNameText: GameObjects.Text | null;
  opponentNameText: GameObjects.Text | null;
  battleLog: GameObjects.Text | null;
  moveButtonsContainer: GameObjects.Container | null;
  actionMenuContainer: GameObjects.Container | null;
  messageText: GameObjects.Text | null;
}

/**
 * Battle Scene - Turn-based battle system with full UI
 * Handles move selection, party management, item usage, and battle resolution
 */
export class Battle extends Scene {
  private battleManager: BattleManager | null = null;
  private gameStateManager = SceneContext.getInstance().getGameStateManager();
  private animationManager: AnimationManager | null = null;

  private ui: BattleUIElements = {
    playerSpriteContainer: null,
    opponentSpriteContainer: null,
    playerHPBar: null,
    opponentHPBar: null,
    playerHPText: null,
    opponentHPText: null,
    playerNameText: null,
    opponentNameText: null,
    battleLog: null,
    moveButtonsContainer: null,
    actionMenuContainer: null,
    messageText: null,
  };

  private battleState: 'menu' | 'selecting-move' | 'executing-turn' | 'selecting-party' | 'selecting-item' | 'ended' = 'menu';
  private selectedMoveIndex: number = 0;
  private selectedPartyIndex: number = 0;
  private selectedItemIndex: number = 0;
  private encounterData: any = null;

  constructor() {
    super('Battle');
  }

  init(data: any) {
    this.encounterData = data;
  }

  create() {
    this.animationManager = new AnimationManager(this);

    try {
      this.setupBattle();
      this.setupUI();
      this.setupInput();

      if (!this.scene.isActive('HUD')) {
        this.scene.launch('HUD');
      }

      EventBus.emit('current-scene-ready', this);
    } catch (error) {
      console.error('Error creating Battle scene:', error);
      this.returnToOverworld();
    }
  }

  private setupBattle() {
    const party = this.gameStateManager.getParty();
    if (party.length === 0) {
      throw new Error('No critters in party');
    }

    if (!this.battleManager) {
      const playerParty = party;
      let opponentParty: ICritter[] = [];
      let isWildEncounter = false;
      let trainer = null;

      if (this.encounterData?.wildCritter) {
        isWildEncounter = true;
        opponentParty = [this.encounterData.wildCritter];
      } else if (this.encounterData?.trainerId) {
        isWildEncounter = false;
        TrainerDatabase.initialize();
        trainer = TrainerDatabase.getTrainer(this.encounterData.trainerId);
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

  private setupUI() {
    const width = this.game.config.width as number;
    const height = this.game.config.height as number;

    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a1a);

    this.setupBattlefield(width, height);
    this.setupHPBars(width, height);
    this.setupActionMenu(width, height);
  }

  private setupBattlefield(width: number, height: number) {
    if (!this.battleManager) return;

    const battle = this.battleManager.getBattle();
    const playerCritter = this.battleManager.getActiveCritter(battle.player.id);
    const opponentCritter = this.battleManager.getActiveCritter(battle.opponent.id);

    if (!playerCritter || !opponentCritter) return;

    const playerSpecies = CritterSpeciesDatabase.getSpecies(playerCritter.speciesId);
    const opponentSpecies = CritterSpeciesDatabase.getSpecies(opponentCritter.speciesId);

    this.ui.playerSpriteContainer = this.add.container(100, height - 150);
    const playerSprite = this.add.rectangle(0, 0, 80, 80, 0x4169E1);
    const playerLabel = this.add.text(0, 50, `${playerSpecies?.name}\nLv. ${playerCritter.level}`, {
      font: '12px Arial',
      color: '#ffffff',
      align: 'center',
    });
    playerLabel.setOrigin(0.5);
    this.ui.playerSpriteContainer.add([playerSprite, playerLabel]);

    this.ui.opponentSpriteContainer = this.add.container(width - 100, 150);
    const opponentSprite = this.add.rectangle(0, 0, 80, 80, 0xff4444);
    const opponentLabel = this.add.text(0, 50, `${opponentSpecies?.name}\nLv. ${opponentCritter.level}`, {
      font: '12px Arial',
      color: '#ffffff',
      align: 'center',
    });
    opponentLabel.setOrigin(0.5);
    this.ui.opponentSpriteContainer.add([opponentSprite, opponentLabel]);
  }

  private setupHPBars(width: number, height: number) {
    if (!this.battleManager) return;

    const battle = this.battleManager.getBattle();
    const playerCritter = this.battleManager.getActiveCritter(battle.player.id);
    const opponentCritter = this.battleManager.getActiveCritter(battle.opponent.id);

    if (!playerCritter || !opponentCritter) return;

    const hpBarWidth = 120;
    const hpBarHeight = 15;

    this.ui.playerHPBar = this.add.rectangle(120, height - 100, hpBarWidth, hpBarHeight, 0x00ff00);
    this.ui.playerHPBar.setOrigin(0);

    this.ui.playerHPText = this.add.text(130, height - 85, `HP: ${playerCritter.currentHP}/${playerCritter.maxHP}`, {
      font: '10px Arial',
      color: '#ffffff',
    });

    this.ui.playerNameText = this.add.text(120, height - 125, playerCritter.nickname || 'Player Critter', {
      font: '12px Arial',
      color: '#00ff00',
    });

    this.ui.opponentHPBar = this.add.rectangle(width - 240, 100, hpBarWidth, hpBarHeight, 0x00ff00);
    this.ui.opponentHPBar.setOrigin(0);

    this.ui.opponentHPText = this.add.text(width - 230, 115, `HP: ${opponentCritter.currentHP}/${opponentCritter.maxHP}`, {
      font: '10px Arial',
      color: '#ffffff',
    });

    this.ui.opponentNameText = this.add.text(width - 240, 80, opponentCritter.nickname || 'Opponent Critter', {
      font: '12px Arial',
      color: '#ff4444',
    });

    this.updateHPBars();
  }

  private setupActionMenu(width: number, height: number) {
    this.ui.actionMenuContainer = this.add.container(width / 2 - 200, height - 200);

    this.createMainActionMenu();

    this.ui.messageText = this.add.text(width / 2, 30, 'What will you do?', {
      font: '16px Arial',
      color: '#ffffff',
      align: 'center',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 },
    });
    this.ui.messageText.setOrigin(0.5);
    this.ui.messageText.setScrollFactor(0);
  }

  private createMainActionMenu() {
    if (!this.ui.actionMenuContainer) return;

    const battle = this.battleManager?.getBattle();
    const isWildEncounter = battle?.isWildEncounter || false;

    const actions = isWildEncounter ? ['Fight', 'Bag', 'Party', 'Flee'] : ['Fight', 'Bag', 'Party', 'Switch'];

    this.ui.actionMenuContainer.removeAll(true);

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

      this.ui.actionMenuContainer?.add([button, text]);
    });

    this.battleState = 'menu';
  }

  private createMoveMenu() {
    if (!this.ui.actionMenuContainer) return;
    if (!this.battleManager) return;

    const battle = this.battleManager.getBattle();
    const playerCritter = this.battleManager.getActiveCritter(battle.player.id);

    if (!playerCritter) return;

    this.ui.actionMenuContainer.removeAll(true);

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

      this.ui.actionMenuContainer?.add([button, text]);
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

    this.ui.actionMenuContainer?.add([backButton, backText]);

    this.battleState = 'selecting-move';
  }

  private createPartyMenu() {
    if (!this.ui.actionMenuContainer) return;

    const party = this.gameStateManager.getParty();
    const battle = this.battleManager?.getBattle();
    const currentCritterIndex = battle?.player.currentCritterIndex || 0;

    this.ui.actionMenuContainer.removeAll(true);

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
      const text = this.add.text(
        x + 90,
        y + 20,
        `${critter.nickname || 'Critter'} Lv.${critter.level}${statusText}`,
        {
          font: 'bold 12px Arial',
          color: isFainted ? '#888888' : '#ffffff',
        }
      );
      text.setOrigin(0.5);

      this.ui.actionMenuContainer?.add([button, text]);
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

    this.ui.actionMenuContainer?.add([backButton, backText]);

    this.battleState = 'selecting-party';
  }

  private createItemMenu() {
    if (!this.ui.actionMenuContainer) return;
    if (!this.battleManager) return;

    const battle = this.battleManager.getBattle();
    const isWildEncounter = battle.isWildEncounter;

    if (!isWildEncounter) {
      this.ui.messageText?.setText('Cannot use items against trainers!');
      return;
    }

    this.ui.actionMenuContainer.removeAll(true);

    const inventory = this.gameStateManager.getPlayerState().inventory;
    const items = Array.from(inventory.items.entries());

    if (items.length === 0) {
      this.ui.messageText?.setText('No items in bag!');
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

      const text = this.add.text(
        x + 90,
        y + 20,
        `${item.name}\n×${quantity}`,
        {
          font: 'bold 12px Arial',
          color: '#ffffff',
          align: 'center',
        }
      );
      text.setOrigin(0.5);

      this.ui.actionMenuContainer?.add([button, text]);
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

    this.ui.actionMenuContainer?.add([backButton, backText]);

    this.battleState = 'selecting-item';
  }

  private handleItemSelect(itemId: string) {
    this.selectedItemIndex = 0;
    const item = ItemDatabase.getItem(itemId);

    if (!item) return;

    if (item.type === 'Pokeball') {
      this.attemptCatch(itemId);
    } else if (item.type === 'Potion') {
      this.useHealingItem(itemId);
    } else {
      this.ui.messageText?.setText('Cannot use this item in battle!');
    }
  }

  private async attemptCatch(orbId: string) {
    if (!this.battleManager) return;

    const item = ItemDatabase.getItem(orbId);
    if (!item) return;

    const battle = this.battleManager.getBattle();
    const wildCritter = this.battleManager.getActiveCritter(battle.opponent.id);

    if (!wildCritter) return;

    this.ui.actionMenuContainer?.setVisible(false);
    this.ui.messageText?.setText(`Throwing ${item.name}...`);

    await this.waitMs(500);

    const caught = this.battleManager.attemptCatch(wildCritter, item.catchModifier || 1.0);

    if (caught) {
      await this.animateCatchSuccess(wildCritter, item.name);
      this.gameStateManager.removeItem(orbId, 1);
      await this.handleCatchSuccess(wildCritter);
    } else {
      await this.animateCatchFailure();
      this.gameStateManager.removeItem(orbId, 1);
      this.ui.messageText?.setText("The critter broke free!");
      await this.waitMs(1500);
      this.createMainActionMenu();
    }
  }

  private async animateCatchSuccess(wildCritter: ICritter, orbName: string) {
    const stages = this.battleManager?.simulateCatchAnimation() || 4;

    for (let i = 0; i < stages; i++) {
      this.ui.messageText?.setText(`Caught ${wildCritter.nickname || 'Critter'}!`);
      await this.waitMs(300);
    }
  }

  private async animateCatchFailure() {
    for (let i = 0; i < 3; i++) {
      await this.waitMs(300);
    }
  }

  private async handleCatchSuccess(wildCritter: ICritter) {
    const party = this.gameStateManager.getParty();
    const playerState = this.gameStateManager.getPlayerState();

    if (party.length < playerState.party.maxSize) {
      this.gameStateManager.addCritterToParty(wildCritter);
      this.gameStateManager.addToPokedex(wildCritter.speciesId);
      this.ui.messageText?.setText(`${wildCritter.nickname || 'Critter'} was added to the party!`);
      await this.waitMs(2000);
    } else {
      this.ui.messageText?.setText(`Party full! ${wildCritter.nickname || 'Critter'} stored in PC.`);
      EventBus.emit('pc:storage-needed', { critter: wildCritter });
      await this.waitMs(2000);
    }

    this.endBattle('caught');
  }

  private async useHealingItem(itemId: string) {
    const item = ItemDatabase.getItem(itemId);
    if (!item || !item.effect) return;

    const battle = this.battleManager?.getBattle();
    if (!battle) return;

    const playerCritter = this.battleManager?.getActiveCritter(battle.player.id);
    if (!playerCritter) return;

    this.ui.actionMenuContainer?.setVisible(false);

    if (item.effect.type === 'heal') {
      const healAmount = (item.effect.value as number) || 20;
      const actualHeal = Math.min(
        playerCritter.maxHP - playerCritter.currentHP,
        healAmount
      );
      playerCritter.currentHP += actualHeal;
      this.ui.messageText?.setText(`Used ${item.name}! Restored ${actualHeal} HP.`);
    }

    this.gameStateManager.removeItem(itemId, 1);
    this.updateHPBars();

    await this.waitMs(1000);
    await this.executeOpponentTurn();

    this.battleManager?.checkBattleStatus();

    if (battle.battleStatus !== 'Active') {
      this.endBattle();
    } else {
      this.ui.actionMenuContainer?.setVisible(true);
      this.createMainActionMenu();
    }
  }

  private handleActionSelect(action: string) {
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

  private handleMoveSelect(moveIndex: number) {
    this.selectedMoveIndex = moveIndex;
    this.executeTurn(moveIndex);
  }

  private switchPartyMember(index: number) {
    if (!this.battleManager) return;

    const battle = this.battleManager.getBattle();
    const success = this.battleManager.switchCritter(battle.player.id, index);

    if (success) {
      this.ui.messageText?.setText(`Switched to ${this.gameStateManager.getParty()[index].nickname || 'Critter'}!`);
      this.executeTurn(-1, 'switch');
    }
  }

  private async executeTurn(moveIndex: number, action: string = 'move') {
    if (!this.battleManager) return;

    this.battleState = 'executing-turn';
    this.ui.actionMenuContainer?.setVisible(false);

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

        this.ui.messageText?.setText(`${playerCritter.nickname || 'Player'} used ${move.name}!`);
        await this.waitMs(800);

        const opponentSpecies = CritterSpeciesDatabase.getSpecies(opponentCritter.speciesId);
        const result = this.battleManager.resolveMoveAction(battle.player.id, moveId, opponentCritter.currentStats, opponentSpecies?.type || []);

        if (result.damage > 0) {
          await this.animationManager?.animateAttack(
            this.ui.playerSpriteContainer as any,
            this.ui.opponentSpriteContainer as any
          );

          this.battleManager.damageActiveCritter(battle.opponent.id, result.damage);

          await this.animationManager?.damageFlash(this.ui.opponentSpriteContainer as any);
          await this.animationManager?.displayDamageText(
            (this.ui.opponentSpriteContainer as any)?.x || 300,
            (this.ui.opponentSpriteContainer as any)?.y || 150,
            result.damage
          );

          if (result.isSuperEffective) {
            await this.animationManager?.displayEffectiveness(300, 100, 2.0);
          } else if (result.isNotVeryEffective) {
            await this.animationManager?.displayEffectiveness(300, 100, 0.5);
          }
        }

        this.updateHPBars();

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
        this.ui.actionMenuContainer?.setVisible(true);
        this.createMainActionMenu();
        this.battleState = 'menu';
      }
    } catch (error) {
      console.error('Error during turn execution:', error);
      this.battleState = 'menu';
      this.ui.actionMenuContainer?.setVisible(true);
    }
  }

  private async executeOpponentTurn() {
    if (!this.battleManager) return;

    const battle = this.battleManager.getBattle();
    const playerCritter = this.battleManager.getActiveCritter(battle.player.id);
    const opponentCritter = this.battleManager.getActiveCritter(battle.opponent.id);

    if (!playerCritter || !opponentCritter || opponentCritter.isFainted) return;

    const aiDecision = this.battleManager.getAIDecision(opponentCritter, playerCritter);
    if (!aiDecision.moveId) return;
    
    const move = MoveDatabase.getMove(aiDecision.moveId);

    if (!move) return;

    this.ui.messageText?.setText(`${opponentCritter.nickname || 'Opponent'} used ${move.name}!`);
    await this.waitMs(800);

    const playerSpecies = CritterSpeciesDatabase.getSpecies(playerCritter.speciesId);
    const result = this.battleManager.resolveMoveAction(battle.opponent.id, aiDecision.moveId, playerCritter.currentStats, playerSpecies?.type || []);

    if (result.damage > 0) {
      await this.animationManager?.animateAttack(
        this.ui.opponentSpriteContainer as any,
        this.ui.playerSpriteContainer as any
      );

      this.battleManager.damageActiveCritter(battle.player.id, result.damage);

      await this.animationManager?.damageFlash(this.ui.playerSpriteContainer as any);
      await this.animationManager?.displayDamageText(
        (this.ui.playerSpriteContainer as any)?.x || 100,
        (this.ui.playerSpriteContainer as any)?.y || 250,
        result.damage
      );

      if (result.isSuperEffective) {
        await this.animationManager?.displayEffectiveness(100, 250, 2.0);
      } else if (result.isNotVeryEffective) {
        await this.animationManager?.displayEffectiveness(100, 250, 0.5);
      }
    }

    this.updateHPBars();

    if (playerCritter.isFainted) {
      await this.handleCritterFainted(battle.player.id);
    } else {
      await this.waitMs(800);
    }
  }

  private async handleCritterFainted(participantId: string) {
    if (!this.battleManager) return;

    const battle = this.battleManager.getBattle();
    const participant = battle.player.id === participantId ? battle.player : battle.opponent;
    const faintedCritter = this.battleManager.getActiveCritter(participantId);

    if (!faintedCritter) return;

    this.ui.messageText?.setText(`${faintedCritter.nickname || 'Critter'} fainted!`);

    const sprite = participantId === battle.player.id ? this.ui.playerSpriteContainer : this.ui.opponentSpriteContainer;
    if (sprite) {
      await this.animationManager?.animateFainting(sprite as any);
    }

    await this.waitMs(800);

    const hasActiveCritters = this.battleManager.hasActiveCritters(participantId);

    if (hasActiveCritters) {
      const switchedCritter = this.findNextActiveCritter(participant);
      if (switchedCritter !== null) {
        this.battleManager.switchCritter(participantId, switchedCritter);

        const nextCritter = this.battleManager.getActiveCritter(participantId);
        this.ui.messageText?.setText(`${nextCritter?.nickname || 'Critter'} is sent out!`);

        const nextSprite = participantId === battle.player.id ? this.ui.playerSpriteContainer : this.ui.opponentSpriteContainer;
        if (nextSprite) {
          nextSprite.setAlpha(1);
          nextSprite.setScale(1);
          await this.animationManager?.animateEntering(nextSprite as any);
        }

        this.updateHPBars();
        await this.waitMs(500);
      }
    }
  }

  private findNextActiveCritter(participant: any): number | null {
    for (let i = 0; i < participant.party.length; i++) {
      if (!participant.party[i].isFainted) {
        return i;
      }
    }
    return null;
  }

  private updateHPBars() {
    if (!this.battleManager) return;

    const battle = this.battleManager.getBattle();
    const playerCritter = this.battleManager.getActiveCritter(battle.player.id);
    const opponentCritter = this.battleManager.getActiveCritter(battle.opponent.id);

    if (!playerCritter || !opponentCritter) return;

    const playerHPPercent = playerCritter.currentHP / playerCritter.maxHP;
    const opponentHPPercent = opponentCritter.currentHP / opponentCritter.maxHP;

    if (this.ui.playerHPBar) {
      this.ui.playerHPBar.setDisplaySize(120 * playerHPPercent, 15);
      this.ui.playerHPBar.setFillStyle(playerHPPercent > 0.5 ? 0x00ff00 : playerHPPercent > 0.25 ? 0xffff00 : 0xff0000);
    }

    if (this.ui.opponentHPBar) {
      this.ui.opponentHPBar.setDisplaySize(120 * opponentHPPercent, 15);
      this.ui.opponentHPBar.setFillStyle(opponentHPPercent > 0.5 ? 0x00ff00 : opponentHPPercent > 0.25 ? 0xffff00 : 0xff0000);
    }

    if (this.ui.playerHPText) {
      this.ui.playerHPText.setText(`HP: ${playerCritter.currentHP}/${playerCritter.maxHP}`);
    }

    if (this.ui.opponentHPText) {
      this.ui.opponentHPText.setText(`HP: ${opponentCritter.currentHP}/${opponentCritter.maxHP}`);
    }
  }

  private async attemptFlee() {
    if (!this.battleManager) return;

    const battle = this.battleManager.getBattle();
    if (!battle.isWildEncounter) {
      this.ui.messageText?.setText("Can't flee from a trainer battle!");
      return;
    }

    const playerCritter = this.battleManager.getActiveCritter(battle.player.id);
    const opponentCritter = this.battleManager.getActiveCritter(battle.opponent.id);

    if (!playerCritter || !opponentCritter) return;

    const fled = this.battleManager.attemptFlee(playerCritter.currentStats.speed, opponentCritter.currentStats.speed);

    if (fled) {
      this.ui.messageText?.setText('Successfully fled from battle!');
      await this.waitMs(1500);
      this.endBattle('fled');
    } else {
      this.ui.messageText?.setText("Couldn't escape!");
      await this.waitMs(1500);
      this.createMainActionMenu();
    }
  }

  private async endBattle(result: string = '') {
    if (!this.battleManager) return;

    const battle = this.battleManager.getBattle();

    if (!result) {
      if (battle.battleStatus === 'PlayerWon') {
        result = 'victory';
        this.ui.messageText?.setText('Victory! You won!');

        const opponentCritter = this.battleManager.getActiveCritter(battle.opponent.id);
        if (opponentCritter) {
          this.battleManager.distributeExperience(battle.player.id, opponentCritter);
        }

        if (!battle.isWildEncounter && this.encounterData?.trainerId) {
          const trainer = this.encounterData.trainer;
          const gymLeaderId = this.encounterData.trainerId;

          this.gameStateManager.defeatTrainer(gymLeaderId);

          if (trainer?.badge) {
            this.gameStateManager.addBadge(trainer.badge);
            if (trainer.moneyReward) {
              this.gameStateManager.addMoney(trainer.moneyReward);
            }

            const badgeName = trainer.badgeName || trainer.badge;
            this.ui.messageText?.setText(`You earned the ${badgeName}!`);
            await this.waitMs(1500);
            EventBus.emit('badge:earned', { badgeId: trainer.badge, badgeName });
          }
        }
      } else if (battle.battleStatus === 'OpponentWon') {
        result = 'defeat';
        this.ui.messageText?.setText('Defeat! You lost!');
      }
    }

    this.gameStateManager.saveGame();

    await this.waitMs(2000);

    this.scene.stop();
    this.scene.resume('Overworld');

    EventBus.emit('battle:ended', { result });
  }

  private waitMs(ms: number): Promise<void> {
    return new Promise(resolve => {
      this.time.delayedCall(ms, resolve);
    });
  }

  private returnToOverworld() {
    this.scene.stop();
    this.scene.resume('Overworld');
  }

  setupInput() {
    // Input is handled through interactive buttons in UI
  }

  update() {
    this.updateHPBars();
  }

  shutdown() {
    if (this.animationManager) {
      this.animationManager.destroy();
    }
  }
}
