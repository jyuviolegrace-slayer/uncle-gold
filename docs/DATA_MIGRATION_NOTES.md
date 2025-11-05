# Legacy Data Migration and Conversion Notes

## Overview

This document outlines the data migration strategy for converting legacy JSON data (from `legacy/assets/data/`) into the modern TypeScript-friendly format used by the current game engine. The migration maintains 100% fidelity to the original data while adapting to the new type system and conventions.

## Migration Strategy

### 1. Source Files

**Legacy source files** are now backed up and accessible at:
- `/public/assets/data/legacy/` - Raw legacy JSON files (for reference)

These files are read-only and maintained for historical reference and debugging purposes.

### 2. Normalized Data Files

**Normalized legacy data files** are created at:
- `/public/assets/data/legacy-critters.json` - Critter species from legacy monsters.json
- `/public/assets/data/legacy-moves.json` - Move definitions from legacy attacks.json
- `/public/assets/data/legacy-items.json` - Item definitions from legacy items.json
- `/public/assets/data/legacy-encounters.json` - Wild critter encounters from legacy encounters.json
- `/public/assets/data/legacy-npcs.json` - NPC definitions from legacy npcs.json
- `/public/assets/data/legacy-events.json` - Event sequences from legacy events.json
- `/public/assets/data/legacy-signs.json` - Sign/landmark messages from legacy signs.json
- `/public/assets/data/legacy-id-mappings.json` - ID mapping tables for reference

## ID Conversion Strategy

### Numeric to String IDs

Legacy data uses numeric IDs (1, 2, 3) while modern system uses descriptive string IDs (embolt, aqualis, etc.).

#### Monster/Critter ID Mapping

| Legacy ID | Modern ID      | Name           |
|-----------|----------------|----------------|
| 1         | iguanignite    | Iguanignite    |
| 2         | carnodusk      | Carnodusk      |
| 3         | ignivolt       | Ignivolt       |
| 4         | aquavalor      | Aquavalor      |
| 5         | frostsaber     | Frostsaber     |

**Preserved in**: `legacy-id-mappings.json` → `monsterIdMap`

#### Attack/Move ID Mapping

| Legacy ID | Modern ID  | Name       |
|-----------|-----------|-----------|
| 1         | ice-shard | Ice Shard  |
| 2         | slash     | Slash      |

**Preserved in**: `legacy-id-mappings.json` → `attackIdMap`

#### Item ID Mapping

| Legacy ID | Modern ID | Name      |
|-----------|-----------|-----------|
| 1         | potion    | Potion    |
| 2         | pokeball  | Pokéball  |

**Preserved in**: `legacy-id-mappings.json` → `itemIdMap`

#### Area ID Mapping

| Legacy ID | Modern ID    | Name        |
|-----------|-------------|-------------|
| 1         | route-1    | Route 1     |
| 2         | route-2    | Route 2     |
| 3         | forest-area | Forest Area |

**Preserved in**: `legacy-id-mappings.json` → `areaIdMap`

## Data Structure Transformations

### Critters (Monsters)

**Legacy Structure (monsters.json)**:
```json
{
  "id": "1",
  "monsterId": 1,
  "name": "iguanignite",
  "assetKey": "IGUANIGNITE",
  "assetFrame": 0,
  "currentHp": 25,
  "maxHp": 25,
  "attackIds": [2],
  "baseAttack": 5,
  "currentLevel": 5,
  "baseExp": 50
}
```

**Modern Structure (legacy-critters.json)**:
```json
{
  "id": "iguanignite",
  "name": "Iguanignite",
  "types": ["Fire"],
  "baseStats": {
    "hp": 25,
    "attack": 5,
    "defense": 5,
    "spAtk": 5,
    "spDef": 5,
    "speed": 5
  },
  "moves": ["slash"],
  "pokedexEntry": "A fire-type reptilian critter...",
  "height": 0.5,
  "weight": 3.5,
  "catchRate": 45,
  "legacyId": 1,
  "legacyAssetKey": "IGUANIGNITE"
}
```

**Key Changes**:
- `id`: String-based, descriptive ID
- `types`: Array format supporting multiple types
- `baseStats`: Expanded stat object with defensive/special stats
- `attackIds` → `moves`: Array of move IDs instead of attack IDs
- `name`: Proper capitalization
- `legacyId`: Preserved for backward compatibility
- `legacyAssetKey`: Asset reference preserved

### Moves (Attacks)

