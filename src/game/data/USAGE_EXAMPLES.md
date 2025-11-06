# DataLoader Usage Examples

This document provides practical examples of using the DataLoader in various game scenarios.

## Import the DataLoader

```typescript
import { dataLoader } from '@/game';
```

## Battle System Examples

### Calculate Damage with Type Effectiveness

```typescript
// In a battle scene
calculateDamage(attacker: Critter, defender: Critter, moveId: string): number {
  const move = dataLoader.getMoveById(moveId);
  if (!move) return 0;
  
  // Get type effectiveness multiplier
  const attackerType = attacker.types[0];
  const defenderType = defender.types[0];
  const effectiveness = dataLoader.getTypeEffectiveness(attackerType, defenderType);
  
  // Calculate base damage
  const baseDamage = move.power * (attacker.baseStats.attack / defender.baseStats.defense);
  
  // Apply type effectiveness
  return Math.floor(baseDamage * effectiveness);
}
```

### Display Type Effectiveness UI

```typescript
// Show effectiveness indicator
showTypeMatchup(attackType: string, defendType: string): string {
  const effectiveness = dataLoader.getTypeEffectiveness(attackType, defendType);
  
  if (effectiveness > 1.5) return "It's super effective!";
  if (effectiveness < 0.75) return "It's not very effective...";
  if (effectiveness === 0) return "It doesn't affect the target!";
  return "";
}
```

## Inventory System Examples

### Display Categorized Items

```typescript
// Create inventory UI sections
createInventoryUI() {
  const potions = dataLoader.getItemsByCategory('Potion');
  const pokeballs = dataLoader.getItemsByCategory('Pokeball');
  const berries = dataLoader.getItemsByCategory('Berry');
  const keyItems = dataLoader.getItemsByCategory('Key Item');
  
  this.renderInventorySection('HEALING', potions);
  this.renderInventorySection('POKÉBALLS', pokeballs);
  this.renderInventorySection('BERRIES', berries);
  this.renderInventorySection('KEY ITEMS', keyItems);
}
```

### Use Item on Critter

```typescript
useItem(itemId: string, critterId: string): boolean {
  const item = dataLoader.getItemById(itemId);
  const critter = this.getCurrentCritter(critterId);
  
  if (!item || !critter) return false;
  
  switch (item.effect?.type) {
    case 'heal-hp':
      critter.currentHp = Math.min(
        critter.maxHp, 
        critter.currentHp + (item.effect.value ?? 0)
      );
      return true;
      
    case 'catch-rate':
      return this.attemptCapture(critter, item.effect.value ?? 1);
      
    case 'heal-status':
      critter.status = 'normal';
      return true;
      
    default:
      return false;
  }
}
```

## World/Overworld Examples

### Trigger Random Encounter

```typescript
// When player walks in grass
checkForEncounter(areaId: string): void {
  // Random encounter rate (e.g., 10% per step in grass)
  if (Math.random() > 0.9) {
    const monsterId = dataLoader.getRandomEncounter(areaId);
    
    if (monsterId) {
      // Get the monster data for battle
      const wildCritter = dataLoader.getLegacyMonsterById(monsterId);
      if (wildCritter) {
        this.startBattle(wildCritter);
      }
    }
  }
}
```

### Display Area Encounters

```typescript
// For a Pokédex-like interface
displayAreaInfo(areaId: string): void {
  const encounterTable = dataLoader.getEncounterTable(areaId);
  
  if (!encounterTable) {
    console.log('No encounters in this area');
    return;
  }
  
  console.log(`Encounters in Area ${areaId}:`);
  encounterTable.encounters.forEach(entry => {
    const monster = dataLoader.getLegacyMonsterById(entry.monsterId);
    const rarity = this.calculateRarity(entry.weight);
    console.log(`- ${monster?.name}: ${rarity}`);
  });
}
```

## Starter Selection Examples

### Display Starter Options

```typescript
createStarterSelection() {
  const starters = dataLoader.getStarterCritters();
  
  starters.forEach((critter, index) => {
    const button = this.createStarterButton(
      critter,
      100 + (index * 200),
      300
    );
    
    button.on('pointerdown', () => {
      this.selectStarter(critter.id);
    });
  });
}
```

### Provide Starter Info

```typescript
displayStarterInfo(critterId: string) {
  const critter = dataLoader.getCritterById(critterId);
  
  if (!critter) return;
  
  this.nameText.setText(critter.name);
  this.typeText.setText(`Type: ${critter.types.join(', ')}`);
  this.descText.setText(critter.pokedexEntry);
  
  // Show starting moves
  const moves = critter.moves.slice(0, 2).map(moveId => {
    const move = dataLoader.getMoveById(moveId);
    return move ? `${move.name} (${move.type})` : 'Unknown';
  });
  
  this.movesText.setText(`Starting moves:\n${moves.join('\n')}`);
}
```

## Pokédex System Examples

### Display Critter Details

