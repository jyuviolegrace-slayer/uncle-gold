/**
 * @jest-environment jsdom
 */
import { SaveService, SaveSlot } from '../SaveService';
import { EventBus } from '../../EventBus';
import { Direction, GameFlag } from '../../models/common';

// Define types locally to avoid importing DataManager (which imports Phaser)
enum TextSpeedOptions {
    FAST = "FAST",
    MID = "MID",
    SLOW = "SLOW",
}

enum BattleSceneOptions {
    ON = "ON",
    OFF = "OFF",
}

enum BattleStyleOptions {
    SHIFT = "SHIFT",
    SET = "SET",
}

enum SoundOptions {
    ON = "ON",
    OFF = "OFF",
}

interface GlobalState {
    player: {
        position: { x: number; y: number };
        direction: Direction;
        location: { area: string; isInterior: boolean };
    };
    options: {
        textSpeed: TextSpeedOptions;
        battleSceneAnimations: BattleSceneOptions;
        battleStyle: BattleStyleOptions;
        sound: SoundOptions;
        volume: number;
        menuColor: number;
    };
    gameStarted: boolean;
    monsters: {
        inParty: any[];
    };
    inventory: any[];
    itemsPickedUp: number[];
    viewedEvents: number[];
    flags: GameFlag[];
    money: number;
}

// Mock EventBus
jest.mock('../../EventBus', () => ({
    EventBus: {
        emit: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
        once: jest.fn(),
    },
}));

// Mock DataManager module to avoid Phaser imports
jest.mock('../DataManager', () => {
    return {
        DataManager: jest.fn(),
        dataManager: {},
        Direction: { DOWN: 'DOWN', UP: 'UP', LEFT: 'LEFT', RIGHT: 'RIGHT', NONE: 'NONE' },
        GameFlag: { TEST_FLAG: 'TEST_FLAG' },
    };
});

// Mock DataManager to avoid Phaser dependencies
class MockDataManager {
    private state: any = {};

    getCurrentState(): GlobalState {
        return {
            player: {
                position: this.state.PLAYER_POSITION || { x: 0, y: 0 },
                direction: this.state.PLAYER_DIRECTION || Direction.DOWN,
                location: this.state.PLAYER_LOCATION || { area: 'main_1', isInterior: false },
            },
            options: {
                textSpeed: this.state.OPTIONS_TEXT_SPEED || TextSpeedOptions.MID,
                battleSceneAnimations: this.state.OPTIONS_BATTLE_SCENE_ANIMATIONS || BattleSceneOptions.ON,
                battleStyle: this.state.OPTIONS_BATTLE_STYLE || BattleStyleOptions.SHIFT,
                sound: this.state.OPTIONS_SOUND || SoundOptions.ON,
                volume: this.state.OPTIONS_VOLUME || 4,
                menuColor: this.state.OPTIONS_MENU_COLOR || 0,
            },
            gameStarted: this.state.GAME_STARTED || false,
            monsters: {
                inParty: this.state.CRITTERS_IN_PARTY || [],
            },
            inventory: this.state.INVENTORY || [],
            itemsPickedUp: this.state.ITEMS_PICKED_UP || [],
            viewedEvents: this.state.VIEWED_EVENTS || [],
            flags: this.state.FLAGS || [],
            money: this.state.MONEY || 1000,
        };
    }

    loadFromState(state: GlobalState): void {
        this.state = {
            PLAYER_POSITION: state.player.position,
            PLAYER_DIRECTION: state.player.direction,
            PLAYER_LOCATION: state.player.location,
            OPTIONS_TEXT_SPEED: state.options.textSpeed,
            OPTIONS_BATTLE_SCENE_ANIMATIONS: state.options.battleSceneAnimations,
            OPTIONS_BATTLE_STYLE: state.options.battleStyle,
            OPTIONS_SOUND: state.options.sound,
            OPTIONS_VOLUME: state.options.volume,
            OPTIONS_MENU_COLOR: state.options.menuColor,
            GAME_STARTED: state.gameStarted,
            CRITTERS_IN_PARTY: state.monsters.inParty,
            INVENTORY: state.inventory,
            ITEMS_PICKED_UP: state.itemsPickedUp,
            VIEWED_EVENTS: state.viewedEvents,
            FLAGS: state.flags,
            MONEY: state.money,
        };
    }

