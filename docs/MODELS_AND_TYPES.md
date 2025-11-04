# Core Models and Types Documentation

## Overview

This document describes the TypeScript interfaces and classes that form the foundation of Critter Quest. All game state, entities, and mechanics are built upon these core definitions.

## File Structure

```
src/game/models/
├── types.ts                    # TypeScript interfaces and type definitions
├── Critter.ts                  # Individual critter instance class
├── TypeChart.ts                # Type effectiveness utility
├── BattleManager.ts            # Battle orchestration and mechanics
├── GameStateManager.ts         # Player progression and state management
├── MoveDatabase.ts             # Move registry and creation utilities
├── CritterSpeciesDatabase.ts   # Species registry and evolution tracking
└── index.ts                    # Central export file
```

## Core Interfaces (types.ts)

### Stats
```typescript
interface Stats {
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
}
```
Represents combat statistics for both base stats and current stats (after level/stat changes).

### ICritterSpecies
```typescript
interface ICritterSpecies {
  id: string;
  name: string;
  type: CritterType[];
  baseStats: Stats;
  moves: string[];
  evolvesFrom?: string;
  evolvesInto?: string;
  evolutionLevel?: number;
  pokedexEntry: string;
  height: number;
  weight: number;
  catchRate: number;
}
```
Defines the template for a critter species (immutable, shared across all instances).

### ICritter
```typescript
interface ICritter {
  id: string;
  speciesId: string;
  nickname?: string;
  level: number;
  currentHP: number;
  maxHP: number;
  baseStats: Stats;
  currentStats: Stats;
  moves: IMoveInstance[];
  status?: StatusEffect;
  experience: number;
  isFainted: boolean;
}
```
Represents an individual caught/trained critter in the player's party or during a battle.

### IMove
```typescript
interface IMove {
  id: string;
  name: string;
  type: CritterType;
  power: number;
  accuracy: number;
  basePP: number;
  category: MoveCategory;
  effect?: { type: string; chance?: number; value?: number };
}
```
Defines move templates with damage, accuracy, and effects.

### IBattle
```typescript
interface IBattle {
  id: string;
  player: IBattleParticipant;
  opponent: IBattleParticipant;
  turnCount: number;
  log: string[];
  isWildEncounter: boolean;
  isTrainerBattle: boolean;
  battleStatus: 'Active' | 'PlayerWon' | 'OpponentWon' | 'Fled' | 'Error';
}
```
Represents an active battle state between two participants.

## Core Classes

### Critter Class

Represents an individual critter instance with methods for leveling, stat calculation, and serialization.

#### Key Methods
- `addExperience(amount: number)`: Add EXP and handle level-ups
- `recalculateStats()`: Recalculate stats based on level
- `takeDamage(damage: number)`: Apply damage and check faint
- `addMove(moveInstance)`: Add move to critter (max 4)
- `heal()`: Restore to full HP and clear status
- `toJSON()`: Serialize critter to ICritter
- `static fromJSON(data)`: Deserialize from ICritter

#### Example Usage
```typescript
const critter = new Critter('embolt', 5, 'Sparky');
critter.addExperience(400); // May trigger level-up
critter.takeDamage(10);
critter.heal();
```

### TypeChart Class

Static utility for type effectiveness calculations using the 8×8 type matrix.

#### Key Methods
- `getEffectiveness(moveType, defenderTypes)`: Get multiplier (0.5×/1.0×/2.0×)
- `isSuperEffective(moveType, defenderTypes)`: Check if super effective
- `isNotVeryEffective(moveType, defenderTypes)`: Check if resisted
- `getStrengthAgainst(defenderTypes)`: Get all types that beat the target
- `getWeakAgainst(attackerTypes)`: Get all types vulnerable to the attacker

#### Example Usage
```typescript
const multiplier = TypeChart.getEffectiveness('Fire', ['Water']); // 0.5
const isSE = TypeChart.isSuperEffective('Water', ['Fire']); // true
const strongTypes = TypeChart.getStrengthAgainst(['Water']); // ['Grass', 'Electric']
```

### BattleManager Class

Orchestrates turn-based battle logic including damage calculation, turn ordering, and status effects.

