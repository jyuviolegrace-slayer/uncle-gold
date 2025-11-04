import { IMove, ICritterSpecies, IItem, IArea, CritterType } from '../models/types';

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
}

export default DataLoader;
