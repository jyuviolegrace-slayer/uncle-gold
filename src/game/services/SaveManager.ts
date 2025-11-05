import { ISaveData, IPlayerState } from '../models/types';
import { EventBus } from '../EventBus';

/**
 * Save slot information
 */
export interface ISaveSlot {
  slot: number;
  exists: boolean;
  playerName?: string;
  timestamp?: number;
  playtime?: number;
  level?: number;
  badges?: number;
  partySize?: number;
}

/**
 * Save result information
 */
export interface ISaveResult {
  success: boolean;
  slot: number;
  timestamp?: number;
  error?: string;
}

/**
 * Load result information
 */
export interface ILoadResult {
  success: boolean;
  slot: number;
  data?: ISaveData;
  error?: string;
}

/**
 * SaveManager - handles save/load operations with multiple slots,
 * versioning, compression, and IndexedDB fallback
 */
export class SaveManager {
  private static instance: SaveManager;
  private readonly STORAGE_KEY_PREFIX = 'critterquest_save_slot_';
  private readonly SETTINGS_KEY = 'critterquest_settings';
  private readonly AUTOSAVE_KEY = 'critterquest_autosave';
  private readonly SAVE_VERSION = 2;
  private readonly MAX_SLOTS = 3;
  private readonly COMPRESSION_THRESHOLD = 1024; // Compress if > 1KB
  
