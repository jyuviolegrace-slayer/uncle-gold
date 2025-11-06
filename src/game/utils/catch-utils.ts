import { Math as PhaserMath } from 'phaser';
import { CritterInstance } from '../models/critter';

/**
 * Catch/capture utility functions
 * Ported from archive/src/utils/catch-utils.js
 */

export interface CaptureResults {
  requiredCaptureValue: number;
  actualCaptureValue: number;
  wasCaptured: boolean;
}

export interface BattleCritter extends CritterInstance {
  currentHp: number;
  maxHp: number;
  catchRate?: number;
}

/**
 * Calculate the minimum value required for capture based on critter's health
 * @param critter The critter to calculate capture difficulty for
 * @returns Minimum value required for successful capture (0-100)
 */
export function calculateMinValueForCapture(critter: BattleCritter): number {
  let baseMin = 80; // Base difficulty
  const healthRatio = critter.currentHp / critter.maxHp;

  // Adjust difficulty based on remaining health
  if (healthRatio < 0.25) {
    baseMin -= 20; // Much easier when very low health
  } else if (healthRatio < 0.5) {
    baseMin -= 15; // Easier when low health
  } else if (healthRatio < 0.75) {
    baseMin -= 10; // Slightly easier when damaged
  } else if (healthRatio < 0.9) {
    baseMin -= 5; // Slightly easier when slightly damaged
  }

  // Adjust for catch rate if available (lower catch rate = harder to catch)
  if (critter.catchRate !== undefined) {
    // Catch rate is typically 0-255, where higher is easier to catch
    // Map this to a difficulty modifier
    const catchRateModifier = (255 - critter.catchRate) / 255 * 20; // Max 20 point adjustment
    baseMin += catchRateModifier;
  }

  // Ensure the minimum is within valid bounds
  return Math.max(0, Math.min(100, baseMin));
}

/**
 * Calculate capture results for a critter
 * @param critter The critter attempting to be captured
 * @returns Capture results including whether it was successful
 */
export function calculateCaptureResults(critter: BattleCritter): CaptureResults {
  const minValueRequiredForCapture = calculateMinValueForCapture(critter);
  const randomValue = PhaserMath.Between(0, 100);
  
  return {
    requiredCaptureValue: minValueRequiredForCapture,
    actualCaptureValue: randomValue,
    wasCaptured: randomValue >= minValueRequiredForCapture,
  };
}

/**
 * Calculate capture probability for UI display
 * @param critter The critter to calculate probability for
 * @returns Capture probability as percentage (0-100)
 */
export function calculateCaptureProbability(critter: BattleCritter): number {
  const minValue = calculateMinValueForCapture(critter);
  return Math.max(0, Math.min(100, 100 - minValue));
}

/**
 * Simulate multiple capture attempts to get accurate probability
 * @param critter The critter to test
 * @param simulations Number of simulations to run (default 1000)
 * @returns Actual capture success rate as percentage
 */
export function simulateCaptureAttempts(critter: BattleCritter, simulations: number = 1000): number {
  let successes = 0;
  
  for (let i = 0; i < simulations; i++) {
    const result = calculateCaptureResults(critter);
    if (result.wasCaptured) {
      successes++;
    }
  }
  
  return (successes / simulations) * 100;
}

/**
 * Get capture difficulty description
 * @param critter The critter to get difficulty for
 * @returns Human-readable difficulty description
 */
export function getCaptureDifficultyDescription(critter: BattleCritter): string {
  const probability = calculateCaptureProbability(critter);
  
  if (probability >= 80) {
    return 'Very Easy';
  } else if (probability >= 60) {
    return 'Easy';
  } else if (probability >= 40) {
    return 'Medium';
  } else if (probability >= 20) {
    return 'Hard';
  } else if (probability >= 5) {
    return 'Very Hard';
  } else {
    return 'Nearly Impossible';
  }
}

/**
 * Calculate shake intensity for capture animation based on capture difficulty
 * @param critter The critter being captured
 * @returns Number of shakes (0-3) for the capture animation
 */
export function calculateCaptureShakes(critter: BattleCritter): number {
  const result = calculateCaptureResults(critter);
  
  if (!result.wasCaptured) {
    return 0; // Broke out immediately
  }
  
  const probability = calculateCaptureProbability(critter);
  
  // More shakes for harder captures
  if (probability >= 80) {
    return 1; // Easy capture
  } else if (probability >= 40) {
    return 2; // Medium capture
  } else {
    return 3; // Difficult capture
  }
}

/**
 * Calculate critical capture chance (improved capture rate)
 * @param critter The critter to calculate for
 * @param catchBonus Bonus from capture items (default 1.0)
 * @returns Critical capture chance as percentage (0-100)
 */
export function calculateCriticalCaptureChance(critter: BattleCritter, catchBonus: number = 1.0): number {
  const baseChance = calculateCaptureProbability(critter);
  const criticalChance = baseChance * 0.5 * catchBonus; // Critical is half of normal chance
  return Math.min(100, criticalChance);
}

/**
 * Determine if a capture should be critical
 * @param critter The critter being captured
 * @param catchBonus Bonus from capture items (default 1.0)
 * @returns True if capture should be critical
 */
export function isCriticalCapture(critter: BattleCritter, catchBonus: number = 1.0): boolean {
  const criticalChance = calculateCriticalCaptureChance(critter, catchBonus);
  return PhaserMath.Between(0, 100) <= criticalChance;
}