/**
 * LegacyDataUtils - utility functions for accessing cached game data
 * Provides backward-compatible API for retrieving data from Phaser scene cache
 */

export interface IAttack {
  id: number;
  name: string;
  type: string;
  power: number;
  accuracy: number;
  pp: number;
}

export interface IAnimation {
  id: string;
  name: string;
  frames: number[];
}

export interface IItem {
  id: number;
  name: string;
  description: string;
  type: string;
}

export interface IMonster {
  monsterId: number;
  name: string;
  type: string;
  baseStats: Record<string, number>;
}

export interface IEncounterData {
  [areaId: number]: number[][];
}

export interface INpcDetails {
  id: number;
  name: string;
  dialogue: string;
}

export interface IEventDetails {
  id: number;
  name: string;
  description: string;
}

export interface ISignDetails {
  id: number;
  text: string;
}

const ASSET_KEYS = {
  ATTACKS: 'attacks',
  ANIMATIONS: 'animations',
  ITEMS: 'items',
  MONSTERS: 'monsters',
  ENCOUNTERS: 'encounters',
  NPCS: 'npcs',
  EVENTS: 'events',
  SIGNS: 'signs',
} as const;

/**
 * LegacyDataUtils - provides static methods for retrieving cached game data
 */
export class LegacyDataUtils {
  /**
   * Retrieve an attack from the attacks cache
   */
  static getMonsterAttack(scene: any, attackId: number): IAttack | undefined {
    try {
      const data = scene.cache.json.get(ASSET_KEYS.ATTACKS) as IAttack[];
      return data?.find((attack) => attack.id === attackId);
    } catch (error) {
      console.warn(`[LegacyDataUtils:getMonsterAttack] Failed to get attack ${attackId}:`, error);
      return undefined;
    }
  }

  /**
   * Retrieve all animations from the animations cache
   */
  static getAnimations(scene: any): IAnimation[] {
    try {
      const data = scene.cache.json.get(ASSET_KEYS.ANIMATIONS) as IAnimation[];
      return data || [];
    } catch (error) {
      console.warn('[LegacyDataUtils:getAnimations] Failed to get animations:', error);
      return [];
    }
  }

  /**
   * Retrieve an item from the items cache
   */
  static getItem(scene: any, itemId: number): IItem | undefined {
    try {
      const data = scene.cache.json.get(ASSET_KEYS.ITEMS) as IItem[];
      return data?.find((item) => item.id === itemId);
    } catch (error) {
      console.warn(`[LegacyDataUtils:getItem] Failed to get item ${itemId}:`, error);
      return undefined;
    }
  }

  /**
   * Retrieve multiple items from the items cache
   */
  static getItems(scene: any, itemIds: number[]): IItem[] {
    try {
      const data = scene.cache.json.get(ASSET_KEYS.ITEMS) as IItem[];
      return data?.filter((item) => itemIds.includes(item.id)) || [];
    } catch (error) {
      console.warn('[LegacyDataUtils:getItems] Failed to get items:', error);
      return [];
    }
  }

  /**
   * Retrieve a monster by ID from the monsters cache
   */
  static getMonsterById(scene: any, monsterId: number): IMonster | undefined {
    try {
      const data = scene.cache.json.get(ASSET_KEYS.MONSTERS) as IMonster[];
      return data?.find((monster) => monster.monsterId === monsterId);
    } catch (error) {
      console.warn(`[LegacyDataUtils:getMonsterById] Failed to get monster ${monsterId}:`, error);
      return undefined;
    }
  }

  /**
   * Retrieve encounter data for an area
   */
  static getEncounterAreaDetails(scene: any, areaId: number): number[][] | undefined {
    try {
      const data = scene.cache.json.get(ASSET_KEYS.ENCOUNTERS) as IEncounterData;
      return data?.[areaId];
    } catch (error) {
      console.warn(`[LegacyDataUtils:getEncounterAreaDetails] Failed to get encounter data for area ${areaId}:`, error);
      return undefined;
    }
  }

  /**
   * Retrieve NPC data by ID
   */
  static getNpcData(scene: any, npcId: number): INpcDetails | undefined {
    try {
      const data = scene.cache.json.get(ASSET_KEYS.NPCS);
      return data?.[npcId];
    } catch (error) {
      console.warn(`[LegacyDataUtils:getNpcData] Failed to get NPC data ${npcId}:`, error);
      return undefined;
    }
  }

  /**
   * Retrieve event data by ID
   */
  static getEventData(scene: any, eventId: number): IEventDetails | undefined {
    try {
      const data = scene.cache.json.get(ASSET_KEYS.EVENTS);
      return data?.[eventId];
    } catch (error) {
      console.warn(`[LegacyDataUtils:getEventData] Failed to get event data ${eventId}:`, error);
      return undefined;
    }
  }

  /**
   * Retrieve sign data by ID
   */
  static getSignData(scene: any, signId: number): ISignDetails | undefined {
    try {
      const data = scene.cache.json.get(ASSET_KEYS.SIGNS);
      return data?.[signId];
    } catch (error) {
      console.warn(`[LegacyDataUtils:getSignData] Failed to get sign data ${signId}:`, error);
      return undefined;
    }
  }
}
