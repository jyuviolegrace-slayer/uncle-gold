# Data Loader

The Data Loader provides type-safe access to game data loaded from JSON files.

## Overview

The `DataLoader` class loads and validates game data from Phaser's cache, exposing strongly-typed APIs for accessing critters, moves, items, types, encounters, and legacy data.

## Initialization

The data loader is automatically initialized in the `Preloader` scene after all assets have been loaded. A singleton instance is exported as `dataLoader`.

```typescript
import { dataLoader } from '@/game';

// The loader is ready after the Preloader scene completes
const embolt = dataLoader.getCritterById('embolt');
```

## API Reference

### Critters

```typescript
// Get a critter by ID
const critter = dataLoader.getCritterById('embolt');

// Get a critter by name (case-insensitive)
const critter = dataLoader.getCritterByName('Embolt');

// Get all critters
const allCritters = dataLoader.getAllCritters();

// Get starter critters
const starters = dataLoader.getStarterCritters();
```

### Moves

```typescript
// Get a move by ID
const move = dataLoader.getMoveById('scratch');

// Get a move by name (case-insensitive)
const move = dataLoader.getMoveByName('Scratch');

// Get all moves
const allMoves = dataLoader.getAllMoves();
```

### Items

```typescript
// Get an item by ID
const item = dataLoader.getItemById('potion');

// Get an item by name (case-insensitive)
const item = dataLoader.getItemByName('Potion');

// Get all items
const allItems = dataLoader.getAllItems();

// Get items by category
const potions = dataLoader.getItemsByCategory('Potion');
```

### Types

```typescript
// Get a type by ID
const fireType = dataLoader.getTypeById('fire');

// Get a type by name (case-insensitive)
const fireType = dataLoader.getTypeByName('Fire');

// Get all types
const allTypes = dataLoader.getAllTypes();

// Get type effectiveness multiplier
const effectiveness = dataLoader.getTypeEffectiveness('Fire', 'Grass'); // Returns 2.0
```

### Encounters

```typescript
// Get encounter table for an area
const table = dataLoader.getEncounterTable('1');

// Get a random encounter from an area
const monsterId = dataLoader.getRandomEncounter('1');
```

### Legacy Data

The loader also provides access to legacy data formats for backward compatibility:

```typescript
// Get legacy attack by ID
const attack = dataLoader.getLegacyAttackById(1);

// Get legacy item by ID
const item = dataLoader.getLegacyItemById(1);

// Get legacy monster by ID
const monster = dataLoader.getLegacyMonsterById(1);
```

## Validation

All data is validated using Zod schemas when loaded. If required fields are missing or have invalid types, descriptive errors will be thrown during initialization.

## Type Safety

The DataLoader provides full TypeScript type inference:

```typescript
const critter = dataLoader.getCritterById('embolt');
// critter is typed as Critter | undefined

if (critter) {
  console.log(critter.name); // TypeScript knows all Critter properties
  console.log(critter.baseStats.hp); // Nested properties are also typed
}
```

## Testing

See `__tests__/DataLoader.test.ts` for comprehensive unit tests covering all data loading scenarios.
