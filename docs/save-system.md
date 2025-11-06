# Save System Documentation

## Overview

The Critter Quest save system uses localStorage to persist game state across sessions. It supports multiple save slots, schema versioning, and automatic migration from legacy save formats.

## Architecture

### Components

1. **SaveService** (`src/game/services/SaveService.ts`)
   - Coordinates all save/load operations
   - Manages multiple save slots (Slot 1, 2, 3)
   - Handles schema versioning and migration
   - Emits EventBus notifications for UI updates

2. **DataManager** (`src/game/services/DataManager.ts`)
   - Maintains in-memory game state
   - Provides methods to export/import state snapshots
   - Used by SaveService to read/write game state

### Save Schema

#### Current Schema Version: 1

```typescript
interface SaveSchema {
    version: number;                    // Schema version for migration
    slots: {
        [slotId: string]: GlobalState | null;  // Save slot data
    };
    activeSlot: SaveSlot | null;       // Currently active slot
    lastModified: {
        [slotId: string]: number;      // Timestamp of last modification (ms)
    };
}

enum SaveSlot {
    SLOT_1 = 'slot_1',
    SLOT_2 = 'slot_2',
    SLOT_3 = 'slot_3',
}
```

#### GlobalState Structure

```typescript
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
        inParty: CritterInstance[];
    };
    inventory: LegacyInventoryItem[];
    itemsPickedUp: number[];    // Unique IDs of collected items
    viewedEvents: number[];     // IDs of completed events
    flags: GameFlag[];          // Story progression flags
    money: number;
}
```

## Storage Keys

- **Current Multi-Slot Key**: `CRITTER_QUEST_SAVE_DATA`
- **Legacy Keys** (migrated automatically):
  - `MONSTER_TAMER_DATA` (original JavaScript implementation)
  - `CRITTER_QUEST_DATA` (early TypeScript single-slot implementation)

## Save Operations

### Manual Save

Triggered by player via World Menu → Save option.

```typescript
// In Overworld scene
EventBus.on('save:requested', () => {
    saveService.saveGame(true);  // true = show notification
});
```

### Auto-Save

Triggered automatically after key events:

1. **Battle Victory**: After defeating a wild critter or trainer
2. **Item Collection**: After picking up an item from the world
3. **Game Over**: After blackout/knockout to save revive location

```typescript
// Auto-save without notification
saveService.autoSave();
```

### Load Game

```typescript
// Load most recent save (used by Continue button)
const mostRecentSlot = saveService.getMostRecentSlot();
if (mostRecentSlot) {
    saveService.loadGame(mostRecentSlot);
}

// Load specific slot
saveService.loadGame(SaveSlot.SLOT_1);
```

## Migration System

### Legacy Data Migration

When the game starts, SaveService checks for legacy save keys:

1. **Check for `MONSTER_TAMER_DATA`** (original format)
2. **Check for `CRITTER_QUEST_DATA`** (single-slot format)
3. If found, migrate to Slot 1 of the new multi-slot format
4. Remove old key after successful migration
5. Log migration status to console
6. Emit `save:migration-complete` event

```typescript
// Migration is automatic on SaveService instantiation
const saveService = new SaveService(dataManager);
// Console output: "[SaveService] ✓ Legacy save data migrated successfully to Slot 1"
```

### Schema Version Migration

When loading a save with an older schema version:

1. Detect version mismatch
2. Apply version-specific transformations
3. Update to current schema version
4. Save migrated data

Currently at v1, so no migrations exist yet. Future versions will add transformation logic here.

## EventBus Events

### Emitted by SaveService

- `save:notification` - Save completed (success or error)
  ```typescript
  { message: string; slot: SaveSlot; error?: boolean }
  ```

- `save:loaded` - Game loaded from slot
  ```typescript
  { slot: SaveSlot }
  ```

- `save:deleted` - Save slot deleted
  ```typescript
  { slot: SaveSlot }
  ```

- `save:migration-complete` - Legacy data migrated
  ```typescript
  { fromKey: string; toSlot: SaveSlot }
  ```

- `save:all-cleared` - All save slots cleared

### Listened to by SaveService

- `save:requested` - Manual save request from World Menu

## Title Screen Integration

