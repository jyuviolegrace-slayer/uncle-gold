/**
 * SaveManagerAdapters - conversion functions between legacy and modern data structures
 * Enables seamless migration from legacy DataManager to modern SaveManager
 */

import { ISaveData, IPlayerState, ICritter, IInventory } from '../models/types';
import type {
  IGlobalState,
  ILegacyInventoryItem,
  ILegacyPlayerLocation,
} from './LegacyDataManager';

/**
 * Convert legacy inventory format to modern Map-based format
 */
export function convertLegacyInventoryToModern(
  legacyInventory: ILegacyInventoryItem[]
): Map<string, number> {
  const inventoryMap = new Map<string, number>();
  for (const item of legacyInventory) {
    inventoryMap.set(String(item.item.id), item.quantity);
  }
  return inventoryMap;
}

/**
 * Convert modern inventory Map to legacy array format
 */
export function convertModernInventoryToLegacy(
  inventoryMap: Map<string, number>
): ILegacyInventoryItem[] {
  const legacyInventory: ILegacyInventoryItem[] = [];
  const entries = Array.from(inventoryMap.entries());
  for (const [itemId, quantity] of entries) {
    legacyInventory.push({
      item: { id: Number(itemId) },
      quantity,
    });
  }
  return legacyInventory;
}

/**
 * Convert legacy critters to modern ICritter format
 * Note: This is a simplified conversion assuming legacy critter structure
 */
export function convertLegacyCrittersToModern(legacyCritters: any[]): ICritter[] {
  return legacyCritters.map((critter) => {
    if (critter.id && typeof critter.speciesId !== 'undefined') {
      // Already in modern format
      return critter as ICritter;
    }
    // Convert from legacy format if needed
    return {
      id: critter.id || `critter-${Date.now()}-${Math.random()}`,
      speciesId: critter.speciesId || critter.monsterId || 'unknown',
      nickname: critter.nickname,
      level: critter.level || 1,
      currentHP: critter.currentHP || critter.hp || 0,
      maxHP: critter.maxHP || 100,
      baseStats: critter.baseStats || {
        hp: 0,
        attack: 0,
        defense: 0,
        spAtk: 0,
        spDef: 0,
        speed: 0,
      },
      currentStats: critter.currentStats || {
        hp: 0,
        attack: 0,
        defense: 0,
        spAtk: 0,
        spDef: 0,
        speed: 0,
      },
      moves: critter.moves || [],
      status: critter.status,
      experience: critter.experience || 0,
      isFainted: critter.isFainted || false,
    };
  });
}

/**
 * Convert modern critters to legacy format
 */
export function convertModernCrittersToLegacy(modernCritters: ICritter[]): any[] {
  return modernCritters.map((critter) => ({
    ...critter,
  }));
}

/**
 * Create ISaveData from legacy IGlobalState
 */
export function convertLegacyStateToSaveData(
  legacyState: IGlobalState,
  playerName: string = 'Player',
  additionalData?: Partial<ISaveData>
): ISaveData {
  const inventoryMap = convertLegacyInventoryToModern(legacyState.inventory);
  const modernCritters = convertLegacyCrittersToModern(legacyState.monsters.inParty);

  const playerState: IPlayerState = {
    name: playerName,
    level: additionalData?.playerState?.level ?? 1,
    badges: additionalData?.playerState?.badges ?? [],
    pokedex: additionalData?.playerState?.pokedex ?? new Set(),
    inventory: {
      items: inventoryMap,
      capacity: 50,
    },
    party: {
      critters: modernCritters,
      maxSize: 6,
    },
    money: additionalData?.playerState?.money ?? 0,
    position: legacyState.player.position,
    currentArea: legacyState.player.location.area,
    playtime: additionalData?.playerState?.playtime ?? 0,
  };

  return {
    version: 2,
    timestamp: Date.now(),
    playerState,
    completedArenas: additionalData?.completedArenas ?? [],
    defeatedTrainers: legacyState.flags,
    caughtCritters: modernCritters,
    playedMinutes: additionalData?.playedMinutes ?? 0,
  };
}

