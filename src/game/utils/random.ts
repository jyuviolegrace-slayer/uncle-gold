import { Math as PhaserMath } from 'phaser';

/**
 * Random utility functions
 * Ported from archive/src/utils/random.js
 */

export interface WeightedItem<T> {
  item: T;
  weight: number;
}

/**
 * Picks a random item based on its weight.
 * Items with higher weight will be picked more often (with a higher probability).
 * 
 * @param data Array of weighted items, where each item has a value and a weight
 * @returns The randomly selected item based on weights
 */
export function weightedRandom<T>(data: WeightedItem<T>[]): T {
  if (data.length === 0) {
    throw new Error('[weightedRandom] Cannot pick from empty array');
  }

  // Split input into two separate arrays of values and weights.
  const values = data.map((d) => d.item);
  const weights = data.map((d) => d.weight);

  // Calculate the cumulative weights based on the weights that were provided
  const cumulativeWeights: number[] = [];
  for (let i = 0; i < weights.length; i += 1) {
    cumulativeWeights[i] = weights[i] + (cumulativeWeights[i - 1] || 0);
  }

  /**
   * By adding the weights together cumulatively, this gives us a range where
   * a single weight would represent more possible values to choose from.
   * Example: if weights were [1, 3, 2, 5], then our cumulative weights would be
   * [1, 4, 6, 11], and this would represent the following ranges for each weight:
   * 1 - 1
   * 3 - 2,3,4
   * 2 - 5,6
   * 5 - 7,8,9,10,11
   * So by picking a random number between 1 - 11, higher weights have more
   * chances to be picked.
   */

  // Choose random value based on the range from 0 to our max weight
  const maxCumulativeWeight = cumulativeWeights[cumulativeWeights.length - 1];
  const randomNumber = maxCumulativeWeight * Math.random();

  // Using the random value, find the first element in the array where the weight is more than
  // the random value. By filtering the array, we know the index of element in the cumulative
  // weights array that is the value we want to return
  return values[cumulativeWeights.filter((element) => element <= randomNumber).length];
}

/**
 * Legacy version of weighted random that takes a 2D array
 * @param data A 2D array of pairs, where the first element is the item and the second is the weight
 */
export function weightedRandomLegacy<T>(data: [T, number][]): T {
  const weightedData: WeightedItem<T>[] = data.map(([item, weight]) => ({ item, weight }));
  return weightedRandom(weightedData);
}

/**
 * Generate a UUID using Phaser's built-in UUID generator
 * @returns A UUID string
 */
export function generateUuid(): string {
  return PhaserMath.RND.uuid();
}

/**
 * Generate a random integer between min and max (inclusive)
 * @param min Minimum value (inclusive)
 * @param max Maximum value (inclusive)
 * @returns Random integer between min and max
 */
export function randomBetween(min: number, max: number): number {
  return PhaserMath.Between(min, max);
}

/**
 * Generate a random float between min and max
 * @param min Minimum value
 * @param max Maximum value
 * @returns Random float between min and max
 */
export function randomFloatBetween(min: number, max: number): number {
  return PhaserMath.FloatBetween(min, max);
}

/**
 * Pick a random element from an array
 * @param array Array to pick from
 * @returns Random element from the array
 */
export function randomChoice<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error('[randomChoice] Cannot pick from empty array');
  }
  return PhaserMath.RND.pick(array);
}

/**
 * Shuffle an array in place
 * @param array Array to shuffle
 * @returns The shuffled array (same reference as input)
 */
export function shuffle<T>(array: T[]): T[] {
  return PhaserMath.RND.shuffle(array);
}

/**
 * Generate a random boolean with optional probability
 * @param probability Probability of true (0-1, default 0.5)
 * @returns Random boolean
 */
export function randomBoolean(probability: number = 0.5): boolean {
  return Math.random() < probability;
}

/**
 * Roll dice with specified number of sides
 * @param sides Number of sides on the die
 * @param numberOfDice Number of dice to roll (default 1)
 * @returns Sum of dice rolls
 */
export function rollDice(sides: number, numberOfDice: number = 1): number {
  let total = 0;
  for (let i = 0; i < numberOfDice; i++) {
    total += randomBetween(1, sides);
  }
  return total;
}

/**
 * Check if a random chance succeeds
 * @param chance Chance of success (0-100)
 * @returns True if chance succeeds
 */
export function chance(chance: number): boolean {
  return randomBetween(1, 100) <= chance;
}

/**
 * Generate a random string of specified length
 * @param length Length of the string
 * @param charset Optional character set to use
 * @returns Random string
 */
export function randomString(length: number, charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(randomBetween(0, charset.length - 1));
  }
  return result;
}