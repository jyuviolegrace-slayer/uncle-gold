import { ICritterSpecies, Stats, CritterType } from './types';

/**
 * CritterSpeciesDatabase - central registry for all critter species
 * Provides species lookups, evolution paths, and species generation utilities
 */
export class CritterSpeciesDatabase {
  private static species: Map<string, ICritterSpecies> = new Map();
  private static initialized = false;

  /**
   * Initialize default species database with starter and common critters
   */
  static initialize(): void {
    if (this.initialized) return;

    const defaultSpecies: ICritterSpecies[] = [
      // Starter trio
      {
        id: 'embolt',
        name: 'Embolt',
        type: ['Fire'],
        baseStats: { hp: 39, attack: 52, defense: 43, spAtk: 60, spDef: 50, speed: 65 },
        moves: ['scratch', 'ember'],
        evolvesInto: 'boltiger',
        evolutionLevel: 36,
        pokedexEntry: 'An energetic fire-type with a sparky personality.',
        height: 0.3,
        weight: 2.3,
        catchRate: 45,
      },
      {
        id: 'boltiger',
        name: 'Boltiger',
        type: ['Fire'],
        baseStats: { hp: 58, attack: 76, defense: 58, spAtk: 88, spDef: 72, speed: 93 },
        moves: ['scratch', 'ember', 'flame-burst', 'thunderbolt'],
        evolvesFrom: 'embolt',
        pokedexEntry: 'The evolved form of Embolt, crackling with energy.',
        height: 1.1,
        weight: 40.5,
        catchRate: 45,
      },

      {
        id: 'aqualis',
        name: 'Aqualis',
        type: ['Water'],
        baseStats: { hp: 44, attack: 48, defense: 65, spAtk: 50, spDef: 64, speed: 43 },
        moves: ['water-gun', 'bubblebeam'],
        evolvesInto: 'tidecrown',
        evolutionLevel: 36,
        pokedexEntry: 'A calm water-type known for its defensive shell.',
        height: 0.5,
        weight: 7.9,
        catchRate: 45,
      },
      {
        id: 'tidecrown',
        name: 'Tidecrown',
        type: ['Water'],
        baseStats: { hp: 65, attack: 65, defense: 100, spAtk: 85, spDef: 105, speed: 60 },
        moves: ['water-gun', 'bubblebeam', 'aqua-ring'],
        evolvesFrom: 'aqualis',
        pokedexEntry: 'An elegant water-type with aquatic grace.',
        height: 1.6,
        weight: 39.2,
        catchRate: 45,
      },

      {
        id: 'thornwick',
        name: 'Thornwick',
        type: ['Grass'],
        baseStats: { hp: 45, attack: 49, defense: 49, spAtk: 65, spDef: 49, speed: 45 },
        moves: ['vine-whip', 'growth'],
        evolvesInto: 'verdaxe',
        evolutionLevel: 36,
        pokedexEntry: 'A nurturing grass-type with healing properties.',
        height: 0.4,
        weight: 2.6,
        catchRate: 45,
      },
      {
        id: 'verdaxe',
        name: 'Verdaxe',
        type: ['Grass'],
        baseStats: { hp: 65, attack: 75, defense: 68, spAtk: 90, spDef: 72, speed: 60 },
        moves: ['vine-whip', 'growth'],
        evolvesFrom: 'thornwick',
        pokedexEntry: 'A mighty grass-type warrior.',
        height: 1.3,
        weight: 16.8,
        catchRate: 45,
      },

      // Early game critters
      {
        id: 'sparkit',
        name: 'Sparkit',
        type: ['Electric'],
        baseStats: { hp: 35, attack: 42, defense: 37, spAtk: 47, spDef: 40, speed: 52 },
        moves: ['spark'],
        evolvesInto: 'voltrix',
        evolutionLevel: 20,
        pokedexEntry: 'A yellow mouse-like electric type, quick and sparky.',
        height: 0.4,
        weight: 6.0,
        catchRate: 190,
      },
      {
        id: 'voltrix',
        name: 'Voltrix',
        type: ['Electric'],
        baseStats: { hp: 55, attack: 65, defense: 55, spAtk: 72, spDef: 60, speed: 80 },
        moves: ['spark', 'thunderbolt'],
        evolvesFrom: 'sparkit',
        pokedexEntry: 'The evolved electric rodent, crackling with power.',
        height: 0.8,
        weight: 13.2,
        catchRate: 190,
      },

      {
        id: 'rockpile',
        name: 'Rockpile',
        type: ['Fire'],
        baseStats: { hp: 35, attack: 45, defense: 52, spAtk: 35, spDef: 40, speed: 35 },
        moves: ['tackle'],
        evolvesInto: 'boulderan',
        evolutionLevel: 25,
        pokedexEntry: 'A stubborn rock-type, slowly but surely advancing.',
        height: 0.4,
        weight: 18.0,
        catchRate: 120,
      },
      {
        id: 'boulderan',
        name: 'Boulderan',
        type: ['Fire'],
        baseStats: { hp: 55, attack: 70, defense: 90, spAtk: 50, spDef: 60, speed: 40 },
        moves: ['tackle', 'earthquake'],
        evolvesFrom: 'rockpile',
        pokedexEntry: 'A massive rock-type guardian.',
        height: 1.3,
        weight: 60.0,
        catchRate: 120,
      },

      {
        id: 'pupskin',
        name: 'Pupskin',
        type: ['Fire'],
        baseStats: { hp: 37, attack: 46, defense: 36, spAtk: 46, spDef: 36, speed: 35 },
        moves: ['tackle', 'bite'],
        evolvesInto: 'houndrake',
        evolutionLevel: 22,
        pokedexEntry: 'A loyal dog-like critter with a fiery spirit.',
        height: 0.5,
        weight: 6.2,
        catchRate: 180,
      },
      {
        id: 'houndrake',
        name: 'Houndrake',
        type: ['Fire'],
        baseStats: { hp: 65, attack: 80, defense: 50, spAtk: 70, spDef: 60, speed: 65 },
        moves: ['tackle', 'bite', 'flame-burst'],
        evolvesFrom: 'pupskin',
        pokedexEntry: 'An imposing fire beast with a fierce personality.',
        height: 1.5,
        weight: 24.0,
        catchRate: 180,
      },

      // Mid-game critters
      {
        id: 'frostwhip',
        name: 'Frostwhip',
        type: ['Fire'],
        baseStats: { hp: 50, attack: 50, defense: 50, spAtk: 65, spDef: 60, speed: 65 },
        moves: ['scratch'],
        evolvesInto: 'glaciarch',
        evolutionLevel: 30,
        pokedexEntry: 'A mischievous snow creature that defies nature.',
        height: 0.7,
        weight: 12.5,
        catchRate: 120,
      },
      {
        id: 'glaciarch',
        name: 'Glaciarch',
        type: ['Fire'],
        baseStats: { hp: 70, attack: 65, defense: 65, spAtk: 95, spDef: 85, speed: 80 },
        moves: ['scratch', 'thunderbolt'],
        evolvesFrom: 'frostwhip',
        pokedexEntry: 'A powerful snow sage with mystical powers.',
        height: 1.4,
        weight: 22.8,
        catchRate: 120,
      },

      {
        id: 'psychink',
        name: 'Psychink',
        type: ['Psychic'],
        baseStats: { hp: 30, attack: 25, defense: 35, spAtk: 70, spDef: 60, speed: 45 },
        moves: ['psychic'],
        evolvesInto: 'mindseer',
        evolutionLevel: 32,
        pokedexEntry: 'An alien-like telepath with strange abilities.',
        height: 0.6,
        weight: 4.2,
        catchRate: 120,
      },
      {
        id: 'mindseer',
        name: 'Mindseer',
        type: ['Psychic'],
        baseStats: { hp: 55, attack: 48, defense: 60, spAtk: 103, spDef: 95, speed: 77 },
        moves: ['psychic', 'growth'],
        evolvesFrom: 'psychink',
        pokedexEntry: 'A master of the psychic realm.',
        height: 1.6,
        weight: 48.0,
        catchRate: 120,
      },

      {
        id: 'venomling',
        name: 'Venomling',
        type: ['Fire'],
        baseStats: { hp: 35, attack: 42, defense: 37, spAtk: 50, spDef: 35, speed: 42 },
        moves: ['bite'],
        evolvesInto: 'toxiclaw',
        evolutionLevel: 29,
        pokedexEntry: 'A tiny toxic reptile with a venomous bite.',
        height: 0.3,
        weight: 5.5,
        catchRate: 140,
      },
      {
        id: 'toxiclaw',
        name: 'Toxiclaw',
        type: ['Fire'],
        baseStats: { hp: 60, attack: 75, defense: 60, spAtk: 75, spDef: 65, speed: 70 },
        moves: ['bite', 'flame-burst'],
        evolvesFrom: 'venomling',
        pokedexEntry: 'A dangerous poison dealer.',
        height: 1.1,
        weight: 25.0,
        catchRate: 140,
      },

      // Late-game critters
      {
        id: 'stoneguard',
        name: 'Stoneguard',
        type: ['Ground'],
        baseStats: { hp: 65, attack: 75, defense: 100, spAtk: 35, spDef: 40, speed: 25 },
        moves: ['earthquake'],
        evolvesInto: 'terrasmith',
        evolutionLevel: 34,
        pokedexEntry: 'A slow but solid earth guardian.',
        height: 1.0,
        weight: 88.5,
        catchRate: 120,
      },
      {
        id: 'terrasmith',
        name: 'Terrasmith',
        type: ['Ground'],
        baseStats: { hp: 85, attack: 100, defense: 125, spAtk: 55, spDef: 60, speed: 30 },
        moves: ['earthquake', 'tackle'],
        evolvesFrom: 'stoneguard',
        pokedexEntry: 'An unstoppable force of nature.',
        height: 1.6,
        weight: 128.0,
        catchRate: 120,
      },

      {
        id: 'lightbringer',
        name: 'Lightbringer',
        type: ['Fairy'],
        baseStats: { hp: 45, attack: 48, defense: 48, spAtk: 62, spDef: 66, speed: 42 },
        moves: ['fairy-wind'],
        evolvesInto: 'radianceking',
        evolutionLevel: 39,
        pokedexEntry: 'A magical sparkly fairy-type.',
        height: 0.6,
        weight: 1.5,
        catchRate: 150,
      },
      {
        id: 'radianceking',
        name: 'Radianceking',
        type: ['Fairy'],
        baseStats: { hp: 68, attack: 65, defense: 68, spAtk: 85, spDef: 88, speed: 72 },
        moves: ['fairy-wind', 'psychic'],
        evolvesFrom: 'lightbringer',
        pokedexEntry: 'A radiant celestial being.',
        height: 1.3,
        weight: 4.2,
        catchRate: 150,
      },

      // Legendary critters
      {
        id: 'infernus',
        name: 'Infernus',
        type: ['Fire', 'Dark'],
        baseStats: { hp: 75, attack: 131, defense: 95, spAtk: 106, spDef: 95, speed: 77 },
        moves: ['flame-burst', 'bite', 'earthquake'],
        pokedexEntry: 'A legendary fire-dark hybrid of immense power.',
        height: 2.0,
        weight: 150.0,
        catchRate: 3,
      },

      {
        id: 'tidal',
        name: 'Tidal',
        type: ['Water', 'Electric'],
        baseStats: { hp: 75, attack: 88, defense: 111, spAtk: 112, spDef: 97, speed: 72 },
        moves: ['water-gun', 'thunderbolt', 'aqua-ring'],
        pokedexEntry: 'A legendary water-electric deity.',
        height: 1.8,
        weight: 145.0,
        catchRate: 3,
      },

      {
        id: 'natureveil',
        name: 'Natureveil',
        type: ['Grass', 'Fairy'],
        baseStats: { hp: 80, attack: 65, defense: 100, spAtk: 120, spDef: 120, speed: 65 },
        moves: ['vine-whip', 'fairy-wind', 'growth'],
        pokedexEntry: 'A legendary guardian of nature.',
        height: 2.5,
        weight: 88.8,
        catchRate: 3,
      },
    ];

    defaultSpecies.forEach(spec => this.registerSpecies(spec));
    this.initialized = true;
  }

