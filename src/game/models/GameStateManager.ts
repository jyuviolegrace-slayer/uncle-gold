import { IPlayerState, IPlayerParty, ICritter, IInventory, ISaveData } from './types';
import { EventBus } from '../EventBus';

/**
 * GameStateManager - manages player progression, party, and save data
 * Handles loading/saving to localStorage
 */
export class GameStateManager {
  private playerState: IPlayerState;
  private defeatedTrainers: Set<string> = new Set();
  private readonly SAVE_KEY = 'critterquest_save';
  private readonly SAVE_VERSION = 1;

  constructor(playerName: string = 'Player') {
    this.playerState = this.initializePlayerState(playerName);
  }

  /**
   * Initialize fresh player state
   */
  private initializePlayerState(name: string): IPlayerState {
    return {
      name,
      level: 1,
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
      currentArea: 'meadowvale',
      playtime: 0,
    };
  }

  /**
   * Get current player state
   */
  getPlayerState(): IPlayerState {
    return this.playerState;
  }

  /**
   * Add critter to party
   */
  addCritterToParty(critter: ICritter): boolean {
    if (this.playerState.party.critters.length >= this.playerState.party.maxSize) {
      EventBus.emit('party:full', { critter });
      return false;
    }

    this.playerState.party.critters.push(critter);
    EventBus.emit('party:updated', { critters: this.playerState.party.critters });
    return true;
  }

  /**
   * Remove critter from party by index
   */
  removeCritterFromParty(index: number): boolean {
    if (index < 0 || index >= this.playerState.party.critters.length) {
      return false;
    }

    const removed = this.playerState.party.critters.splice(index, 1);
    EventBus.emit('party:updated', { critters: this.playerState.party.critters });
    return true;
  }

  /**
   * Get party
   */
  getParty(): ICritter[] {
    return this.playerState.party.critters;
  }

  /**
   * Update critter in party
   */
  updateCritter(critterIndex: number, updates: Partial<ICritter>): boolean {
    if (critterIndex < 0 || critterIndex >= this.playerState.party.critters.length) {
      return false;
    }

    const critter = this.playerState.party.critters[critterIndex];
    Object.assign(critter, updates);
    EventBus.emit('party:updated', { critters: this.playerState.party.critters });
    return true;
  }

  /**
   * Add badge to collection
   */
  addBadge(badgeId: string): void {
    if (!this.playerState.badges.includes(badgeId)) {
      this.playerState.badges.push(badgeId);
      EventBus.emit('badge:earned', { badgeId, totalBadges: this.playerState.badges.length });
    }
  }

  /**
   * Check if player has badge
   */
  hasBadge(badgeId: string): boolean {
    return this.playerState.badges.includes(badgeId);
  }

  /**
   * Get badge count
   */
  getBadgeCount(): number {
    return this.playerState.badges.length;
  }

  /**
   * Mark trainer as defeated
   */
  defeatTrainer(trainerId: string): void {
    this.defeatedTrainers.add(trainerId);
    EventBus.emit('trainer:defeated', { trainerId });
  }

  /**
   * Check if trainer has been defeated
   */
  hasDefeatedTrainer(trainerId: string): boolean {
    return this.defeatedTrainers.has(trainerId);
  }

  /**
   * Get defeated trainer count
   */
  getDefeatedTrainerCount(): number {
    return this.defeatedTrainers.size;
  }

  /**
   * Add critter to pokedex
   */
  addToPokedex(critterSpeciesId: string): void {
    if (!this.playerState.pokedex.has(critterSpeciesId)) {
      this.playerState.pokedex.add(critterSpeciesId);
      EventBus.emit('pokedex:updated', { speciesId: critterSpeciesId });
    }
  }

  /**
   * Check if critter seen in pokedex
   */
  isSeenInPokedex(critterSpeciesId: string): boolean {
    return this.playerState.pokedex.has(critterSpeciesId);
  }

  /**
   * Get pokedex entries
   */
  getPokedexCount(): number {
    return this.playerState.pokedex.size;
  }

  /**
   * Add item to inventory
   */
  addItem(itemId: string, quantity: number = 1): boolean {
    const currentQuantity = this.playerState.inventory.items.get(itemId) || 0;
    const newQuantity = currentQuantity + quantity;

    if (this.playerState.inventory.items.size >= this.playerState.inventory.capacity) {
      if (!this.playerState.inventory.items.has(itemId)) {
        EventBus.emit('inventory:full');
        return false;
      }
    }

    this.playerState.inventory.items.set(itemId, newQuantity);
    EventBus.emit('inventory:updated', { itemId, quantity: newQuantity });
    return true;
  }

