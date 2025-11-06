/**
 * Utility functions barrel export
 */

// Data utilities
export { DataUtils } from './data-utils';

// Random utilities
export {
  weightedRandom,
  weightedRandomLegacy,
  generateUuid,
  randomBetween,
  randomFloatBetween,
  randomChoice,
  shuffle,
  randomBoolean,
  rollDice,
  chance,
  randomString,
} from './random';
export type { WeightedItem } from './random';

// Time utilities
export {
  sleep,
  delayedCallback,
  createRepeatingTimer,
  createCountdownTimer,
  debounce,
  throttle,
  getCurrentTime,
  hasTimeElapsed,
  formatTime,
} from './time-utils';

// Catch utilities
export {
  calculateMinValueForCapture,
  calculateCaptureResults,
  calculateCaptureProbability,
  simulateCaptureAttempts,
  getCaptureDifficultyDescription,
  calculateCaptureShakes,
  calculateCriticalCaptureChance,
  isCriticalCapture,
} from './catch-utils';
export type { CaptureResults, BattleCritter } from './catch-utils';

// Leveling utilities
export {
  totalExpNeededForLevel,
  expNeededForNextLevel,
  calculateExpBarCurrentValue,
  calculateExpProgress,
  calculateExpGainedFromCritter,
  handleCritterGainingExperience,
  canCritterEvolve,
  expNeededToReachLevel,
  getLevelExpRange,
  calculateMaxLevelStats,
} from './leveling-utils';
export type { StatChanges, LevelUpResults } from './leveling-utils';