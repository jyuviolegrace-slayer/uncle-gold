import { BaseScene } from './common/BaseScene';
import { SceneKeys } from '../assets/SceneKeys';
import { TextureKeys } from '../assets/TextureKeys';
import { EventBus } from '../EventBus';
import { DataManager, DataManagerStoreKeys, BattleSceneOptions } from '../services/DataManager';
import { 
  BattleBackground, 
  BattleBall, 
  BattleStateMachine, 
  BattleState, 
  BattleMenu, 
  BattleMenuOption, 
  PlayerBattleMonster, 
  EnemyBattleMonster, 
  AttackManager, 
  AttackTarget 
} from '../battle';
import { CritterInstance, LegacyMonster } from '../models/critter';
import { dataLoader } from '../data/DataLoader';
import { calculateExpGainedFromCritter, handleCritterGainingExperience } from '../utils/leveling-utils';
import { calculateCaptureResults } from '../utils/catch-utils';
import { Move } from '../models/move';
import { Item } from '../models/item';

export interface BattleSceneData {
  playerMonsters: (CritterInstance | LegacyMonster)[];
  enemyMonsters: (CritterInstance | LegacyMonster)[];
  enemyMonsterId?: number;
  areaId?: string;
  isTrainerBattle?: boolean;
}

export interface BattleSceneResumeData {
  wasMonsterSelected?: boolean;
  selectedMonsterIndex?: number;
  wasItemUsed?: boolean;
  item?: Item;
}

/**
 * Battle Scene - Turn-based combat system
 * Complete TypeScript implementation with modern battle modules
 */
export class Battle extends BaseScene {
  private battleMenu: BattleMenu;
  private activeEnemyMonster: EnemyBattleMonster;
  private activePlayerMonster: PlayerBattleMonster;
  private battleStateMachine: BattleStateMachine;
  private attackManager: AttackManager;
  private background: BattleBackground;
  private ball: BattleBall;
  private availableMonstersUiContainer: Phaser.GameObjects.Container;

  // Battle state
  private sceneData: BattleSceneData;
  private activePlayerAttackIndex: number = -1;
  private activeEnemyAttackIndex: number = -1;
  private activePlayerMonsterPartyIndex: number = 0;
  private skipAnimations: boolean = false;
  private playerKnockedOut: boolean = false;
  private switchingActiveMonster: boolean = false;
  private activeMonsterKnockedOut: boolean = false;
  private monsterCaptured: boolean = false;
  private selectedMove: Move | null = null;

  constructor() {
    super(SceneKeys.BATTLE);
  }

  init(data: BattleSceneData): void {
    super.init(data);
    
    // Initialize scene data
    this.sceneData = data;
    
    // Handle empty data (testing from preload scene)
    if (Object.keys(data).length === 0) {
      const dataManager = this.registry.get('dataManager') as DataManager;
      this.sceneData = {
        enemyMonsters: [dataLoader.getLegacyMonsterById(2) as LegacyMonster],
        playerMonsters: [...dataManager.dataStore.get(DataManagerStoreKeys.CRITTERS_IN_PARTY) || []],
      };
    }

    // Initialize battle state
    this.activePlayerAttackIndex = -1;
    this.activeEnemyAttackIndex = -1;
    this.activePlayerMonsterPartyIndex = 0;
    this.playerKnockedOut = false;
    this.switchingActiveMonster = false;
    this.activeMonsterKnockedOut = false;
    this.monsterCaptured = false;
    this.selectedMove = null;

    // Check animation settings
    const dataManager = this.registry.get('dataManager') as DataManager;
    const chosenBattleSceneOption = dataManager.dataStore.get(DataManagerStoreKeys.OPTIONS_BATTLE_SCENE_ANIMATIONS);
    this.skipAnimations = chosenBattleSceneOption !== BattleSceneOptions.ON;
  }

