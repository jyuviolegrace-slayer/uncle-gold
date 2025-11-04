# Save Layer Implementation - Critter Quest

## Overview

The Save Layer provides comprehensive save/load functionality for Critter Quest with support for:
- **Multiple Save Slots** (3 slots by default)
- **localStorage** with **IndexedDB fallback** for maximum compatibility
- **Data Integrity Checking** via checksums
- **Versioning** for future save migration
- **Auto-save** functionality with configurable intervals
- **Export/Import** for data portability
- **Settings Management** (separate from game saves)

## Architecture

### Core Components

#### 1. SaveManager (`src/game/services/SaveManager.ts`)

Singleton service handling all save/load operations.

**Key Features:**
- Multiple save slots management
- Automatic storage fallback (localStorage → IndexedDB)
- Data compression support (ready for lz-string integration)
- Checksum verification for data integrity
- Auto-save with configurable intervals
- Export/import functionality

**Storage Strategy:**
```
localStorage/IndexedDB:
  - critterquest_save_slot_0 (slot 0)
  - critterquest_save_slot_1 (slot 1)
  - critterquest_save_slot_2 (slot 2)
  - critterquest_settings (settings)
```

#### 2. useSaveGame Hook (`src/hooks/useSaveGame.ts`)

React hook for UI integration and save/load management.

**Provides:**
- State management for slots, loading, errors
- Save/load/delete operations
- Export/import functionality
- Settings management
- Auto-save control
- Event subscription

#### 3. useSaveGameEvents Hook

Secondary hook for listening to save/load events.

**Events Emitted:**
- `game:saved` - After successful save
- `game:loaded` - After successful load
- `game:deleted` - After save deletion
- `autosave:success` - After auto-save succeeds
- `autosave:failed` - When auto-save fails
- `storage:unavailable` - When no storage available

## Save Data Structure

### ISaveData Format

```typescript
{
  version: 2,
  timestamp: 1699564800000,
  playerState: {
    name: "Ash",
    level: 15,
    badges: ["Boulder", "Cascade"],
    pokedex: ["bulbasaur", "charmander", "squirtle"],
    inventory: {
      items: [
        ["potion", 5],
        ["pokeball", 20]
      ],
      capacity: 50
    },
    party: {
      critters: [
        {
          id: "critter_xxx",
          speciesId: "pikachu",
          level: 12,
          currentHP: 35,
          maxHP: 35,
          moves: [...]
        }
      ],
      maxSize: 6
    },
    money: 1500,
    position: { x: 100, y: 200 },
    currentArea: "meadowvale",
    playtime: 120
  },
  completedArenas: ["Boulder", "Cascade"],
  defeatedTrainers: ["Brock", "Misty"],
  caughtCritters: [...],
  playedMinutes: 120
}
```

### Save Wrapper Format (Internal)

```typescript
{
  version: 2,
  timestamp: 1699564800000,
  checksum: "a3f5b8e2",
  data: ISaveData
}
```

## Usage Examples

### Basic Save/Load

```typescript
import { useSaveGame } from '@/hooks/useSaveGame';
import { ISaveData } from '@/game/models';

export function GameUI() {
  const { saveToSlot, loadFromSlot, slots, loading, error } = useSaveGame();

  const handleSave = async () => {
    const saveData: ISaveData = {
      version: 2,
      timestamp: Date.now(),
      playerState: gameState.player,
      completedArenas: gameState.badges,
      defeatedTrainers: gameState.trainers,
      caughtCritters: gameState.party,
      playedMinutes: gameState.playtime
    };

    const result = await saveToSlot(saveData, 0);
    if (result.success) {
      console.log('Saved successfully!');
    }
  };

  const handleLoad = async () => {
    const result = await loadFromSlot(0);
    if (result.success) {
      applyGameState(result.data);
    }
  };

  return (
    <div>
      {slots.map(slot => (
        <div key={slot.slot}>
          <p>{slot.playerName || 'Empty'}</p>
          <button onClick={() => handleSave()}>Save to Slot {slot.slot}</button>
          <button onClick={() => handleLoad()}>Load from Slot {slot.slot}</button>
        </div>
      ))}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

### Auto-Save Implementation

```typescript
import { useSaveGame } from '@/hooks/useSaveGame';

