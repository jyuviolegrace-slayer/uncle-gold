import { Math as PhaserMath } from 'phaser';
import { CritterInstance } from '../models/critter';

/**
 * Leveling and experience utility functions
 * Ported from archive/src/utils/leveling-utils.js
 */

export interface StatChanges {
  level: number;
  health: number;
  attack: number;
}

export interface LevelUpResults {
  leveledUp: boolean;
  levelsGained: number;
  statChanges: StatChanges;
  newLevel: number;
  newExp: number;
}

/**
 * Calculates the total number of experience points that are needed for a given level.
 * For a simple growth rate, we are using the same equation for all critters in the game.
 * Example: if target level is 5, we need 125 total exp, vs level 100 where we need 1,000,000 exp.
 *
 * In the game, we have a max level of 100, so if the provided level is greater than that
 * we return the max exp that is needed for the max level.
 * @param level The target level we need to the total experience for
 * @returns The total experience amount needed to reach the provided level
 */
export function totalExpNeededForLevel(level: number): number {
  if (level > 100) {
    return 100 ** 3;
  }
  return level ** 3;
}

/**
 * Calculates the number of experience points the critter needs to gain to reach the
 * next level. Calculation is based off the critter's current level and current exp points.
 *
 * In the game, we have a max level of 100, so if the provided level is at the current
 * max level, we return 0 exp.
 * @param currentLevel The current level of the critter
 * @param currentExp The current exp of the critter
 * @returns The total experience points needed to reach the next level
 */
export function expNeededForNextLevel(currentLevel: number, currentExp: number): number {
  if (currentLevel >= 100) {
    return 0;
  }
  return totalExpNeededForLevel(currentLevel + 1) - currentExp;
}

/**
 * Calculates the current value of exp to display on the exp bar.
 * The current value is based on how much more the exp the critter needs
 * to reach the next level. This is calculated by taking the critter's current
 * exp points, subtracting the base exp needed to reach the current level, and
 * then comparing that value against the exp points needed to reach the next level.
 * @param currentLevel The current level of the critter
 * @param currentExp The current exp of the critter
 * @returns The progress to next level as a value between 0 and 1
 */
export function calculateExpBarCurrentValue(currentLevel: number, currentExp: number): number {
  const expNeededForCurrentLevel = totalExpNeededForLevel(currentLevel);
  let currentExpForBar = currentExp - expNeededForCurrentLevel;
  if (currentExpForBar < 0) {
    currentExpForBar = 0;
  }
  const expForNextLevel = totalExpNeededForLevel(currentLevel + 1);
  const maxExpForBar = expForNextLevel - expNeededForCurrentLevel;
  return currentExpForBar / maxExpForBar;
}

/**
 * Calculates the percentage of experience progress to the next level
 * @param currentLevel The current level of the critter
 * @param currentExp The current exp of the critter
 * @returns Experience progress as a percentage (0-100)
 */
export function calculateExpProgress(currentLevel: number, currentExp: number): number {
  return calculateExpBarCurrentValue(currentLevel, currentExp) * 100;
}

/**
 * Calculates the number of experience points a critter will gain from a given critter
 * based on that critter's baseExp value and current level.
 * @param baseExp The base exp value for a given critter that was defeated or caught
 * @param defeatedLevel The current level of a given critter that was defeated or caught
 * @param isActiveCritter If the critter that is gaining the exp was the current active critter in battle
 * @param isWild Whether the defeated critter was wild (true) or tamed (false)
 * @returns The number of experience points earned from this critter
 */
export function calculateExpGainedFromCritter(
  baseExp: number,
  defeatedLevel: number,
  isActiveCritter: boolean = true,
  isWild: boolean = true
): number {
  let exp = Math.round(((baseExp * defeatedLevel) / 7) * (1 / (isActiveCritter ? 1 : 2)));
  
  // Wild critters give more exp than tamed critters
  if (!isWild) {
    exp = Math.round(exp * 0.5); // Tamed critters give half the exp
  }
  
  return Math.max(1, exp); // Always give at least 1 exp
}

