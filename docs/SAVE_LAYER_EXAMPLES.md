# Save Layer - UI Integration Examples

This document provides practical examples of integrating the Save Layer into Critter Quest UI components.

## Example 1: Save/Load Menu Component

```typescript
'use client';

import React, { useState } from 'react';
import { useSaveGame } from '@/hooks/useSaveGame';
import { ISaveData } from '@/game/models';

interface SaveMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onGameStateLoad: (data: ISaveData) => void;
  getCurrentSaveData: () => ISaveData;
}

export function SaveMenu({ 
  isOpen, 
  onClose, 
  onGameStateLoad, 
  getCurrentSaveData 
}: SaveMenuProps) {
  const {
    slots,
    loading,
    error,
    storageAvailable,
    saveToSlot,
    loadFromSlot,
    deleteSlot,
    clearError
  } = useSaveGame();

  const [selectedSlot, setSelectedSlot] = useState(0);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!storageAvailable) {
      alert('Storage not available. Save data will not persist.');
      return;
    }

    const saveData = getCurrentSaveData();
    const result = await saveToSlot(saveData, selectedSlot);
    
    if (result.success) {
      alert(`Game saved to slot ${selectedSlot + 1}`);
    }
  };

  const handleLoad = async () => {
    const result = await loadFromSlot(selectedSlot);
    
    if (result.success && result.data) {
      onGameStateLoad(result.data);
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this save permanently?')) return;
    await deleteSlot(selectedSlot);
  };

  const currentSlot = slots[selectedSlot];

  return (
    <div style={styles.modal}>
      <div style={styles.container}>
        <h2>Save/Load Game</h2>

        {/* Slot Selection */}
        <div style={styles.slotButtons}>
          {slots.map((slot) => (
            <button
              key={slot.slot}
              onClick={() => setSelectedSlot(slot.slot)}
              style={{
                ...styles.slotButton,
                backgroundColor: selectedSlot === slot.slot ? '#4CAF50' : '#2196F3'
              }}
            >
              Slot {slot.slot + 1}
              {slot.exists && (
                <div style={styles.slotInfo}>
                  {slot.playerName}
                  <br />
                  {slot.playtime}m playtime
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Current Slot Details */}
        {currentSlot?.exists && (
          <div style={styles.details}>
            <p><strong>Player:</strong> {currentSlot.playerName}</p>
            <p><strong>Level:</strong> {currentSlot.level}</p>
            <p><strong>Badges:</strong> {currentSlot.badges}</p>
            <p><strong>Party Size:</strong> {currentSlot.partySize}/6</p>
            <p><strong>Playtime:</strong> {currentSlot.playtime} minutes</p>
            <p><strong>Last Saved:</strong> {new Date(currentSlot.timestamp!).toLocaleString()}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div style={styles.buttons}>
          <button 
            onClick={handleSave}
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button 
            onClick={handleLoad}
            disabled={loading || !currentSlot?.exists}
            style={styles.button}
          >
            {loading ? 'Loading...' : 'Load'}
          </button>
          <button 
            onClick={handleDelete}
            disabled={loading || !currentSlot?.exists}
            style={{ ...styles.button, backgroundColor: '#f44336' }}
          >
            Delete
          </button>
          <button 
            onClick={onClose}
            disabled={loading}
            style={styles.button}
          >
            Close
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div style={styles.error}>
            <p>{error}</p>
            <button onClick={clearError}>Dismiss</button>
          </div>
        )}

        {/* Storage Status */}
        {!storageAvailable && (
          <div style={styles.warning}>
            ⚠️ Storage is not available. Saves will not persist.
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  modal: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  container: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto'
  },
  slotButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    marginBottom: '20px'
  },
  slotButton: {
    padding: '10px',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px'
  },
  slotInfo: {
    fontSize: '12px',
    marginTop: '5px'
  },
  details: {
    backgroundColor: '#f5f5f5',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '15px'
  },
  buttons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px',
    marginBottom: '15px'
  },
  button: {
    padding: '10px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#2196F3',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px'
  },
  error: {
    backgroundColor: '#ffebee',
    border: '1px solid #ef5350',
    color: '#c62828',
    padding: '10px',
    borderRadius: '4px',
    marginTop: '10px'
  },
  warning: {
    backgroundColor: '#fff3e0',
    border: '1px solid #ffb74d',
    color: '#e65100',
    padding: '10px',
    borderRadius: '4px',
    marginTop: '10px'
  }
};
```

