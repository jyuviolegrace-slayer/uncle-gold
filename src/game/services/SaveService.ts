import { EventBus } from '../EventBus';
import { DataManager, type GlobalState, dataManager } from './DataManager';

export enum SaveSlot {
    SLOT_1 = 'slot_1',
    SLOT_2 = 'slot_2',
    SLOT_3 = 'slot_3',
}

export interface SaveSchema {
    version: number;
    slots: {
        [key: string]: GlobalState | null;
    };
    activeSlot: SaveSlot | null;
    lastModified: {
        [key: string]: number;
    };
}

const SAVE_SCHEMA_VERSION = 1;
const SAVE_STORAGE_KEY = 'CRITTER_QUEST_SAVE_DATA';
const LEGACY_STORAGE_KEY = 'MONSTER_TAMER_DATA';

export class SaveService {
    private dataManager: DataManager;
    private activeSlot: SaveSlot | null = null;
    private saveSchema: SaveSchema;

    constructor(dataManager: DataManager) {
        this.dataManager = dataManager;
        this.saveSchema = this.initializeSaveSchema();
        this.checkAndMigrateLegacyData();
    }

    /**
     * Initialize the save schema from localStorage or create a new one
     */
    private initializeSaveSchema(): SaveSchema {
        if (typeof Storage === 'undefined') {
            console.warn('[SaveService] localStorage not supported');
            return this.createEmptySaveSchema();
        }

        const savedData = localStorage.getItem(SAVE_STORAGE_KEY);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData) as SaveSchema;
                // Validate schema version
                if (parsed.version !== SAVE_SCHEMA_VERSION) {
                    console.log(`[SaveService] Migrating save schema from v${parsed.version} to v${SAVE_SCHEMA_VERSION}`);
                    return this.migrateSaveSchema(parsed);
                }
                return parsed;
            } catch (error) {
                console.warn('[SaveService] Failed to parse save data, creating new schema', error);
                return this.createEmptySaveSchema();
            }
        }

        return this.createEmptySaveSchema();
    }

    /**
     * Create an empty save schema
     */
    private createEmptySaveSchema(): SaveSchema {
        return {
            version: SAVE_SCHEMA_VERSION,
            slots: {
                [SaveSlot.SLOT_1]: null,
                [SaveSlot.SLOT_2]: null,
                [SaveSlot.SLOT_3]: null,
            },
            activeSlot: null,
            lastModified: {},
        };
    }

    /**
     * Migrate save schema to current version
     */
    private migrateSaveSchema(oldSchema: SaveSchema): SaveSchema {
        // For now, just create a new schema since we're at v1
        // In future, add version-specific migration logic here
        return {
            ...this.createEmptySaveSchema(),
            slots: oldSchema.slots || this.createEmptySaveSchema().slots,
            activeSlot: oldSchema.activeSlot || null,
            lastModified: oldSchema.lastModified || {},
        };
    }

    /**
     * Check for legacy save data and migrate if found
     */
    private checkAndMigrateLegacyData(): void {
        if (typeof Storage === 'undefined') {
            return;
        }

        // Check for old single-slot save key
        const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacyData) {
            try {
                console.log('[SaveService] Legacy save data detected, migrating...');
                const parsedLegacy = JSON.parse(legacyData) as GlobalState;
                
                // Migrate to slot 1
                this.saveSchema.slots[SaveSlot.SLOT_1] = parsedLegacy;
                this.saveSchema.activeSlot = SaveSlot.SLOT_1;
                this.saveSchema.lastModified[SaveSlot.SLOT_1] = Date.now();
                
                // Save the migrated data
                this.persistSaveSchema();
                
                // Remove legacy key
                localStorage.removeItem(LEGACY_STORAGE_KEY);
                
                console.log('[SaveService] ✓ Legacy save data migrated successfully to Slot 1');
                
                // Emit migration notification
                EventBus.emit('save:migration-complete', {
                    fromKey: LEGACY_STORAGE_KEY,
                    toSlot: SaveSlot.SLOT_1,
                });
            } catch (error) {
                console.error('[SaveService] Failed to migrate legacy save data', error);
            }
            return;
        }

        // Also check for the current single-slot key (CRITTER_QUEST_DATA)
        const currentSingleSlotData = localStorage.getItem('CRITTER_QUEST_DATA');
        if (currentSingleSlotData && !this.hasAnySaveData()) {
            try {
                console.log('[SaveService] Current single-slot save data detected, migrating...');
                const parsedData = JSON.parse(currentSingleSlotData) as GlobalState;
                
                // Migrate to slot 1
                this.saveSchema.slots[SaveSlot.SLOT_1] = parsedData;
                this.saveSchema.activeSlot = SaveSlot.SLOT_1;
                this.saveSchema.lastModified[SaveSlot.SLOT_1] = Date.now();
                
                // Save the migrated data
                this.persistSaveSchema();
                
                // Remove old key
                localStorage.removeItem('CRITTER_QUEST_DATA');
                
                console.log('[SaveService] ✓ Single-slot save data migrated successfully to Slot 1');
                
                // Emit migration notification
                EventBus.emit('save:migration-complete', {
                    fromKey: 'CRITTER_QUEST_DATA',
                    toSlot: SaveSlot.SLOT_1,
                });
            } catch (error) {
                console.error('[SaveService] Failed to migrate single-slot save data', error);
            }
        }
    }

    /**
     * Check if any save slot has data
     */
    hasAnySaveData(): boolean {
        return Object.values(this.saveSchema.slots).some(slot => slot !== null);
    }

    /**
     * Get all save slots with metadata
     */
    getSaveSlots(): Array<{ slot: SaveSlot; data: GlobalState | null; lastModified: number | null }> {
        return [SaveSlot.SLOT_1, SaveSlot.SLOT_2, SaveSlot.SLOT_3].map(slot => ({
            slot,
            data: this.saveSchema.slots[slot],
            lastModified: this.saveSchema.lastModified[slot] || null,
        }));
    }

    /**
     * Check if a specific slot has save data
     */
    hasSlotData(slot: SaveSlot): boolean {
        return this.saveSchema.slots[slot] !== null;
    }

    /**
     * Get the currently active slot
     */
    getActiveSlot(): SaveSlot | null {
        return this.activeSlot;
    }

    /**
     * Set the active slot
     */
    setActiveSlot(slot: SaveSlot): void {
        this.activeSlot = slot;
        this.saveSchema.activeSlot = slot;
    }

    /**
     * Load game from a specific slot
     */
    loadGame(slot: SaveSlot): boolean {
        const slotData = this.saveSchema.slots[slot];
        if (!slotData) {
            console.warn(`[SaveService:loadGame] No save data found in ${slot}`);
            return false;
        }

        try {
            this.dataManager.loadFromState(slotData);
            this.setActiveSlot(slot);
            console.log(`[SaveService:loadGame] ✓ Loaded game from ${slot}`);
            
            // Emit load success event
            EventBus.emit('save:loaded', { slot });
            return true;
        } catch (error) {
            console.error(`[SaveService:loadGame] Failed to load from ${slot}`, error);
            return false;
        }
    }

    /**
     * Save game to the active slot
     */
    saveGame(notify: boolean = true): boolean {
        if (!this.activeSlot) {
            console.warn('[SaveService:saveGame] No active slot selected');
            return false;
        }

        return this.saveGameToSlot(this.activeSlot, notify);
    }

    /**
     * Save game to a specific slot
     */
    saveGameToSlot(slot: SaveSlot, notify: boolean = true): boolean {
        if (typeof Storage === 'undefined') {
            console.warn('[SaveService:saveGameToSlot] localStorage not supported');
            return false;
        }

        try {
            const currentState = this.dataManager.getCurrentState();
            this.saveSchema.slots[slot] = currentState;
            this.saveSchema.lastModified[slot] = Date.now();
            this.setActiveSlot(slot);

            this.persistSaveSchema();

            console.log(`[SaveService:saveGameToSlot] ✓ Game saved to ${slot}`);

            if (notify) {
                // Emit save notification
                EventBus.emit('save:notification', {
                    message: 'Game saved!',
                    slot,
                });
            }

            return true;
        } catch (error) {
            console.error(`[SaveService:saveGameToSlot] Failed to save to ${slot}`, error);
            
            if (notify) {
                EventBus.emit('save:notification', {
                    message: 'Failed to save game',
                    slot,
                    error: true,
                });
            }
            
            return false;
        }
    }

    /**
     * Auto-save to the active slot without notification
     */
    autoSave(): boolean {
        if (!this.activeSlot) {
            // If no active slot, use slot 1 as default
            this.setActiveSlot(SaveSlot.SLOT_1);
        }
        
        return this.saveGame(false);
    }

    /**
     * Delete save data from a specific slot
     */
    deleteSaveSlot(slot: SaveSlot): void {
        this.saveSchema.slots[slot] = null;
        delete this.saveSchema.lastModified[slot];
        
        if (this.activeSlot === slot) {
            this.activeSlot = null;
            this.saveSchema.activeSlot = null;
        }

        this.persistSaveSchema();
        
        console.log(`[SaveService:deleteSaveSlot] Deleted save data from ${slot}`);
        EventBus.emit('save:deleted', { slot });
    }

    /**
     * Persist the save schema to localStorage
     */
    private persistSaveSchema(): void {
        if (typeof Storage === 'undefined') {
            return;
        }

        try {
            localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(this.saveSchema));
        } catch (error) {
            console.error('[SaveService:persistSaveSchema] Failed to persist save schema', error);
        }
    }

    /**
     * Get the most recent save slot
     */
    getMostRecentSlot(): SaveSlot | null {
        const slots = this.getSaveSlots().filter(s => s.data !== null);
        if (slots.length === 0) {
            return null;
        }

        slots.sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));
        return slots[0].slot;
    }

    /**
     * Clear all save data (for testing or new game+)
     */
    clearAllSaves(): void {
        this.saveSchema = this.createEmptySaveSchema();
        this.activeSlot = null;
        this.persistSaveSchema();
        
        console.log('[SaveService:clearAllSaves] All save data cleared');
        EventBus.emit('save:all-cleared');
    }
}

// Create singleton instance
export const saveService = new SaveService(dataManager);
