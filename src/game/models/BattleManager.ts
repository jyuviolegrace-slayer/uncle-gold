import { IBattle, IBattleParticipant, IBattleTurn, ICritter, IMove, Stats } from './types';
import { TypeChart } from './TypeChart';
import { EventBus } from '../EventBus';

/**
 * BattleManager - orchestrates turn-based battle logic
 * Handles damage calculation, turn ordering, status effects, and battle flow
 */
export class BattleManager {
  private battle: IBattle;
  private moveDatabase: Map<string, IMove> = new Map();
  private turnQueue: IBattleTurn[] = [];

  constructor(battle: IBattle) {
    this.battle = battle;
  }

  /**
    * Initialize battle with participants
    */
  static createBattle(
    playerId: string,
    playerName: string,
    playerParty: ICritter[],
    opponentId: string,
    opponentName: string,
    opponentParty: ICritter[],
    isWildEncounter: boolean = false
  ): IBattle {
    const battle: IBattle = {
      id: `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      player: {
        id: playerId,
        name: playerName,
        party: playerParty,
        currentCritterIndex: 0,
      },
      opponent: {
        id: opponentId,
        name: opponentName,
        party: opponentParty,
        currentCritterIndex: 0,
      },
      turnCount: 0,
      log: [],
      isWildEncounter,
      isTrainerBattle: !isWildEncounter,
      battleStatus: 'Active',
    };

    return battle;
  }

  /**
   * Register a move for use in battle
   */
  registerMove(move: IMove): void {
    this.moveDatabase.set(move.id, move);
  }

  /**
   * Register multiple moves
   */
  registerMoves(moves: IMove[]): void {
    moves.forEach(move => this.registerMove(move));
  }

  /**
   * Get current active critter for a participant
   */
  getActiveCritter(participantId: string): ICritter | null {
    const participant =
      this.battle.player.id === participantId ? this.battle.player : this.battle.opponent;
    if (!participant || participant.party.length === 0) return null;
    return participant.party[participant.currentCritterIndex];
  }

  /**
   * Calculate damage dealt by an attack
   * Formula: ((2 × Level / 5 + 2) × Power × Stat / 100) / 25 + 2) × STAB × Type × Random(0.85, 1.0)
   */
  calculateDamage(
    attackerLevel: number,
    movePower: number,
    attackerStat: number,
    defenderStat: number,
    isSameMoveType: boolean,
    typeEffectiveness: number
  ): number {
    const random = 0.85 + Math.random() * 0.15;
    const stab = isSameMoveType ? 1.5 : 1.0;

    const baseDamage =
      ((2 * attackerLevel) / 5 + 2) * movePower * (attackerStat / defenderStat) / 100 + 2;

    const damage = Math.floor(baseDamage / 25 * stab * typeEffectiveness * random);
    return Math.max(1, damage);
  }

  /**
   * Resolve a turn action (move execution, damage, effects)
   */
  resolveMoveAction(
    attackerId: string,
    moveId: string,
    defenderStats: Stats,
    defenderTypes: string[]
  ): { damage: number; isSuperEffective: boolean; isNotVeryEffective: boolean } {
    const move = this.moveDatabase.get(moveId);
    if (!move) {
      return { damage: 0, isSuperEffective: false, isNotVeryEffective: false };
    }

    const attacker = this.getActiveCritter(attackerId);
    if (!attacker) {
      return { damage: 0, isSuperEffective: false, isNotVeryEffective: false };
    }

    if (move.category === 'Status') {
      return { damage: 0, isSuperEffective: false, isNotVeryEffective: false };
    }

    const isSameType = attacker.baseStats ? true : false;
    const typeMultiplier = TypeChart.getEffectiveness(
      move.type as any,
      defenderTypes as any
    );

    const stat = move.category === 'Physical'
      ? attacker.currentStats.attack
      : attacker.currentStats.spAtk;

    const defStat = move.category === 'Physical'
      ? defenderStats.defense
      : defenderStats.spDef;

    const damage = this.calculateDamage(
      attacker.level,
      move.power,
      stat,
      defStat,
      isSameType,
      typeMultiplier
    );

    const isSuperEffective = typeMultiplier > 1.0;
    const isNotVeryEffective = typeMultiplier < 1.0;

    return { damage, isSuperEffective, isNotVeryEffective };
  }

  /**
   * Determine turn order based on speed
   */
  determineTurnOrder(
    playerCritter: ICritter,
    opponentCritter: ICritter,
    playerMovePriority: number = 0,
    opponentMovePriority: number = 0
  ): 'player' | 'opponent' {
    const playerSpeed = playerCritter.currentStats.speed + playerMovePriority;
    const opponentSpeed = opponentCritter.currentStats.speed + opponentMovePriority;

    return playerSpeed >= opponentSpeed ? 'player' : 'opponent';
  }

  /**
   * Check if a move hits (accuracy check)
   */
  doesMoveHit(moveAccuracy: number): boolean {
    return Math.random() * 100 <= moveAccuracy;
  }

  /**
   * Get a random move from critter's move set
   */
  getRandomMove(critter: ICritter): string | null {
    if (critter.moves.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * critter.moves.length);
    return critter.moves[randomIndex].moveId;
  }

  /**
   * Check if participant has active critters left
   */
  hasActiveCritters(participantId: string): boolean {
    const participant =
      this.battle.player.id === participantId ? this.battle.player : this.battle.opponent;
    return participant.party.some(c => !c.isFainted);
  }

  /**
   * Check battle victory/defeat conditions
   */
  checkBattleStatus(): void {
    const playerHasActive = this.hasActiveCritters(this.battle.player.id);
    const opponentHasActive = this.hasActiveCritters(this.battle.opponent.id);

    if (!playerHasActive && !opponentHasActive) {
      this.battle.battleStatus = 'Error';
      EventBus.emit('battle:error', { message: 'Draw - both out of critters' });
    } else if (!playerHasActive) {
      this.battle.battleStatus = 'OpponentWon';
      EventBus.emit('battle:defeat');
    } else if (!opponentHasActive) {
      this.battle.battleStatus = 'PlayerWon';
      EventBus.emit('battle:victory');
    }
  }

  /**
   * End current battle
   */
  endBattle(): void {
    if (this.battle.battleStatus === 'Active') {
      this.battle.battleStatus = 'Error';
    }
    EventBus.emit('battle:ended', this.battle);
  }

  /**
   * Get current battle state
   */
  getBattle(): IBattle {
    return this.battle;
  }

  /**
   * Add log entry to battle
   */
  addLog(message: string): void {
    this.battle.log.push(`Turn ${this.battle.turnCount}: ${message}`);
  }

  /**
   * Increment turn counter
   */
  nextTurn(): void {
    this.battle.turnCount += 1;
  }

  /**
   * Switch active critter for participant
   */
  switchCritter(participantId: string, newCritterIndex: number): boolean {
    const participant =
      this.battle.player.id === participantId ? this.battle.player : this.battle.opponent;

    if (
      newCritterIndex < 0 ||
      newCritterIndex >= participant.party.length ||
      participant.party[newCritterIndex].isFainted
    ) {
      return false;
    }

    participant.currentCritterIndex = newCritterIndex;
    const critterName = participant.party[newCritterIndex].nickname || `${participant.name}'s Critter`;
    this.addLog(`${participant.name} switched to ${critterName}!`);
    EventBus.emit('battle:switched', { participantId, critterIndex: newCritterIndex });
    return true;
  }

  /**
   * Apply status condition to critter
   */
  applyStatusEffect(critterId: string, status: string): void {
    const playerCritter = this.getActiveCritter(this.battle.player.id);
    const opponentCritter = this.getActiveCritter(this.battle.opponent.id);

    if (playerCritter?.id === critterId) {
      playerCritter.status = status as any;
    } else if (opponentCritter?.id === critterId) {
      opponentCritter.status = status as any;
    }

    EventBus.emit('battle:statusApplied', { critterId, status });
  }

  /**
   * Process damage to active critter
   */
  damageActiveCritter(participantId: string, damage: number): void {
    const critter = this.getActiveCritter(participantId);
    if (!critter) return;

    critter.currentHP = Math.max(0, critter.currentHP - damage);
    if (critter.currentHP === 0) {
      critter.isFainted = true;
    }

    EventBus.emit('battle:damageDealt', { participantId, damage, remainingHP: critter.currentHP });

    if (critter.isFainted) {
      EventBus.emit('battle:fainted', { participantId, critterName: critter.nickname || 'Critter' });
    }
  }
}
