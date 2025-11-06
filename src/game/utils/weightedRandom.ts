/**
 * Performs weighted random selection from an array of entries
 * @param entries Array of [value, weight] pairs
 * @returns The selected value
 */
export function weightedRandom(entries: number[][]): number {
  if (entries.length === 0) {
    throw new Error('Cannot perform weighted random on empty array');
  }

  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);
  const random = Math.random() * totalWeight;

  let currentWeight = 0;
  for (const [value, weight] of entries) {
    currentWeight += weight;
    if (random <= currentWeight) {
      return value;
    }
  }

  // Fallback to first entry if something goes wrong
  return entries[0][0];
}