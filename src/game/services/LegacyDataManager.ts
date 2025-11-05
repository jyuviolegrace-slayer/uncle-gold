import { SaveManager, ISaveResult, ILoadResult } from './SaveManager';
import { EventBus } from '../EventBus';
import { ISaveData, IPlayerState, ICritter, IInventory, IItem } from '../models/types';

/**
 * Legacy options structure
 */
export type TextSpeedOption = 'FAST' | 'MID' | 'SLOW';
export type BattleSceneOption = 'ON' | 'OFF';
export type BattleStyleOption = 'SHIFT' | 'SWITCH';
export type SoundOption = 'ON' | 'OFF';

/**
 * Legacy player location
 */
export interface ILegacyPlayerLocation {
  area: string;
  isInterior: boolean;
}

/**
 * Legacy player data
 */
export interface ILegacyPlayerPosition {
  x: number;
  y: number;
}

/**
 * Legacy player info
 */
export interface ILegacyPlayer {
  position: ILegacyPlayerPosition;
  direction: string;
  location: ILegacyPlayerLocation;
}

/**
 * Legacy options
 */
export interface ILegacyOptions {
  textSpeed: TextSpeedOption;
  battleSceneAnimations: BattleSceneOption;
  battleStyle: BattleStyleOption;
  sound: SoundOption;
  volume: number;
  menuColor: number;
}

/**
 * Legacy monster data
 */
export interface ILegacyMonsterData {
  inParty: any[];
}

/**
 * Legacy inventory item
 */
export interface ILegacyInventoryItem {
  item: {
    id: number;
  };
  quantity: number;
}

/**
 * Legacy global state
 */
export interface IGlobalState {
  player: ILegacyPlayer;
  options: ILegacyOptions;
  gameStarted: boolean;
  monsters: ILegacyMonsterData;
  inventory: ILegacyInventoryItem[];
  itemsPickedUp: number[];
  viewedEvents: number[];
  flags: string[];
}

/**
 * Direction constants
 */
const DIRECTION = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
} as const;

/**
 * Default text speed values
 */
export const TEXT_SPEED = {
  FAST: 50,
  MEDIUM: 100,
  SLOW: 150,
} as const;

/**
 * LegacyDataManager - bridges legacy data structures with modern SaveManager
 * Provides backward compatibility during the port from legacy codebase
 */
export class LegacyDataManager {
  private saveManager: SaveManager;
  private currentSlot: number = 0;
  private inMemoryState: IGlobalState;
  private static readonly DEFAULT_SAVE_SLOT = 0;

  constructor() {
    this.saveManager = SaveManager.getInstance();
    this.inMemoryState = this.createInitialState();
  }

