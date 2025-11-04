# Core Types Integration Guide

## Quick Start

All core game models are ready to use in Phaser scenes and React components.

### Basic Import

```typescript
import {
  Critter,
  TypeChart,
  BattleManager,
  GameStateManager,
  MoveDatabase,
  CritterSpeciesDatabase,
  // Types
  ICritter,
  IMove,
  IBattle,
  Stats,
  CritterType,
} from '@/game/models';
```

## Typical Game Flow

### 1. Initialize Game State

```typescript
// In main game initialization
const gameState = new GameStateManager('PlayerName');

// Check for existing save
if (gameState.hasSaveData()) {
  gameState.loadGame();
} else {
  // New game - give starter
  const embolt = new Critter('embolt', 5);
  gameState.addCritterToParty(embolt);
  gameState.saveGame();
}
```

### 2. Wild Encounter and Catching

```typescript
// Wild critter appears
const wildCritter = new Critter('sparkit', 8);

// Start battle
const playerParty = gameState.getParty();
const battle = BattleManager.createBattle(
  'player-1', 'Player', playerParty,
  'wild-sparkit', 'Wild Sparkit', [wildCritter],
  true // isWildEncounter
);

const battleManager = new BattleManager(battle);
battleManager.registerMoves(MoveDatabase.getAllMoves());

// After battle is won and critter weakened...
const catchSuccess = Math.random() < 0.8; // Simplified catch rate
if (catchSuccess) {
  wildCritter.nickname = 'Spark'; // Optional
  gameState.addCritterToParty(wildCritter);
  gameState.addToPokedex('sparkit');
} else {
  // Ball failed, critter may flee
}
```

### 3. Trainer Battle

```typescript
const trainerParty = [
  new Critter('aqualis', 12),
  new Critter('rockpile', 11),
];

const battle = BattleManager.createBattle(
  'player-1', 'Player', playerParty,
  'trainer-blake', 'Rival Blake', trainerParty,
  false // isTrainerBattle
);

const battleManager = new BattleManager(battle);
battleManager.registerMoves(MoveDatabase.getAllMoves());

EventBus.on('battle:victory', () => {
  gameState.addBadge('badge-1');
  gameState.addMoney(500);
  gameState.saveGame();
});
```

### 4. Gym Leader Battle with Evolution

```typescript
// After leveling up...
const playerCritter = gameState.getParty()[0];
const levelUps = playerCritter.addExperience(800);

if (levelUps.includes(36)) {
  // Embolt evolves to Boltiger
  const evolvedSpecies = CritterSpeciesDatabase.getSpecies('boltiger');
  playerCritter.speciesId = 'boltiger';
  playerCritter.recalculateStats();
  EventBus.emit('critter:evolved', { critterName: playerCritter.nickname });
}
```

### 5. Continuous Save During Gameplay

```typescript
// In game update loop (e.g., when entering new area)
gameState.setCurrentArea('thunderpeak');
gameState.setPosition(100, 150);
gameState.saveGame();

EventBus.on('game:saved', ({ timestamp }) => {
  // Show save indicator
});
```

## Type Safety Examples

### Using TypeChart for AI Decisions

```typescript
const player = gameState.getParty()[0];
const opponent = battle.opponent.party[0];

const playerTypes = CritterSpeciesDatabase.getSpecies(player.speciesId)?.type || [];
const opponentTypes = CritterSpeciesDatabase.getSpecies(opponent.speciesId)?.type || [];

// Check what types beat the opponent
const strongAgainstOpponent = TypeChart.getStrengthAgainst(opponentTypes);

// Choose move that's super effective if possible
const bestMove = player.moves.find(m => {
  const move = MoveDatabase.getMove(m.moveId);
  if (!move) return false;
  return TypeChart.isSuperEffective(move.type, opponentTypes);
});
```

### Damage Calculation

```typescript
const battle = new BattleManager(battleObj);
battleObj.battleManager = battle;

// Register moves first
battle.registerMoves(MoveDatabase.getAllMoves());

// Get attacker and defender stats
const attacker = battle.getActiveCritter('player-1');
const defender = battle.getActiveCritter('opponent-1');

if (attacker && defender) {
  const moveId = attacker.moves[0].moveId;
  const result = battle.resolveMoveAction(
    'player-1',
    moveId,
    defender.currentStats,
    CritterSpeciesDatabase.getSpecies(defender.speciesId)?.type || []
  );

  console.log(`Damage: ${result.damage}`);
  console.log(`Super Effective: ${result.isSuperEffective}`);
  
  battle.damageActiveCritter('opponent-1', result.damage);
}
```

## React Component Integration

### Party Display Component

