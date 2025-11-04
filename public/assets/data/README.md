# Game Data Files

This directory contains all JSON seed data files for the Critter Quest game. Each file has a corresponding JSON schema that validates its structure.

## Files Overview

### critters.json
**Schema:** `critters.schema.json`

Contains definitions for all 25+ critter species in the game. Each critter includes:
- `id`: Unique identifier (e.g., "embolt")
- `name`: Display name (e.g., "Embolt")
- `types`: Array of 1-2 type strings from the 8 available types
- `baseStats`: Object with HP, ATK, DEF, SpA, SpD, SPD (all 1-255)
- `moves`: Array of move IDs the species can learn
- `evolvesFrom`/`evolvesInto`: Evolution chain references
- `evolutionLevel`: Level at which evolution occurs
- `pokedexEntry`: Species description
- `height`: Height in meters
- `weight`: Weight in kilograms
- `catchRate`: 1-255 (higher = easier to catch)

**Example:**
```json
{
  "id": "embolt",
  "name": "Embolt",
  "types": ["Fire"],
  "baseStats": {"hp": 39, "attack": 52, "defense": 43, "spAtk": 60, "spDef": 50, "speed": 65},
  "moves": ["scratch", "ember"],
  "evolvesInto": "boltiger",
  "evolutionLevel": 36,
  "pokedexEntry": "An energetic fire-type with a sparky personality.",
  "height": 0.3,
  "weight": 2.3,
  "catchRate": 45
}
```

### moves.json
**Schema:** `moves.schema.json`

Contains 30+ move definitions. Each move includes:
- `id`: Unique identifier (e.g., "tackle")
- `name`: Display name (e.g., "Tackle")
- `type`: One of the 8 types
- `power`: 0-150 (0 for status moves)
- `accuracy`: 0-100 (percentage)
- `basePP`: 5-40 (power points)
- `category`: "Physical", "Special", or "Status"
- `effect`: Optional secondary effect with type, chance, and value

**Example:**
```json
{
  "id": "tackle",
  "name": "Tackle",
  "type": "Fire",
  "power": 40,
  "accuracy": 100,
  "basePP": 35,
  "category": "Physical"
}
```

### types.json
**Schema:** `types.schema.json`

Contains the type effectiveness matrix. Includes:
- `types`: Array of all 8 type names
- `matrix`: 8×8 object mapping attacker type → defender type → effectiveness multiplier
  - 2.0 = super effective
  - 1.0 = neutral
  - 0.5 = not very effective

**Example:**
```json
{
  "types": ["Fire", "Water", "Grass", "Electric", "Psychic", "Ground", "Dark", "Fairy"],
  "matrix": {
    "Fire": {"Fire": 0.5, "Water": 0.5, "Grass": 2, ...},
    ...
  }
}
```

### items.json
**Schema:** `items.schema.json`

Contains item definitions. Each item includes:
- `id`: Unique identifier
- `name`: Display name
- `description`: Item description
- `type`: Item category ("Pokeball", "Potion", "Key Item", "TM", "Berry", "Other")
- `effect`: Optional effect with type and value

**Example:**
```json
{
  "id": "potion",
  "name": "Potion",
  "description": "Restores 20 HP to a critter.",
  "type": "Potion",
  "effect": {"type": "heal-hp", "value": 20}
}
```

### areas.json
**Schema:** `areas.schema.json`

Contains area/route definitions. Each area includes:
- `id`: Unique identifier
- `name`: Display name
- `type`: Primary type theme
- `description`: Area flavor text
- `levelRange`: Object with min/max critter levels
- `wildCritters`: Array of encounter objects with speciesId and rarity weight
- `trainers`: Optional array of trainer references
- `landmarks`: Optional array of point-of-interest names

**Example:**
```json
{
  "id": "starter-forest",
  "name": "Starter Forest",
  "type": "Fire",
  "description": "A peaceful forest where your adventure begins.",
  "levelRange": {"min": 2, "max": 8},
  "wildCritters": [
    {"speciesId": "embolt", "rarity": 35},
    {"speciesId": "aqualis", "rarity": 35},
    {"speciesId": "thornwick", "rarity": 30}
  ],
  "trainers": [],
  "landmarks": ["Starting Point", "Forest Entrance"]
}
```

## Data Loading

The game uses `DataLoader` utility to load all JSON files at startup:

```typescript
import { DataLoader } from '@/game/data/loader';

// Load all game data
const gameData = await DataLoader.loadAllGameData();
// Returns: { critters, moves, typeMatrix, items, areas }

// Load specific data
const critters = await DataLoader.loadCritters();
const moves = await DataLoader.loadMoves();
const typeMatrix = await DataLoader.loadTypeMatrix();
const items = await DataLoader.loadItems();
const areas = await DataLoader.loadAreas();
```

### Integration with Preloader Scene

The `Preloader` scene automatically:
1. Fetches all JSON files via DataLoader
2. Validates the data structure
3. Registers critters and moves with their respective databases
4. Initializes the type effectiveness matrix
5. Makes data available to all game scenes

## Validation

Each JSON file is validated against its schema by the DataLoader. Validation includes:
- Required field checks
- Type validation
- Range validation (e.g., stats 1-255, accuracy 0-100)
- Array structure validation

If validation fails, an error is thrown and logged to the browser console.

## Adding New Data

### Adding a New Critter
1. Create entry in `critters.json`
2. Ensure all required fields are present
3. Reference only existing move IDs from `moves.json`
4. Data will auto-load in the Preloader

### Adding a New Move
1. Create entry in `moves.json`
2. Use one of the 8 available types
3. Reference will be available in critter movePool fields
4. Data will auto-load in the Preloader

### Adding a New Area
1. Create entry in `areas.json`
2. Reference only existing critter species IDs
3. Set appropriate level ranges and encounter rates
4. Data will auto-load in the Preloader

## Types Available

```
Fire, Water, Grass, Electric, Psychic, Ground, Dark, Fairy
```

## Item Types

```
Pokeball, Potion, Key Item, TM, Berry, Other
```

## Effect Types

### Move Effects
- `burn`, `poison`, `paralyze`, `sleep`, `freeze`, `confusion`
- `heal`, `stat-boost`, `lower-spdef`

### Item Effects
- `heal-hp`, `heal-status`, `catch-rate`, `revive`, `stat-boost`, `key`

## Performance Notes

- All JSON files are fetched in parallel during preload
- Validation is performed once during load
- Data is cached in memory (CritterSpeciesDatabase, MoveDatabase, etc.)
- localStorage handles save data (not included in this directory)

## File Size Reference

- `critters.json`: ~8 KB (25 species)
- `moves.json`: ~4 KB (34 moves)
- `types.json`: ~2 KB (8×8 matrix)
- `items.json`: ~3 KB (30 items)
- `areas.json`: ~5 KB (11 areas)
- **Total:** ~22 KB uncompressed

All files are gzipped automatically by Next.js static export, reducing to ~5 KB.
