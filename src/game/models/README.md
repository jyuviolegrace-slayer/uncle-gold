# Critter Quest Core Models

Core game logic, data structures, and managers for Critter Quest - a Pokémon-inspired offline browser RPG.

## What's Here

This directory contains all the foundational TypeScript code for the game's entity system:

- **Types & Interfaces** - TypeScript definitions for all game entities
- **Game Classes** - Critter, BattleManager, GameStateManager, etc.
- **Databases** - MoveDatabase and CritterSpeciesDatabase registries
- **Utilities** - TypeChart for type effectiveness calculations
- **Integration** - Full EventBus support for Phaser/React communication

## Quick Reference

### Create a Critter
```typescript
import { Critter, MoveDatabase } from '@/game/models';

const critter = new Critter('embolt', 5, 'Sparky');
const moveInstance = MoveDatabase.createMoveInstance('ember');
critter.addMove(moveInstance);
```

### Manage Player State
```typescript
import { GameStateManager } from '@/game/models';

const gsm = new GameStateManager('Player1');
gsm.addCritterToParty(critter);
gsm.addBadge('badge-1');
gsm.saveGame();
```

### Check Type Advantages
```typescript
import { TypeChart } from '@/game/models';

TypeChart.isSuperEffective('Water', ['Fire']); // true
TypeChart.getEffectiveness('Fire', ['Water']); // 0.5
TypeChart.getStrengthAgainst(['Fire']); // ['Water', 'Ground', 'Rock']
```

### Start a Battle
```typescript
import { BattleManager, MoveDatabase } from '@/game/models';

const battle = BattleManager.createBattle(
  'player', 'You', playerParty,
  'opponent', 'Enemy', opponentParty,
  false // isTrainerBattle
);

const bm = new BattleManager(battle);
bm.registerMoves(MoveDatabase.getAllMoves());
```

## File Breakdown

### types.ts
Core TypeScript interfaces - single source of truth for all data structures.
- `Stats` - Base/current stat container
- `ICritter` - Individual critter instance
- `ICritterSpecies` - Species template
- `IMove` - Move definition
- `IBattle` - Battle state
- `IPlayerState` - Full player progression
- Plus: enums/types for CritterType, StatusEffect, etc.

### Critter.ts
Individual critter instance with full lifecycle management.
```typescript
const critter = new Critter('embolt', 5);
critter.addExperience(400); // May level up
critter.recalculateStats(); // Update based on level
critter.takeDamage(10);
critter.heal();
```

### TypeChart.ts
Static utility for all type effectiveness calculations.
```typescript
TypeChart.getEffectiveness(moveType, defenderTypes);
TypeChart.isSuperEffective(moveType, defenderTypes);
TypeChart.getStrengthAgainst(defenderTypes);
```

### BattleManager.ts
Orchestrates turn-based battle logic including damage, turn order, status effects.
```typescript
const bm = new BattleManager(battle);
bm.calculateDamage(...); // Full damage formula
bm.determineTurnOrder(critter1, critter2); // Who goes first
bm.switchCritter(participantId, newIndex);
```

### GameStateManager.ts
Manages all player progression, party, inventory, and persistence.
```typescript
const gsm = new GameStateManager('PlayerName');
gsm.addCritterToParty(critter);
gsm.addBadge('badge-1');
gsm.addMoney(500);
gsm.saveGame(); // localStorage
```

### MoveDatabase.ts
Registry of all available moves with 26 default entries.
```typescript
MoveDatabase.getMove('ember');
MoveDatabase.getMovesByType('Fire');
MoveDatabase.createMoveInstance('ember'); // With full PP
```

### CritterSpeciesDatabase.ts
Registry of all 25 critter species with evolution tracking.
```typescript
CritterSpeciesDatabase.getSpecies('embolt');
CritterSpeciesDatabase.getEvolutionLine('embolt'); // [embolt, boltiger]
CritterSpeciesDatabase.getSpeciesByType('Fire');
```

### index.ts
Central export point - import everything from here.
```typescript
import { Critter, BattleManager, GameStateManager, ... } from '@/game/models';
```