#### Key Methods
- `static createBattle()`: Create new battle instance
- `registerMove(move)`: Register move for battle use
- `calculateDamage()`: Damage formula with type/stat/random factors
- `resolveMoveAction()`: Execute a move action
- `determineTurnOrder()`: Determine who goes first by speed
- `doesMoveHit()`: Accuracy check
- `switchCritter()`: Switch active critter during battle
- `applyStatusEffect()`: Apply status condition
- `damageActiveCritter()`: Deal damage to active critter
- `checkBattleStatus()`: Check win/loss conditions
- `endBattle()`: End battle and emit events

#### Example Usage
```typescript
const battle = BattleManager.createBattle(
  'player-1', 'Player', playerParty,
  'trainer-1', 'Trainer', trainerParty,
  false // not wild
);
const bm = new BattleManager(battle);
bm.registerMoves([emberMove, waterGunMove]);
const first = bm.determineTurnOrder(playerCritter, opponentCritter);
```

### GameStateManager Class

Manages all player progression including party, inventory, badges, and saves.

#### Key Methods
- `addCritterToParty(critter)`: Add to party (max 6)
- `removeCritterFromParty(index)`: Remove by index
- `getParty()`: Get current party
- `addBadge(badgeId)`: Add earned badge
- `hasBadge(badgeId)`: Check badge ownership
- `addToPokedex(critterSpeciesId)`: Record critter seen
- `addItem(itemId, quantity)`: Add to inventory
- `removeItem(itemId, quantity)`: Remove from inventory
- `addMoney(amount)`: Gain money
- `spendMoney(amount)`: Spend money
- `saveGame()`: Serialize to localStorage
- `loadGame()`: Deserialize from localStorage
- `hasSaveData()`: Check if save exists
- `deleteSaveData()`: Clear save

#### Example Usage
```typescript
const gsm = new GameStateManager('Player');
gsm.addCritterToParty(embolt);
gsm.addBadge('badge-1');
gsm.addItem('pokeball', 5);
gsm.addMoney(100);
gsm.saveGame();
```

### MoveDatabase Class

Static registry of all available moves with lookup and instantiation utilities.

#### Key Methods
- `static initialize()`: Load default moves
- `static registerMove(move)`: Register single move
- `static getMove(moveId)`: Retrieve by ID
- `static getMovesByType(type)`: Filter by type
- `static getMovesByCategory(category)`: Filter by category
- `static createMoveInstance(moveId)`: Create instance with full PP
- `static moveExists(moveId)`: Check existence

#### Example Usage
```typescript
const emberMove = MoveDatabase.getMove('ember');
const fireMovesAvailable = MoveDatabase.getMovesByType('Fire');
const moveInstance = MoveDatabase.createMoveInstance('ember');
```

### CritterSpeciesDatabase Class

Static registry of all critter species with evolution tracking and lookup utilities.

#### Key Methods
- `static initialize()`: Load default species (25 critters)
- `static registerSpecies(species)`: Register species
- `static getSpecies(speciesId)`: Retrieve by ID
- `static getSpeciesByName(name)`: Retrieve by name
- `static getSpeciesByType(type)`: Filter by type
- `static getEvolutionLine(speciesId)`: Trace full evolution chain
- `static speciesExists(speciesId)`: Check existence

#### Example Usage
```typescript
const embolt = CritterSpeciesDatabase.getSpecies('embolt');
const fireSpecies = CritterSpeciesDatabase.getSpeciesByType('Fire');
const evolutionLine = CritterSpeciesDatabase.getEvolutionLine('embolt');
// Returns: [embolt, boltiger]
```

## Types and Enums

### CritterType
```typescript
type CritterType = 'Fire' | 'Water' | 'Grass' | 'Electric' | 'Psychic' | 'Ground' | 'Dark' | 'Fairy';
```
Eight available critter types with full 8×8 effectiveness matrix.

### MoveCategory
```typescript
type MoveCategory = 'Physical' | 'Special' | 'Status';
```
- Physical: Uses attacker ATK and defender DEF
- Special: Uses attacker SpA and defender SpD
- Status: Non-damaging, effects only

### StatusEffect
```typescript
type StatusEffect = 'Burn' | 'Poison' | 'Paralyze' | 'Sleep' | 'Freeze' | 'Confusion';
```

## Event Bus Integration