  create(): void {
    super.create();

    // Create background
    this.background = new BattleBackground(this);
    this.background.showForest();

    // Create monsters
    this.activeEnemyMonster = new EnemyBattleMonster({
      scene: this,
      monsterDetails: this.sceneData.enemyMonsters[0],
      skipBattleAnimations: this.skipAnimations,
    });

    // Find first eligible monster in player party
    const eligibleMonsterIndex = this.sceneData.playerMonsters.findIndex(
      (monster) => monster.currentHp > 0
    );
    this.activePlayerMonsterPartyIndex = eligibleMonsterIndex;
    this.activePlayerMonster = new PlayerBattleMonster({
      scene: this,
      monsterDetails: this.sceneData.playerMonsters[this.activePlayerMonsterPartyIndex],
      skipBattleAnimations: this.skipAnimations,
    });

    // Create UI components
    this.battleMenu = new BattleMenu({
      scene: this,
      playerMonster: this.activePlayerMonster,
      skipAnimations: this.skipAnimations
    });
    this.attackManager = new AttackManager(this, this.skipAnimations);
    this.createAvailableMonstersUi();
    this.ball = new BattleBall({
      scene: this,
      assetKey: TextureKeys.DAMAGED_BALL,
      scale: 0.1,
      skipBattleAnimations: this.skipAnimations,
    });

    // Set up event listeners
    this.setupEventListeners();

    // Create state machine
    this.createBattleStateMachine();

    // Lock input initially
    this.inputManager.lockInput();

    // Start the battle
    this.battleStateMachine.setState(BattleState.INTRO);
  }

  update(time: number, delta: number): void {
    super.update(time, delta);
    this.battleStateMachine.update();

    if (this.inputManager.isInputLocked) {
      return;
    }

    this.handleInput();
  }

  private handleInput(): void {
    const wasSpaceKeyPressed = this.inputManager.wasSpaceKeyPressed();

    // Handle input based on current state
    if (
      wasSpaceKeyPressed &&
      (this.battleStateMachine.currentStateName === BattleState.PRE_BATTLE_INFO ||
        this.battleStateMachine.currentStateName === BattleState.POST_ATTACK_CHECK ||
        this.battleStateMachine.currentStateName === BattleState.GAIN_EXPERIENCE ||
        this.battleStateMachine.currentStateName === BattleState.SWITCH_MONSTER ||
        this.battleStateMachine.currentStateName === BattleState.CAPTURE_ITEM_USED ||
        this.battleStateMachine.currentStateName === BattleState.FLEE_ATTEMPT)
    ) {
      this.battleMenu.handlePlayerInput('OK');
      return;
    }

    if (this.battleStateMachine.currentStateName === BattleState.PLAYER_INPUT) {
      if (wasSpaceKeyPressed) {
        this.handlePlayerMenuSelection();
        return;
      }

      if (this.inputManager.wasBackKeyPressed()) {
        this.battleMenu.handlePlayerInput('CANCEL');
        return;
      }

      const selectedDirection = this.inputManager.getDirectionKeyJustPressed();
      if (selectedDirection !== 'NONE') {
        this.battleMenu.handlePlayerInput(selectedDirection as any);
      }
    }
  }

  private handlePlayerMenuSelection(): void {
    const selectedOption = this.battleMenu.getSelectedOption();
    
    switch (selectedOption) {
      case BattleMenuOption.FIGHT:
        // Show fight submenu (simplified for now)
        this.selectRandomAttack();
        this.battleStateMachine.setState(BattleState.ENEMY_INPUT);
        break;
      case BattleMenuOption.BAG:
        // TODO: Implement bag menu
        console.log('[Battle] Bag menu not implemented yet');
        break;
      case BattleMenuOption.CRITTER:
        this.battleStateMachine.setState(BattleState.SWITCH_MONSTER);
        break;
      case BattleMenuOption.RUN:
        this.battleStateMachine.setState(BattleState.FLEE_ATTEMPT);
        break;
    }
  }

  private selectRandomAttack(): void {
    const moves = this.attackManager.getMonsterMoves(this.activePlayerMonster);
    if (moves.length > 0) {
      this.activePlayerAttackIndex = Math.floor(Math.random() * moves.length);
      this.selectedMove = moves[this.activePlayerAttackIndex];
    }
  }

  private setupEventListeners(): void {
    // Listen for menu selections
    this.events.on('menu:selected', (option: BattleMenuOption) => {
      console.log('[Battle] Menu selected:', option);
    });
  }

