import { IMove, ICritterSpecies, IItem, IArea, CritterType } from '../models/types';
import {
  ILegacyMonster,
  ILegacyAttack,
  ILegacyItem,
  ILegacyNPCDefinition,
  ILegacySign,
  ILegacyEventDefinition,
  ILegacyEncounterMap,
  ILegacyIDMapping,
} from '../models/legacyTypes';

/**
 * Data loader utility for fetching and parsing JSON game data files
 * Provides type-safe data loading with validation and error handling
 */

interface TypeMatrix {
  types: string[];
  matrix: Record<string, Record<string, number>>;
}

export class DataLoader {
  private static baseUrl = '/assets/data';

  /**
   * Load critters data from JSON
   */
  static async loadCritters(): Promise<ICritterSpecies[]> {
    try {
      const response = await fetch(`${this.baseUrl}/critters.json`);
      if (!response.ok) {
        throw new Error(`Failed to load critters: ${response.statusText}`);
      }
      const data = await response.json();
      return this.validateCrittersData(data);
    } catch (error) {
      console.error('Error loading critters data:', error);
      throw error;
    }
  }

  /**
   * Load moves data from JSON
   */
  static async loadMoves(): Promise<IMove[]> {
    try {
      const response = await fetch(`${this.baseUrl}/moves.json`);
      if (!response.ok) {
        throw new Error(`Failed to load moves: ${response.statusText}`);
      }
      const data = await response.json();
      return this.validateMovesData(data);
    } catch (error) {
      console.error('Error loading moves data:', error);
      throw error;
    }
  }

  /**
   * Load type effectiveness matrix from JSON
   */
  static async loadTypeMatrix(): Promise<TypeMatrix> {
    try {
      const response = await fetch(`${this.baseUrl}/types.json`);
      if (!response.ok) {
        throw new Error(`Failed to load type matrix: ${response.statusText}`);
      }
      const data = await response.json();
      return this.validateTypeMatrixData(data);
    } catch (error) {
      console.error('Error loading type matrix data:', error);
      throw error;
    }
  }