All state changes emit events via `EventBus` for React component integration.

### Battle Events
- `battle:started` - Battle begins
- `battle:ended` - Battle concludes
- `battle:victory` - Player won
- `battle:defeat` - Player lost
- `battle:switched` - Critter switched
- `battle:damageDealt` - Damage applied
- `battle:fainted` - Critter fainted
- `battle:statusApplied` - Status effect applied

### Party Events
- `party:updated` - Party changed
- `party:full` - Cannot add critter

### Progression Events
- `badge:earned` - Badge unlocked
- `pokedex:updated` - Species recorded
- `money:updated` - Money changed
- `area:changed` - Location changed

### Save Events
- `game:saved` - Save completed
- `game:loaded` - Load completed
- `game:saveFailed` - Save error
- `game:loadFailed` - Load error

## Default Data

### Starter Critters (Level 5)
- **Embolt** (Fire) - Fast special attacker
- **Aqualis** (Water) - Defensive tank
- **Thornwick** (Grass) - Special attacker

### Early Game Critters
- Sparkit (Electric), Rockpile (Fire), Pupskin (Fire), Bugite (Bug)
- All catchable at Lv5-10 in Meadowvale

### Evolution Mechanics
All starters and many common critters evolve at specific levels:
- Embolt → Boltiger (L36)
- Aqualis → Tidecrown (L36)
- Thornwick → Verdaxe (L36)
- Plus 15+ other evolution lines

### Type Effectiveness
8×8 matrix fully implemented:
- Fire weak to: Water, Ground, Rock
- Water weak to: Electric, Grass
- Grass weak to: Fire, Ice, Poison, Flying, Bug
- (etc. - see GDD for full matrix)

## Save Data Structure

Saved to `localStorage` as JSON under key `critterquest_save`:

```typescript
interface ISaveData {
  version: number;
  timestamp: number;
  playerState: {
    name: string;
    level: number;
    badges: string[];
    pokedex: string[];
    inventory: { items: [string, number][] };
    party: ICritter[];
    money: number;
    position: { x: number; y: number };
    currentArea: string;
    playtime: number;
  };
  completedArenas: string[];
  defeatedTrainers: string[];
  caughtCritters: ICritter[];
  playedMinutes: number;
}
```

## Usage Examples

### Creating a Critter and Adding to Party

```typescript
import { Critter, GameStateManager, CritterSpeciesDatabase } from '@/game/models';

const gsm = new GameStateManager('MyPlayer');

// Create a caught critter
const embolt = new Critter('embolt', 5, 'Sparky');

// Add move
const moveInstance = { 
  id: 'move_1', 
  moveId: 'ember', 
  currentPP: 25, 
  maxPP: 25 
};
embolt.addMove(moveInstance);

// Add to party
gsm.addCritterToParty(embolt);
```

### Starting a Battle

```typescript
import { BattleManager, GameStateManager } from '@/game/models';

const playerParty = gsm.getParty();
const opponentParty = [new Critter('aqualis', 10)];

const battle = BattleManager.createBattle(
  'player-1',
  'Player',
  playerParty,
  'opponent-1',
  'Trainer Blake',
  opponentParty,
  false // trainer battle
);

const bm = new BattleManager(battle);
const first = bm.determineTurnOrder(playerParty[0], opponentParty[0]);
```

### Saving and Loading

```typescript
const gsm = new GameStateManager('Player1');
gsm.addCritterToParty(critter);
gsm.addBadge('badge-1');
gsm.addMoney(500);

// Save to localStorage
gsm.saveGame();

// Load later
const gsm2 = new GameStateManager('Player1');
gsm2.loadGame();
```

## Integration with Scenes

All models are designed to be used from Phaser scenes and React components via EventBus:

```typescript
// In a Phaser scene
import { BattleManager } from '@/game/models';
import { EventBus } from '@/game/EventBus';

EventBus.on('battle:victory', () => {
  // Handle victory
});

EventBus.on('party:updated', ({ critters }) => {
  // Update UI
});
```

## Compilation and Type Safety

All models compile with TypeScript strict mode enabled. The models are fully typed and provide excellent IDE autocomplete support.

To verify compilation:
```bash
npm run build
```

All models export from `/src/game/models/index.ts` for clean imports.