  private createBattleStateMachine(): void {
    this.battleStateMachine = new BattleStateMachine();

    // INTRO state
    this.battleStateMachine.addState(BattleState.INTRO, {
      onEnter: () => {
        this.cameras.main.fadeIn(600, 0, 0, 0);
        this.time.delayedCall(600, () => {
          this.battleStateMachine.setState(BattleState.PRE_BATTLE_INFO);
        });
      }
    });

    // PRE_BATTLE_INFO state
    this.battleStateMachine.addState(BattleState.PRE_BATTLE_INFO, {
      onEnter: async () => {
        await this.activeEnemyMonster.showMonster();
        this.showMessage(`Wild ${this.activeEnemyMonster.getMonsterDetails().name} appeared!`);
        this.inputManager.unlockInput();
      }
    });

    // BRING_OUT_MONSTER state
    this.battleStateMachine.addState(BattleState.BRING_OUT_MONSTER, {
      onEnter: async () => {
        await this.activePlayerMonster.showMonster();
        this.availableMonstersUiContainer.setAlpha(1);
        this.showMessage(`Go ${this.activePlayerMonster.getMonsterDetails().name}!`);
        
        this.time.delayedCall(1200, () => {
          this.switchingActiveMonster = false;
          this.activeMonsterKnockedOut = false;
          this.battleStateMachine.setState(BattleState.PLAYER_INPUT);
        });
      }
    });

    // PLAYER_INPUT state
    this.battleStateMachine.addState(BattleState.PLAYER_INPUT, {
      onEnter: () => {
        this.battleMenu.showMenu();
      },
      onExit: () => {
        this.battleMenu.hideMenu();
      }
    });

    // ENEMY_INPUT state
    this.battleStateMachine.addState(BattleState.ENEMY_INPUT, {
      onEnter: () => {
        // Select random enemy move
        const moves = this.attackManager.getMonsterMoves(this.activeEnemyMonster);
        if (moves.length > 0) {
          this.activeEnemyAttackIndex = Math.floor(Math.random() * moves.length);
        }
        this.battleStateMachine.setState(BattleState.BATTLE);
      }
    });

    // BATTLE state
    this.battleStateMachine.addState(BattleState.BATTLE, {
      onEnter: async () => {
        // Determine turn order (simplified - player goes first)
        await this.executePlayerAttack();
        await this.executeEnemyAttack();
        this.battleStateMachine.setState(BattleState.POST_ATTACK_CHECK);
      }
    });

    // POST_ATTACK_CHECK state
    this.battleStateMachine.addState(BattleState.POST_ATTACK_CHECK, {
      onEnter: () => {
        this.postBattleSequenceCheck();
      }
    });

    // FLEE_ATTEMPT state
    this.battleStateMachine.addState(BattleState.FLEE_ATTEMPT, {
      onEnter: () => {
        const success = Math.random() > 0.5;
        if (success) {
          this.showMessage('You got away safely!');
          this.time.delayedCall(1000, () => {
            this.battleStateMachine.setState(BattleState.FINISHED);
          });
        } else {
          this.showMessage('You failed to run away...');
          this.time.delayedCall(1000, () => {
            this.battleStateMachine.setState(BattleState.ENEMY_INPUT);
          });
        }
      }
    });

    // GAIN_EXPERIENCE state
    this.battleStateMachine.addState(BattleState.GAIN_EXPERIENCE, {
      onEnter: () => {
        this.handleExperienceGain();
      }
    });

    // SWITCH_MONSTER state
    this.battleStateMachine.addState(BattleState.SWITCH_MONSTER, {
      onEnter: () => {
        // For now, just switch to first available monster
        const availableMonsters = this.sceneData.playerMonsters.filter(
          (monster, index) => index !== this.activePlayerMonsterPartyIndex && monster.currentHp > 0
        );
        
        if (availableMonsters.length === 0) {
          this.showMessage('You have no other monsters able to fight!');
          this.battleStateMachine.setState(BattleState.PLAYER_INPUT);
          return;
        }

        // Switch to first available monster
        const newMonsterIndex = this.sceneData.playerMonsters.indexOf(availableMonsters[0]);
        this.switchToMonster(newMonsterIndex);
      }
    });

    // FINISHED state
    this.battleStateMachine.addState(BattleState.FINISHED, {
      onEnter: () => {
        this.transitionToNextScene();
      }
    });
  }