    set(key: string, value: any): void {
        this.state[key] = value;
    }

    get(key: string): any {
        return this.state[key];
    }
}

describe('SaveService', () => {
    let saveService: SaveService;
    let dataManager: MockDataManager;

    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
        
        dataManager = new MockDataManager();
        saveService = new SaveService(dataManager as any);
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('Initialization', () => {
        test('should create empty save schema on first run', () => {
            const slots = saveService.getSaveSlots();
            
            expect(slots).toHaveLength(3);
            expect(slots[0].slot).toBe(SaveSlot.SLOT_1);
            expect(slots[0].data).toBeNull();
            expect(slots[1].slot).toBe(SaveSlot.SLOT_2);
            expect(slots[1].data).toBeNull();
            expect(slots[2].slot).toBe(SaveSlot.SLOT_3);
            expect(slots[2].data).toBeNull();
        });

        test('should have no active slot on initialization', () => {
            expect(saveService.getActiveSlot()).toBeNull();
        });

        test('should report no save data on first run', () => {
            expect(saveService.hasAnySaveData()).toBe(false);
        });
    });

    describe('Save Operations', () => {
        test('should save to active slot', () => {
            saveService.setActiveSlot(SaveSlot.SLOT_1);
            const success = saveService.saveGame(false);
            
            expect(success).toBe(true);
            expect(saveService.hasSlotData(SaveSlot.SLOT_1)).toBe(true);
        });

        test('should fail to save without active slot', () => {
            const success = saveService.saveGame(false);
            
            expect(success).toBe(false);
        });

        test('should save to specific slot', () => {
            const success = saveService.saveGameToSlot(SaveSlot.SLOT_2, false);
            
            expect(success).toBe(true);
            expect(saveService.hasSlotData(SaveSlot.SLOT_2)).toBe(true);
            expect(saveService.getActiveSlot()).toBe(SaveSlot.SLOT_2);
        });

        test('should emit notification on manual save', () => {
            saveService.setActiveSlot(SaveSlot.SLOT_1);
            saveService.saveGame(true);
            
            expect(EventBus.emit).toHaveBeenCalledWith('save:notification', {
                message: 'Game saved!',
                slot: SaveSlot.SLOT_1,
            });
        });

        test('should not emit notification on auto-save', () => {
            saveService.setActiveSlot(SaveSlot.SLOT_1);
            saveService.autoSave();
            
            expect(EventBus.emit).not.toHaveBeenCalled();
        });

        test('should auto-save to default slot when no active slot', () => {
            const success = saveService.autoSave();
            
            expect(success).toBe(true);
            expect(saveService.getActiveSlot()).toBe(SaveSlot.SLOT_1);
            expect(saveService.hasSlotData(SaveSlot.SLOT_1)).toBe(true);
        });

        test('should persist save data to localStorage', () => {
            saveService.saveGameToSlot(SaveSlot.SLOT_1, false);
            
            const savedData = localStorage.getItem('CRITTER_QUEST_SAVE_DATA');
            expect(savedData).not.toBeNull();
            
            const parsed = JSON.parse(savedData!);
            expect(parsed.version).toBe(1);
            expect(parsed.slots.slot_1).not.toBeNull();
        });

        test('should update lastModified timestamp on save', () => {
            const beforeTime = Date.now();
            saveService.saveGameToSlot(SaveSlot.SLOT_1, false);
            const afterTime = Date.now();
            
            const slots = saveService.getSaveSlots();
            const slot1 = slots.find(s => s.slot === SaveSlot.SLOT_1);
            
            expect(slot1!.lastModified).toBeGreaterThanOrEqual(beforeTime);
            expect(slot1!.lastModified).toBeLessThanOrEqual(afterTime);
        });
    });

    describe('Load Operations', () => {
        beforeEach(() => {
            // Setup some test data
            dataManager.set('PLAYER_POSITION', { x: 100, y: 200 });
            dataManager.set('MONEY', 5000);
            saveService.saveGameToSlot(SaveSlot.SLOT_1, false);
            
            // Reset to initial state
            dataManager.set('PLAYER_POSITION', { x: 0, y: 0 });
            dataManager.set('MONEY', 1000);
        });

        test('should load game from slot', () => {
            const success = saveService.loadGame(SaveSlot.SLOT_1);
            
            expect(success).toBe(true);
            
            const position = dataManager.get('PLAYER_POSITION');
            const money = dataManager.get('MONEY');
            
            expect(position.x).toBe(100);
            expect(position.y).toBe(200);
            expect(money).toBe(5000);
        });

        test('should set active slot on load', () => {
            saveService.loadGame(SaveSlot.SLOT_1);
            
            expect(saveService.getActiveSlot()).toBe(SaveSlot.SLOT_1);
        });

        test('should emit load event', () => {
            saveService.loadGame(SaveSlot.SLOT_1);
            
            expect(EventBus.emit).toHaveBeenCalledWith('save:loaded', {
                slot: SaveSlot.SLOT_1,
            });
        });

        test('should fail to load from empty slot', () => {
            const success = saveService.loadGame(SaveSlot.SLOT_2);
            
            expect(success).toBe(false);
        });
    });

    describe('Slot Management', () => {
        beforeEach(() => {
            saveService.saveGameToSlot(SaveSlot.SLOT_1, false);
            saveService.saveGameToSlot(SaveSlot.SLOT_2, false);
        });

        test('should check if slot has data', () => {
            expect(saveService.hasSlotData(SaveSlot.SLOT_1)).toBe(true);
            expect(saveService.hasSlotData(SaveSlot.SLOT_2)).toBe(true);
            expect(saveService.hasSlotData(SaveSlot.SLOT_3)).toBe(false);
        });

        test('should check if any save data exists', () => {
            expect(saveService.hasAnySaveData()).toBe(true);
        });

        test('should delete save slot', () => {
            saveService.deleteSaveSlot(SaveSlot.SLOT_1);
            
            expect(saveService.hasSlotData(SaveSlot.SLOT_1)).toBe(false);
            expect(saveService.hasSlotData(SaveSlot.SLOT_2)).toBe(true);
        });

        test('should clear active slot when deleting active slot', () => {
            saveService.setActiveSlot(SaveSlot.SLOT_1);
            saveService.deleteSaveSlot(SaveSlot.SLOT_1);
            
            expect(saveService.getActiveSlot()).toBeNull();
        });

        test('should emit delete event', () => {
            saveService.deleteSaveSlot(SaveSlot.SLOT_1);
            
            expect(EventBus.emit).toHaveBeenCalledWith('save:deleted', {
                slot: SaveSlot.SLOT_1,
            });
        });

        test('should get most recent slot', () => {
            // Force a delay to ensure slot 3 is saved after others
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));
            
            const testService = new SaveService(dataManager as any);
            testService.saveGameToSlot(SaveSlot.SLOT_1, false);
            
            jest.setSystemTime(new Date('2024-01-01T00:01:00Z'));
            testService.saveGameToSlot(SaveSlot.SLOT_2, false);
            
            jest.useRealTimers();
            
            const recentSlot = testService.getMostRecentSlot();
            expect(recentSlot).toBe(SaveSlot.SLOT_2);
        });

        test('should return null for most recent slot when no saves', () => {
            saveService.clearAllSaves();
            
            const recentSlot = saveService.getMostRecentSlot();
            expect(recentSlot).toBeNull();
        });

        test('should clear all saves', () => {
            saveService.clearAllSaves();
            
            expect(saveService.hasAnySaveData()).toBe(false);
            expect(saveService.getActiveSlot()).toBeNull();
        });
    });

    describe('Legacy Migration', () => {
        test('should migrate from MONSTER_TAMER_DATA', () => {
            const legacyData: GlobalState = {
                player: {
                    position: { x: 50, y: 75 },
                    direction: Direction.RIGHT,
                    location: { area: 'main_2', isInterior: true },
                },
                options: {
                    textSpeed: TextSpeedOptions.FAST,
                    battleSceneAnimations: BattleSceneOptions.OFF,
                    battleStyle: BattleStyleOptions.SET,
                    sound: SoundOptions.OFF,
                    volume: 3,
                    menuColor: 1,
                },
                gameStarted: true,
                monsters: { inParty: [] },
                inventory: [],
                itemsPickedUp: [1, 2, 3],
                viewedEvents: [10, 20],
                flags: [GameFlag.FOUND_PROFESSOR],
                money: 2500,
            };

            localStorage.setItem('MONSTER_TAMER_DATA', JSON.stringify(legacyData));

            // Create new SaveService to trigger migration
            const newService = new SaveService(dataManager as any);

            expect(newService.hasSlotData(SaveSlot.SLOT_1)).toBe(true);
            expect(localStorage.getItem('MONSTER_TAMER_DATA')).toBeNull();
            
            expect(EventBus.emit).toHaveBeenCalledWith('save:migration-complete', {
                fromKey: 'MONSTER_TAMER_DATA',
                toSlot: SaveSlot.SLOT_1,
            });
        });

        test('should migrate from CRITTER_QUEST_DATA', () => {
            const currentSingleSlotData: GlobalState = {
                player: {
                    position: { x: 25, y: 50 },
                    direction: Direction.LEFT,
                    location: { area: 'main_3', isInterior: false },
                },
                options: {
                    textSpeed: TextSpeedOptions.MID,
                    battleSceneAnimations: BattleSceneOptions.ON,
                    battleStyle: BattleStyleOptions.SHIFT,
                    sound: SoundOptions.ON,
                    volume: 4,
                    menuColor: 0,
                },
                gameStarted: true,
                monsters: { inParty: [] },
                inventory: [],
                itemsPickedUp: [],
                viewedEvents: [],
                flags: [],
                money: 1000,
            };

            localStorage.setItem('CRITTER_QUEST_DATA', JSON.stringify(currentSingleSlotData));

            const newService = new SaveService(dataManager as any);

            expect(newService.hasSlotData(SaveSlot.SLOT_1)).toBe(true);
            expect(localStorage.getItem('CRITTER_QUEST_DATA')).toBeNull();
            
            expect(EventBus.emit).toHaveBeenCalledWith('save:migration-complete', {
                fromKey: 'CRITTER_QUEST_DATA',
                toSlot: SaveSlot.SLOT_1,
            });
        });

        test('should not migrate if multi-slot data already exists', () => {
            saveService.saveGameToSlot(SaveSlot.SLOT_1, false);
            
            const legacyData = { gameStarted: true, player: { position: {x: 0, y: 0}, direction: Direction.DOWN, location: { area: 'main_1', isInterior: false } }, options: { textSpeed: TextSpeedOptions.MID, battleSceneAnimations: BattleSceneOptions.ON, battleStyle: BattleStyleOptions.SHIFT, sound: SoundOptions.ON, volume: 4, menuColor: 0 }, monsters: { inParty: [] }, inventory: [], itemsPickedUp: [], viewedEvents: [], flags: [], money: 0 };
            localStorage.setItem('CRITTER_QUEST_DATA', JSON.stringify(legacyData));

            const newService = new SaveService(dataManager as any);

            expect(localStorage.getItem('CRITTER_QUEST_DATA')).not.toBeNull();
        });
    });

    describe('Multiple Save Slots', () => {
        test('should maintain separate save data per slot', () => {
            // Save to slot 1
            dataManager.set('MONEY', 1000);
            saveService.saveGameToSlot(SaveSlot.SLOT_1, false);

            // Save to slot 2
            dataManager.set('MONEY', 2000);
            saveService.saveGameToSlot(SaveSlot.SLOT_2, false);

            // Save to slot 3
            dataManager.set('MONEY', 3000);
            saveService.saveGameToSlot(SaveSlot.SLOT_3, false);

            // Verify each slot has different data
            saveService.loadGame(SaveSlot.SLOT_1);
            expect(dataManager.get('MONEY')).toBe(1000);

            saveService.loadGame(SaveSlot.SLOT_2);
            expect(dataManager.get('MONEY')).toBe(2000);

            saveService.loadGame(SaveSlot.SLOT_3);
            expect(dataManager.get('MONEY')).toBe(3000);
        });

        test('should get all save slots with metadata', () => {
            saveService.saveGameToSlot(SaveSlot.SLOT_1, false);
            saveService.saveGameToSlot(SaveSlot.SLOT_3, false);

            const slots = saveService.getSaveSlots();

            expect(slots[0].data).not.toBeNull();
            expect(slots[0].lastModified).not.toBeNull();
            expect(slots[1].data).toBeNull();
            expect(slots[1].lastModified).toBeNull();
            expect(slots[2].data).not.toBeNull();
            expect(slots[2].lastModified).not.toBeNull();
        });
    });
});