The Title screen checks for existing save data to enable/disable the Continue button:

```typescript
this.isContinueButtonEnabled = saveService.hasAnySaveData();
```

When Continue is selected:
1. Load most recent save slot
2. Transition to Overworld with saved location

When New Game is selected:
1. Reset DataManager to initial state
2. Set Slot 1 as active slot
3. Start at default spawn location

## Best Practices

### When to Auto-Save

✅ **Do auto-save:**
- After battle victories (progress is saved)
- After item collection (prevents re-collecting)
- On game over (revive location is set)

❌ **Don't auto-save:**
- Before battles (player hasn't progressed yet)
- During cutscenes (may interrupt narrative)
- On every player movement (performance impact)

### Error Handling

All save operations return `boolean` for success/failure:

```typescript
const success = saveService.saveGame(true);
if (!success) {
    // Handle save failure (show error to player)
    EventBus.emit('hud:notification', {
        message: 'Failed to save game',
        type: 'error'
    });
}
```

### Testing

To test migration:
1. Open browser DevTools → Application → Local Storage
2. Add a test entry with key `MONSTER_TAMER_DATA`
3. Reload the game
4. Check console for migration message
5. Verify new `CRITTER_QUEST_SAVE_DATA` entry exists
6. Verify old key is removed

## Future Enhancements

### Planned Features

- **Save Slot UI**: Scene to manage multiple save slots
- **Cloud Sync**: Optional online backup (requires backend)
- **Export/Import**: Download save files for backup
- **Compression**: Reduce localStorage footprint
- **Encryption**: Prevent save editing (if desired)

### Schema Evolution

When adding new fields to GlobalState:

1. Increment `SAVE_SCHEMA_VERSION`
2. Add migration logic in `migrateSaveSchema()`
3. Provide default values for new fields
4. Test with old save data
5. Document changes in this file

Example:
```typescript
// v2 migration example
if (oldSchema.version === 1) {
    return {
        ...oldSchema,
        version: 2,
        slots: Object.fromEntries(
            Object.entries(oldSchema.slots).map(([key, state]) => [
                key,
                state ? { ...state, newField: defaultValue } : null
            ])
        ),
    };
}
```

## Troubleshooting

### Save Not Persisting

1. Check browser localStorage is enabled
2. Check localStorage quota (5-10MB limit)
3. Check for localStorage errors in console
4. Verify DataManager state is updated before save

### Migration Not Working

1. Check old save key exists in localStorage
2. Check console for migration errors
3. Verify old save format matches expected structure
4. Check localStorage isn't full (migration needs space for both)

### Continue Button Not Showing

1. Check `saveService.hasAnySaveData()` returns true
2. Check `CRITTER_QUEST_SAVE_DATA` exists in localStorage
3. Verify at least one slot has non-null data
4. Check console for SaveService initialization errors

## API Reference

### SaveService Methods

```typescript
// Check for save data
hasAnySaveData(): boolean
hasSlotData(slot: SaveSlot): boolean

// Get save information
getSaveSlots(): Array<{ slot: SaveSlot; data: GlobalState | null; lastModified: number | null }>
getActiveSlot(): SaveSlot | null
getMostRecentSlot(): SaveSlot | null

// Load/Save operations
loadGame(slot: SaveSlot): boolean
saveGame(notify: boolean = true): boolean
saveGameToSlot(slot: SaveSlot, notify: boolean = true): boolean
autoSave(): boolean

// Slot management
setActiveSlot(slot: SaveSlot): void
deleteSaveSlot(slot: SaveSlot): void
clearAllSaves(): void
```

### DataManager Extensions

```typescript
// Export current state
getCurrentState(): GlobalState

// Import state from save
loadFromState(state: GlobalState): void
```

## Performance Considerations

- **Save size**: ~5-50KB per slot (depends on party/inventory size)
- **Save time**: <10ms on modern browsers
- **Migration time**: <50ms for legacy data
- **Auto-save frequency**: Limited to key events (not every frame)

## Security Notes

- Save data is **not encrypted** (standard localStorage)
- Players **can edit** save data via DevTools
- Consider client-side validation for critical values
- For competitive features, use server-side validation

---

*Last updated: [Current Date]*
*Schema Version: 1*