  private async executePlayerAttack(): Promise<void> {
    if (!this.selectedMove || this.activePlayerMonster.isKnockedOut()) {
      return;
    }

    const monsterDetails = this.activePlayerMonster.getMonsterDetails();
    this.showMessage(`${monsterDetails.name} used ${this.selectedMove.name}!`);

    await this.attackManager.executeAttack({
      attacker: this.activePlayerMonster,
      defender: this.activeEnemyMonster,
      move: this.selectedMove,
      target: AttackTarget.ENEMY
    });
  }

  private async executeEnemyAttack(): Promise<void> {
    if (this.activeEnemyMonster.isKnockedOut()) {
      return;
    }

    const moves = this.attackManager.getMonsterMoves(this.activeEnemyMonster);
    if (moves.length === 0) return;

    const enemyMove = moves[this.activeEnemyAttackIndex];
    const monsterDetails = this.activeEnemyMonster.getMonsterDetails();
    this.showMessage(`Foe ${monsterDetails.name} used ${enemyMove.name}!`);

    await this.attackManager.executeAttack({
      attacker: this.activeEnemyMonster,
      defender: this.activePlayerMonster,
      move: enemyMove,
      target: AttackTarget.PLAYER
    });
  }

  private postBattleSequenceCheck(): void {
    // Update monster data
    this.sceneData.playerMonsters[this.activePlayerMonsterPartyIndex].currentHp = 
      this.activePlayerMonster.getCurrentHp();

    const dataManager = this.registry.get('dataManager') as DataManager;
    dataManager.dataStore.set(DataManagerStoreKeys.CRITTERS_IN_PARTY, this.sceneData.playerMonsters);

    if (this.monsterCaptured) {
      this.showMessage(`You caught ${this.activeEnemyMonster.getMonsterDetails().name}!`);
      this.battleStateMachine.setState(BattleState.GAIN_EXPERIENCE);
      return;
    }

    if (this.activeEnemyMonster.isKnockedOut()) {
      this.showMessage(`Wild ${this.activeEnemyMonster.getMonsterDetails().name} fainted!`);
      this.battleStateMachine.setState(BattleState.GAIN_EXPERIENCE);
      return;
    }

    if (this.activePlayerMonster.isKnockedOut()) {
      this.showMessage(`${this.activePlayerMonster.getMonsterDetails().name} fainted!`);
      
      // Check if player has other monsters
      const hasOtherActiveMonsters = this.sceneData.playerMonsters.some(
        (monster, index) => 
          index !== this.activePlayerMonsterPartyIndex && monster.currentHp > 0
      );

      if (!hasOtherActiveMonsters) {
        this.showMessage('You have no more monsters, escaping to safety...');
        this.playerKnockedOut = true;
        this.battleStateMachine.setState(BattleState.FINISHED);
        return;
      }

      this.activeMonsterKnockedOut = true;
      this.battleStateMachine.setState(BattleState.SWITCH_MONSTER);
      return;
    }

    this.battleStateMachine.setState(BattleState.PLAYER_INPUT);
  }

  private handleExperienceGain(): void {
    const enemyDetails = this.activeEnemyMonster.getMonsterDetails();
    const baseExp = (enemyDetails as any).baseExp || 100; // Fallback if missing
    const gainedExpForActive = calculateExpGainedFromCritter(
      baseExp,
      enemyDetails.currentLevel,
      true
    );
    const gainedExpForInactive = calculateExpGainedFromCritter(
      baseExp,
      enemyDetails.currentLevel,
      false
    );

    const messages: string[] = [];
    
    this.sceneData.playerMonsters.forEach((monster, index) => {
      if (monster.currentHp <= 0) return;

      const gainedExp = index === this.activePlayerMonsterPartyIndex ? gainedExpForActive : gainedExpForInactive;
      const statChanges = handleCritterGainingExperience(monster as CritterInstance, gainedExp);
      
      messages.push(`${monster.name} gained ${gainedExp} exp!`);
      
      if (statChanges.statChanges.level > 0) {
        messages.push(
          `${monster.name} level increased to ${monster.currentLevel}!`,
          `${monster.name} attack increased by ${statChanges.statChanges.attack} and health increased by ${statChanges.statChanges.health}`
        );
      }
    });

    this.showMessage(messages.join(' '));
    
    this.time.delayedCall(2000, () => {
      if (this.monsterCaptured) {
        this.handleCaughtMonster();
      } else {
        this.battleStateMachine.setState(BattleState.FINISHED);
      }
    });
  }