```typescript
showPokedexEntry(critterId: string) {
  const critter = dataLoader.getCritterById(critterId);
  
  if (!critter) return;
  
  // Display basic info
  this.nameText.setText(`#${critter.id} ${critter.name}`);
  this.typesText.setText(critter.types.join(' / '));
  this.entryText.setText(critter.pokedexEntry);
  
  // Display stats
  this.statsText.setText([
    `HP:      ${critter.baseStats.hp}`,
    `Attack:  ${critter.baseStats.attack}`,
    `Defense: ${critter.baseStats.defense}`,
    `Sp.Atk:  ${critter.baseStats.spAtk}`,
    `Sp.Def:  ${critter.baseStats.spDef}`,
    `Speed:   ${critter.baseStats.speed}`
  ].join('\n'));
  
  // Display size
  this.sizeText.setText(`Height: ${critter.height}m  Weight: ${critter.weight}kg`);
  
  // Display evolution info
  if (critter.evolvesInto) {
    const evolution = dataLoader.getCritterById(critter.evolvesInto);
    this.evolutionText.setText(
      `Evolves into ${evolution?.name} at level ${critter.evolutionLevel}`
    );
  }
}
```

### Build Evolution Chain

```typescript
getEvolutionChain(critterId: string): Critter[] {
  const chain: Critter[] = [];
  let current = dataLoader.getCritterById(critterId);
  
  if (!current) return chain;
  
  // Go back to base form
  while (current.evolvesFrom) {
    const prev = dataLoader.getCritterById(current.evolvesFrom);
    if (!prev) break;
    current = prev;
  }
  
  // Build forward chain
  chain.push(current);
  
  while (current.evolvesInto) {
    const next = dataLoader.getCritterById(current.evolvesInto);
    if (!next) break;
    chain.push(next);
    current = next;
  }
  
  return chain;
}
```

## Move Learning System

### Check Available Moves

```typescript
getLearnableMoves(critterId: string, level: number): Move[] {
  const critter = dataLoader.getCritterById(critterId);
  if (!critter) return [];
  
  return critter.moves
    .map(moveId => dataLoader.getMoveById(moveId))
    .filter((move): move is Move => move !== undefined);
}
```

### Display Move Details

```typescript
showMoveInfo(moveId: string) {
  const move = dataLoader.getMoveById(moveId);
  if (!move) return;
  
  this.nameText.setText(move.name);
  this.typeText.setText(`Type: ${move.type}`);
  this.categoryText.setText(`Category: ${move.category}`);
  this.powerText.setText(move.power > 0 ? `Power: ${move.power}` : 'Status Move');
  this.accuracyText.setText(`Accuracy: ${move.accuracy}%`);
  this.ppText.setText(`PP: ${move.basePP}`);
  
  if (move.effect) {
    this.effectText.setText(`Effect: ${move.effect.type}`);
    if (move.effect.chance) {
      this.effectText.setText(
        this.effectText.text + ` (${move.effect.chance}% chance)`
      );
    }
  }
}
```

## Type Chart Display

### Create Type Effectiveness Chart

```typescript
createTypeChart() {
  const types = dataLoader.getAllTypes();
  const typeNames = types.map(t => t.name);
  
  // Create header row
  this.createRow(['', ...typeNames], 0);
  
  // Create data rows
  typeNames.forEach((attackType, row) => {
    const effectiveness = typeNames.map(defendType => {
      const multiplier = dataLoader.getTypeEffectiveness(attackType, defendType);
      return this.formatMultiplier(multiplier);
    });
    
    this.createRow([attackType, ...effectiveness], row + 1);
  });
}

formatMultiplier(multiplier: number): string {
  if (multiplier === 0) return '×0';
  if (multiplier === 0.5) return '½';
  if (multiplier === 2) return '×2';
  return '×1';
}
```

## Error Handling Examples

### Graceful Fallbacks

```typescript
displayCritter(critterId: string) {
  const critter = dataLoader.getCritterById(critterId);
  
  if (!critter) {
    console.warn(`Critter not found: ${critterId}`);
    this.showPlaceholder();
    return;
  }
  
  this.renderCritter(critter);
}

executeMove(moveId: string) {
  const move = dataLoader.getMoveById(moveId);
  
  if (!move) {
    console.error(`Move not found: ${moveId}`);
    return this.executeBasicAttack(); // Fallback
  }
  
  this.playMoveAnimation(move);
}
```

### Data Validation

```typescript
validateParty(party: CritterInstance[]): boolean {
  return party.every(critter => {
    const definition = dataLoader.getCritterById(critter.critterId);
    
    if (!definition) {
      console.error(`Invalid critter in party: ${critter.critterId}`);
      return false;
    }
    
    // Validate moves
    const validMoves = critter.attackIds.every(attackId => {
      return dataLoader.getLegacyAttackById(attackId) !== undefined;
    });
    
    if (!validMoves) {
      console.error(`Invalid moves for critter: ${critter.name}`);
      return false;
    }
    
    return true;
  });
}
```

## Performance Tips

### Cache Frequently Accessed Data

```typescript
export class BattleScene extends BaseScene {
  private moveCache = new Map<string, Move>();
  
  getCachedMove(moveId: string): Move | undefined {
    if (!this.moveCache.has(moveId)) {
      const move = dataLoader.getMoveById(moveId);
      if (move) {
        this.moveCache.set(moveId, move);
      }
    }
    return this.moveCache.get(moveId);
  }
}
```

### Preload Related Data

```typescript
preloadBattleData(critter: Critter) {
  // Preload all moves
  critter.moves.forEach(moveId => {
    dataLoader.getMoveById(moveId);
  });
  
  // Preload type effectiveness
  critter.types.forEach(type => {
    dataLoader.getTypeById(type);
  });
}
```

## Testing Your Integration

```typescript
// In a scene's create method, verify data is loaded
create() {
  const testCritter = dataLoader.getCritterById('embolt');
  
  if (!testCritter) {
    console.error('DataLoader not initialized properly!');
    return;
  }
  
  console.log('DataLoader ready!');
  console.log(`Loaded ${dataLoader.getAllCritters().length} critters`);
  console.log(`Loaded ${dataLoader.getAllMoves().length} moves`);
  console.log(`Loaded ${dataLoader.getAllItems().length} items`);
}
```
