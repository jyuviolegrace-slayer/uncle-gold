import { ICritter, IMove, IMoveInstance } from './types';
import { CritterSpeciesDatabase } from './CritterSpeciesDatabase';
import { MoveDatabase } from './MoveDatabase';
import { EventBus } from '../EventBus';

/**
 * MoveLearningManager - handles move learning and move replacement logic
 * Tracks which moves critters can learn at each level
 */
export class MoveLearningManager {
  /**
   * Get moves that critter can learn at a specific level
   */
  static getLearnableMoves(speciesId: string, level: number): string[] {
    const species = CritterSpeciesDatabase.getSpecies(speciesId);
    if (!species) return [];

    const learnset = this.getLearnset(speciesId);
    return learnset
      .filter(moveData => moveData.level === level)
      .map(moveData => moveData.moveId);
  }

  /**
   * Get all moves learnable up to a level
   */
  static getLearnableMovesUpToLevel(speciesId: string, level: number): string[] {
    const learnset = this.getLearnset(speciesId);
    return learnset
      .filter(moveData => moveData.level <= level)
      .map(moveData => moveData.moveId);
  }

  /**
   * Get the complete learnset for a species
   */
  static getLearnset(speciesId: string): Array<{ level: number; moveId: string }> {
    const species = CritterSpeciesDatabase.getSpecies(speciesId);
    if (!species) return [];

    const learnset: Array<{ level: number; moveId: string }> = [];

    const LEVEL_UP_MOVES: Record<string, Array<{ level: number; moveId: string }>> = {
      embolt: [
        { level: 1, moveId: 'scratch' },
        { level: 1, moveId: 'ember' },
        { level: 7, moveId: 'flame-burst' },
        { level: 15, moveId: 'dragon-claw' },
      ],
      boltiger: [
        { level: 1, moveId: 'scratch' },
        { level: 1, moveId: 'ember' },
        { level: 7, moveId: 'flame-burst' },
        { level: 15, moveId: 'dragon-claw' },
        { level: 36, moveId: 'dragon-claw' },
      ],
      aqualis: [
        { level: 1, moveId: 'water-gun' },
        { level: 1, moveId: 'bubblebeam' },
        { level: 10, moveId: 'aqua-ring' },
        { level: 20, moveId: 'bubblebeam' },
      ],
      tidecrown: [
        { level: 1, moveId: 'water-gun' },
        { level: 1, moveId: 'bubblebeam' },
        { level: 10, moveId: 'aqua-ring' },
        { level: 20, moveId: 'bubblebeam' },
        { level: 36, moveId: 'aqua-ring' },
      ],
      thornwick: [
        { level: 1, moveId: 'vine-whip' },
        { level: 1, moveId: 'growth' },
        { level: 8, moveId: 'growth' },
        { level: 16, moveId: 'vine-whip' },
      ],
      verdaxe: [
        { level: 1, moveId: 'vine-whip' },
        { level: 1, moveId: 'growth' },
        { level: 8, moveId: 'growth' },
        { level: 16, moveId: 'vine-whip' },
        { level: 36, moveId: 'vine-whip' },
      ],
      sparkit: [
        { level: 1, moveId: 'spark' },
        { level: 1, moveId: 'spark' },
        { level: 5, moveId: 'spark' },
        { level: 12, moveId: 'spark' },
      ],
      voltrix: [
        { level: 1, moveId: 'spark' },
        { level: 5, moveId: 'spark' },
        { level: 12, moveId: 'spark' },
        { level: 20, moveId: 'thunderbolt' },
      ],
      rockpile: [
        { level: 1, moveId: 'tackle' },
        { level: 1, moveId: 'tackle' },
        { level: 10, moveId: 'tackle' },
      ],
      boulderan: [
        { level: 1, moveId: 'tackle' },
        { level: 10, moveId: 'tackle' },
        { level: 25, moveId: 'earthquake' },
      ],
      glimflare: [
        { level: 1, moveId: 'fairy-wind' },
        { level: 5, moveId: 'fairy-wind' },
        { level: 15, moveId: 'fairy-wind' },
      ],
      flickering: [
        { level: 1, moveId: 'bite' },
        { level: 8, moveId: 'bite' },
      ],
      crystalid: [
        { level: 1, moveId: 'psychic' },
        { level: 10, moveId: 'psychic' },
      ],
      mentalmaw: [
        { level: 1, moveId: 'psychic' },
        { level: 10, moveId: 'psychic' },
        { level: 25, moveId: 'psychic' },
      ],
    };

    const moves = LEVEL_UP_MOVES[speciesId] || [];
    return moves;
  }

  /**
   * Check if critter learns a move at a level and hasn't learned it yet
   */
  static hasNewMoveToLearn(critter: ICritter): Array<{ moveId: string; level: number }> {
    const learnset = this.getLearnset(critter.speciesId);
    const learnedMoveIds = critter.moves.map(m => m.moveId);

    return learnset
      .filter(
        moveData => moveData.level === critter.level && !learnedMoveIds.includes(moveData.moveId)
      );
  }

  /**
   * Learn a move, replacing an existing one if necessary
   */
  static learnMove(critter: ICritter, moveId: string): boolean {
    if (!MoveDatabase.moveExists(moveId)) {
      return false;
    }

    const alreadyKnows = critter.moves.some(m => m.moveId === moveId);
    if (alreadyKnows) {
      return false;
    }

    const moveInstance = MoveDatabase.createMoveInstance(moveId);
    if (!moveInstance) {
      return false;
    }

    if (critter.moves.length < 4) {
      (critter as any).addMove(moveInstance);
      EventBus.emit('movelearned:success', {
        critterId: critter.id,
        moveId,
        moveName: MoveDatabase.getMove(moveId)?.name,
      });
      return true;
    }

    return false;
  }

  /**
   * Replace an existing move with a new one
   */
  static replaceMove(critter: ICritter, newMoveId: string, existingMoveIndex: number): boolean {
    if (!MoveDatabase.moveExists(newMoveId)) {
      return false;
    }

    if (existingMoveIndex < 0 || existingMoveIndex >= critter.moves.length) {
      return false;
    }

    const newMoveInstance = MoveDatabase.createMoveInstance(newMoveId);
    if (!newMoveInstance) {
      return false;
    }

    const oldMove = critter.moves[existingMoveIndex];
    critter.moves[existingMoveIndex] = newMoveInstance;

    EventBus.emit('movelearned:replaced', {
      critterId: critter.id,
      newMoveId,
      newMoveName: MoveDatabase.getMove(newMoveId)?.name,
      oldMoveId: oldMove.moveId,
      oldMoveName: MoveDatabase.getMove(oldMove.moveId)?.name,
    });

    return true;
  }

  /**
   * Get move by ID
   */
  static getMove(moveId: string): IMove | undefined {
    return MoveDatabase.getMove(moveId);
  }
}