## Example 2: Auto-Save Integration

```typescript
'use client';

import React, { useEffect } from 'react';
import { useSaveGame } from '@/hooks/useSaveGame';
import { ISaveData } from '@/game/models';

interface AutoSaveIndicatorProps {
  gameState: ISaveData;
  enabled?: boolean;
  intervalMinutes?: number;
  onAutoSave?: (success: boolean, error?: string) => void;
}

export function AutoSaveIndicator({
  gameState,
  enabled = true,
  intervalMinutes = 5,
  onAutoSave
}: AutoSaveIndicatorProps) {
  const {
    enableAutoSave,
    disableAutoSave,
    isAutoSaveEnabled,
    saveToSlot
  } = useSaveGame();

  const [lastAutoSaveTime, setLastAutoSaveTime] = React.useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = React.useState(false);

  useEffect(() => {
    if (enabled && gameState) {
      const autoSaveFunc = async () => {
        setIsAutoSaving(true);
        try {
          const result = await saveToSlot(gameState, 0);
          setLastAutoSaveTime(new Date());
          onAutoSave?.(result.success, result.error);
        } finally {
          setIsAutoSaving(false);
        }
      };

      enableAutoSave(autoSaveFunc, intervalMinutes);

      return () => disableAutoSave();
    } else {
      disableAutoSave();
    }
  }, [enabled, gameState, intervalMinutes, enableAutoSave, disableAutoSave, saveToSlot, onAutoSave]);

  if (!enabled) return null;

  return (
    <div style={styles.indicator}>
      <span style={{ fontSize: '12px', color: '#666' }}>
        {isAutoSaving ? '💾 Auto-saving...' : '✓ Auto-save enabled'}
      </span>
      {lastAutoSaveTime && (
        <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
          Last save: {lastAutoSaveTime.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}

const styles = {
  indicator: {
    padding: '8px 12px',
    backgroundColor: '#e8f5e9',
    border: '1px solid #4caf50',
    borderRadius: '4px',
    fontSize: '12px'
  }
};
```

## Example 3: Save Slot Browser Component