  /**
   * Remove item from inventory
   */
  removeItem(itemId: string, quantity: number = 1): boolean {
    const currentQuantity = this.playerState.inventory.items.get(itemId) || 0;
    if (currentQuantity < quantity) {
      return false;
    }

    if (currentQuantity === quantity) {
      this.playerState.inventory.items.delete(itemId);
    } else {
      this.playerState.inventory.items.set(itemId, currentQuantity - quantity);
    }

    EventBus.emit('inventory:updated', { itemId, quantity: currentQuantity - quantity });
    return true;
  }

  /**
   * Get item quantity
   */
  getItemQuantity(itemId: string): number {
    return this.playerState.inventory.items.get(itemId) || 0;
  }

  /**
   * Update money
   */
  addMoney(amount: number): void {
    this.playerState.money += amount;
    EventBus.emit('money:updated', { money: this.playerState.money });
  }

  /**
   * Spend money
   */
  spendMoney(amount: number): boolean {
    if (this.playerState.money >= amount) {
      this.playerState.money -= amount;
      EventBus.emit('money:updated', { money: this.playerState.money });
      return true;
    }
    return false;
  }

  /**
   * Update position
   */
  setPosition(x: number, y: number): void {
    this.playerState.position = { x, y };
  }

  /**
   * Update current area
   */
  setCurrentArea(areaId: string): void {
    this.playerState.currentArea = areaId;
    EventBus.emit('area:changed', { areaId });
  }

  /**
   * Update playtime (in minutes)
   */
  updatePlaytime(minutes: number): void {
    this.playerState.playtime += minutes;
  }

  /**
   * Save game to localStorage
   */
  saveGame(): boolean {
    try {
      const saveData: ISaveData = {
        version: this.SAVE_VERSION,
        timestamp: Date.now(),
        playerState: {
          ...this.playerState,
          pokedex: Array.from(this.playerState.pokedex),
          inventory: {
            ...this.playerState.inventory,
            items: Array.from(this.playerState.inventory.items.entries()),
          },
        } as any,
        completedArenas: this.playerState.badges,
        defeatedTrainers: Array.from(this.defeatedTrainers),
        caughtCritters: this.playerState.party.critters,
        playedMinutes: this.playerState.playtime,
      };

      localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
      EventBus.emit('game:saved', { timestamp: saveData.timestamp });
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      EventBus.emit('game:saveFailed', { error: (error as Error).message });
      return false;
    }
  }

  /**
   * Load game from localStorage
   */
  loadGame(): boolean {
    try {
      const saveDataStr = localStorage.getItem(this.SAVE_KEY);
      if (!saveDataStr) {
        return false;
      }

      const saveData = JSON.parse(saveDataStr) as ISaveData;

      if (saveData.version !== this.SAVE_VERSION) {
        console.warn('Save data version mismatch');
        return false;
      }

      this.playerState = {
        ...saveData.playerState,
        pokedex: new Set(saveData.playerState.pokedex as unknown as string[]),
        inventory: {
          ...saveData.playerState.inventory,
          items: new Map(saveData.playerState.inventory.items as unknown as [string, number][]),
        },
      };

      this.defeatedTrainers = new Set(saveData.defeatedTrainers || []);

      EventBus.emit('game:loaded', { playerName: this.playerState.name });
      return true;
    } catch (error) {
      console.error('Failed to load game:', error);
      EventBus.emit('game:loadFailed', { error: (error as Error).message });
      return false;
    }
  }

  /**
   * Check if save exists
   */
  hasSaveData(): boolean {
    return localStorage.getItem(this.SAVE_KEY) !== null;
  }

  /**
   * Delete save data
   */
  deleteSaveData(): void {
    localStorage.removeItem(this.SAVE_KEY);
    EventBus.emit('game:deleted');
  }

  /**
   * Get save file info
   */
  getSaveInfo(): { timestamp: number; playerName: string; playtime: number } | null {
    try {
      const saveDataStr = localStorage.getItem(this.SAVE_KEY);
      if (!saveDataStr) return null;

      const saveData = JSON.parse(saveDataStr) as ISaveData;
      return {
        timestamp: saveData.timestamp,
        playerName: saveData.playerState.name,
        playtime: saveData.playedMinutes,
      };
    } catch {
      return null;
    }
  }
}
