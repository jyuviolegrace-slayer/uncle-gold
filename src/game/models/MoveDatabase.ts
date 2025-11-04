import { IMove, CritterType, MoveCategory } from './types';

/**
 * MoveDatabase - central registry and utility for move definitions
 * Provides move lookups and move generation utilities
 */
export class MoveDatabase {
  private static moves: Map<string, IMove> = new Map();
  private static initialized = false;

  /**
   * Initialize default move database
   */
  static initialize(): void {
    if (this.initialized) return;

    const defaultMoves: IMove[] = [
      // Normal type moves
      {
        id: 'scratch',
        name: 'Scratch',
        type: 'Fire',
        power: 40,
        accuracy: 100,
        basePP: 35,
        category: 'Physical',
      },
      {
        id: 'tackle',
        name: 'Tackle',
        type: 'Fire',
        power: 40,
        accuracy: 100,
        basePP: 35,
        category: 'Physical',
      },

      // Fire type moves
      {
        id: 'flame-burst',
        name: 'Flame Burst',
        type: 'Fire',
        power: 70,
        accuracy: 100,
        basePP: 15,
        category: 'Special',
        effect: { type: 'burn', chance: 10 },
      },
      {
        id: 'ember',
        name: 'Ember',
        type: 'Fire',
        power: 40,
        accuracy: 100,
        basePP: 25,
        category: 'Special',
        effect: { type: 'burn', chance: 10 },
      },

      // Water type moves
      {
        id: 'aqua-ring',
        name: 'Aqua Ring',
        type: 'Water',
        power: 0,
        accuracy: 100,
        basePP: 20,
        category: 'Status',
        effect: { type: 'heal', value: 12.5 },
      },
      {
        id: 'water-gun',
        name: 'Water Gun',
        type: 'Water',
        power: 40,
        accuracy: 100,
        basePP: 25,
        category: 'Special',
      },
      {
        id: 'bubblebeam',
        name: 'Bubble Beam',
        type: 'Water',
        power: 65,
        accuracy: 100,
        basePP: 20,
        category: 'Special',
      },

      // Grass type moves
      {
        id: 'vine-whip',
        name: 'Vine Whip',
        type: 'Grass',
        power: 45,
        accuracy: 100,
        basePP: 25,
        category: 'Physical',
      },
      {
        id: 'growth',
        name: 'Growth',
        type: 'Grass',
        power: 0,
        accuracy: 100,
        basePP: 40,
        category: 'Status',
        effect: { type: 'stat-boost', value: 1 },
      },

      // Electric type moves
      {
        id: 'thunderbolt',
        name: 'Thunderbolt',
        type: 'Electric',
        power: 90,
        accuracy: 100,
        basePP: 15,
        category: 'Special',
        effect: { type: 'paralyze', chance: 10 },
      },
      {
        id: 'spark',
        name: 'Spark',
        type: 'Electric',
        power: 65,
        accuracy: 100,
        basePP: 20,
        category: 'Physical',
        effect: { type: 'paralyze', chance: 30 },
      },

      // Psychic type moves
      {
        id: 'psychic',
        name: 'Psychic',
        type: 'Psychic',
        power: 90,
        accuracy: 100,
        basePP: 10,
        category: 'Special',
        effect: { type: 'lower-spdef', chance: 10 },
      },

      // Ground type moves
      {
        id: 'earthquake',
        name: 'Earthquake',
        type: 'Ground',
        power: 100,
        accuracy: 100,
        basePP: 10,
        category: 'Physical',
      },

      // Dark type moves
      {
        id: 'bite',
        name: 'Bite',
        type: 'Dark',
        power: 60,
        accuracy: 100,
        basePP: 25,
        category: 'Physical',
      },

      // Fairy type moves
      {
        id: 'fairy-wind',
        name: 'Fairy Wind',
        type: 'Fairy',
        power: 40,
        accuracy: 100,
        basePP: 30,
        category: 'Special',
      },

      // Dragon type moves
      {
        id: 'dragon-claw',
        name: 'Dragon Claw',
        type: 'Fire',
        power: 80,
        accuracy: 100,
        basePP: 15,
        category: 'Physical',
      },
    ];

    defaultMoves.forEach(move => this.registerMove(move));
    this.initialized = true;
  }

  /**
   * Register a single move
   */
  static registerMove(move: IMove): void {
    this.moves.set(move.id, move);
  }

  /**
   * Register multiple moves
   */
  static registerMoves(moves: IMove[]): void {
    moves.forEach(move => this.registerMove(move));
  }

  /**
   * Get a move by ID
   */
  static getMove(moveId: string): IMove | undefined {
    return this.moves.get(moveId);
  }

  /**
   * Get all moves
   */
  static getAllMoves(): IMove[] {
    return Array.from(this.moves.values());
  }

  /**
   * Get moves by type
   */
  static getMovesByType(type: CritterType): IMove[] {
    return Array.from(this.moves.values()).filter(move => move.type === type);
  }

  /**
   * Get moves by category
   */
  static getMovesByCategory(category: MoveCategory): IMove[] {
    return Array.from(this.moves.values()).filter(move => move.category === category);
  }

  /**
   * Create a move instance with full PP
   */
  static createMoveInstance(moveId: string): { id: string; moveId: string; currentPP: number; maxPP: number } | null {
    const move = this.getMove(moveId);
    if (!move) return null;

    return {
      id: `move_instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      moveId,
      currentPP: move.basePP,
      maxPP: move.basePP,
    };
  }

  /**
   * Check if move exists
   */
  static moveExists(moveId: string): boolean {
    return this.moves.has(moveId);
  }

  /**
   * Get move count
   */
  static getMoveCount(): number {
    return this.moves.size;
  }
}

// Initialize on import
MoveDatabase.initialize();
