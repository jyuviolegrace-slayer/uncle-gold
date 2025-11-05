import { ICritter, IMove, CritterType } from './types';
import { TypeChart } from './TypeChart';
import { MoveDatabase } from './MoveDatabase';
import Phaser from 'phaser';

export interface AIDecision {
  moveId: string;
  switchCritterIndex?: number;
  action: 'move' | 'switch';
}

/**
 * AIDecisionMaker - Implements AI strategies for different opponent types
 * Supports random AI for wild critters and type-aware heuristics for trainers
 */
export class AIDecisionMaker {
  /**
   * Make a decision for a wild critter (random move selection)
   */
  static decideWildCritterMove(critter: ICritter): AIDecision {
    if (critter.moves.length === 0) {
      return { moveId: '', action: 'move' };
    }

    const validMoves = critter.moves.filter(m => m.currentPP > 0);
    if (validMoves.length === 0) {
      return { moveId: critter.moves[0].moveId, action: 'move' };
    }

    const randomMove = validMoves[Phaser.Math.Between(0, validMoves.length - 1)];
    return { moveId: randomMove.moveId, action: 'move' };
  }

  /**
   * Make a decision for a trainer critter (type-aware heuristics)
   */
  static decideTrainerMove(
    critter: ICritter,
    defenderTypes: CritterType[],
    defenderStats: { defense: number; spDef: number }
  ): AIDecision {
    const validMoves = critter.moves.filter(m => m.currentPP > 0);

    if (validMoves.length === 0) {
      return { moveId: critter.moves[0]?.moveId || '', action: 'move' };
    }

    let bestMoveId = validMoves[0].moveId;
    let bestScore = -Infinity;

    for (const moveInstance of validMoves) {
      const move = MoveDatabase.getMove(moveInstance.moveId);
      if (!move) continue;

      let score = move.power || 1;

      // Type effectiveness bonus
      const effectiveness = TypeChart.getEffectiveness(move.type as CritterType, defenderTypes);
      score *= effectiveness;

      // STAB bonus (same type attack bonus)
      const hasSTAB = critter.baseStats && true; // Simplified check
      if (hasSTAB && critter.baseStats) {
        // Check if critter has this type
        const species = this.getSpeciesForCritter(critter);
        if (species && species.type.includes(move.type)) {
          score *= 1.5;
        }
      }

      // Accuracy factor
      score *= move.accuracy / 100;

      // Slight randomization to avoid being too predictable
      score += Phaser.Math.Between(-5, 5);

      if (score > bestScore) {
        bestScore = score;
        bestMoveId = moveInstance.moveId;
      }
    }

    return { moveId: bestMoveId, action: 'move' };
  }

  /**
   * Decide whether to switch critters for trainer battles
   */
  static decideTrainerSwitch(
    currentCritter: ICritter,
    opponentAttackType: CritterType,
    party: ICritter[]
  ): AIDecision | null {
    // Only switch if current critter has type disadvantage and low health
    const species = this.getSpeciesForCritter(currentCritter);
    if (!species) return null;

    const effectiveness = TypeChart.getEffectiveness(opponentAttackType, species.type);

    // Switch if super effective and health is low
    if (effectiveness > 1.0 && currentCritter.currentHP < currentCritter.maxHP * 0.5) {
      // Find a better matchup
      for (let i = 0; i < party.length; i++) {
        if (party[i].isFainted) continue;
        if (party[i].id === currentCritter.id) continue;

        const switchSpecies = this.getSpeciesForCritter(party[i]);
        if (!switchSpecies) continue;

        const switchResistance = TypeChart.getEffectiveness(opponentAttackType, switchSpecies.type);
        if (switchResistance <= 1.0) {
          return { moveId: '', switchCritterIndex: i, action: 'switch' };
        }
      }
    }

    return null;
  }

  /**
   * Get species data for a critter instance
   */
  private static getSpeciesForCritter(critter: ICritter): any {
    // This is a placeholder - would integrate with CritterSpeciesDatabase in real implementation
    // For now, return null and caller will handle it
    return null;
  }

  /**
   * Make gym leader AI decision (more aggressive)
   */
  static decideGymLeaderMove(
    critter: ICritter,
    defenderTypes: CritterType[],
    battleTurnNumber: number
  ): AIDecision {
    const validMoves = critter.moves.filter(m => m.currentPP > 0);

    if (validMoves.length === 0) {
      return { moveId: critter.moves[0]?.moveId || '', action: 'move' };
    }

    // Gym leaders are more aggressive early on
    let bestMoveId = validMoves[0].moveId;
    let bestScore = -Infinity;

    for (const moveInstance of validMoves) {
      const move = MoveDatabase.getMove(moveInstance.moveId);
      if (!move) continue;

      let score = move.power || 1;

      // Type effectiveness bonus (more aggressive weighting)
      const effectiveness = TypeChart.getEffectiveness(move.type as CritterType, defenderTypes);
      score *= effectiveness * 1.5; // Weighted more heavily than trainer

      // Accuracy factor
      score *= move.accuracy / 100;

      // Slight randomization
      score += Phaser.Math.Between(-2, 2);

      if (score > bestScore) {
        bestScore = score;
        bestMoveId = moveInstance.moveId;
      }
    }

    return { moveId: bestMoveId, action: 'move' };
  }
}
