import { DataManager, dataManager, DataManagerStoreKeys } from '../DataManager';
import { Direction, GameFlag } from '../../models/common';

describe('DataManager', () => {
  let testManager: DataManager;

  beforeEach(() => {
    // Create a fresh instance for each test
    testManager = new DataManager();
  });

  afterEach(() => {
    // Clean up localStorage after each test
    localStorage.clear();
  });

  describe('Inventory Management', () => {
    test('should initialize with default inventory', () => {
      const inventory = testManager.getInventory();
      expect(inventory).toHaveLength(2);
      expect(inventory[0].item.id).toBe('1');
      expect(inventory[0].quantity).toBe(10);
      expect(inventory[1].item.id).toBe('2');
      expect(inventory[1].quantity).toBe(5);
    });

    test('should add new item to inventory', () => {
      testManager.addItem({ id: '3' }, 3);
      const inventory = testManager.getInventory();
      
      expect(inventory).toHaveLength(3);
      const newItem = inventory.find(item => item.item.id === '3');
      expect(newItem).toBeDefined();
      expect(newItem!.quantity).toBe(3);
    });

    test('should increase quantity of existing item', () => {
      testManager.addItem({ id: '1' }, 5);
      const inventory = testManager.getInventory();
      
      const existingItem = inventory.find(item => item.item.id === '1');
      expect(existingItem).toBeDefined();
      expect(existingItem!.quantity).toBe(15); // 10 + 5
    });

    test('should update entire inventory', () => {
      const newInventory = [
        { 
          item: { 
            id: '10', 
            name: 'Test Item 10', 
            description: 'Test description', 
            type: 'item' 
          }, 
          quantity: 2 
        },
        { 
          item: { 
            id: '20', 
            name: 'Test Item 20', 
            description: 'Test description', 
            type: 'item' 
          }, 
          quantity: 1 
        },
      ];
      
      testManager.updateInventory(newInventory);
      const inventory = testManager.getInventory();
      
      expect(inventory).toHaveLength(2);
      expect(inventory[0]!.item.id).toBe('10');
      expect(inventory[0]!.quantity).toBe(2);
      expect(inventory[1]!.item.id).toBe('20');
      expect(inventory[1]!.quantity).toBe(1);
    });
  });

  describe('Party Management', () => {
    test('should start with empty party', () => {
      const party = testManager.getParty();
      expect(party).toHaveLength(0);
    });

    test('should add critter to party', () => {
      const critter = {
        id: 'test-critter-1',
        critterId: 'critter-1',
        name: 'TestCritter',
        assetKey: 'test',
        assetFrame: 0,
        currentLevel: 5,
        maxHp: 50,
        currentHp: 50,
        baseAttack: 10,
        currentAttack: 10,
        attackIds: [1, 2],
        baseExp: 100,
        currentExp: 200,
      };

      testManager.addToParty(critter);
      const party = testManager.getParty();
      
      expect(party).toHaveLength(1);
      expect(party[0]).toEqual(critter);
    });

    test('should remove critter from party', () => {
      const critter = {
        id: 'test-critter-1',
        critterId: 'critter-1',
        name: 'TestCritter',
        assetKey: 'test',
        assetFrame: 0,
        currentLevel: 5,
        maxHp: 50,
        currentHp: 50,
        baseAttack: 10,
        currentAttack: 10,
        attackIds: [1, 2],
        baseExp: 100,
        currentExp: 200,
      };

      testManager.addToParty(critter);
      testManager.removeFromParty(critter.id);
      const party = testManager.getParty();
      
      expect(party).toHaveLength(0);
    });

    test('should detect when party is full', () => {
      // Add 6 critters to fill the party
      for (let i = 0; i < 6; i++) {
        const critter = {
          id: `test-critter-${i}`,
          critterId: 'critter-1',
          name: `TestCritter${i}`,
          assetKey: 'test',
          assetFrame: 0,
          currentLevel: 5,
          maxHp: 50,
          currentHp: 50,
          baseAttack: 10,
          currentAttack: 10,
          attackIds: [1, 2],
          baseExp: 100,
          currentExp: 200,
        };
        testManager.addToParty(critter);
      }

      expect(testManager.isPartyFull()).toBe(true);
    });
  });

  describe('Money Management', () => {
    test('should start with default money', () => {
      expect(testManager.getMoney()).toBe(1000);
    });

    test('should add money', () => {
      testManager.addMoney(500);
      expect(testManager.getMoney()).toBe(1500);
    });

    test('should subtract money successfully', () => {
      const result = testManager.subtractMoney(300);
      expect(result).toBe(true);
      expect(testManager.getMoney()).toBe(700);
    });

    test('should fail to subtract more money than available', () => {
      const result = testManager.subtractMoney(2000);
      expect(result).toBe(false);
      expect(testManager.getMoney()).toBe(1000); // Unchanged
    });
  });

  describe('Flag Management', () => {
    test('should start with no flags', () => {
      const flags = testManager.getFlags();
      expect(flags.size).toBe(0);
    });

    test('should add flag', () => {
      testManager.addFlag(GameFlag.FOUND_PROFESSOR);
      const flags = testManager.getFlags();
      
      expect(flags.has(GameFlag.FOUND_PROFESSOR)).toBe(true);
    });

    test('should remove flag', () => {
      testManager.addFlag(GameFlag.FOUND_PROFESSOR);
      testManager.removeFlag(GameFlag.FOUND_PROFESSOR);
      const flags = testManager.getFlags();
      
      expect(flags.has(GameFlag.FOUND_PROFESSOR)).toBe(false);
    });

    test('should check if flag exists', () => {
      expect(testManager.hasFlag(GameFlag.LOOKING_FOR_PROFESSOR)).toBe(false);
      
      testManager.addFlag(GameFlag.LOOKING_FOR_PROFESSOR);
      expect(testManager.hasFlag(GameFlag.LOOKING_FOR_PROFESSOR)).toBe(true);
    });
  });

  describe('Player Data', () => {
    test('should have default player position', () => {
      const position = testManager.dataStore.get(DataManagerStoreKeys.PLAYER_POSITION);
      expect(position).toEqual({ x: 0, y: 0 });
    });

    test('should have default player direction', () => {
      const direction = testManager.dataStore.get(DataManagerStoreKeys.PLAYER_DIRECTION);
      expect(direction).toBe(Direction.DOWN);
    });

    test('should have default player location', () => {
      const location = testManager.dataStore.get(DataManagerStoreKeys.PLAYER_LOCATION);
      expect(location).toEqual({ area: 'main_1', isInterior: false });
    });
  });

  describe('Event Tracking', () => {
    test('should track viewed events', () => {
      testManager.viewedEvent(100);
      testManager.viewedEvent(200);
      
      const viewedEvents = testManager.dataStore.get(DataManagerStoreKeys.VIEWED_EVENTS);
      expect(viewedEvents).toContain(100);
      expect(viewedEvents).toContain(200);
    });

    test('should track picked up items', () => {
      testManager.addItemPickedUp(50);
      testManager.addItemPickedUp(75);
      
      const pickedUpItems = testManager.dataStore.get(DataManagerStoreKeys.ITEMS_PICKED_UP);
      expect(pickedUpItems).toContain(50);
      expect(pickedUpItems).toContain(75);
    });
  });
});

describe('DataManager Singleton', () => {
  test('should export singleton instance', () => {
    expect(dataManager).toBeDefined();
    expect(dataManager).toBeInstanceOf(DataManager);
  });

  test('should maintain singleton pattern', () => {
    const instance1 = dataManager;
    const instance2 = dataManager;
    
    expect(instance1).toBe(instance2);
  });
});