## Type System

### 8 Types
Fire, Water, Grass, Electric, Psychic, Ground, Dark, Fairy

### Full Effectiveness Matrix
- Row = attacking type
- Column = defending type
- 2.0 = super effective
- 1.0 = neutral
- 0.5 = resisted

### Move Categories
- Physical: Uses ATK/DEF stats
- Special: Uses SpA/SpD stats
- Status: Non-damaging effects

## Database Contents

### 25 Critters
- **Starter Trio** (L5): Embolt, Aqualis, Thornwick
- **Early Game** (L5-15): Sparkit, Rockpile, Pupskin, Bugite
- **Mid Game** (L15-30): Frostwhip, Psychink, Flamepaw, Mystwave, Venomling
- **Late Game** (L30-40): Stoneguard, Skyfeather, Shadowmist, Ironhide, Lightbringer, Drakeling
- **Legendary** (L45-50): Infernus, Tidal, Natureveil

### Evolution Lines
- Each starter evolves at L36 into powerful form
- Multiple evolution chains for variety
- Evolution line tracing available

### 26 Moves
Across all 8 types with varied power, accuracy, PP, and effects.
Examples: Scratch (40 PWR), Flame Burst (70 PWR, 10% burn), Thunderbolt (90 PWR, 10% paralyze)

## Events Emitted

All state changes emit via `EventBus` for React integration.

### Battle Events
- `battle:started`, `battle:ended`, `battle:victory`, `battle:defeat`
- `battle:switched`, `battle:damageDealt`, `battle:fainted`
- `battle:statusApplied`, `battle:error`

### Progression Events
- `badge:earned`, `pokedex:updated`, `money:updated`
- `area:changed`

### Party/Inventory Events
- `party:updated`, `party:full`
- `inventory:updated`, `inventory:full`

### Save/Load Events
- `game:saved`, `game:loaded`, `game:saveFailed`, `game:loadFailed`, `game:deleted`

## Save Data Structure

Persisted to localStorage under key `critterquest_save` as JSON:
```typescript
{
  version: 1,
  timestamp: number,
  playerState: { name, level, badges, pokedex, inventory, party, money, ... },
  completedArenas: string[],
  defeatedTrainers: string[],
  caughtCritters: ICritter[],
  playedMinutes: number
}
```

## Integration Points

### With Phaser Scenes
```typescript
// In scene update loop
import { GameStateManager } from '@/game/models';
this.gameState = new GameStateManager();

// Listen for events
this.events.on('update', () => {
  this.gameState.setPosition(this.player.x, this.player.y);
});
```

### With React Components
```typescript
import { useEffect, useState } from 'react';
import { EventBus } from '@/game/EventBus';

EventBus.on('party:updated', ({ critters }) => {
  setParty(critters);
});
```

## Development Notes

1. **Initialization**: Databases auto-initialize on import, but can be called manually
2. **Serialization**: Critter.toJSON()/fromJSON() handles save/load
3. **Type Safety**: All models are fully typed for IDE support
4. **Performance**: Databases are static singletons, lookups are O(1)
5. **Extensibility**: Easy to add new species, moves, or types

## Testing

All models are independently testable:
```typescript
// Test Critter growth
const critter = new Critter('embolt', 5);
critter.addExperience(400);
assert(critter.level > 5);

// Test type matchups
assert(TypeChart.isSuperEffective('Water', ['Fire']));

// Test saves
const gsm = new GameStateManager();
gsm.addMoney(100);
gsm.saveGame();
assert(gsm.hasSaveData());
```

## Next Steps

After models are established:
1. Create Phaser scenes using these models
2. Build battle scene with turn-based logic
3. Implement overworld navigation
4. Add NPC and trainer battle systems
5. Create UI scenes for party/inventory management
6. Implement catching and evolution mechanics

## Documentation

- See `docs/MODELS_AND_TYPES.md` for comprehensive API reference
- See `docs/INTEGRATION_GUIDE.md` for usage patterns and examples