/**
 * Create legacy IGlobalState from ISaveData
 */
export function convertSaveDataToLegacyState(saveData: ISaveData): IGlobalState {
  const legacyInventory = convertModernInventoryToLegacy(saveData.playerState.inventory.items);
  const legacyCritters = convertModernCrittersToLegacy(saveData.playerState.party.critters);

  return {
    player: {
      position: saveData.playerState.position,
      direction: 'DOWN',
      location: {
        area: saveData.playerState.currentArea,
        isInterior: false,
      },
    },
    options: {
      textSpeed: 'MID',
      battleSceneAnimations: 'ON',
      battleStyle: 'SHIFT',
      sound: 'ON',
      volume: 4,
      menuColor: 0,
    },
    gameStarted: saveData.playerState.name !== '',
    monsters: {
      inParty: legacyCritters,
    },
    inventory: legacyInventory,
    itemsPickedUp: [],
    viewedEvents: [],
    flags: saveData.defeatedTrainers || [],
  };
}

/**
 * Merge modern ISaveData with legacy options/state
 */
export function mergeModernSaveWithLegacyOptions(
  saveData: ISaveData,
  legacyState: IGlobalState
): ISaveData {
  return {
    ...saveData,
    playerState: {
      ...saveData.playerState,
      position: legacyState.player.position,
      currentArea: legacyState.player.location.area,
    },
  };
}

/**
 * Extract options from legacy state
 */
export function extractLegacyOptions(
  legacyState: IGlobalState
): Omit<IGlobalState, 'player' | 'gameStarted' | 'monsters' | 'inventory'> {
  return {
    options: legacyState.options,
    itemsPickedUp: legacyState.itemsPickedUp,
    viewedEvents: legacyState.viewedEvents,
    flags: legacyState.flags,
  };
}

/**
 * Validate legacy state structure
 */
export function validateLegacyState(state: any): state is IGlobalState {
  return (
    state &&
    state.player &&
    state.player.position &&
    typeof state.player.position.x === 'number' &&
    typeof state.player.position.y === 'number' &&
    state.options &&
    Array.isArray(state.inventory) &&
    state.monsters &&
    Array.isArray(state.monsters.inParty)
  );
}

/**
 * Validate modern save data structure
 */
export function validateSaveData(data: any): data is ISaveData {
  return (
    data &&
    data.playerState &&
    data.playerState.party &&
    Array.isArray(data.playerState.party.critters) &&
    typeof data.playerState.position === 'object' &&
    Array.isArray(data.defeatedTrainers)
  );
}

/**
 * Create compatibility wrapper for accessing data
 * Allows code to work with both legacy and modern formats
 */
export class DataCompatibilityWrapper {
  private saveData: ISaveData;
  private legacyState: IGlobalState;

  constructor(saveData: ISaveData, legacyState?: IGlobalState) {
    this.saveData = saveData;
    this.legacyState = legacyState || convertSaveDataToLegacyState(saveData);
  }

  /**
   * Get data in modern format
   */
  getModern(): ISaveData {
    return this.saveData;
  }

  /**
   * Get data in legacy format
   */
  getLegacy(): IGlobalState {
    return this.legacyState;
  }

  /**
   * Update with modern data and sync legacy
   */
  updateModern(saveData: ISaveData): void {
    this.saveData = saveData;
    this.legacyState = convertSaveDataToLegacyState(saveData);
  }

  /**
   * Update with legacy data and sync modern
   */
  updateLegacy(legacyState: IGlobalState): void {
    this.legacyState = legacyState;
    this.saveData = convertLegacyStateToSaveData(legacyState);
  }

  /**
   * Get player state from either format
   */
  getPlayerState(): IPlayerState {
    return this.saveData.playerState;
  }

  /**
   * Get inventory from either format
   */
  getInventory(): Map<string, number> {
    return this.saveData.playerState.inventory.items;
  }

  /**
   * Get party from either format
   */
  getParty(): ICritter[] {
    return this.saveData.playerState.party.critters;
  }
}
