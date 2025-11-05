# Legacy Data Manager Migration to TypeScript Services

## Overview

This document describes the migration of the legacy `data-manager.js` to modern TypeScript services that integrate with the `SaveManager` and `GameStateManager` while maintaining backward compatibility and EventBus event emission.

## Architecture

### Three-Layer Approach

```
Legacy Game Code (Ported Scenes)
       ↓
LegacyDataManager (Adapter Layer)
       ↓
SaveManager (Persistence Layer)
```

### Services Created

1. **LegacyDataManager.ts** - Main adapter bridging legacy and modern systems
2. **LegacyDataUtils.ts** - Utility functions for accessing cached game data
3. **SaveManagerAdapters.ts** - Type conversion functions between legacy and modern structures

## Service Descriptions

### LegacyDataManager

A singleton class that provides the legacy DataManager API while delegating persistence to SaveManager.

**Key Features:**
- In-memory state management for performance
- EventBus integration for option changes
- Backward-compatible API with legacy data-manager.js
- Automatic conversion between legacy and modern formats

**Usage:**

```typescript
import { LegacyDataManager } from '@/game/services';

const dataManager = new LegacyDataManager();

// Load save data
await dataManager.loadData(slotNumber);

// Save game
await dataManager.saveData(slotNumber);

// Start new game (preserves options)
await dataManager.startNewGame();

// Manage player position/location
dataManager.setPlayerPosition(x, y);
dataManager.setPlayerLocation('forest', false);

// Manage party
dataManager.addCritterToParty(critter);
dataManager.isPartyFull();

// Manage inventory
dataManager.addItem(itemId, quantity);
dataManager.removeItem(itemId, quantity);

// Manage options (emits EventBus events)
dataManager.setTextSpeed('FAST');
dataManager.setBattleStyle('SWITCH');
dataManager.setVolume(8);

// Manage game state
dataManager.addFlag('defeated_gym_leader_1');
dataManager.viewedEvent(10);
```

### LegacyDataUtils

Static utility class for accessing game data from Phaser scene cache.

**Key Methods:**
- `getMonsterAttack()` - Retrieve attack by ID
- `getItem()` - Retrieve item by ID
- `getMonsterById()` - Retrieve monster species
- `getEncounterAreaDetails()` - Get wild encounters for an area
- `getNpcData()` - Get NPC dialogue and data
- `getEventData()` - Get event details
- `getSignData()` - Get sign text

**Usage:**

```typescript
import { LegacyDataUtils } from '@/game/services';

const attack = LegacyDataUtils.getMonsterAttack(scene, attackId);
const item = LegacyDataUtils.getItem(scene, itemId);
const monster = LegacyDataUtils.getMonsterById(scene, monsterId);
const encounters = LegacyDataUtils.getEncounterAreaDetails(scene, areaId);
```

### SaveManagerAdapters

Collection of conversion functions for bidirectional transformation between legacy and modern formats.

**Key Functions:**

```typescript
// Inventory conversion
convertLegacyInventoryToModern(legacy) → Map<string, number>
convertModernInventoryToLegacy(modern) → ILegacyInventoryItem[]

// Critter conversion
convertLegacyCrittersToModern(legacy) → ICritter[]
convertModernCrittersToLegacy(modern) → any[]

// Full state conversion
convertLegacyStateToSaveData(legacy) → ISaveData
convertSaveDataToLegacyState(modern) → IGlobalState

// Validation
validateLegacyState(state) → boolean
validateSaveData(data) → boolean

// Compatibility wrapper
new DataCompatibilityWrapper(saveData)
  .getModern() → ISaveData
  .getLegacy() → IGlobalState
```

## EventBus Events

When options or state changes through LegacyDataManager, the following events are emitted:

### Option Events
- `option:textSpeedChanged` - { speed: TextSpeedOption, animationMs: number }
- `option:battleAnimationsChanged` - { enabled: BattleSceneOption }
- `option:battleStyleChanged` - { style: BattleStyleOption }
- `option:soundChanged` - { enabled: SoundOption }
- `option:volumeChanged` - { volume: number }
- `option:menuColorChanged` - { color: number }

### State Events
- `inventory:updated` - { items: ILegacyInventoryItem[] }
- `inventory:itemAdded` - { itemId: number, quantity: number }
- `inventory:itemRemoved` - { itemId: number, quantity: number }
- `party:updated` - { critters: any[] }
- `party:full` - (when adding to full party)
- `item:pickedUp` - { itemId: number }
- `event:viewed` - { eventId: number }
- `flag:added` - { flag: string }
- `flag:removed` - { flag: string }

### Persistence Events
- `data:saved` - { slot: number }
- `data:saveFailed` - { error: string }

## Data Structure Mapping

### Legacy GlobalState → Modern ISaveData

```
Legacy Structure:
{
  player: {
    position: { x, y },
    direction: string,
    location: { area, isInterior }
  },
  options: {
    textSpeed, battleSceneAnimations, battleStyle, sound, volume, menuColor
  },
  gameStarted: boolean,
  monsters: { inParty: [] },
  inventory: [{ item: { id }, quantity }],
  itemsPickedUp: [],
  viewedEvents: [],
  flags: []
}

Modern Structure:
{
  playerState: {
    name, level, badges, pokedex,
    inventory: { items: Map<id, quantity>, capacity },
    party: { critters, maxSize },
    money, position, currentArea, playtime
  },
  completedArenas, defeatedTrainers, caughtCritters, playedMinutes
}
```