```typescript
'use client';

import React from 'react';
import { useSaveGame, useSaveGameEvents } from '@/hooks/useSaveGame';

export function SaveSlotBrowser() {
  const { slots, loading, error, exportSave, importSave, deleteSlot } = useSaveGame();
  const [selectedSlot, setSelectedSlot] = React.useState(0);

  useSaveGameEvents(
    (slot, timestamp) => console.log(`Save slot ${slot} at ${new Date(timestamp).toLocaleTimeString()}`),
    (slot, playerName) => console.log(`Loaded ${playerName}`),
    (slot) => console.log(`Deleted slot ${slot}`)
  );

  const handleExport = async (slot: number) => {
    const jsonData = exportSave(slot);
    if (!jsonData) {
      alert('Failed to export save');
      return;
    }

    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `critterquest-slot${slot}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (slot: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const content = await file.text();
        const success = await importSave(content, slot);
        if (success) {
          alert('Save imported successfully');
        } else {
          alert('Failed to import save');
        }
      } catch (err) {
        alert('Error reading file');
      }
    };

    input.click();
  };

  return (
    <div style={styles.container}>
      <h3>Save Slot Browser</h3>
      
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Slot</th>
            <th>Player</th>
            <th>Level</th>
            <th>Badges</th>
            <th>Party</th>
            <th>Time</th>
            <th>Last Saved</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {slots.map((slot) => (
            <tr key={slot.slot} style={selectedSlot === slot.slot ? styles.selectedRow : {}}>
              <td>{slot.slot + 1}</td>
              <td>{slot.exists ? slot.playerName : '—'}</td>
              <td>{slot.exists ? slot.level : '—'}</td>
              <td>{slot.exists ? slot.badges : '—'}</td>
              <td>{slot.exists ? `${slot.partySize}/6` : '—'}</td>
              <td>{slot.exists ? `${slot.playtime}m` : '—'}</td>
              <td>
                {slot.exists && (
                  new Date(slot.timestamp!).toLocaleDateString() + ' ' +
                  new Date(slot.timestamp!).toLocaleTimeString()
                )}
              </td>
              <td>
                {slot.exists && (
                  <div style={styles.actions}>
                    <button onClick={() => handleExport(slot.slot)} style={styles.actionButton}>
                      📥
                    </button>
                    <button onClick={() => handleImport(slot.slot)} style={styles.actionButton}>
                      📤
                    </button>
                    <button 
                      onClick={() => deleteSlot(slot.slot)} 
                      style={{ ...styles.actionButton, backgroundColor: '#f44336' }}
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {error && <div style={styles.error}>{error}</div>}
      {loading && <div style={styles.loading}>Loading...</div>}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'monospace'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginTop: '10px'
  },
  selectedRow: {
    backgroundColor: '#e3f2fd'
  },
  actions: {
    display: 'flex',
    gap: '5px'
  },
  actionButton: {
    padding: '4px 8px',
    border: 'none',
    borderRadius: '3px',
    backgroundColor: '#2196F3',
    color: 'white',
    cursor: 'pointer',
    fontSize: '12px'
  },
  error: {
    color: '#d32f2f',
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#ffebee',
    borderRadius: '4px'
  },
  loading: {
    color: '#1976d2',
    marginTop: '10px'
  }
};
```

## Example 4: Game Integration with Main Game Loop

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { useSaveGame } from '@/hooks/useSaveGame';
import { GameStateManager, ISaveData, Critter } from '@/game/models';
import { EventBus } from '@/game/EventBus';

export function GameContainer() {
  const { saveToSlot, loadFromSlot, enableAutoSave, disableAutoSave } = useSaveGame();
  const [gameState, setGameState] = useState<GameStateManager | null>(null);
  const [saveData, setSaveData] = useState<ISaveData | null>(null);
  const [isSaveMenuOpen, setIsSaveMenuOpen] = useState(false);

  // Initialize game
  useEffect(() => {
    const initGame = async () => {
      // Try to load existing save
      const result = await loadFromSlot(0);
      
      const state = new GameStateManager('Player');
      
      if (result.success && result.data) {
        // Load from save
        // TODO: Apply loaded data to gameState
        console.log('Loaded save:', result.data);
      } else {
        // New game
        const starter = new Critter('embolt', 5);
        state.addCritterToParty(starter);
      }

      setGameState(state);
    };

    initGame();
  }, [loadFromSlot]);

  // Prepare save data from game state
  const prepareSaveData = (): ISaveData | null => {
    if (!gameState) return null;

    const playerState = gameState.getPlayerState();
    return {
      version: 2,
      timestamp: Date.now(),
      playerState,
      completedArenas: playerState.badges,
      defeatedTrainers: [],
      caughtCritters: playerState.party.critters,
      playedMinutes: playerState.playtime
    };
  };

  // Enable auto-save when game state is ready
  useEffect(() => {
    if (gameState) {
      enableAutoSave(async () => {
        const data = prepareSaveData();
        if (data) {
          return await saveToSlot(data, 0);
        }
        return { success: false, slot: 0, error: 'No game state' };
      }, 5); // 5 minute intervals

      return () => disableAutoSave();
    }
  }, [gameState, enableAutoSave, disableAutoSave, saveToSlot]);

  // Listen to battle victories for auto-save
  useEffect(() => {
    const handleBattleVictory = () => {
      // Trigger immediate save on victory
      const data = prepareSaveData();
      if (data) {
        saveToSlot(data, 0);
      }
    };

    const handleItemUsed = () => {
      // Auto-save on important events
      const data = prepareSaveData();
      if (data) {
        saveToSlot(data, 0);
      }
    };

    EventBus.on('battle:victory', handleBattleVictory);
    EventBus.on('item:used', handleItemUsed);

    return () => {
      EventBus.off('battle:victory', handleBattleVictory);
      EventBus.off('item:used', handleItemUsed);
    };
  }, [saveToSlot]);

  // Manual save
  const handleManualSave = async () => {
    const data = prepareSaveData();
    if (data) {
      const result = await saveToSlot(data, 0);
      if (result.success) {
        alert('Game saved successfully!');
      }
    }
  };

  if (!gameState) {
    return <div>Initializing game...</div>;
  }

  return (
    <div>
      {/* Game UI here */}
      <div style={{ position: 'fixed', bottom: '10px', right: '10px' }}>
        <button onClick={handleManualSave} style={{ marginRight: '5px' }}>
          💾 Save
        </button>
        <button onClick={() => setIsSaveMenuOpen(true)}>
          📂 Menu
        </button>
      </div>

      {/* Save menu component here */}
      {isSaveMenuOpen && (
        <SaveMenu
          isOpen={isSaveMenuOpen}
          onClose={() => setIsSaveMenuOpen(false)}
          onGameStateLoad={(data) => {
            // Apply loaded data to game
            setSaveData(data);
          }}
          getCurrentSaveData={prepareSaveData}
        />
      )}
    </div>
  );
}

// Mock SaveMenu component for this example
function SaveMenu(props: any) {
  return <div>Save Menu</div>;
}
```

## Example 5: Settings Persistence Component

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { useSaveGame } from '@/hooks/useSaveGame';

interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  difficulty: 'easy' | 'normal' | 'hard';
  animationsEnabled: boolean;
  subtitlesEnabled: boolean;
  language: 'en' | 'es' | 'fr' | 'de';
}

const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.8,
  musicVolume: 0.7,
  sfxVolume: 0.8,
  difficulty: 'normal',
  animationsEnabled: true,
  subtitlesEnabled: false,
  language: 'en'
};

export function SettingsPanel() {
  const { saveSettings, loadSettings } = useSaveGame();
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);

  // Load settings on mount
  useEffect(() => {
    const loaded = loadSettings();
    if (loaded) {
      setSettings({ ...DEFAULT_SETTINGS, ...loaded });
    }
  }, [loadSettings]);

  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveSettings(updated);
  };

  return (
    <div style={styles.panel}>
      <h2>Settings</h2>

      {/* Audio */}
      <div style={styles.section}>
        <h3>Audio</h3>
        <label>
          Master Volume: {Math.round(settings.masterVolume * 100)}%
          <input
            type="range"
            min="0"
            max="100"
            value={settings.masterVolume * 100}
            onChange={(e) => updateSetting('masterVolume', parseInt(e.target.value) / 100)}
            style={styles.slider}
          />
        </label>
        <label>
          Music Volume: {Math.round(settings.musicVolume * 100)}%
          <input
            type="range"
            min="0"
            max="100"
            value={settings.musicVolume * 100}
            onChange={(e) => updateSetting('musicVolume', parseInt(e.target.value) / 100)}
            style={styles.slider}
          />
        </label>
        <label>
          SFX Volume: {Math.round(settings.sfxVolume * 100)}%
          <input
            type="range"
            min="0"
            max="100"
            value={settings.sfxVolume * 100}
            onChange={(e) => updateSetting('sfxVolume', parseInt(e.target.value) / 100)}
            style={styles.slider}
          />
        </label>
      </div>

      {/* Gameplay */}
      <div style={styles.section}>
        <h3>Gameplay</h3>
        <label>
          Difficulty:
          <select
            value={settings.difficulty}
            onChange={(e) => updateSetting('difficulty', e.target.value as any)}
            style={styles.select}
          >
            <option value="easy">Easy</option>
            <option value="normal">Normal</option>
            <option value="hard">Hard</option>
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={settings.animationsEnabled}
            onChange={(e) => updateSetting('animationsEnabled', e.target.checked)}
          />
          Animations
        </label>
        <label>
          <input
            type="checkbox"
            checked={settings.subtitlesEnabled}
            onChange={(e) => updateSetting('subtitlesEnabled', e.target.checked)}
          />
          Subtitles
        </label>
      </div>

      {/* Localization */}
      <div style={styles.section}>
        <h3>Localization</h3>
        <label>
          Language:
          <select
            value={settings.language}
            onChange={(e) => updateSetting('language', e.target.value as any)}
            style={styles.select}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </label>
      </div>
    </div>
  );
}

const styles = {
  panel: {
    padding: '20px',
    maxWidth: '600px'
  },
  section: {
    marginBottom: '20px',
    paddingBottom: '20px',
    borderBottom: '1px solid #ddd'
  },
  slider: {
    marginLeft: '10px'
  },
  select: {
    marginLeft: '10px',
    padding: '4px'
  }
};
```

## Integration Checklist

- [ ] Create save/load UI component
- [ ] Connect to main game scene
- [ ] Test manual save in all 3 slots
- [ ] Test manual load from all slots
- [ ] Verify data persists after page reload
- [ ] Test auto-save at correct intervals
- [ ] Test export/import functionality
- [ ] Test settings persistence
- [ ] Test storage fallback (disable localStorage in DevTools)
- [ ] Test error handling for storage failures
- [ ] Test on mobile browsers
- [ ] Test in private/incognito mode
- [ ] Test on different browsers (Chrome, Firefox, Safari, Edge)
- [ ] Verify no console errors
- [ ] Performance test with large party/inventory