  /**
   * Register a single species
   */
  static registerSpecies(species: ICritterSpecies): void {
    this.species.set(species.id, species);
  }

  /**
   * Register multiple species
   */
  static registerSpecies_Multiple(species: ICritterSpecies[]): void {
    species.forEach(s => this.registerSpecies(s));
  }

  /**
   * Get a species by ID
   */
  static getSpecies(speciesId: string): ICritterSpecies | undefined {
    return this.species.get(speciesId);
  }

  /**
   * Get species by name
   */
  static getSpeciesByName(name: string): ICritterSpecies | undefined {
    return Array.from(this.species.values()).find(s => s.name.toLowerCase() === name.toLowerCase());
  }

  /**
   * Get all species
   */
  static getAllSpecies(): ICritterSpecies[] {
    return Array.from(this.species.values());
  }

  /**
   * Get species by type
   */
  static getSpeciesByType(type: CritterType): ICritterSpecies[] {
    return Array.from(this.species.values()).filter(s => s.type.includes(type));
  }

  /**
   * Get evolution line (including evolutions)
   */
  static getEvolutionLine(speciesId: string): ICritterSpecies[] {
    const line: ICritterSpecies[] = [];
    const species = this.getSpecies(speciesId);
    if (!species) return line;

    // Find base of line
    let current = species;
    while (current.evolvesFrom) {
      const prev = this.getSpecies(current.evolvesFrom);
      if (!prev) break;
      current = prev;
    }

    // Follow evolution chain
    line.push(current);
    while (current.evolvesInto) {
      const next = this.getSpecies(current.evolvesInto);
      if (!next) break;
      line.push(next);
      current = next;
    }

    return line;
  }

  /**
   * Check if species exists
   */
  static speciesExists(speciesId: string): boolean {
    return this.species.has(speciesId);
  }

  /**
   * Get species count
   */
  static getSpeciesCount(): number {
    return this.species.size;
  }
}

// Initialize on import
CritterSpeciesDatabase.initialize();