export function GameScene() {
  const { enableAutoSave, disableAutoSave } = useSaveGame();
  const gameState = useGameState();

  useEffect(() => {
    // Enable auto-save every 5 minutes to slot 0
    const autoSaveFunc = async () => {
      const saveData = prepareSaveData(gameState);
      return await saveToSlot(saveData, 0);
    };

    enableAutoSave(autoSaveFunc, 5); // 5 minutes

    return () => disableAutoSave();
  }, [gameState]);
}
```

### Event Monitoring

```typescript
import { useSaveGameEvents } from '@/hooks/useSaveGame';

export function SaveNotifications() {
  useSaveGameEvents(
    (slot, timestamp) => {
      console.log(`Saved to slot ${slot} at ${new Date(timestamp).toLocaleString()}`);
    },
    (slot, playerName) => {
      console.log(`Loaded ${playerName} from slot ${slot}`);
    },
    (slot) => {
      console.log(`Deleted save from slot ${slot}`);
    },
    (slot) => {
      console.log(`Auto-save successful in slot ${slot}`);
    },
    (error) => {
      console.error(`Auto-save failed: ${error}`);
    }
  );

  return null;
}
```

### Manual Slot Management

```typescript
const { 
  getSaveSlots, 
  deleteSlot, 
  exportSave, 
  importSave 
} = useSaveGame();

// Get all slots
const allSlots = await getSaveSlots();
console.log(allSlots);
// Output:
// [
//   { slot: 0, exists: true, playerName: "Ash", timestamp: 1699564800000, ... },
//   { slot: 1, exists: false },
//   { slot: 2, exists: true, playerName: "Misty", timestamp: 1699564850000, ... }
// ]

// Delete a save
await deleteSlot(0);

// Export save to JSON
const jsonData = exportSave(0);
const blob = new Blob([jsonData], { type: 'application/json' });
// Download blob...

// Import save from JSON
const fileContent = await file.text();
const imported = await importSave(fileContent, 0);
```

### Settings Management

```typescript
const { saveSettings, loadSettings } = useSaveGame();

// Save settings
const settings = {
  volume: 0.5,
  difficulty: 'normal',
  showTutorial: false,
  language: 'en'
};
saveSettings(settings);

// Load settings
const loaded = loadSettings();
console.log(loaded.volume); // 0.5
```

### Storage Status Check

```typescript
const { getStorageStatus } = useSaveGame();

const status = getStorageStatus();
console.log(status);
// Output:
// {
//   useLocalStorage: true,
//   useIndexedDB: false,
//   storageAvailable: true
// }

if (!status.storageAvailable) {
  console.error('No storage available - saves will not persist');
}
```

## Integration with GameStateManager

The GameStateManager already has basic save/load functionality. The SaveManager extends this with:

1. **Multiple Slots** - GameStateManager uses single slot, SaveManager supports 3
2. **Fallback Storage** - SaveManager tries localStorage first, falls back to IndexedDB
3. **Auto-save** - SaveManager provides auto-save capability
4. **Event Integration** - Both emit events via EventBus

### Migration Path

```typescript
// Old: GameStateManager direct save
const manager = new GameStateManager('Player');
manager.saveGame(); // Always uses single slot

// New: SaveManager with slots
const result = await saveManager.saveGameToSlot(saveData, 0);
const result = await saveManager.saveGameToSlot(saveData, 1);
const result = await saveManager.saveGameToSlot(saveData, 2);
```

## Error Handling

### Graceful Degradation

The system handles errors gracefully:

1. **localStorage Unavailable** → Falls back to IndexedDB
2. **Both Unavailable** → Emits `storage:unavailable` event
3. **Save Fails** → Emits `game:saveFailed` with error message
4. **Load Fails** → Emits `game:loadFailed` with error message
5. **Checksum Fails** → Returns error, data not loaded

### Example Error Handling

```typescript
const { loadFromSlot, error, storageAvailable } = useSaveGame();

const handleLoad = async () => {
  if (!storageAvailable) {
    alert('No storage available. Save data will not persist.');
    return;
  }

  const result = await loadFromSlot(0);
  if (!result.success) {
    alert(`Load failed: ${result.error}`);
    return;
  }

  applyGameState(result.data);
};
```

## Performance Considerations

### Compression (Future Enhancement)

Currently, data is not compressed. To add compression:

1. Install `lz-string`: `npm install lz-string`
2. Update SaveManager:

```typescript
import LZ from 'lz-string';