/**
 * Adds the given experience to the provided critter and handles increasing the critter's
 * level and stats if the critter leveled up.
 * @param critter The critter that is gaining the experience
 * @param gainedExp The amount of experience the critter gained
 * @returns The stat increases that were applied to the critter
 */
export function handleCritterGainingExperience(critter: CritterInstance, gainedExp: number): LevelUpResults {
  if (critter.currentLevel >= 100) {
    return {
      leveledUp: false,
      levelsGained: 0,
      statChanges: {
        level: 0,
        health: 0,
        attack: 0,
      },
      newLevel: critter.currentLevel,
      newExp: critter.currentExp,
    };
  }

  critter.currentExp += gainedExp;
  
  const results: LevelUpResults = {
    leveledUp: false,
    levelsGained: 0,
    statChanges: {
      level: 0,
      health: 0,
      attack: 0,
    },
    newLevel: critter.currentLevel,
    newExp: critter.currentExp,
  };

  // Check if we have enough exp to gain a level
  let gainedLevel = false;
  do {
    gainedLevel = false;
    const expRequiredForNextLevel = totalExpNeededForLevel(critter.currentLevel + 1);
    if (critter.currentExp >= expRequiredForNextLevel) {
      critter.currentLevel += 1;
      results.leveledUp = true;
      results.levelsGained += 1;
      
      // Calculate stat increases
      const bonusAttack = PhaserMath.Between(0, 1);
      const bonusHealth = PhaserMath.Between(0, 3);
      const hpIncrease = 5 + bonusHealth;
      const atkIncrease = 1 + bonusAttack;
      
      critter.maxHp += hpIncrease;
      critter.currentHp += hpIncrease; // Also heal on level up
      critter.baseAttack += atkIncrease;
      critter.currentAttack += atkIncrease;
      
      results.statChanges.level += 1;
      results.statChanges.health += hpIncrease;
      results.statChanges.attack += atkIncrease;

      gainedLevel = true;
    }
  } while (gainedLevel);

  results.newLevel = critter.currentLevel;
  results.newExp = critter.currentExp;

  return results;
}

/**
 * Check if a critter can evolve based on its level
 * @param critter The critter to check
 * @param evolutionLevel The level at which the critter evolves
 * @returns True if the critter can evolve
 */
export function canCritterEvolve(critter: CritterInstance, evolutionLevel: number): boolean {
  return critter.currentLevel >= evolutionLevel;
}

/**
 * Calculate the experience needed to reach a specific level from current level
 * @param currentLevel The critter's current level
 * @param targetLevel The target level to reach
 * @param currentExp The critter's current experience
 * @returns Experience needed to reach the target level
 */
export function expNeededToReachLevel(currentLevel: number, targetLevel: number, currentExp: number): number {
  if (targetLevel <= currentLevel) {
    return 0;
  }
  if (targetLevel > 100) {
    targetLevel = 100;
  }
  
  return totalExpNeededForLevel(targetLevel) - currentExp;
}

/**
 * Get the experience range for a specific level
 * @param level The level to get range for
 * @returns Object with min and max exp for the level
 */
export function getLevelExpRange(level: number): { min: number; max: number } {
  if (level <= 1) {
    return { min: 0, max: totalExpNeededForLevel(2) };
  }
  return {
    min: totalExpNeededForLevel(level),
    max: totalExpNeededForLevel(level + 1),
  };
}

/**
 * Calculate the total stat potential for a critter at max level
 * @param baseStats The base stats of the critter
 * @param maxLevel The maximum level (default 100)
 * @returns Projected stats at max level
 */
export function calculateMaxLevelStats(baseStats: { hp: number; attack: number }, maxLevel: number = 100): { hp: number; attack: number } {
  // Calculate total stat increases over the leveling process
  const levelUps = maxLevel - 1; // Start from level 1
  
  // Average stat increases per level (based on the random ranges in handleCritterGainingExperience)
  const avgHpIncreasePerLevel = 5 + 1.5; // 5 base + average of 0-3
  const avgAttackIncreasePerLevel = 1 + 0.5; // 1 base + average of 0-1
  
  return {
    hp: baseStats.hp + Math.round(avgHpIncreasePerLevel * levelUps),
    attack: baseStats.attack + Math.round(avgAttackIncreasePerLevel * levelUps),
  };
}