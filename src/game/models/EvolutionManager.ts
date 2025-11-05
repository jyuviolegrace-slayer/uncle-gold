import { ICritter } from './types';
import { CritterSpeciesDatabase } from './CritterSpeciesDatabase';
import { MoveLearningManager } from './MoveLearningManager';
import { MoveDatabase } from './MoveDatabase';
import { EventBus } from '../EventBus';

/**
 * Evolution details for a critter
 */
export interface IEvolution {
  from: string;
  to: string;
  method: 'level' | 'item' | 'trade' | 'friendship';
  requirement: number | string;
}

/**
 * EvolutionManager - handles evolution checks and transformations
 * Manages evolution requirements and critter transformation
 */
export class EvolutionManager {
  /**
   * Check if critter can evolve
   */
  static canEvolve(critter: ICritter): IEvolution | null {
    const species = CritterSpeciesDatabase.getSpecies(critter.speciesId);
    if (!species || !species.evolvesInto) {
      return null;
    }

    const evoSpecies = CritterSpeciesDatabase.getSpecies(species.evolvesInto);
    if (!evoSpecies) {
      return null;
    }

    // Check level requirement
    if (species.evolutionLevel && critter.level >= species.evolutionLevel) {
      return {
        from: critter.speciesId,
        to: species.evolvesInto,
        method: 'level',
        requirement: species.evolutionLevel,
      };
    }

    return null;
  }

  /**
   * Get evolution info for a species
   */
  static getEvolutionInfo(speciesId: string): IEvolution | null {
    const species = CritterSpeciesDatabase.getSpecies(speciesId);
    if (!species || !species.evolvesInto || !species.evolutionLevel) {
      return null;
    }

    return {
      from: speciesId,
      to: species.evolvesInto,
      method: 'level',
      requirement: species.evolutionLevel,
    };
  }

  /**
   * Get all possible evolutions for a critter (including future evolutions)
   */
  static getEvolutionChain(speciesId: string): string[] {
    const chain: string[] = [speciesId];
    let current = speciesId;

    while (true) {
      const species = CritterSpeciesDatabase.getSpecies(current);
      if (!species || !species.evolvesInto) {
        break;
      }
      chain.push(species.evolvesInto);
      current = species.evolvesInto;
    }

    return chain;
  }

  /**
   * Evolve a critter to its next form
   * This transforms the critter in place and updates its moveset
   */
  static evolve(critter: ICritter): boolean {
    const evo = this.canEvolve(critter);
    if (!evo) {
      return false;
    }

    const newSpecies = CritterSpeciesDatabase.getSpecies(evo.to);
    if (!newSpecies) {
      return false;
    }

    // Transform species
    critter.speciesId = evo.to;

    // Update base stats
    critter.baseStats = { ...newSpecies.baseStats };

    // Recalculate current stats with new base stats
    (critter as any).recalculateStats();

    // Add new moves from evolved form's learnset
    this.addEvolutionMoves(critter, newSpecies.id);

    EventBus.emit('evolution:completed', {
      critterId: critter.id,
      fromSpecies: evo.from,
      toSpecies: evo.to,
      level: critter.level,
    });

    return true;
  }

  /**
   * Add moves from evolved form that critter hasn't learned yet
   */
  private static addEvolutionMoves(critter: ICritter, newSpeciesId: string): void {
    const learnableUpToLevel = MoveLearningManager.getLearnableMovesUpToLevel(
      newSpeciesId,
      critter.level
    );

    const learnedMoveIds = critter.moves.map(m => m.moveId);

    learnableUpToLevel.forEach(moveId => {
      if (!learnedMoveIds.includes(moveId) && critter.moves.length < 4) {
        const moveInstance = MoveDatabase.createMoveInstance(moveId);
        if (moveInstance) {
          (critter as any).addMove(moveInstance);
        }
      }
    });
  }

  /**
   * Check if critter is fully evolved
   */
  static isFullyEvolved(critter: ICritter): boolean {
    const species = CritterSpeciesDatabase.getSpecies(critter.speciesId);
    return !species || !species.evolvesInto;
  }

  /**
   * Get base form of a species
   */
  static getBaseForm(speciesId: string): string {
    const species = CritterSpeciesDatabase.getSpecies(speciesId);
    if (!species || !species.evolvesFrom) {
      return speciesId;
    }
    return this.getBaseForm(species.evolvesFrom);
  }

  /**
   * Get final evolution of a species
   */
  static getFinalForm(speciesId: string): string {
    const species = CritterSpeciesDatabase.getSpecies(speciesId);
    if (!species || !species.evolvesInto) {
      return speciesId;
    }
    return this.getFinalForm(species.evolvesInto);
  }
}
