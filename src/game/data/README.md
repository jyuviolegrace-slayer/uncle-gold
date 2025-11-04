# Data Loading System

This directory contains TypeScript utilities for loading and validating game data files.

## Overview

The data loading system provides:
- Async JSON file loading from `/public/assets/data/`
- Type-safe data validation against schema constraints
- Error handling and reporting
- Integration with game databases (CritterSpeciesDatabase, MoveDatabase, etc.)

## Files

### loader.ts

Main data loader utility with static methods for loading all game data types.

#### Methods

```typescript
// Load individual data types
static async loadCritters(): Promise<ICritterSpecies[]>
static async loadMoves(): Promise<IMove[]>
static async loadTypeMatrix(): Promise<TypeMatrix>
static async loadItems(): Promise<IItem[]>
static async loadAreas(): Promise<IArea[]>

// Load all data in parallel
static async loadAllGameData(): Promise<{
  critters: ICritterSpecies[];
  moves: IMove[];
  typeMatrix: TypeMatrix;
  items: IItem[];
  areas: IArea[];
}>
```

#### Validation

Each load method includes built-in validation:

- **Critters**: Verifies species ID, name, types array, base stats structure
- **Moves**: Validates move properties, power (0-150), accuracy (0-100)
- **Type Matrix**: Ensures 8 types with complete 8×8 effectiveness matrix
- **Items**: Checks required fields (ID, name, description, type)
- **Areas**: Validates structure, level ranges, critter references

#### Usage Examples

```typescript
import { DataLoader } from '@/game/data/loader';

// Load all game data at once
const gameData = await DataLoader.loadAllGameData();
console.log(`Loaded ${gameData.critters.length} critters`);
console.log(`Loaded ${gameData.moves.length} moves`);

// Load specific data type
const moves = await DataLoader.loadMoves();
moves.forEach(move => {
  console.log(`${move.name} (Type: ${move.type}, Power: ${move.power})`);
});

// Load areas for encounter generation
const areas = await DataLoader.loadAreas();
const startArea = areas.find(a => a.id === 'starter-forest');
console.log(`Starting area: ${startArea?.name}`);
```

## Integration with Databases

The Preloader scene uses DataLoader to initialize game databases:

```typescript
import { DataLoader } from '@/game/data/loader';
import { CritterSpeciesDatabase, MoveDatabase, TypeChart } from '@/game/models';

const gameData = await DataLoader.loadAllGameData();

// Register all critters
gameData.critters.forEach(critter => {
  CritterSpeciesDatabase.registerSpecies(critter);
});

// Register all moves
gameData.moves.forEach(move => {
  MoveDatabase.registerMove(move);
});

// Initialize type effectiveness matrix
TypeChart.initializeFromMatrix(gameData.typeMatrix.matrix);
```

## Error Handling

The loader provides comprehensive error handling:

```typescript
try {
  const critters = await DataLoader.loadCritters();
} catch (error) {
  console.error('Failed to load critters:', error);
  // Fall back to hardcoded defaults or show error UI
}
```

Errors include:
- Network errors (file not found, CORS issues)
- Validation errors (invalid data structure)
- Type errors (missing required fields)

## Performance Considerations

### Parallel Loading
All data types are loaded in parallel using `Promise.all()`:

```typescript
static async loadAllGameData() {
  const [critters, moves, typeMatrix, items, areas] = await Promise.all([
    this.loadCritters(),
    this.loadMoves(),
    this.loadTypeMatrix(),
    this.loadItems(),
    this.loadAreas(),
  ]);
  return { critters, moves, typeMatrix, items, areas };
}
```

Total load time: ~50-200ms depending on network and CPU.

### File Size

Combined JSON size: ~22 KB uncompressed
After gzip: ~5 KB (Next.js handles compression automatically)

### Caching

Once loaded, data is cached in memory by the database classes:
- CritterSpeciesDatabase caches species by ID
- MoveDatabase caches moves by ID
- No repeated loads needed

## Type Safety

All loader methods return typed data:

```typescript
const critters: ICritterSpecies[] = await DataLoader.loadCritters();
const moves: IMove[] = await DataLoader.loadMoves();

// TypeScript catches incorrect usage
critters.forEach(critter => {
  const { id, name, types, baseStats } = critter;
  // IDE provides autocomplete for all properties
});
```

## Extending the System

### Adding a New Data Type

1. Create JSON file: `/public/assets/data/mynewdata.json`
2. Create schema: `/public/assets/data/mynewdata.schema.json`
3. Define TypeScript interface in `/src/game/models/types.ts`
4. Add loader method in `loader.ts`:

```typescript
static async loadMyNewData(): Promise<IMyNewData[]> {
  try {
    const response = await fetch(`${this.baseUrl}/mynewdata.json`);
    if (!response.ok) {
      throw new Error(`Failed to load new data: ${response.statusText}`);
    }
    const data = await response.json();
    return this.validateMyNewData(data);
  } catch (error) {
    console.error('Error loading new data:', error);
    throw error;
  }
}

private static validateMyNewData(data: any): IMyNewData[] {
  // Add validation logic here
  return data;
}
```

5. Update `loadAllGameData()` to include new data type
6. Update Preloader scene to initialize/register new data

## Debugging

Enable debug logging by adding to localStorage:

```javascript
localStorage.setItem('DEBUG_DATA_LOADER', 'true');
```

Then check browser console for detailed load timing and validation output.

## Testing

Data files can be validated locally:

```bash
# Validate critters.json against schema
npm run validate:data

# Check for missing move references
npm run check:data-refs
```

(These scripts would need to be added to package.json if validation is desired.)

## Future Enhancements

Potential improvements to the data loading system:

- [ ] Lazy loading: Load areas on-demand instead of all at startup
- [ ] Compression: Use msgpack or similar for smaller file sizes
- [ ] Differential updates: Support server-side data patches
- [ ] Versioning: Track data schema versions for compatibility
- [ ] Analytics: Log which data types are used most frequently
- [ ] Hot reloading: Reload data without full page refresh in dev mode