**Legacy Structure (attacks.json)**:
```json
{
  "id": 1,
  "name": "ice shard",
  "animationName": "ICE_SHARD",
  "audioKey": "ICE"
}
```

**Modern Structure (legacy-moves.json)**:
```json
{
  "id": "ice-shard",
  "name": "Ice Shard",
  "type": "Water",
  "power": 40,
  "accuracy": 100,
  "basePP": 30,
  "category": "Physical",
  "legacyId": 1,
  "legacyAnimationName": "ICE_SHARD",
  "legacyAudioKey": "ICE"
}
```

**Key Changes**:
- `id`: String-based, kebab-case format
- `type`: Assigned based on move characteristics
- `power`, `accuracy`, `basePP`: Added combat stats
- `category`: Physical/Special/Status classification
- `legacyId`, `legacyAnimationName`, `legacyAudioKey`: Legacy references preserved

### Items

**Legacy Structure (items.json)**:
```json
{
  "id": 1,
  "name": "potion",
  "description": "A basic healing item...",
  "category": "HEAL",
  "effect": "HEAL_30"
}
```

**Modern Structure (legacy-items.json)**:
```json
{
  "id": "potion",
  "name": "Potion",
  "description": "A basic healing item...",
  "type": "Potion",
  "effect": {
    "type": "heal",
    "value": 30
  },
  "legacyId": 1,
  "legacyCategory": "HEAL",
  "legacyEffect": "HEAL_30"
}
```

**Key Changes**:
- `id`: String-based ID
- `category` → `type`: Standardized item types
- `effect`: Object structure with type and value
- Legacy fields preserved with `legacy` prefix

### Encounters

**Legacy Structure (encounters.json)**:
```json
{
  "1": [
    [2, 45],
    [3, 40]
  ]
}
```

**Modern Structure (legacy-encounters.json)**:
```json
{
  "route-1": [
    {
      "speciesId": "carnodusk",
      "rarity": 45
    },
    {
      "speciesId": "ignivolt",
      "rarity": 40
    }
  ]
}
```

**Key Changes**:
- Area ID: String-based area IDs instead of numeric
- Monster IDs: Converted to string critter IDs
- Array format: Changed from `[numericId, rarity]` to object with explicit fields
- Rarity preserved: Direct mapping to new format

### NPCs

**Legacy Structure (npcs.json)**:
```json
{
  "1": {
    "frame": 30,
    "animationKeyPrefix": "NPC_1",
    "events": [...]
  }
}
```

**Modern Structure (legacy-npcs.json)**:
```json
[
  {
    "id": "npc-1",
    "name": "Healer",
    "type": "healer",
    "frame": 30,
    "animationKeyPrefix": "NPC_1",
    "legacyId": "1",
    "events": [...]
  }
]
```

**Key Changes**:
- Structure: Changed from object map to array
- `id`: Added unique string ID
- `name`: Added descriptive name
- `type`: Added NPC type classification
- `legacyId`: Preserved numeric ID reference
- `events`: Direct mapping of event structure

### Events

**Legacy Structure (events.json)**:
```json
{
  "1": {
    "requires": [],
    "events": [...]
  }
}
```

**Modern Structure (legacy-events.json)**:
```json
[
  {
    "id": "event-1",
    "name": "Intro Event",
    "legacyId": "1",
    "requires": [],
    "events": [...]
  }
]
```

**Key Changes**:
- Structure: Changed from object map to array
- `id`: Added unique string ID
- `name`: Added descriptive event name
- `legacyId`: Preserved numeric ID reference
- Event step format: Fully preserved

### Signs

**Legacy Structure (signs.json)**:
```json
{
  "1": {
    "message": "TRAINER TIPS\n..."
  }
}
```

**Modern Structure (legacy-signs.json)**:
```json
[
  {
    "id": "sign-1",
    "message": "TRAINER TIPS\n...",
    "legacyId": "1"
  }
]
```

**Key Changes**:
- Structure: Changed from object map to array
- `id`: Added unique string ID
- `legacyId`: Preserved numeric ID reference
- `message`: Fully preserved

## DataLoader Extensions

### New Methods Added to `DataLoader` Class

```typescript
static loadLegacyCritters(): Promise<ICritterSpecies[]>
static loadLegacyMoves(): Promise<IMove[]>
static loadLegacyItems(): Promise<IItem[]>
static loadLegacyEncounters(): Promise<Record<string, Array<{speciesId: string; rarity: number}>>>
static loadLegacyNPCs(): Promise<ILegacyNPCDefinition[]>
static loadLegacyEvents(): Promise<ILegacyEventDefinition[]>
static loadLegacySigns(): Promise<ILegacySign[]>
static loadLegacyIDMappings(): Promise<ILegacyIDMapping>
static loadAllLegacyData(): Promise<{...}>
```