```typescript
import { useEffect, useState } from 'react';
import { EventBus } from '@/game/EventBus';
import { GameStateManager, CritterSpeciesDatabase } from '@/game/models';

export const PartyDisplay = () => {
  const [party, setParty] = useState([]);
  const [gsm] = useState(() => new GameStateManager());

  useEffect(() => {
    // Initialize
    gsm.loadGame();
    setParty(gsm.getParty());

    // Listen for updates
    EventBus.on('party:updated', ({ critters }) => {
      setParty(critters);
    });

    return () => EventBus.removeAllListeners('party:updated');
  }, []);

  return (
    <div className="party">
      {party.map((critter) => {
        const species = CritterSpeciesDatabase.getSpecies(critter.speciesId);
        return (
          <div key={critter.id} className="critter-card">
            <h3>{critter.nickname || species?.name}</h3>
            <p>Level {critter.level}</p>
            <div className="hp-bar">
              <div 
                className="hp-fill" 
                style={{ width: `${(critter.currentHP / critter.maxHP) * 100}%` }}
              />
            </div>
            <p>{critter.currentHP}/{critter.maxHP} HP</p>
          </div>
        );
      })}
    </div>
  );
};
```

### Inventory Component

```typescript
export const InventoryDisplay = () => {
  const [items, setItems] = useState(new Map());
  const [gsm] = useState(() => new GameStateManager());

  useEffect(() => {
    gsm.loadGame();
    const playerState = gsm.getPlayerState();
    setItems(playerState.inventory.items);

    EventBus.on('inventory:updated', ({ itemId, quantity }) => {
      setItems((prev) => new Map(prev).set(itemId, quantity));
    });

    return () => EventBus.removeAllListeners('inventory:updated');
  }, []);

  return (
    <div className="inventory">
      {Array.from(items.entries()).map(([itemId, quantity]) => (
        <div key={itemId}>
          {itemId}: {quantity}
        </div>
      ))}
    </div>
  );
};
```

## Event Bus Usage

### Listen for Battle Events

```typescript
import { EventBus } from '@/game/EventBus';

EventBus.on('battle:started', ({ battleId }) => {
  console.log('Battle started:', battleId);
});

EventBus.on('battle:damageDealt', ({ participantId, damage }) => {
  console.log(`${participantId} took ${damage} damage`);
});

EventBus.on('battle:victory', () => {
  console.log('Player won!');
});

EventBus.on('battle:defeat', () => {
  console.log('Player lost!');
});
```

### Listen for Progression Events

```typescript
EventBus.on('badge:earned', ({ badgeId, totalBadges }) => {
  console.log(`Earned badge: ${badgeId}. Total: ${totalBadges}`);
});

EventBus.on('pokedex:updated', ({ speciesId }) => {
  console.log(`Added to Pokédex: ${speciesId}`);
});

EventBus.on('money:updated', ({ money }) => {
  console.log(`Current money: ${money}`);
});
```

## Performance Considerations

1. **Database Access**: `CritterSpeciesDatabase` and `MoveDatabase` are static and initialized once on import.

2. **Save/Load**: Typically happens on area transitions or major milestones, not every frame.

3. **Battle Calculations**: Cache effectiveness lookups if calling repeatedly within same battle.

```typescript
// Cache effectiveness for battle
const defenderTypes = CritterSpeciesDatabase.getSpecies(defender.speciesId)?.type || [];
const effectiveness = (moveType: CritterType) => TypeChart.getEffectiveness(moveType, defenderTypes);
```

4. **Critter Instance Creation**: Use `Critter.fromJSON()` for deserialized data to avoid recalculation.

## Testing Models Independently

All models can be tested independently:

```typescript
// Test Critter
const critter = new Critter('embolt', 5);
critter.addExperience(400);
assert(critter.level > 5);

// Test TypeChart
assert(TypeChart.isSuperEffective('Water', ['Fire']));

// Test GameStateManager
const gsm = new GameStateManager();
gsm.addMoney(100);
assert(gsm.getPlayerState().money === 100);

// Test Databases
assert(MoveDatabase.getMove('ember') !== undefined);
assert(CritterSpeciesDatabase.getSpecies('embolt') !== undefined);
```

## Common Patterns

### Creating a Full Battle Session

```typescript
function initiateBattle(playerParty, opponentParty, isWildEncounter) {
  // Create battle
  const battle = BattleManager.createBattle(
    'player', 'You',
    playerParty,
    'opponent', 'Opponent',
    opponentParty,
    isWildEncounter
  );

  // Initialize manager
  const manager = new BattleManager(battle);
  manager.registerMoves(MoveDatabase.getAllMoves());

  // Set up event listeners
  EventBus.once('battle:victory', () => {
    // Award EXP, money, etc.
    gameState.saveGame();
  });

  EventBus.once('battle:defeat', () => {
    // Handle loss
  });

  return manager;
}
```

### Evolution Helper

```typescript
function checkEvolutions(critter) {
  const species = CritterSpeciesDatabase.getSpecies(critter.speciesId);
  if (species?.evolvesInto && critter.level >= (species.evolutionLevel || 0)) {
    const evolved = CritterSpeciesDatabase.getSpecies(species.evolvesInto);
    if (evolved) {
      critter.speciesId = evolved.id;
      critter.recalculateStats();
      EventBus.emit('critter:evolved', {
        from: species.name,
        to: evolved.name,
      });
    }
  }
}
```

## Next Steps

After Core Types are established:
1. Create scene classes that use these models
2. Implement UI scenes that display party/inventory/pokedex
3. Create wild encounter and trainer battle scenes
4. Build overworld exploration scenes
5. Implement shop and NPC interaction systems
