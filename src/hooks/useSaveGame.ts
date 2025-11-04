'use client';

import { useState, useCallback, useEffect } from 'react';
import { SaveManager, ISaveSlot, ISaveResult, ILoadResult } from '@/game/services/SaveManager';
import { ISaveData } from '@/game/models/types';
import { EventBus } from '@/game/EventBus';

/**
 * Hook for managing game saves
 */
export function useSaveGame() {
  const [saveManager] = useState(() => SaveManager.getInstance());
  const [slots, setSlots] = useState<ISaveSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storageAvailable, setStorageAvailable] = useState(true);

  // Initialize slots on mount
  useEffect(() => {
    refreshSlots();

    // Listen to save events
    const handleSaved = () => {
      refreshSlots();
      setError(null);
    };

    const handleSaveFailed = (data: any) => {
      setError(data.error || 'Save failed');
    };

    const handleLoadFailed = (data: any) => {
      setError(data.error || 'Load failed');
    };

    const handleStorageUnavailable = () => {
      setStorageAvailable(false);
      setError('Storage is not available');
    };

    EventBus.on('game:saved', handleSaved);
    EventBus.on('game:saveFailed', handleSaveFailed);
    EventBus.on('game:loadFailed', handleLoadFailed);
    EventBus.on('storage:unavailable', handleStorageUnavailable);

    return () => {
      EventBus.off('game:saved', handleSaved);
      EventBus.off('game:saveFailed', handleSaveFailed);
      EventBus.off('game:loadFailed', handleLoadFailed);
      EventBus.off('storage:unavailable', handleStorageUnavailable);
    };
  }, [saveManager]);

  /**
   * Refresh save slots list
   */
  const refreshSlots = useCallback(async () => {
    try {
      setLoading(true);
      const newSlots = await saveManager.getSaveSlots();
      setSlots(newSlots);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh slots';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [saveManager]);

  /**
   * Save game to a slot
   */
  const saveToSlot = useCallback(
    async (saveData: ISaveData, slot: number = 0): Promise<ISaveResult> => {
      try {
        setLoading(true);
        const result = await saveManager.saveGameToSlot(saveData, slot);
        if (result.success) {
          setError(null);
          await refreshSlots();
        } else {
          setError(result.error || 'Save failed');
        }
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Save failed';
        setError(message);
        return { success: false, slot, error: message };
      } finally {
        setLoading(false);
      }
    },
    [saveManager, refreshSlots]
  );

  /**
   * Load game from a slot
   */
  const loadFromSlot = useCallback(
    async (slot: number = 0): Promise<ILoadResult> => {
      try {
        setLoading(true);
        const result = await saveManager.loadGameFromSlot(slot);
        if (result.success) {
          setError(null);
        } else {
          setError(result.error || 'Load failed');
        }
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Load failed';
        setError(message);
        return { success: false, slot, error: message };
      } finally {
        setLoading(false);
      }
    },
    [saveManager]
  );

  /**
   * Delete a save slot
   */
  const deleteSlot = useCallback(
    async (slot: number): Promise<boolean> => {
      try {
        setLoading(true);
        const success = await saveManager.deleteSlot(slot);
        if (success) {
          setError(null);
          await refreshSlots();
        } else {
          setError('Failed to delete save');
        }
        return success;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Delete failed';
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [saveManager, refreshSlots]
  );

  /**
   * Export save as JSON
   */
  const exportSave = useCallback(
    (slot: number): string | null => {
      try {
        const jsonData = saveManager.exportSaveAsJson(slot);
        return jsonData;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Export failed';
        setError(message);
        return null;
      }
    },
    [saveManager]
  );

  /**
   * Import save from JSON
   */
  const importSave = useCallback(
    async (jsonData: string, slot: number): Promise<boolean> => {
      try {
        setLoading(true);
        const success = await saveManager.importSaveFromJson(jsonData, slot);
        if (success) {
          setError(null);
          await refreshSlots();
        } else {
          setError('Failed to import save');
        }
        return success;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Import failed';
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [saveManager, refreshSlots]
  );

  /**
   * Clear all saves
   */
  const clearAllSaves = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      const success = await saveManager.clearAllSaves();
      if (success) {
        setError(null);
        await refreshSlots();
      } else {
        setError('Failed to clear saves');
      }
      return success;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Clear failed';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [saveManager, refreshSlots]);

  /**
   * Get storage status
   */
  const getStorageStatus = useCallback(() => {
    return saveManager.getStorageStatus();
  }, [saveManager]);

  /**
   * Save settings
   */
  const saveSettings = useCallback(
    (settings: Record<string, any>): boolean => {
      try {
        const success = saveManager.saveSettings(settings);
        if (success) {
          setError(null);
        } else {
          setError('Failed to save settings');
        }
        return success;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Settings save failed';
        setError(message);
        return false;
      }
    },
    [saveManager]
  );

  /**
   * Load settings
   */
  const loadSettings = useCallback((): Record<string, any> | null => {
    try {
      return saveManager.loadSettings();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Settings load failed';
      setError(message);
      return null;
    }
  }, [saveManager]);

  /**
   * Enable auto-save
   */
  const enableAutoSave = useCallback(
    (saveFunction: () => Promise<ISaveResult>, intervalMinutes: number = 5): void => {
      try {
        saveManager.enableAutoSave(saveFunction, intervalMinutes);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Auto-save enable failed';
        setError(message);
      }
    },
    [saveManager]
  );

  /**
   * Disable auto-save
   */
  const disableAutoSave = useCallback(() => {
    try {
      saveManager.disableAutoSave();
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Auto-save disable failed';
      setError(message);
    }
  }, [saveManager]);

  /**
   * Check if auto-save is enabled
   */
  const isAutoSaveEnabled = useCallback((): boolean => {
    return saveManager.isAutoSaveEnabled();
  }, [saveManager]);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    slots,
    loading,
    error,
    storageAvailable,

    // Methods
    refreshSlots,
    saveToSlot,
    loadFromSlot,
    deleteSlot,
    exportSave,
    importSave,
    clearAllSaves,
    getStorageStatus,
    saveSettings,
    loadSettings,
    enableAutoSave,
    disableAutoSave,
    isAutoSaveEnabled,
    clearError,
  };
}

/**
 * Hook for monitoring save/load events
 */
export function useSaveGameEvents(
  onSave?: (slot: number, timestamp: number) => void,
  onLoad?: (slot: number, playerName: string) => void,
  onDelete?: (slot: number) => void,
  onAutoSaveSuccess?: (slot: number) => void,
  onAutoSaveFailed?: (error: string) => void
) {
  useEffect(() => {
    const handleSaved = (data: any) => {
      onSave?.(data.slot, data.timestamp);
    };

    const handleLoaded = (data: any) => {
      onLoad?.(data.slot, data.playerName);
    };

    const handleDeleted = (data: any) => {
      onDelete?.(data.slot);
    };

    const handleAutoSaveSuccess = (data: any) => {
      onAutoSaveSuccess?.(data.slot);
    };

    const handleAutoSaveFailed = (data: any) => {
      onAutoSaveFailed?.(data.error);
    };

    EventBus.on('game:saved', handleSaved);
    EventBus.on('game:loaded', handleLoaded);
    EventBus.on('game:deleted', handleDeleted);
    EventBus.on('autosave:success', handleAutoSaveSuccess);
    EventBus.on('autosave:failed', handleAutoSaveFailed);

    return () => {
      EventBus.off('game:saved', handleSaved);
      EventBus.off('game:loaded', handleLoaded);
      EventBus.off('game:deleted', handleDeleted);
      EventBus.off('autosave:success', handleAutoSaveSuccess);
      EventBus.off('autosave:failed', handleAutoSaveFailed);
    };
  }, [onSave, onLoad, onDelete, onAutoSaveSuccess, onAutoSaveFailed]);
}