  /**
   * Create initial state matching legacy defaults
   */
  private createInitialState(): IGlobalState {
    return {
      player: {
        position: { x: 0, y: 0 },
        direction: DIRECTION.DOWN,
        location: {
          area: 'main_1',
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
      gameStarted: false,
      monsters: {
        inParty: [],
      },
      inventory: [
        {
          item: { id: 1 },
          quantity: 10,
        },
        {
          item: { id: 2 },
          quantity: 5,
        },
      ],
      itemsPickedUp: [],
      viewedEvents: [],
      flags: [],
    };
  }

  /**
   * Load data from SaveManager
   */
  async loadData(slot: number = LegacyDataManager.DEFAULT_SAVE_SLOT): Promise<boolean> {
    try {
      const result = await this.saveManager.loadGameFromSlot(slot);
      if (result.success && result.data) {
        this.currentSlot = slot;
        this.convertSaveDataToLegacyState(result.data);
        return true;
      }
      return false;
    } catch (error) {
      console.warn('[LegacyDataManager:loadData] Failed to load data:', error);
      return false;
    }
  }

  /**
   * Save data to SaveManager
   */
  async saveData(slot: number = LegacyDataManager.DEFAULT_SAVE_SLOT): Promise<boolean> {
    try {
      const saveData = this.convertLegacyStateToSaveData();
      const result = await this.saveManager.saveGameToSlot(saveData, slot);
      if (result.success) {
        this.currentSlot = slot;
        EventBus.emit('data:saved', { slot });
        return true;
      }
      return false;
    } catch (error) {
      console.warn('[LegacyDataManager:saveData] Failed to save data:', error);
      EventBus.emit('data:saveFailed', { error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }

  /**
   * Start new game - reset data while preserving options
   */
  async startNewGame(): Promise<void> {
    const existingOptions = { ...this.inMemoryState.options };
    this.inMemoryState = this.createInitialState();
    this.inMemoryState.options = existingOptions;
    this.inMemoryState.gameStarted = true;
    await this.saveData(this.currentSlot);
  }

  /**
   * Get animated text speed value
   */
  getAnimatedTextSpeed(): number {
    switch (this.inMemoryState.options.textSpeed) {
      case 'FAST':
        return TEXT_SPEED.FAST;
      case 'MID':
        return TEXT_SPEED.MEDIUM;
      case 'SLOW':
        return TEXT_SPEED.SLOW;
      default:
        return TEXT_SPEED.MEDIUM;
    }
  }

  /**
   * Set text speed option
   */
  setTextSpeed(speed: TextSpeedOption): void {
    this.inMemoryState.options.textSpeed = speed;
    EventBus.emit('option:textSpeedChanged', { speed, animationMs: this.getAnimatedTextSpeed() });
  }

  /**
   * Set battle animations option
   */
  setBattleAnimations(enabled: BattleSceneOption): void {
    this.inMemoryState.options.battleSceneAnimations = enabled;
    EventBus.emit('option:battleAnimationsChanged', { enabled });
  }

  /**
   * Set battle style option
   */
  setBattleStyle(style: BattleStyleOption): void {
    this.inMemoryState.options.battleStyle = style;
    EventBus.emit('option:battleStyleChanged', { style });
  }

  /**
   * Set sound option
   */
  setSound(enabled: SoundOption): void {
    this.inMemoryState.options.sound = enabled;
    EventBus.emit('option:soundChanged', { enabled });
  }

  /**
   * Set volume
   */
  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(10, volume));
    this.inMemoryState.options.volume = clampedVolume;
    EventBus.emit('option:volumeChanged', { volume: clampedVolume });
  }

  /**
   * Set menu color
   */
  setMenuColor(color: number): void {
    this.inMemoryState.options.menuColor = color;
    EventBus.emit('option:menuColorChanged', { color });
  }

  /**
   * Get current options
   */
  getOptions(): ILegacyOptions {
    return { ...this.inMemoryState.options };
  }

  /**
   * Get player position
   */
  getPlayerPosition(): ILegacyPlayerPosition {
    return { ...this.inMemoryState.player.position };
  }

  /**
   * Set player position
   */
  setPlayerPosition(x: number, y: number): void {
    this.inMemoryState.player.position = { x, y };
  }

  /**
   * Get player direction
   */
  getPlayerDirection(): string {
    return this.inMemoryState.player.direction;
  }

  /**
   * Set player direction
   */
  setPlayerDirection(direction: string): void {
    this.inMemoryState.player.direction = direction;
  }

  /**
   * Get player location
   */
  getPlayerLocation(): ILegacyPlayerLocation {
    return { ...this.inMemoryState.player.location };
  }

  /**
   * Set player location
   */
  setPlayerLocation(area: string, isInterior: boolean): void {
    this.inMemoryState.player.location = { area, isInterior };
  }

  /**
   * Get inventory (in legacy format)
   */
  getInventory(): ILegacyInventoryItem[] {
    return this.inMemoryState.inventory.map((item) => ({ ...item }));
  }

  /**
   * Update inventory
   */
  updateInventory(items: ILegacyInventoryItem[]): void {
    this.inMemoryState.inventory = items.map((item) => ({ ...item }));
    EventBus.emit('inventory:updated', { items });
  }

  /**
   * Add item to inventory
   */
  addItem(itemId: number, quantity: number): void {
    const existing = this.inMemoryState.inventory.find((item) => item.item.id === itemId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.inMemoryState.inventory.push({
        item: { id: itemId },
        quantity,
      });
    }
    EventBus.emit('inventory:itemAdded', { itemId, quantity });
  }

  /**
   * Remove item from inventory
   */
  removeItem(itemId: number, quantity: number): boolean {
    const itemIndex = this.inMemoryState.inventory.findIndex((item) => item.item.id === itemId);
    if (itemIndex === -1) {
      return false;
    }

    const item = this.inMemoryState.inventory[itemIndex];
    if (item.quantity < quantity) {
      return false;
    }

    item.quantity -= quantity;
    if (item.quantity === 0) {
      this.inMemoryState.inventory.splice(itemIndex, 1);
    }

    EventBus.emit('inventory:itemRemoved', { itemId, quantity });
    return true;
  }

  /**
   * Get party (in legacy format)
   */
  getParty(): any[] {
    return this.inMemoryState.monsters.inParty.map((monster) => ({ ...monster }));
  }

  /**
   * Update party
   */
  updateParty(critters: any[]): void {
    this.inMemoryState.monsters.inParty = critters.map((critter) => ({ ...critter }));
    EventBus.emit('party:updated', { critters });
  }

  /**
   * Add critter to party
   */
  addCritterToParty(critter: any): boolean {
    if (this.inMemoryState.monsters.inParty.length >= 6) {
      EventBus.emit('party:full');
      return false;
    }
    this.inMemoryState.monsters.inParty.push(critter);
    EventBus.emit('party:updated', { critters: this.inMemoryState.monsters.inParty });
    return true;
  }

  /**
   * Check if party is full
   */
  isPartyFull(): boolean {
    return this.inMemoryState.monsters.inParty.length >= 6;
  }

  /**
   * Add picked up item
   */
  addItemPickedUp(itemId: number): void {
    this.inMemoryState.itemsPickedUp.push(itemId);
    EventBus.emit('item:pickedUp', { itemId });
  }

  /**
   * Mark event as viewed
   */
  viewedEvent(eventId: number): void {
    if (!this.inMemoryState.viewedEvents.includes(eventId)) {
      this.inMemoryState.viewedEvents.push(eventId);
      EventBus.emit('event:viewed', { eventId });
    }
  }

  /**
   * Get all flags
   */
  getFlags(): Set<string> {
    return new Set(this.inMemoryState.flags);
  }

  /**
   * Add flag
   */
  addFlag(flag: string): void {
    if (!this.inMemoryState.flags.includes(flag)) {
      this.inMemoryState.flags.push(flag);
      EventBus.emit('flag:added', { flag });
    }
  }

  /**
   * Remove flag
   */
  removeFlag(flag: string): void {
    const index = this.inMemoryState.flags.indexOf(flag);
    if (index !== -1) {
      this.inMemoryState.flags.splice(index, 1);
      EventBus.emit('flag:removed', { flag });
    }
  }

  /**
   * Convert ISaveData to legacy IGlobalState
   */
  private convertSaveDataToLegacyState(saveData: ISaveData): void {
    this.inMemoryState = {
      player: {
        position: {
          x: saveData.playerState.position.x,
          y: saveData.playerState.position.y,
        },
        direction: DIRECTION.DOWN,
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
        inParty: saveData.playerState.party.critters,
      },
      inventory: Array.from(saveData.playerState.inventory.items.entries()).map(([itemId, quantity]) => ({
        item: { id: Number(itemId) },
        quantity,
      })),
      itemsPickedUp: [],
      viewedEvents: [],
      flags: saveData.defeatedTrainers || [],
    };
  }

  /**
   * Convert legacy IGlobalState to ISaveData
   */
  private convertLegacyStateToSaveData(): ISaveData {
    const inventoryMap = new Map<string, number>();
    for (const item of this.inMemoryState.inventory) {
      if (item) {
        inventoryMap.set(String(item.item.id), item.quantity);
      }
    }

    const playerState: IPlayerState = {
      name: 'Player',
      level: 1,
      badges: [],
      pokedex: new Set(),
      inventory: {
        items: inventoryMap,
        capacity: 50,
      },
      party: {
        critters: this.inMemoryState.monsters.inParty,
        maxSize: 6,
      },
      money: 0,
      position: this.inMemoryState.player.position,
      currentArea: this.inMemoryState.player.location.area,
      playtime: 0,
    };

    return {
      version: 1,
      timestamp: Date.now(),
      playerState,
      completedArenas: [],
      defeatedTrainers: this.inMemoryState.flags,
      caughtCritters: this.inMemoryState.monsters.inParty,
      playedMinutes: 0,
    };
  }

  /**
   * Get current in-memory state (for debugging)
   */
  getState(): IGlobalState {
    return JSON.parse(JSON.stringify(this.inMemoryState));
  }

  /**
   * Clear all data
   */
  async clearAllData(): Promise<boolean> {
    return this.saveManager.clearAllSaves();
  }
}