  private handleCaughtMonster(): void {
    // Add monster to player's party
    const enemyDetails = this.activeEnemyMonster.getMonsterDetails();
    const capturedMonster = {
      ...enemyDetails,
      id: `captured-${Date.now()}`,
      currentHp: this.activeEnemyMonster.getCurrentHp(),
    } as LegacyMonster;

    this.sceneData.playerMonsters.push(capturedMonster);
    this.battleStateMachine.setState(BattleState.FINISHED);
  }

  private switchToMonster(newMonsterIndex: number): void {
    this.switchingActiveMonster = true;
    this.activePlayerMonsterPartyIndex = newMonsterIndex;
    
    // Update the player monster
    this.activePlayerMonster.destroy();
    this.activePlayerMonster = new PlayerBattleMonster({
      scene: this,
      monsterDetails: this.sceneData.playerMonsters[newMonsterIndex],
      skipBattleAnimations: this.skipAnimations,
    });

    this.battleStateMachine.setState(BattleState.BRING_OUT_MONSTER);
  }

  private createAvailableMonstersUi(): void {
    this.availableMonstersUiContainer = this.add.container(
      this.scale.width - 24, 
      304, 
      []
    );

    this.sceneData.playerMonsters.forEach((monster, index) => {
      const alpha = monster.currentHp > 0 ? 1 : 0.4;
      const ball = this.add
        .image(30 * -index, 0, TextureKeys.BALL_THUMBNAIL)
        .setScale(0.8)
        .setAlpha(alpha);
      this.availableMonstersUiContainer.add(ball);
    });

    this.availableMonstersUiContainer.setAlpha(0);
  }

  private showMessage(message: string): void {
    console.log('[Battle]', message);
    // In a full implementation, this would show a message box
    // For now, we'll just advance the state after a delay
  }

  private transitionToNextScene(): void {
    const dataManager = this.registry.get('dataManager') as DataManager;
    dataManager.dataStore.set(DataManagerStoreKeys.CRITTERS_IN_PARTY, this.sceneData.playerMonsters);

    // Emit battle completion events
    if (this.playerKnockedOut) {
      EventBus.emit('battle:defeat');
    } else {
      EventBus.emit('battle:victory');
    }

    // Transition back to overworld
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(SceneKeys.WORLD, {
        isPlayerKnockedOut: this.playerKnockedOut
      });
    });
  }

  /**
   * Handle scene resume (for monster switching)
   */
  handleSceneResume(sys: Phaser.Scenes.Systems, data?: BattleSceneResumeData): void {
    super.handleSceneResume(sys, data);

    if (!data || !data.wasMonsterSelected || data.selectedMonsterIndex === undefined) {
      this.battleStateMachine.setState(BattleState.PLAYER_INPUT);
      return;
    }

    this.inputManager.lockInput();
    this.switchingActiveMonster = true;

    // Switch to selected monster
    this.switchToMonster(data.selectedMonsterIndex);
    this.inputManager.unlockInput();
  }

  /**
   * Clean up resources
   */
  shutdown(): void {
    // Clean up battle components
    if (this.background) this.background.destroy();
    if (this.activeEnemyMonster) this.activeEnemyMonster.destroy();
    if (this.activePlayerMonster) this.activePlayerMonster.destroy();
    if (this.battleMenu) this.battleMenu.destroy();
    if (this.ball) this.ball.destroy();
    if (this.availableMonstersUiContainer) this.availableMonstersUiContainer.destroy();
    if (this.battleStateMachine) this.battleStateMachine.reset();

    // Clean up event listeners
    this.events.removeAllListeners();

    // Clean up timers and tweens
    this.tweens.killAll();
    this.time.removeAllEvents();

    super.shutdown();
  }
}