  private useLocalStorage = true;
  private useIndexedDB = false;
  private dbInstance?: IDBDatabase;
  private storeName = 'critterquestSaves';
  private autoSaveEnabled = true;
  private autoSaveInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.initializeStorage();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): SaveManager {
    if (!SaveManager.instance) {
      SaveManager.instance = new SaveManager();
    }
    return SaveManager.instance;
  }

  /**
   * Initialize storage (localStorage and optional IndexedDB)
   */
  private initializeStorage(): void {
    try {
      // Test localStorage availability
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      this.useLocalStorage = true;
    } catch (e) {
      console.warn('localStorage not available, falling back to IndexedDB');
      this.useLocalStorage = false;
    }

    // Initialize IndexedDB as fallback
    if (!this.useLocalStorage) {
      this.initializeIndexedDB();
    }
  }

  /**
   * Initialize IndexedDB as fallback storage
   */
  private initializeIndexedDB(): void {
    try {
      const request = indexedDB.open('critterquest', 1);

      request.onerror = () => {
        console.error('IndexedDB failed to open');
        EventBus.emit('storage:unavailable', {
          message: 'Both localStorage and IndexedDB are unavailable',
        });
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event: Event) => {
        this.dbInstance = (event.target as IDBOpenDBRequest).result;
        this.useIndexedDB = true;
      };
    } catch (error) {
      console.warn('IndexedDB initialization failed:', error);
    }
  }

  /**
   * Compress data using simple string compression
   * For production, consider lz-string library
   */
  private compressData(data: string): string {
    // For now, return as-is. In production, use:
    // import LZ from 'lz-string';
    // return LZ.compressToBase64(data);
    return data;
  }

  /**
   * Decompress data
   */
  private decompressData(data: string): string {
    // For now, return as-is. In production, use:
    // import LZ from 'lz-string';
    // return LZ.decompressFromBase64(data);
    return data;
  }

  /**
   * Calculate checksum for integrity verification
   */
  private calculateChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Create save wrapper with metadata
   */
  private createSaveWrapper(saveData: ISaveData): string {
    const wrapper = {
      version: this.SAVE_VERSION,
      timestamp: Date.now(),
      checksum: '',
      data: saveData,
    };

    const dataStr = JSON.stringify(wrapper.data);
    wrapper.checksum = this.calculateChecksum(dataStr);

    return JSON.stringify(wrapper);
  }

  /**
   * Verify save data integrity
   */
  private verifySaveIntegrity(wrapper: any): boolean {
    if (!wrapper || !wrapper.checksum || !wrapper.data) {
      return false;
    }

    const dataStr = JSON.stringify(wrapper.data);
    const expectedChecksum = this.calculateChecksum(dataStr);
    return wrapper.checksum === expectedChecksum;
  }

  /**
   * Save game to a specific slot
   */
  async saveGameToSlot(
    saveData: ISaveData,
    slot: number = 0
  ): Promise<ISaveResult> {
    if (slot < 0 || slot >= this.MAX_SLOTS) {
      const error = `Invalid slot: ${slot}. Must be 0-${this.MAX_SLOTS - 1}`;
      return { success: false, slot, error };
    }

    try {
      const wrapper = this.createSaveWrapper(saveData);
      const key = `${this.STORAGE_KEY_PREFIX}${slot}`;

      if (this.useLocalStorage) {
        try {
          localStorage.setItem(key, wrapper);
          EventBus.emit('game:saved', {
            slot,
            timestamp: saveData.timestamp,
          });
          
          EventBus.emit('save:notification', {
            type: 'success',
            message: `Game saved to slot ${slot + 1}!`
          });
          return {
            success: true,
            slot,
            timestamp: saveData.timestamp,
          };
        } catch (error) {
          console.warn('localStorage save failed, trying IndexedDB');
          if (this.useIndexedDB && this.dbInstance) {
            return this.saveToIndexedDB(key, wrapper, slot, saveData.timestamp);
          }
          throw error;
        }
      } else if (this.useIndexedDB && this.dbInstance) {
        return this.saveToIndexedDB(key, wrapper, slot, saveData.timestamp);
      }

      return {
        success: false,
        slot,
        error: 'No storage available',
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('Failed to save game:', error);
      EventBus.emit('game:saveFailed', { slot, error: errorMsg });
      EventBus.emit('save:notification', {
        type: 'error',
        message: `Save failed: ${errorMsg}`
      });
      return { success: false, slot, error: errorMsg };
    }
  }

  /**
   * Save to IndexedDB
   */
  private saveToIndexedDB(
    key: string,
    wrapper: string,
    slot: number,
    timestamp: number
  ): Promise<ISaveResult> {
    return new Promise((resolve) => {
      if (!this.dbInstance) {
        resolve({
          success: false,
          slot,
          error: 'IndexedDB not available',
        });
        return;
      }

      const transaction = this.dbInstance.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put({
        id: key,
        data: wrapper,
        timestamp: Date.now(),
      });

      request.onsuccess = () => {
        EventBus.emit('game:saved', { slot, timestamp });
        EventBus.emit('save:notification', {
          type: 'success',
          message: `Game saved to slot ${slot + 1}!`
        });
        resolve({ success: true, slot, timestamp });
      };

      request.onerror = () => {
        const error = 'IndexedDB write failed';
        EventBus.emit('game:saveFailed', { slot, error });
        EventBus.emit('save:notification', {
          type: 'error',
          message: `Save failed: ${error}`
        });
        resolve({ success: false, slot, error });
      };
    });
  }

  /**
   * Load game from a specific slot
   */
  async loadGameFromSlot(slot: number = 0): Promise<ILoadResult> {
    if (slot < 0 || slot >= this.MAX_SLOTS) {
      const error = `Invalid slot: ${slot}. Must be 0-${this.MAX_SLOTS - 1}`;
      return { success: false, slot, error };
    }

    try {
      const key = `${this.STORAGE_KEY_PREFIX}${slot}`;

      if (this.useLocalStorage) {
        const data = localStorage.getItem(key);
        if (data) {
          return this.parseAndVerifySave(data, slot);
        }
      }

      if (this.useIndexedDB && this.dbInstance) {
        return this.loadFromIndexedDB(key, slot);
      }

      return {
        success: false,
        slot,
        error: 'Save slot not found',
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('Failed to load game:', error);
      EventBus.emit('game:loadFailed', { slot, error: errorMsg });
      return { success: false, slot, error: errorMsg };
    }
  }

  /**
   * Load from IndexedDB
   */
  private loadFromIndexedDB(key: string, slot: number): Promise<ILoadResult> {
    return new Promise((resolve) => {
      if (!this.dbInstance) {
        resolve({
          success: false,
          slot,
          error: 'IndexedDB not available',
        });
        return;
      }

      const transaction = this.dbInstance.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (result && result.data) {
          const parseResult = this.parseAndVerifySave(result.data, slot);
          resolve(parseResult);
        } else {
          resolve({
            success: false,
            slot,
            error: 'Save slot not found in IndexedDB',
          });
        }
      };

      request.onerror = () => {
        resolve({
          success: false,
          slot,
          error: 'IndexedDB read failed',
        });
      };
    });
  }

  /**
   * Parse and verify save data
   */
  private parseAndVerifySave(data: string, slot: number): ILoadResult {
    try {
      const decompressed = this.decompressData(data);
      const wrapper = JSON.parse(decompressed);

      // Verify version
      if (wrapper.version !== this.SAVE_VERSION) {
        console.warn(`Save version mismatch: ${wrapper.version} vs ${this.SAVE_VERSION}`);
        // Optionally handle migration here
      }

      // Verify integrity
      if (!this.verifySaveIntegrity(wrapper)) {
        return {
          success: false,
          slot,
          error: 'Save data integrity check failed',
        };
      }

      const saveData = wrapper.data as ISaveData;
      EventBus.emit('game:loaded', { slot, playerName: saveData.playerState.name });
      return { success: true, slot, data: saveData };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return { success: false, slot, error: errorMsg };
    }
  }

  /**
   * Get information about all save slots
   */
  async getSaveSlots(): Promise<ISaveSlot[]> {
    const slots: ISaveSlot[] = [];

    for (let i = 0; i < this.MAX_SLOTS; i++) {
      const key = `${this.STORAGE_KEY_PREFIX}${i}`;
      const slot: ISaveSlot = {
        slot: i,
        exists: false,
      };

      try {
        if (this.useLocalStorage) {
          const data = localStorage.getItem(key);
          if (data) {
            const info = this.extractSlotInfo(data);
            if (info) {
              slot.exists = true;
              slot.playerName = info.playerName;
              slot.timestamp = info.timestamp;
              slot.playtime = info.playtime;
              slot.level = info.level;
              slot.badges = info.badges;
              slot.partySize = info.partySize;
            }
          }
        } else if (this.useIndexedDB && this.dbInstance) {
          const result = await this.getSlotInfoFromIndexedDB(key, i);
          if (result.exists) {
            Object.assign(slot, result);
          }
        }
      } catch (error) {
        console.warn(`Failed to get info for slot ${i}:`, error);
      }

      slots.push(slot);
    }

    return slots;
  }

  /**
   * Get slot info from IndexedDB
   */
  private getSlotInfoFromIndexedDB(key: string, slot: number): Promise<Partial<ISaveSlot>> {
    return new Promise((resolve) => {
      if (!this.dbInstance) {
        resolve({ exists: false });
        return;
      }

      const transaction = this.dbInstance.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (result && result.data) {
          const info = this.extractSlotInfo(result.data);
          resolve({ exists: true, ...info });
        } else {
          resolve({ exists: false });
        }
      };

      request.onerror = () => {
        resolve({ exists: false });
      };
    });
  }

  /**
   * Extract save slot information without full load
   */
  private extractSlotInfo(data: string): Partial<ISaveSlot> | null {
    try {
      const decompressed = this.decompressData(data);
      const wrapper = JSON.parse(decompressed);
      const saveData = wrapper.data as ISaveData;

      return {
        playerName: saveData.playerState.name,
        timestamp: saveData.timestamp,
        playtime: saveData.playedMinutes,
        level: saveData.playerState.level,
        badges: saveData.playerState.badges.length,
        partySize: saveData.playerState.party.critters.length,
      };
    } catch (error) {
      console.warn('Failed to extract slot info:', error);
      return null;
    }
  }

  /**
   * Delete save in a slot
   */
  async deleteSlot(slot: number): Promise<boolean> {
    if (slot < 0 || slot >= this.MAX_SLOTS) {
      return false;
    }

    try {
      const key = `${this.STORAGE_KEY_PREFIX}${slot}`;

      if (this.useLocalStorage) {
        localStorage.removeItem(key);
      } else if (this.useIndexedDB && this.dbInstance) {
        return this.deleteFromIndexedDB(key);
      }

      EventBus.emit('game:deleted', { slot });
      return true;
    } catch (error) {
      console.error('Failed to delete slot:', error);
      return false;
    }
  }

  /**
   * Delete from IndexedDB
   */
  private deleteFromIndexedDB(key: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.dbInstance) {
        resolve(false);
        return;
      }

      const transaction = this.dbInstance.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }

  /**
   * Save game settings
   */
  saveSettings(settings: Record<string, any>): boolean {
    try {
      if (this.useLocalStorage) {
        localStorage.setItem(
          this.SETTINGS_KEY,
          JSON.stringify({
            version: this.SAVE_VERSION,
            timestamp: Date.now(),
            data: settings,
          })
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    }
  }

  /**
   * Load game settings
   */
  loadSettings(): Record<string, any> | null {
    try {
      if (this.useLocalStorage) {
        const data = localStorage.getItem(this.SETTINGS_KEY);
        if (data) {
          const parsed = JSON.parse(data);
          return parsed.data || null;
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return null;
    }
  }

  /**
   * Enable auto-save with interval (in minutes)
   */
  enableAutoSave(
    saveFunction: () => Promise<ISaveResult>,
    intervalMinutes: number = 5
  ): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    this.autoSaveEnabled = true;
    const intervalMs = intervalMinutes * 60 * 1000;

    this.autoSaveInterval = setInterval(async () => {
      if (this.autoSaveEnabled) {
        try {
          const result = await saveFunction();
          if (result.success) {
            EventBus.emit('autosave:success', { slot: result.slot });
            EventBus.emit('save:notification', {
              type: 'success',
              message: 'Auto-saved successfully!'
            });
          } else {
            EventBus.emit('autosave:failed', { error: result.error });
            EventBus.emit('save:notification', {
              type: 'error',
              message: `Auto-save failed: ${result.error}`
            });
          }
        } catch (error) {
          console.error('Auto-save failed:', error);
          const errorMsg = error instanceof Error ? error.message : String(error);
          EventBus.emit('autosave:failed', {
            error: errorMsg,
          });
          EventBus.emit('save:notification', {
            type: 'error',
            message: `Auto-save failed: ${errorMsg}`
          });
        }
      }
    }, intervalMs);
  }

  /**
   * Disable auto-save
   */
  disableAutoSave(): void {
    this.autoSaveEnabled = false;
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  /**
   * Check if auto-save is enabled
   */
  isAutoSaveEnabled(): boolean {
    return this.autoSaveEnabled;
  }

  /**
   * Get storage status
   */
  getStorageStatus(): {
    useLocalStorage: boolean;
    useIndexedDB: boolean;
    storageAvailable: boolean;
  } {
    return {
      useLocalStorage: this.useLocalStorage,
      useIndexedDB: this.useIndexedDB,
      storageAvailable: this.useLocalStorage || this.useIndexedDB,
    };
  }

  /**
   * Clear all saves (careful!)
   */
  async clearAllSaves(): Promise<boolean> {
    try {
      for (let i = 0; i < this.MAX_SLOTS; i++) {
        await this.deleteSlot(i);
      }
      return true;
    } catch (error) {
      console.error('Failed to clear all saves:', error);
      return false;
    }
  }

  /**
   * Export save data as JSON file
   */
  exportSaveAsJson(slot: number): string | null {
    if (slot < 0 || slot >= this.MAX_SLOTS) {
      return null;
    }

    try {
      const key = `${this.STORAGE_KEY_PREFIX}${slot}`;
      const data = localStorage.getItem(key);
      if (data) {
        const decompressed = this.decompressData(data);
        return decompressed;
      }
      return null;
    } catch (error) {
      console.error('Failed to export save:', error);
      return null;
    }
  }

  /**
   * Import save data from JSON
   */
  async importSaveFromJson(jsonData: string, slot: number): Promise<boolean> {
    if (slot < 0 || slot >= this.MAX_SLOTS) {
      return false;
    }

    try {
      const wrapper = JSON.parse(jsonData);
      if (!wrapper.data) {
        return false;
      }

      const saveData = wrapper.data as ISaveData;
      const result = await this.saveGameToSlot(saveData, slot);
      return result.success;
    } catch (error) {
      console.error('Failed to import save:', error);
      return false;
    }
  }
}