private compressData(data: string): string {
  return LZ.compressToBase64(data);
}

private decompressData(data: string): string {
  return LZ.decompressFromBase64(data);
}
```

### Storage Limits

- **localStorage**: ~5-10MB per origin (depends on browser)
- **IndexedDB**: Much larger (varies by browser, typically 50MB+)
- **Compression**: ~30-50% reduction typical for JSON

### Recommendations

For typical Critter Quest saves:
- Uncompressed: ~50-100KB per slot
- Compressed: ~15-30KB per slot
- Can store hundreds of saves in available storage

## Browser Compatibility

| Storage | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| localStorage | ✓ | ✓ | ✓ | ✓ |
| IndexedDB | ✓ | ✓ | ✓ | ✓ |
| Private Mode | localStorage may fail, IndexedDB available | Both may fail | localStorage available | localStorage may fail |

## Testing Checklist

- [ ] Manual save in slot 0
- [ ] Load from slot 0
- [ ] Save in multiple slots simultaneously
- [ ] Data persists across page reload
- [ ] Delete save works correctly
- [ ] Auto-save triggers at correct intervals
- [ ] Export saves as JSON
- [ ] Import saves from JSON
- [ ] Settings persist separately
- [ ] Error messages display when storage unavailable
- [ ] Checksum verification catches corrupted saves
- [ ] IndexedDB fallback works if localStorage disabled
- [ ] Works in private/incognito mode
- [ ] Mobile browser compatibility

## Future Enhancements

1. **Cloud Sync** - Optional cloud save backup
2. **Save Encryption** - Encrypt sensitive data
3. **Differential Saves** - Only save changed data
4. **Analytics** - Track save patterns
5. **Replay System** - Record and replay battles
6. **Achievement Tracking** - Track unlock events
7. **Steam Cloud** - Steam Cloud integration for releases

## API Reference

### SaveManager.getInstance()

Get singleton instance.

```typescript
const saveManager = SaveManager.getInstance();
```

### saveGameToSlot(saveData, slot)

Save game to specific slot.

```typescript
const result = await saveManager.saveGameToSlot(saveData, 0);
// { success: true, slot: 0, timestamp: 1699564800000 }
```

### loadGameFromSlot(slot)

Load game from specific slot.

```typescript
const result = await saveManager.loadGameFromSlot(0);
// { success: true, slot: 0, data: ISaveData }
```

### getSaveSlots()

Get information about all save slots.

```typescript
const slots = await saveManager.getSaveSlots();
// ISaveSlot[]
```

### deleteSlot(slot)

Delete a save slot.

```typescript
const success = await saveManager.deleteSlot(0);
```

### enableAutoSave(saveFunction, intervalMinutes)

Enable auto-save with specified interval.

```typescript
saveManager.enableAutoSave(async () => {
  return await saveManager.saveGameToSlot(saveData, 0);
}, 5);
```

### disableAutoSave()

Disable auto-save.

```typescript
saveManager.disableAutoSave();
```

### getStorageStatus()

Get current storage availability.

```typescript
const status = saveManager.getStorageStatus();
// { useLocalStorage: true, useIndexedDB: false, storageAvailable: true }
```

### saveSettings(settings)

Save game settings.

```typescript
saveManager.saveSettings({ volume: 0.5, difficulty: 'normal' });
```

### loadSettings()

Load game settings.

```typescript
const settings = saveManager.loadSettings();
```

### exportSaveAsJson(slot)

Export save as JSON string.

```typescript
const json = saveManager.exportSaveAsJson(0);
```

### importSaveFromJson(jsonData, slot)

Import save from JSON string.

```typescript
const success = await saveManager.importSaveFromJson(jsonData, 0);
```

### clearAllSaves()

Clear all save slots.

```typescript
const success = await saveManager.clearAllSaves();
```

## Notes

- Save version mismatch is logged but not fatal (allows older saves to load)
- Checksums prevent corrupted saves from loading
- Auto-save failures don't interrupt gameplay
- All storage operations are asynchronous
- EventBus integration allows global save/load event handling
