/**
 * Unit tests for SaveManagerAdapters
 * Tests conversion functions between legacy and modern data structures
 */

import {
  convertLegacyInventoryToModern,
  convertModernInventoryToLegacy,
  convertLegacyCrittersToModern,
  convertModernCrittersToLegacy,
  convertLegacyStateToSaveData,
  convertSaveDataToLegacyState,
  validateLegacyState,
  validateSaveData,
  DataCompatibilityWrapper,
} from '../SaveManagerAdapters';
import type { IGlobalState, ILegacyInventoryItem } from '../LegacyDataManager';
import type { ISaveData, ICritter } from '../../models/types';

describe('SaveManagerAdapters', () => {
  describe('Inventory Conversion', () => {
    it('should convert legacy inventory to modern Map format', () => {
      const legacyInventory: ILegacyInventoryItem[] = [
        { item: { id: 1 }, quantity: 10 },
        { item: { id: 2 }, quantity: 5 },
      ];

      const modern = convertLegacyInventoryToModern(legacyInventory);

      expect(modern).toBeInstanceOf(Map);
      expect(modern.get('1')).toBe(10);
      expect(modern.get('2')).toBe(5);
    });

    it('should convert modern inventory Map to legacy array format', () => {
      const modernInventory = new Map<string, number>([
        ['1', 10],
        ['2', 5],
      ]);

      const legacy = convertModernInventoryToLegacy(modernInventory);

      expect(Array.isArray(legacy)).toBe(true);
      expect(legacy.length).toBe(2);
      expect(legacy[0]).toEqual({ item: { id: 1 }, quantity: 10 });
      expect(legacy[1]).toEqual({ item: { id: 2 }, quantity: 5 });
    });

    it('should handle empty inventory', () => {
      const empty: ILegacyInventoryItem[] = [];
      const modern = convertLegacyInventoryToModern(empty);
      expect(modern.size).toBe(0);

      const legacy = convertModernInventoryToLegacy(modern);
      expect(legacy.length).toBe(0);
    });
  });

  describe('Critter Conversion', () => {
    it('should convert legacy critters to modern format', () => {
      const legacyCritters = [
        {
          id: 'legacy-1',
          level: 5,
          hp: 20,
          experience: 100,
        },
      ];

      const modern = convertLegacyCrittersToModern(legacyCritters);

      expect(Array.isArray(modern)).toBe(true);
      expect(modern[0].level).toBe(5);
      expect(modern[0].experience).toBe(100);
    });

    it('should handle already modern critters', () => {
      const modernCritters: ICritter[] = [
        {
          id: 'modern-1',
          speciesId: 'species-1',
          level: 10,
          currentHP: 50,
          maxHP: 50,
          baseStats: { hp: 50, attack: 50, defense: 50, spAtk: 50, spDef: 50, speed: 50 },
          currentStats: { hp: 50, attack: 50, defense: 50, spAtk: 50, spDef: 50, speed: 50 },
          moves: [],
          experience: 200,
          isFainted: false,
        },
      ];

      const converted = convertLegacyCrittersToModern(modernCritters);

      expect(converted[0].id).toBe('modern-1');
      expect(converted[0].speciesId).toBe('species-1');
    });

    it('should convert modern critters back to legacy', () => {
      const modernCritters: ICritter[] = [
        {
          id: 'modern-1',
          speciesId: 'species-1',
          level: 10,
          currentHP: 50,
          maxHP: 50,
          baseStats: { hp: 50, attack: 50, defense: 50, spAtk: 50, spDef: 50, speed: 50 },
          currentStats: { hp: 50, attack: 50, defense: 50, spAtk: 50, spDef: 50, speed: 50 },
          moves: [],
          experience: 200,
          isFainted: false,
        },
      ];

      const legacy = convertModernCrittersToLegacy(modernCritters);

      expect(Array.isArray(legacy)).toBe(true);
      expect(legacy[0].id).toBe('modern-1');
    });
  });

  describe('State Conversion', () => {
    it('should convert legacy state to modern SaveData', () => {
      const legacyState: IGlobalState = {
        player: {
          position: { x: 10, y: 20 },
          direction: 'DOWN',
          location: { area: 'forest', isInterior: false },
        },
        options: {
          textSpeed: 'MID',
          battleSceneAnimations: 'ON',
          battleStyle: 'SHIFT',
          sound: 'ON',
          volume: 5,
          menuColor: 0,
        },
        gameStarted: true,
        monsters: { inParty: [] },
        inventory: [{ item: { id: 1 }, quantity: 5 }],
        itemsPickedUp: [1, 2, 3],
        viewedEvents: [10, 20],
        flags: ['flag1', 'flag2'],
      };

      const saveData = convertLegacyStateToSaveData(legacyState, 'TestPlayer');

      expect(saveData.playerState.name).toBe('TestPlayer');
      expect(saveData.playerState.position).toEqual({ x: 10, y: 20 });
      expect(saveData.playerState.currentArea).toBe('forest');
      expect(saveData.defeatedTrainers).toEqual(['flag1', 'flag2']);
      expect(saveData.playerState.inventory.items.get('1')).toBe(5);
    });

    it('should convert modern SaveData to legacy state', () => {
      const saveData: ISaveData = {
        version: 2,
        timestamp: Date.now(),
        playerState: {
          name: 'TestPlayer',
          level: 10,
          badges: ['badge1'],
          pokedex: new Set(['species-1']),
          inventory: {
            items: new Map([['1', 5]]),
            capacity: 50,
          },
          party: {
            critters: [],
            maxSize: 6,
          },
          money: 1000,
          position: { x: 15, y: 25 },
          currentArea: 'mountain',
          playtime: 100,
        },
        completedArenas: [],
        defeatedTrainers: ['trainer1'],
        caughtCritters: [],
        playedMinutes: 500,
      };

      const legacyState = convertSaveDataToLegacyState(saveData);

      expect(legacyState.player.position).toEqual({ x: 15, y: 25 });
      expect(legacyState.player.location.area).toBe('mountain');
      expect(legacyState.gameStarted).toBe(true);
      expect(legacyState.flags).toEqual(['trainer1']);
      expect(legacyState.inventory[0].item.id).toBe(1);
      expect(legacyState.inventory[0].quantity).toBe(5);
    });

    it('should round-trip conversion correctly', () => {
      const original: IGlobalState = {
        player: {
          position: { x: 50, y: 100 },
          direction: 'UP',
          location: { area: 'city', isInterior: true },
        },
        options: {
          textSpeed: 'FAST',
          battleSceneAnimations: 'OFF',
          battleStyle: 'SWITCH',
          sound: 'OFF',
          volume: 8,
          menuColor: 2,
        },
        gameStarted: true,
        monsters: { inParty: [] },
        inventory: [
          { item: { id: 1 }, quantity: 10 },
          { item: { id: 2 }, quantity: 5 },
        ],
        itemsPickedUp: [1],
        viewedEvents: [100],
        flags: ['defeated_gym1', 'found_item'],
      };

      const saveData = convertLegacyStateToSaveData(original);
      const roundTripped = convertSaveDataToLegacyState(saveData);

      expect(roundTripped.player.position).toEqual(original.player.position);
      expect(roundTripped.player.location).toEqual(original.player.location);
      expect(roundTripped.gameStarted).toBe(original.gameStarted);
      expect(roundTripped.flags).toEqual(original.flags);
      expect(roundTripped.inventory.length).toBe(original.inventory.length);
    });
  });

  describe('Validation', () => {
    it('should validate correct legacy state', () => {
      const validState: IGlobalState = {
        player: {
          position: { x: 0, y: 0 },
          direction: 'DOWN',
          location: { area: 'start', isInterior: false },
        },
        options: {
          textSpeed: 'MID',
          battleSceneAnimations: 'ON',
          battleStyle: 'SHIFT',
          sound: 'ON',
          volume: 5,
          menuColor: 0,
        },
        gameStarted: false,
        monsters: { inParty: [] },
        inventory: [],
        itemsPickedUp: [],
        viewedEvents: [],
        flags: [],
      };

      expect(validateLegacyState(validState)).toBe(true);
    });

    it('should reject invalid legacy state - missing player', () => {
      const invalidState = {
        options: {},
        monsters: { inParty: [] },
      };

      expect(validateLegacyState(invalidState)).toBe(false);
    });

    it('should reject invalid legacy state - invalid position', () => {
      const invalidState: any = {
        player: {
          position: { x: 'invalid', y: 0 },
          direction: 'DOWN',
          location: { area: 'start', isInterior: false },
        },
        options: {},
        monsters: { inParty: [] },
        inventory: [],
      };

      expect(validateLegacyState(invalidState)).toBe(false);
    });

    it('should validate correct SaveData', () => {
      const validSave: ISaveData = {
        version: 2,
        timestamp: Date.now(),
        playerState: {
          name: 'Test',
          level: 1,
          badges: [],
          pokedex: new Set(),
          inventory: { items: new Map(), capacity: 50 },
          party: { critters: [], maxSize: 6 },
          money: 0,
          position: { x: 0, y: 0 },
          currentArea: 'start',
          playtime: 0,
        },
        completedArenas: [],
        defeatedTrainers: [],
        caughtCritters: [],
        playedMinutes: 0,
      };

      expect(validateSaveData(validSave)).toBe(true);
    });

    it('should reject invalid SaveData', () => {
      const invalidSave = {
        version: 2,
        timestamp: Date.now(),
        playerState: {
          name: 'Test',
          // Missing required fields
        },
      };

      expect(validateSaveData(invalidSave)).toBe(false);
    });
  });

  describe('DataCompatibilityWrapper', () => {
    it('should wrap and provide access to both formats', () => {
      const saveData: ISaveData = {
        version: 2,
        timestamp: Date.now(),
        playerState: {
          name: 'TestPlayer',
          level: 5,
          badges: [],
          pokedex: new Set(),
          inventory: {
            items: new Map([['1', 10]]),
            capacity: 50,
          },
          party: {
            critters: [],
            maxSize: 6,
          },
          money: 500,
          position: { x: 10, y: 20 },
          currentArea: 'forest',
          playtime: 60,
        },
        completedArenas: [],
        defeatedTrainers: [],
        caughtCritters: [],
        playedMinutes: 100,
      };

      const wrapper = new DataCompatibilityWrapper(saveData);

      expect(wrapper.getModern()).toBe(saveData);
      expect(wrapper.getLegacy()).toBeDefined();
      expect(wrapper.getPlayerState().name).toBe('TestPlayer');
    });

    it('should sync when updating modern data', () => {
      const saveData: ISaveData = {
        version: 2,
        timestamp: Date.now(),
        playerState: {
          name: 'TestPlayer',
          level: 5,
          badges: [],
          pokedex: new Set(),
          inventory: {
            items: new Map(),
            capacity: 50,
          },
          party: {
            critters: [],
            maxSize: 6,
          },
          money: 0,
          position: { x: 0, y: 0 },
          currentArea: 'start',
          playtime: 0,
        },
        completedArenas: [],
        defeatedTrainers: [],
        caughtCritters: [],
        playedMinutes: 0,
      };

      const wrapper = new DataCompatibilityWrapper(saveData);

      const newData = { ...saveData };
      newData.playerState.position = { x: 50, y: 100 };
      wrapper.updateModern(newData);

      const legacyAfterUpdate = wrapper.getLegacy();
      expect(legacyAfterUpdate.player.position).toEqual({ x: 50, y: 100 });
    });

    it('should sync when updating legacy data', () => {
      const legacyState: IGlobalState = {
        player: {
          position: { x: 10, y: 20 },
          direction: 'DOWN',
          location: { area: 'forest', isInterior: false },
        },
        options: {
          textSpeed: 'MID',
          battleSceneAnimations: 'ON',
          battleStyle: 'SHIFT',
          sound: 'ON',
          volume: 5,
          menuColor: 0,
        },
        gameStarted: true,
        monsters: { inParty: [] },
        inventory: [],
        itemsPickedUp: [],
        viewedEvents: [],
        flags: [],
      };

      const saveData = convertLegacyStateToSaveData(legacyState);
      const wrapper = new DataCompatibilityWrapper(saveData, legacyState);

      const newLegacy = { ...legacyState };
      newLegacy.player.position = { x: 100, y: 200 };
      wrapper.updateLegacy(newLegacy);

      expect(wrapper.getModern().playerState.position).toEqual({ x: 100, y: 200 });
    });

    it('should provide convenience methods', () => {
      const saveData: ISaveData = {
        version: 2,
        timestamp: Date.now(),
        playerState: {
          name: 'Test',
          level: 1,
          badges: [],
          pokedex: new Set(),
          inventory: {
            items: new Map([['1', 5]]),
            capacity: 50,
          },
          party: {
            critters: [],
            maxSize: 6,
          },
          money: 100,
          position: { x: 0, y: 0 },
          currentArea: 'start',
          playtime: 0,
        },
        completedArenas: [],
        defeatedTrainers: [],
        caughtCritters: [],
        playedMinutes: 0,
      };

      const wrapper = new DataCompatibilityWrapper(saveData);

      expect(wrapper.getPlayerState().name).toBe('Test');
      expect(wrapper.getInventory().get('1')).toBe(5);
      expect(wrapper.getParty()).toEqual([]);
    });
  });
});
