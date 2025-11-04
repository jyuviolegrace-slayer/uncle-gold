import { CritterType, TypeEffectivenessRow } from './types';

/**
 * TypeChart - utility for calculating type effectiveness
 * 8x8 type effectiveness matrix for Critter Quest
 */
export class TypeChart {
  /**
   * Type effectiveness matrix
   * Row = attacking type, Column = defending type
   * 2.0 = super effective, 1.0 = neutral, 0.5 = resisted
   */
  private static readonly EFFECTIVENESS_MATRIX: Record<CritterType, TypeEffectivenessRow> = {
    Fire: {
      Fire: 0.5,
      Water: 0.5,
      Grass: 2.0,
      Electric: 1.0,
      Psychic: 1.0,
      Ground: 1.0,
      Dark: 1.0,
      Fairy: 2.0,
    },
    Water: {
      Fire: 2.0,
      Water: 0.5,
      Grass: 0.5,
      Electric: 1.0,
      Psychic: 1.0,
      Ground: 2.0,
      Dark: 1.0,
      Fairy: 1.0,
    },
    Grass: {
      Fire: 0.5,
      Water: 2.0,
      Grass: 0.5,
      Electric: 1.0,
      Psychic: 1.0,
      Ground: 2.0,
      Dark: 1.0,
      Fairy: 1.0,
    },
    Electric: {
      Fire: 1.0,
      Water: 2.0,
      Grass: 0.5,
      Electric: 0.5,
      Psychic: 1.0,
      Ground: 1.0,
      Dark: 1.0,
      Fairy: 1.0,
    },
    Psychic: {
      Fire: 1.0,
      Water: 1.0,
      Grass: 1.0,
      Electric: 1.0,
      Psychic: 0.5,
      Ground: 1.0,
      Dark: 2.0,
      Fairy: 1.0,
    },
    Ground: {
      Fire: 2.0,
      Water: 1.0,
      Grass: 0.5,
      Electric: 2.0,
      Psychic: 1.0,
      Ground: 1.0,
      Dark: 1.0,
      Fairy: 1.0,
    },
    Dark: {
      Fire: 1.0,
      Water: 1.0,
      Grass: 1.0,
      Electric: 1.0,
      Psychic: 2.0,
      Ground: 1.0,
      Dark: 0.5,
      Fairy: 0.5,
    },
    Fairy: {
      Fire: 0.5,
      Water: 1.0,
      Grass: 1.0,
      Electric: 1.0,
      Psychic: 1.0,
      Ground: 1.0,
      Dark: 2.0,
      Fairy: 1.0,
    },
  };

  /**
   * Get effectiveness multiplier for attacking with moveType against defending types
   * @param moveType Type of the attacking move
   * @param defenderTypes Types of the defending critter
   * @returns Effectiveness multiplier
   */
  static getEffectiveness(moveType: CritterType, defenderTypes: CritterType[]): number {
    let multiplier = 1.0;

    for (const defenderType of defenderTypes) {
      multiplier *= this.EFFECTIVENESS_MATRIX[moveType][defenderType];
    }

    return multiplier;
  }

  /**
   * Check if attack is super effective
   */
  static isSuperEffective(moveType: CritterType, defenderTypes: CritterType[]): boolean {
    return this.getEffectiveness(moveType, defenderTypes) > 1.0;
  }

  /**
   * Check if attack is not very effective
   */
  static isNotVeryEffective(moveType: CritterType, defenderTypes: CritterType[]): boolean {
    return this.getEffectiveness(moveType, defenderTypes) < 1.0;
  }

  /**
   * Get types that are strong against given types
   */
  static getStrengthAgainst(defenderTypes: CritterType[]): CritterType[] {
    const allTypes: CritterType[] = ['Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Ground', 'Dark', 'Fairy'];
    return allTypes.filter(type => this.getEffectiveness(type, defenderTypes) > 1.0);
  }

  /**
   * Get types that are weak against given types
   */
  static getWeakAgainst(attackerTypes: CritterType[]): CritterType[] {
    const allTypes: CritterType[] = ['Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Ground', 'Dark', 'Fairy'];
    return allTypes.filter(type => {
      for (const attackerType of attackerTypes) {
        const eff = this.EFFECTIVENESS_MATRIX[attackerType][type];
        if (eff > 1.0) return true;
      }
      return false;
    });
  }

  /**
   * Get resistance multiplier for defending with given types against move type
   */
  static getResistance(defenderTypes: CritterType[], moveType: CritterType): number {
    return this.getEffectiveness(moveType, defenderTypes);
  }

  /**
   * Get all available types
   */
  static getAllTypes(): CritterType[] {
    return ['Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Ground', 'Dark', 'Fairy'];
  }
}