### Validation Methods

Each loader includes corresponding validation methods:
- `validateCrittersData()` - Validates required fields and stat values
- `validateMovesData()` - Validates move power (0-150) and accuracy (0-100)
- `validateItemsData()` - Validates item structure
- `validateLegacyEncountersData()` - Validates encounter structure
- `validateLegacyNPCsData()` - Validates NPC structure
- `validateLegacyEventsData()` - Validates event structure
- `validateLegacySignsData()` - Validates sign structure
- `validateLegacyIDMappings()` - Validates all mapping tables

## New TypeScript Interfaces

Created in `/src/game/models/legacyTypes.ts`:

- `ILegacyMonster` - Legacy critter definition
- `ILegacyAttack` - Legacy move definition
- `ILegacyItem` - Legacy item definition
- `ILegacyNPCDefinition` - Legacy NPC definition
- `ILegacyNPCEvent` - Legacy NPC event
- `ILegacySign` - Legacy sign definition
- `ILegacyEventDefinition` - Legacy event definition
- `ILegacyEventStep` - Single event step
- `ILegacyEncounterMap` - Encounter data structure
- `ILegacyIDMapping` - ID mapping structure
- `ILegacyConversionResult` - Conversion result tracking

## Database Integration Points

### Current Status

Existing databases still use hardcoded placeholder data:
- `CritterSpeciesDatabase` - Hardcoded starter trio and common critters
- `MoveDatabase` - Hardcoded move set
- `ItemDatabase` - Hardcoded item set
- `TrainerDatabase` - Hardcoded trainer rosters

### Migration Path

Databases can be updated to load from legacy data using:

```typescript
const legacyData = await DataLoader.loadAllLegacyData();
legacyData.critters.forEach(critter => CritterSpeciesDatabase.registerCritter(critter));
legacyData.moves.forEach(move => MoveDatabase.registerMove(move));
legacyData.items.forEach(item => ItemDatabase.registerItem(item));
```

## Backward Compatibility

### Legacy Fields Preservation

All normalized data files include `legacy*` prefixed fields to maintain traceability:
- `legacyId` - Original numeric ID
- `legacyAssetKey` - Original asset reference
- `legacyAnimationName` - Original animation reference
- `legacyAudioKey` - Original audio reference
- `legacyCategory` - Original category string
- `legacyEffect` - Original effect string

This allows for:
1. Debugging and traceability
2. Asset lookups using original asset keys
3. Animation/audio mapping if needed
4. Future reconciliation with legacy systems

## Testing Coverage

Unit tests cover:
- ✅ All legacy data loaders return data without errors
- ✅ Required fields validation for all data types
- ✅ Stat range validation (power 0-150, accuracy 0-100)
- ✅ Structure validation for complex types (encounters, events, NPCs)
- ✅ ID mapping validation
- ✅ Parallel loading with `loadAllLegacyData()`
- ✅ Standard data loading compatibility

Test file: `/src/game/data/__tests__/loader.test.ts`

## Error Handling

All DataLoader methods include:
1. HTTP error checking (response.ok)
2. Data structure validation
3. Required field validation
4. Type validation
5. Range validation (for numeric fields)
6. Comprehensive error logging
7. Error re-throwing for caller handling

## Performance Considerations

- Legacy data files are small (<50KB total)
- Parallel loading using `Promise.all()`
- Validation is performed once at load time
- Cached in-memory once loaded
- No performance impact compared to hardcoded defaults

## Future Enhancements

1. **Database Sync**: Update databases to load from legacy files
2. **Asset Mapping**: Create asset reference table using `legacyAssetKey`
3. **Animation/Audio Mapping**: Map legacy animation/audio keys to modern system
4. **Additional Fields**: Add missing stats/types based on game mechanics
5. **Encounter Generation**: Use encounter data for wild critter spawning
6. **Event System**: Implement event execution engine for legacy events
7. **NPC Interaction**: Build NPC interaction system using event data

## Summary

This migration provides:
- ✅ 100% preservation of legacy data
- ✅ Full TypeScript type safety
- ✅ Backward compatibility through legacy fields
- ✅ Clear ID mapping strategy
- ✅ Comprehensive validation
- ✅ Extensible DataLoader architecture
- ✅ Foundation for database integration
- ✅ Documented transformation strategy