## Integration Points

### With SaveManager
- LegacyDataManager uses SaveManager.getInstance() for all persistence
- Supports multiple save slots (0-2)
- Automatic versioning and integrity checking
- Fallback to IndexedDB if localStorage unavailable

### With GameStateManager
- Compatible with existing player state API
- Party management matches ICritter interface
- Inventory uses same Map-based format
- Can be used interchangeably during transition

### With EventBus
- All option changes emit events
- React UI components can subscribe to changes
- Real-time UI updates via EventBus.on()

## Persistence Flow

```
1. Game Scene → LegacyDataManager.setOption()
2. LegacyDataManager → EventBus.emit('option:*Changed')
3. React UI receives event and updates
4. Game Scene → LegacyDataManager.saveData()
5. LegacyDataManager → SaveManager.saveGameToSlot()
6. SaveManager → localStorage (or IndexedDB)
```

## Migration Path for Ported Scenes

When porting legacy scenes that used `dataManager`:

### Before (Legacy)
```typescript
import { dataManager } from '@/legacy/src/utils/data-manager';

class MyScene {
  create() {
    dataManager.loadData();
    const textSpeed = dataManager.getAnimatedTextSpeed();
  }
}
```

### After (Modern)
```typescript
import { LegacyDataManager } from '@/game/services';

class MyScene {
  private dataManager: LegacyDataManager;

  create() {
    this.dataManager = new LegacyDataManager();
    this.dataManager.loadData(0);
    const textSpeed = this.dataManager.getAnimatedTextSpeed();
  }
}
```

## Type Safety

All services are fully typed with TypeScript:

```typescript
// Legacy types
export type TextSpeedOption = 'FAST' | 'MID' | 'SLOW';
export interface IGlobalState { ... }
export interface ILegacyOptions { ... }

// Modern types (existing)
export interface ISaveData { ... }
export interface IPlayerState { ... }
export interface ICritter { ... }
```

## Testing

Unit tests are provided for both services:

- **LegacyDataManager.test.ts** - 50+ tests covering:
  - Initialization and defaults
  - Player position/location management
  - Options handling
  - Inventory management
  - Party management
  - Flags and events
  - State persistence
  - Round-trip conversions

- **SaveManagerAdapters.test.ts** - 40+ tests covering:
  - Inventory conversion
  - Critter conversion
  - State conversion and round-trips
  - Validation functions
  - DataCompatibilityWrapper

## Performance Considerations

1. **In-Memory State** - LegacyDataManager keeps state in memory for fast access
2. **Lazy Persistence** - Data only saved when explicitly calling saveData()
3. **Efficient Conversion** - Adapters use Map for O(1) lookups
4. **EventBus Efficiency** - Events only emitted on actual changes

## Backward Compatibility

LegacyDataManager provides 100% backward compatibility with legacy data-manager.js:

- Same method names and signatures
- Same return types (or compatible)
- Same option constants and defaults
- Same localStorage format (when using SaveManager)

## Future Deprecation

Once all legacy code is ported to modern services:

1. Remove imports of LegacyDataManager from active scenes
2. Use GameStateManager directly for new features
3. Deprecate LegacyDataManager (keep for reference)
4. Remove LegacyDataUtils (merge needed functions into databases)

## Common Issues and Solutions

### Issue: Options not persisting
**Solution**: Make sure to call `saveData()` after changing options, or enable auto-save on SaveManager

### Issue: Party/Inventory not syncing
**Solution**: Use the DataCompatibilityWrapper when working with both formats, or ensure one-way conversion flow

### Issue: Events not received in React UI
**Solution**: Subscribe with `EventBus.on('option:*Changed', handler)` in component useEffect

### Issue: Type mismatches with legacy code
**Solution**: Use adapter functions to convert, don't cast with `as any`

## API Reference

### LegacyDataManager Methods

```typescript
// Lifecycle
loadData(slot?: number): Promise<boolean>
saveData(slot?: number): Promise<boolean>
startNewGame(): Promise<void>
clearAllData(): Promise<boolean>

// Player State
getPlayerPosition(): ILegacyPlayerPosition
setPlayerPosition(x: number, y: number): void
getPlayerDirection(): string
setPlayerDirection(direction: string): void
getPlayerLocation(): ILegacyPlayerLocation
setPlayerLocation(area: string, isInterior: boolean): void

// Options
getOptions(): ILegacyOptions
setTextSpeed(speed: TextSpeedOption): void
setBattleAnimations(enabled: BattleSceneOption): void
setBattleStyle(style: BattleStyleOption): void
setSound(enabled: SoundOption): void
setVolume(volume: number): void
setMenuColor(color: number): void
getAnimatedTextSpeed(): number

// Inventory
getInventory(): ILegacyInventoryItem[]
updateInventory(items: ILegacyInventoryItem[]): void
addItem(itemId: number, quantity: number): void
removeItem(itemId: number, quantity: number): boolean
addItemPickedUp(itemId: number): void

// Party
getParty(): any[]
updateParty(critters: any[]): void
addCritterToParty(critter: any): boolean
isPartyFull(): boolean

// Game State
viewedEvent(eventId: number): void
getFlags(): Set<string>
addFlag(flag: string): void
removeFlag(flag: string): void
getState(): IGlobalState
```

## References

- SaveManager.ts - Persistence layer
- GameStateManager.ts - Modern state management
- EventBus.ts - Event system
- types.ts - TypeScript interfaces