  /**
   * Load items data from JSON
   */
  static async loadItems(): Promise<IItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/items.json`);
      if (!response.ok) {
        throw new Error(`Failed to load items: ${response.statusText}`);
      }
      const data = await response.json();
      return this.validateItemsData(data);
    } catch (error) {
      console.error('Error loading items data:', error);
      throw error;
    }
  }

  /**
   * Load areas data from JSON
   */
  static async loadAreas(): Promise<IArea[]> {
    try {
      const response = await fetch(`${this.baseUrl}/areas.json`);
      if (!response.ok) {
        throw new Error(`Failed to load areas: ${response.statusText}`);
      }
      const data = await response.json();
      return this.validateAreasData(data);
    } catch (error) {
      console.error('Error loading areas data:', error);
      throw error;
    }
  }

  /**
   * Load all game data in parallel
   */
  static async loadAllGameData(): Promise<{
    critters: ICritterSpecies[];
    moves: IMove[];
    typeMatrix: TypeMatrix;
    items: IItem[];
    areas: IArea[];
  }> {
    try {
      const [critters, moves, typeMatrix, items, areas] = await Promise.all([
        this.loadCritters(),
        this.loadMoves(),
        this.loadTypeMatrix(),
        this.loadItems(),
        this.loadAreas(),
      ]);

      return { critters, moves, typeMatrix, items, areas };
    } catch (error) {
      console.error('Error loading all game data:', error);
      throw error;
    }
  }

  /**
   * Validate critters data structure
   */
  private static validateCrittersData(data: any): ICritterSpecies[] {
    if (!Array.isArray(data)) {
      throw new Error('Critters data must be an array');
    }

    return data.map((critter: any) => {
      if (!critter.id || !critter.name || !critter.types || !critter.baseStats) {
        throw new Error(`Invalid critter data: missing required fields`);
      }

      if (!Array.isArray(critter.types) || critter.types.length === 0) {
        throw new Error(`Invalid critter types for ${critter.id}`);
      }

      if (!critter.baseStats.hp || !critter.baseStats.attack || !critter.baseStats.defense) {
        throw new Error(`Invalid stats for critter ${critter.id}`);
      }

      return critter as ICritterSpecies;
    });
  }

  /**
   * Validate moves data structure
   */
  private static validateMovesData(data: any): IMove[] {
    if (!Array.isArray(data)) {
      throw new Error('Moves data must be an array');
    }

    return data.map((move: any) => {
      if (!move.id || !move.name || !move.type || move.power === undefined || move.accuracy === undefined) {
        throw new Error(`Invalid move data: missing required fields`);
      }

      if (move.power < 0 || move.power > 150) {
        throw new Error(`Invalid move power for ${move.id}`);
      }

      if (move.accuracy < 0 || move.accuracy > 100) {
        throw new Error(`Invalid move accuracy for ${move.id}`);
      }

      return move as IMove;
    });
  }

  /**
   * Validate type matrix data structure
   */
  private static validateTypeMatrixData(data: any): TypeMatrix {
    if (!data.types || !data.matrix) {
      throw new Error('Type matrix must have types array and matrix object');
    }

    if (!Array.isArray(data.types)) {
      throw new Error('Types must be an array');
    }

    if (data.types.length !== 8) {
      throw new Error('Must have exactly 8 types');
    }

    return data as TypeMatrix;
  }

  /**
   * Validate items data structure
   */
  private static validateItemsData(data: any): IItem[] {
    if (!Array.isArray(data)) {
      throw new Error('Items data must be an array');
    }

    return data.map((item: any) => {
      if (!item.id || !item.name || !item.description || !item.type) {
        throw new Error(`Invalid item data: missing required fields`);
      }

      return item as IItem;
    });
  }

  /**
   * Validate areas data structure
   */
  private static validateAreasData(data: any): IArea[] {
    if (!Array.isArray(data)) {
      throw new Error('Areas data must be an array');
    }

    return data.map((area: any) => {
      if (!area.id || !area.name || !area.type || !area.description || !area.levelRange || !area.wildCritters) {
        throw new Error(`Invalid area data: missing required fields`);
      }

      if (area.levelRange.min === undefined || area.levelRange.max === undefined) {
        throw new Error(`Invalid level range for area ${area.id}`);
      }

      if (!Array.isArray(area.wildCritters)) {
        throw new Error(`Invalid wild critters for area ${area.id}`);
      }

      return area as IArea;
    });
  }

  /**
   * Load legacy critters data from JSON
   */
  static async loadLegacyCritters(): Promise<ICritterSpecies[]> {
    try {
      const response = await fetch(`${this.baseUrl}/legacy-critters.json`);
      if (!response.ok) {
        throw new Error(`Failed to load legacy critters: ${response.statusText}`);
      }
      const data = await response.json();
      return this.validateCrittersData(data);
    } catch (error) {
      console.error('Error loading legacy critters data:', error);
      throw error;
    }
  }

  /**
   * Load legacy moves data from JSON
   */
  static async loadLegacyMoves(): Promise<IMove[]> {
    try {
      const response = await fetch(`${this.baseUrl}/legacy-moves.json`);
      if (!response.ok) {
        throw new Error(`Failed to load legacy moves: ${response.statusText}`);
      }
      const data = await response.json();
      return this.validateMovesData(data);
    } catch (error) {
      console.error('Error loading legacy moves data:', error);
      throw error;
    }
  }

  /**
   * Load legacy items data from JSON
   */
  static async loadLegacyItems(): Promise<IItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/legacy-items.json`);
      if (!response.ok) {
        throw new Error(`Failed to load legacy items: ${response.statusText}`);
      }
      const data = await response.json();
      return this.validateItemsData(data);
    } catch (error) {
      console.error('Error loading legacy items data:', error);
      throw error;
    }
  }

  /**
   * Load legacy encounters data from JSON
   */
  static async loadLegacyEncounters(): Promise<Record<string, Array<{ speciesId: string; rarity: number }>>> {
    try {
      const response = await fetch(`${this.baseUrl}/legacy-encounters.json`);
      if (!response.ok) {
        throw new Error(`Failed to load legacy encounters: ${response.statusText}`);
      }
      const data = await response.json();
      return this.validateLegacyEncountersData(data);
    } catch (error) {
      console.error('Error loading legacy encounters data:', error);
      throw error;
    }
  }

  /**
   * Load legacy NPCs data from JSON
   */
  static async loadLegacyNPCs(): Promise<ILegacyNPCDefinition[]> {
    try {
      const response = await fetch(`${this.baseUrl}/legacy-npcs.json`);
      if (!response.ok) {
        throw new Error(`Failed to load legacy NPCs: ${response.statusText}`);
      }
      const data = await response.json();
      return this.validateLegacyNPCsData(data);
    } catch (error) {
      console.error('Error loading legacy NPCs data:', error);
      throw error;
    }
  }

  /**
   * Load legacy events data from JSON
   */
  static async loadLegacyEvents(): Promise<ILegacyEventDefinition[]> {
    try {
      const response = await fetch(`${this.baseUrl}/legacy-events.json`);
      if (!response.ok) {
        throw new Error(`Failed to load legacy events: ${response.statusText}`);
      }
      const data = await response.json();
      return this.validateLegacyEventsData(data);
    } catch (error) {
      console.error('Error loading legacy events data:', error);
      throw error;
    }
  }

  /**
   * Load legacy signs data from JSON
   */
  static async loadLegacySigns(): Promise<ILegacySign[]> {
    try {
      const response = await fetch(`${this.baseUrl}/legacy-signs.json`);
      if (!response.ok) {
        throw new Error(`Failed to load legacy signs: ${response.statusText}`);
      }
      const data = await response.json();
      return this.validateLegacySignsData(data);
    } catch (error) {
      console.error('Error loading legacy signs data:', error);
      throw error;
    }
  }

  /**
   * Load legacy ID mappings from JSON
   */
  static async loadLegacyIDMappings(): Promise<ILegacyIDMapping> {
    try {
      const response = await fetch(`${this.baseUrl}/legacy-id-mappings.json`);
      if (!response.ok) {
        throw new Error(`Failed to load legacy ID mappings: ${response.statusText}`);
      }
      const data = await response.json();
      return this.validateLegacyIDMappings(data);
    } catch (error) {
      console.error('Error loading legacy ID mappings:', error);
      throw error;
    }
  }

  /**
   * Load all legacy game data in parallel
   */
  static async loadAllLegacyData(): Promise<{
    critters: ICritterSpecies[];
    moves: IMove[];
    items: IItem[];
    encounters: Record<string, Array<{ speciesId: string; rarity: number }>>;
    npcs: ILegacyNPCDefinition[];
    events: ILegacyEventDefinition[];
    signs: ILegacySign[];
    mappings: ILegacyIDMapping;
  }> {
    try {
      const [critters, moves, items, encounters, npcs, events, signs, mappings] = await Promise.all([
        this.loadLegacyCritters(),
        this.loadLegacyMoves(),
        this.loadLegacyItems(),
        this.loadLegacyEncounters(),
        this.loadLegacyNPCs(),
        this.loadLegacyEvents(),
        this.loadLegacySigns(),
        this.loadLegacyIDMappings(),
      ]);

      return { critters, moves, items, encounters, npcs, events, signs, mappings };
    } catch (error) {
      console.error('Error loading all legacy game data:', error);
      throw error;
    }
  }

  /**
   * Validate legacy encounters data structure
   */
  private static validateLegacyEncountersData(data: any): Record<string, Array<{ speciesId: string; rarity: number }>> {
    if (typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Legacy encounters data must be an object');
    }

    Object.entries(data).forEach(([areaId, encounters]: [string, any]) => {
      if (!Array.isArray(encounters)) {
        throw new Error(`Invalid encounters for area ${areaId}`);
      }
      encounters.forEach((encounter: any, index: number) => {
        if (!encounter.speciesId || encounter.rarity === undefined) {
          throw new Error(`Invalid encounter at area ${areaId} index ${index}`);
        }
      });
    });

    return data;
  }

  /**
   * Validate legacy NPCs data structure
   */
  private static validateLegacyNPCsData(data: any): ILegacyNPCDefinition[] {
    if (!Array.isArray(data)) {
      throw new Error('Legacy NPCs data must be an array');
    }

    data.forEach((npc: any) => {
      if (!npc.id || !npc.frame || !npc.animationKeyPrefix || !Array.isArray(npc.events)) {
        throw new Error(`Invalid NPC data: missing required fields`);
      }
    });

    return data;
  }

  /**
   * Validate legacy events data structure
   */
  private static validateLegacyEventsData(data: any): ILegacyEventDefinition[] {
    if (!Array.isArray(data)) {
      throw new Error('Legacy events data must be an array');
    }

    data.forEach((event: any) => {
      if (!event.id || !Array.isArray(event.events)) {
        throw new Error(`Invalid event data: missing required fields`);
      }
    });

    return data;
  }

  /**
   * Validate legacy signs data structure
   */
  private static validateLegacySignsData(data: any): ILegacySign[] {
    if (!Array.isArray(data)) {
      throw new Error('Legacy signs data must be an array');
    }

    data.forEach((sign: any) => {
      if (!sign.id || !sign.message) {
        throw new Error(`Invalid sign data: missing required fields`);
      }
    });

    return data;
  }

  /**
   * Validate legacy ID mappings
   */
  private static validateLegacyIDMappings(data: any): ILegacyIDMapping {
    if (!data.monsterIdMap || !data.attackIdMap || !data.itemIdMap || !data.areaIdMap) {
      throw new Error('Legacy ID mappings must have monsterIdMap, attackIdMap, itemIdMap, and areaIdMap');
    }

    return data as ILegacyIDMapping;
  }
}

export default DataLoader;
