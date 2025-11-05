/**
 * Legacy TypeScript interfaces for data conversion
 * Used to parse and validate legacy JSON data before conversion to modern format
 */

/**
 * Legacy monster/critter definition from monsters.json
 */
export interface ILegacyMonster {
  id: string;
  monsterId: number;
  name: string;
  assetKey: string;
  assetFrame: number;
  currentHp: number;
  maxHp: number;
  attackIds: number[];
  baseAttack: number;
  currentAttack: number;
  currentLevel: number;
  baseExp: number;
  currentExp: number;
}

/**
 * Legacy attack/move definition from attacks.json
 */
export interface ILegacyAttack {
  id: number;
  name: string;
  animationName: string;
  audioKey: string;
}

/**
 * Legacy item definition from items.json
 */
export interface ILegacyItem {
  id: number;
  name: string;
  description: string;
  category: string;
  effect: string;
}

/**
 * Legacy NPC definition from npcs.json
 * Indexed by string ID
 */
export interface ILegacyNPCDefinition {
  frame: number;
  animationKeyPrefix: string;
  events: ILegacyNPCEvent[];
}

/**
 * Legacy NPC event structure
 */
export interface ILegacyNPCEvent {
  requires: string[];
  type: string;
  data: Record<string, any>;
}

/**
 * Legacy sign definition from signs.json
 * Indexed by string ID
 */
export interface ILegacySign {
  message: string;
}

/**
 * Legacy event definition from events.json
 * Contains sequential event chains
 */
export interface ILegacyEventDefinition {
  requires: string[];
  events: ILegacyEventStep[];
}

/**
 * Single step in a legacy event chain
 */
export interface ILegacyEventStep {
  type: string;
  data: Record<string, any>;
}

/**
 * Legacy encounter data structure
 * Maps area ID to list of [monsterId, rarity] pairs
 */
export type ILegacyEncounterMap = Record<string, Array<[number, number]>>;

/**
 * ID mapping from legacy numeric IDs to modern string IDs
 */
export interface ILegacyIDMapping {
  monsterIdMap: Record<number, string>;
  attackIdMap: Record<number, string>;
  itemIdMap: Record<number, string>;
  areaIdMap: Record<number, string>;
}

/**
 * Conversion result for legacy data
 */
export interface ILegacyConversionResult {
  errors: string[];
  warnings: string[];
  successCount: number;
}
