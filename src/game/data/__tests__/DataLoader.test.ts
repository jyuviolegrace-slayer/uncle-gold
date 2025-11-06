import { DataLoader } from '../DataLoader';

class MockJSONCache {
  private data: Record<string, unknown> = {};

  constructor(initialData: Record<string, unknown> = {}) {
    this.data = initialData;
  }

  get(key: string): unknown {
    return this.data[key];
  }

  set(key: string, value: unknown): void {
    this.data[key] = value;
  }
}

class MockCacheManager {
  json: MockJSONCache;

  constructor(jsonData: Record<string, unknown> = {}) {
    this.json = new MockJSONCache(jsonData);
  }
}

describe('DataLoader', () => {
  describe('Critters', () => {
    it('should load and parse critters data correctly', async () => {
      const mockData = [
        {
          id: 'embolt',
          name: 'Embolt',
          types: ['Fire'],
          baseStats: { hp: 39, attack: 52, defense: 43, spAtk: 60, spDef: 50, speed: 65 },
          moves: ['scratch', 'ember'],
          evolvesInto: 'boltiger',
          evolutionLevel: 36,
          pokedexEntry: 'An energetic fire-type with a sparky personality.',
          height: 0.3,
          weight: 2.3,
          catchRate: 45,
        },
      ];

      const cache = new MockCacheManager({
        CRITTERS: mockData,
        MOVES: [],
        ITEMS: [],
        TYPES: { types: [], matrix: {} },
      });

      const loader = new DataLoader();
      await loader.loadFromCache(cache as unknown as Phaser.Cache.CacheManager);

      const critter = loader.getCritterById('embolt');
      expect(critter).toBeDefined();
      expect(critter?.name).toBe('Embolt');
      expect(critter?.types).toEqual(['Fire']);
      expect(critter?.baseStats.hp).toBe(39);
      expect(critter?.moves).toContain('scratch');
      expect(critter?.evolvesInto).toBe('boltiger');
    });

    it('should throw error when CRITTERS data is missing', async () => {
      const cache = new MockCacheManager({
        MOVES: [],
        ITEMS: [],
        TYPES: { types: [], matrix: {} },
      });

      const loader = new DataLoader();
      await expect(loader.loadFromCache(cache as unknown as Phaser.Cache.CacheManager)).rejects.toThrow(
        'Missing required data: CRITTERS',
      );
    });

    it('should retrieve critter by ID', async () => {
      const mockData = [
        {
          id: 'aqualis',
          name: 'Aqualis',
          types: ['Water'],
          baseStats: { hp: 44, attack: 48, defense: 65, spAtk: 50, spDef: 64, speed: 43 },
          moves: ['water-gun', 'bubblebeam'],
          evolvesInto: 'tidecrown',
          evolutionLevel: 36,
          pokedexEntry: 'A calm water-type known for its defensive shell.',
          height: 0.5,
          weight: 7.9,
          catchRate: 45,
        },
      ];

      const cache = new MockCacheManager({
        CRITTERS: mockData,
        MOVES: [],
        ITEMS: [],
        TYPES: { types: [], matrix: {} },
      });

      const loader = new DataLoader();
      await loader.loadFromCache(cache as unknown as Phaser.Cache.CacheManager);

      const critter = loader.getCritterById('aqualis');
      expect(critter).toBeDefined();
      expect(critter?.name).toBe('Aqualis');
    });

    it('should return all critters', async () => {
      const mockData = [
        {
          id: 'embolt',
          name: 'Embolt',
          types: ['Fire'],
          baseStats: { hp: 39, attack: 52, defense: 43, spAtk: 60, spDef: 50, speed: 65 },
          moves: ['scratch'],
          pokedexEntry: 'Fire type',
          height: 0.3,
          weight: 2.3,
          catchRate: 45,
        },
        {
          id: 'aqualis',
          name: 'Aqualis',
          types: ['Water'],
          baseStats: { hp: 44, attack: 48, defense: 65, spAtk: 50, spDef: 64, speed: 43 },
          moves: ['water-gun'],
          pokedexEntry: 'Water type',
          height: 0.5,
          weight: 7.9,
          catchRate: 45,
        },
      ];

      const cache = new MockCacheManager({
        CRITTERS: mockData,
        MOVES: [],
        ITEMS: [],
        TYPES: { types: [], matrix: {} },
      });

      const loader = new DataLoader();
      await loader.loadFromCache(cache as unknown as Phaser.Cache.CacheManager);

      const allCritters = loader.getAllCritters();
      expect(allCritters).toHaveLength(2);
    });
  });

  describe('Moves', () => {
    it('should load and parse moves data correctly', async () => {
      const mockData = [
        {
          id: 'scratch',
          name: 'Scratch',
          type: 'Fire',
          power: 40,
          accuracy: 100,
          basePP: 35,
          category: 'Physical',
        },
      ];

      const cache = new MockCacheManager({
        CRITTERS: [],
        MOVES: mockData,
        ITEMS: [],
        TYPES: { types: [], matrix: {} },
      });

      const loader = new DataLoader();
      await loader.loadFromCache(cache as unknown as Phaser.Cache.CacheManager);

      const move = loader.getMoveById('scratch');
      expect(move).toBeDefined();
      expect(move?.name).toBe('Scratch');
      expect(move?.power).toBe(40);
      expect(move?.category).toBe('Physical');
    });

    it('should retrieve move by name', async () => {
      const mockData = [
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
      ];

      const cache = new MockCacheManager({
        CRITTERS: [],
        MOVES: mockData,
        ITEMS: [],
        TYPES: { types: [], matrix: {} },
      });

      const loader = new DataLoader();
      await loader.loadFromCache(cache as unknown as Phaser.Cache.CacheManager);

      const move = loader.getMoveByName('Ember');
      expect(move).toBeDefined();
      expect(move?.id).toBe('ember');
      expect(move?.effect?.type).toBe('burn');
    });

    it('should throw error when MOVES data is missing', async () => {
      const cache = new MockCacheManager({
        CRITTERS: [],
        ITEMS: [],
        TYPES: { types: [], matrix: {} },
      });

      const loader = new DataLoader();
      await expect(loader.loadFromCache(cache as unknown as Phaser.Cache.CacheManager)).rejects.toThrow(
        'Missing required data: MOVES',
      );
    });
  });

  describe('Items', () => {
    it('should load and parse items data correctly', async () => {
      const mockData = [
        {
          id: 'potion',
          name: 'Potion',
          description: 'Restores 20 HP to a critter.',
          type: 'Potion',
          effect: { type: 'heal-hp', value: 20 },
        },
      ];

      const cache = new MockCacheManager({
        CRITTERS: [],
        MOVES: [],
        ITEMS: mockData,
        TYPES: { types: [], matrix: {} },
      });

      const loader = new DataLoader();
      await loader.loadFromCache(cache as unknown as Phaser.Cache.CacheManager);

      const item = loader.getItemById('potion');
      expect(item).toBeDefined();
      expect(item?.name).toBe('Potion');
      expect(item?.type).toBe('Potion');
      expect(item?.effect?.value).toBe(20);
    });

    it('should retrieve item by name', async () => {
      const mockData = [
        {
          id: 'pokeball',
          name: 'Pokéball',
          description: 'Standard capture device for critters.',
          type: 'Pokeball',
          effect: { type: 'catch-rate', value: 1 },
        },
      ];

      const cache = new MockCacheManager({
        CRITTERS: [],
        MOVES: [],
        ITEMS: mockData,
        TYPES: { types: [], matrix: {} },
      });

      const loader = new DataLoader();
      await loader.loadFromCache(cache as unknown as Phaser.Cache.CacheManager);

      const item = loader.getItemByName('Pokéball');
      expect(item).toBeDefined();
      expect(item?.id).toBe('pokeball');
    });

    it('should filter items by category', async () => {
      const mockData = [
        {
          id: 'potion',
          name: 'Potion',
          description: 'Restores HP',
          type: 'Potion',
          effect: { type: 'heal-hp', value: 20 },
        },
        {
          id: 'super-potion',
          name: 'Super Potion',
          description: 'Restores more HP',
          type: 'Potion',
          effect: { type: 'heal-hp', value: 50 },
        },
        {
          id: 'pokeball',
          name: 'Pokéball',
          description: 'Catches critters',
          type: 'Pokeball',
          effect: { type: 'catch-rate', value: 1 },
        },
      ];

      const cache = new MockCacheManager({
        CRITTERS: [],
        MOVES: [],
        ITEMS: mockData,
        TYPES: { types: [], matrix: {} },
      });

      const loader = new DataLoader();
      await loader.loadFromCache(cache as unknown as Phaser.Cache.CacheManager);

      const potions = loader.getItemsByCategory('Potion');
      expect(potions).toHaveLength(2);
      expect(potions.every((item) => item.type === 'Potion')).toBe(true);
    });

    it('should throw error when ITEMS data is missing', async () => {
      const cache = new MockCacheManager({
        CRITTERS: [],
        MOVES: [],
        TYPES: { types: [], matrix: {} },
      });

      const loader = new DataLoader();
      await expect(loader.loadFromCache(cache as unknown as Phaser.Cache.CacheManager)).rejects.toThrow(
        'Missing required data: ITEMS',
      );
    });
  });

  describe('Encounters', () => {
    it('should load encounter tables correctly', async () => {
      const mockEncounters = {
        '1': [
          [2, 45],
          [3, 40],
          [4, 10],
        ],
      };

      const cache = new MockCacheManager({
        CRITTERS: [],
        MOVES: [],
        ITEMS: [],
        TYPES: { types: [], matrix: {} },
        LEGACY_ENCOUNTERS: mockEncounters,
      });

      const loader = new DataLoader();
      await loader.loadFromCache(cache as unknown as Phaser.Cache.CacheManager);

      const table = loader.getEncounterTable('1');
      expect(table).toBeDefined();
      expect(table?.areaId).toBe('1');
      expect(table?.encounters).toHaveLength(3);
      expect(table?.encounters[0]).toEqual({ monsterId: 2, weight: 45 });
    });

    it('should return undefined for non-existent area', async () => {
      const cache = new MockCacheManager({
        CRITTERS: [],
        MOVES: [],
        ITEMS: [],
        TYPES: { types: [], matrix: {} },
        LEGACY_ENCOUNTERS: {},
      });

      const loader = new DataLoader();
      await loader.loadFromCache(cache as unknown as Phaser.Cache.CacheManager);

      const table = loader.getEncounterTable('999');
      expect(table).toBeUndefined();
    });

    it('should get random encounter from weighted table', async () => {
      const mockEncounters = {
        '1': [
          [1, 50],
          [2, 50],
        ],
      };

      const cache = new MockCacheManager({
        CRITTERS: [],
        MOVES: [],
        ITEMS: [],
        TYPES: { types: [], matrix: {} },
        LEGACY_ENCOUNTERS: mockEncounters,
      });

      const loader = new DataLoader();
      await loader.loadFromCache(cache as unknown as Phaser.Cache.CacheManager);

      const encounterId = loader.getRandomEncounter('1');
      expect(encounterId).toBeDefined();
      expect([1, 2]).toContain(encounterId);
    });
  });

  describe('Types and Type Effectiveness', () => {
    it('should load type effectiveness matrix correctly', async () => {
      const mockTypeData = {
        types: ['Fire', 'Water', 'Grass'],
        matrix: {
          Fire: { Fire: 0.5, Water: 0.5, Grass: 2 },
          Water: { Fire: 2, Water: 0.5, Grass: 0.5 },
          Grass: { Fire: 0.5, Water: 2, Grass: 0.5 },
        },
      };

      const cache = new MockCacheManager({
        CRITTERS: [],
        MOVES: [],
        ITEMS: [],
        TYPES: mockTypeData,
      });

      const loader = new DataLoader();
      await loader.loadFromCache(cache as unknown as Phaser.Cache.CacheManager);

      const effectiveness = loader.getTypeEffectiveness('Fire', 'Grass');
      expect(effectiveness).toBe(2);
    });

    it('should return neutral effectiveness for unknown type', async () => {
      const mockTypeData = {
        types: ['Fire'],
        matrix: {
          Fire: { Fire: 0.5 },
        },
      };

      const cache = new MockCacheManager({
        CRITTERS: [],
        MOVES: [],
        ITEMS: [],
        TYPES: mockTypeData,
      });

      const loader = new DataLoader();
      await loader.loadFromCache(cache as unknown as Phaser.Cache.CacheManager);

      const effectiveness = loader.getTypeEffectiveness('Unknown', 'Fire');
      expect(effectiveness).toBe(1.0);
    });
  });

  describe('Starter Critters', () => {
    it('should return starter critters', async () => {
      const mockData = [
        {
          id: 'embolt',
          name: 'Embolt',
          types: ['Fire'],
          baseStats: { hp: 39, attack: 52, defense: 43, spAtk: 60, spDef: 50, speed: 65 },
          moves: ['scratch'],
          pokedexEntry: 'Fire starter',
          height: 0.3,
          weight: 2.3,
          catchRate: 45,
        },
        {
          id: 'aqualis',
          name: 'Aqualis',
          types: ['Water'],
          baseStats: { hp: 44, attack: 48, defense: 65, spAtk: 50, spDef: 64, speed: 43 },
          moves: ['water-gun'],
          pokedexEntry: 'Water starter',
          height: 0.5,
          weight: 7.9,
          catchRate: 45,
        },
        {
          id: 'thornwick',
          name: 'Thornwick',
          types: ['Grass'],
          baseStats: { hp: 45, attack: 49, defense: 49, spAtk: 65, spDef: 49, speed: 45 },
          moves: ['vine-whip'],
          pokedexEntry: 'Grass starter',
          height: 0.4,
          weight: 2.6,
          catchRate: 45,
        },
      ];

      const cache = new MockCacheManager({
        CRITTERS: mockData,
        MOVES: [],
        ITEMS: [],
        TYPES: { types: [], matrix: {} },
      });

      const loader = new DataLoader();
      await loader.loadFromCache(cache as unknown as Phaser.Cache.CacheManager);

      const starters = loader.getStarterCritters();
      expect(starters).toHaveLength(3);
      expect(starters.map((s) => s.id)).toEqual(['embolt', 'aqualis', 'thornwick']);
    });
  });
});
