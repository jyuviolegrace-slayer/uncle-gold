# Party System Implementation Guide

## Overview

The Party System is a comprehensive player progression, party management, move learning, and evolution framework for Critter Quest. It enables players to manage their active team (up to 6 critters), PC storage, experience distribution, and critter evolution.

## Core Components

### 1. PlayerParty Class (`src/game/models/PlayerParty.ts`)

Manages the active party and PC storage system with 6-critter teams and 10 PC boxes (30 critters per box).

**Key Features:**
- Active party management (max 6 critters)
- PC storage system (10 boxes, 30 critters each)
- Party reordering
- Critter deposit/withdraw between party and PC
- Experience distribution
- Party healing after battles

**Main Methods:**
```ts
getParty(): ICritter[]
addToParty(critter: ICritter): boolean
removeFromParty(index: number): boolean
reorderParty(fromIndex: number, toIndex: number): boolean
depositToPC(critterIndex: number, boxIndex?: number): boolean
withdrawFromPC(boxIndex: number, critterIndex: number): boolean
healParty(): void
distributeExperience(partyIndices: number[], experience: number): number[]
```

**EventBus Emissions:**
- `party:updated` - Party composition changed
- `pc:updated` - PC box contents changed
- `pc:boxChanged` - Current PC box switched
- `party:healed` - Party healed after battle

### 2. MoveLearningManager (`src/game/models/MoveLearningManager.ts`)

Handles move learning logic and move replacement when critters level up.

**Key Features:**
- Level-up move learning system
- Moveset database by species and level
- Move learning prompts for new moves
- Move replacement logic (limited to 4 moves)

**Main Methods:**
```ts
static getLearnableMoves(speciesId: string, level: number): string[]
static getLearnableMovesUpToLevel(speciesId: string, level: number): string[]
static getLearnset(speciesId: string): Array<{ level: number; moveId: string }>
static hasNewMoveToLearn(critter: ICritter): Array<{ moveId: string; level: number }>
static learnMove(critter: ICritter, moveId: string): boolean
static replaceMove(critter: ICritter, newMoveId: string, existingMoveIndex: number): boolean
```

**EventBus Emissions:**
- `movelearned:success` - Critter learns a new move
- `movelearned:replaced` - Critter replaces an existing move

**Movesets Defined:**
Movesets are defined for all 25 critter species in the database. Example:
- `sparkit` (Level 1: spark, 5: spark, 12: spark, 20: thunderbolt)
- `embolt` (Level 1: scratch+ember, 7: flame-burst, 15: dragon-claw)

### 3. EvolutionManager (`src/game/models/EvolutionManager.ts`)

Manages critter evolution, checking requirements and transformation.

**Key Features:**
- Evolution requirement checking (currently level-based)
- Evolution transformation with stat recalculation
- Automatic moveset update on evolution
- Evolution chain tracking
- Fully evolved status checking

**Main Methods:**
```ts
static canEvolve(critter: ICritter): IEvolution | null
static getEvolutionInfo(speciesId: string): IEvolution | null
static getEvolutionChain(speciesId: string): string[]
static evolve(critter: ICritter): boolean
static isFullyEvolved(critter: ICritter): boolean
static getBaseForm(speciesId: string): string
static getFinalForm(speciesId: string): string
```

**EventBus Emissions:**
- `evolution:completed` - Critter evolved successfully
- `evolution:prompt` - Evolution available (emitted by BattleManager after level-up)

**Evolution Chains:**
- Embolt → Boltiger (Level 36)
- Aqualis → Tidecrown (Level 36)
- Thornwick → Verdaxe (Level 36)
- Sparkit → Voltrix (Level 20)
- Rockpile → Boulderan (Level 25)

### 4. Enhanced BattleManager (`src/game/models/BattleManager.ts`)

Extended with post-level-up event checking for moves and evolution.

**New Methods:**
```ts
checkMoveLearning(critter: ICritter): void
checkEvolution(critter: ICritter): void
checkPostLevelUpEvents(critter: ICritter): void
```

**Usage in Battle Scene:**
After distributing experience, the Battle scene calls:
```ts
const levelUps = battleManager.distributeExperience(playerId, defeatedCritter);
levelUps.forEach(level => {
  const winner = battleManager.getActiveCritter(playerId);
  if (winner) {
    battleManager.checkPostLevelUpEvents(winner);
  }
});
```

### 5. Enhanced Party Scene (`src/game/scenes/Party.ts`)

Comprehensive party management UI with detailed critter information.

**Features:**
- Party member list with selection
- Individual critter detail view (stats, moves, experience)
- HP bar visualization with color coding
- Move list display with current/max PP
- Critter removal via DELETE key
- Up/Down arrow navigation

**Display Information:**
- Critter name/nickname, level, and fainting status
- HP bar with color gradients (green > 50%, yellow > 25%, red ≤ 25%)
- Experience points
- All stats (ATK, DEF, SP.ATK, SP.DEF, SPD)
- All known moves with PP display

**Controls:**
- `UP/DOWN`: Navigate party
- `DELETE`: Remove critter from party
- `ESC`: Return to Overworld

## Experience & Leveling System

### Experience Formula
```
baseExp = 50
levelBonus = max(1, defeatedLevel - winnerLevel)
experience = floor((baseExp * defeatedLevel) / 7 + levelBonus)
```

### Level Up Formula
```
requiredExp = 4 * level²
```

When a critter levels up:
1. Stats are recalculated using the Critter class's `recalculateStats()` method
2. HP is preserved proportionally to max HP changes
3. Move learning is checked via `MoveLearningManager`
4. Evolution eligibility is checked via `EvolutionManager`

### Stat Recalculation
Formula applied per stat (except HP):
```
stat = floor(((2 * baseStat + IV) * level / 100 + 5) * nature)
```

IV (Individual Value) = 31 for all critters
Nature multiplier = 1.0 (neutral nature)

HP uses special formula:
```
hp = floor((2 * baseStat + 31 + 100) * level / 100 + 5)
```

## Integration Flow

### Battle Victory Flow
```
Battle Ends → Player Wins
  ↓
Calculate Experience
  ↓
Distribute Experience to Participating Critters
  ↓
For Each Level-Up:
  ├→ Recalculate Stats
  ├→ Check New Moves (MoveLearningManager)
  │  └→ Emit movelearning:available if new moves exist
  ├→ Check Evolution (EvolutionManager)
  │  └→ Emit evolution:prompt if evolution available
  └→ Emit battle:experienceGained event
```

### Move Learning Confirmation
When `movelearning:available` is emitted:
1. Display move learning prompt to player
2. Player chooses: Learn (if < 4 moves) or Replace (if 4 moves)
3. MoveLearningManager processes the choice
4. UI updates to show new moveset

### Evolution Confirmation
When `evolution:prompt` is emitted:
1. Display evolution confirmation dialog
2. Player chooses: Evolve or Cancel
3. EvolutionManager transforms the critter
4. Stats and moveset updated
5. Emit `evolution:completed` event

## EventBus Events Reference

### Party Management
- `party:updated` - Party changed
- `party:healed` - Party healed
- `party:experienceDistributed` - Experience awarded
- `party:full` - Cannot add critter (party full)

### PC Storage
- `pc:updated` - PC box contents changed
- `pc:boxChanged` - Current box switched

### Move Learning
- `movelearning:available` - New moves available to learn
- `movelearned:success` - Critter learned move (no replacement needed)
- `movelearned:replaced` - Critter replaced existing move

### Evolution
- `evolution:prompt` - Evolution available (awaiting player confirmation)
- `evolution:completed` - Evolution finished

### Existing Battle Events
- `battle:experienceGained` - Experience awarded after victory
- `battle:victory` - Battle won
- `battle:defeat` - Battle lost
- `battle:ended` - Battle session ended

## Save Data Integration

Party and PC storage are persisted through the SaveManager via ISaveData:

```ts
export interface ISaveData {
  ...
  playerState: IPlayerState;
  ...
}

export interface IPlayerState {
  ...
  party: IPlayerParty;  // Contains active critters
  ...
}
```

**Serialization:**
- Critters are serialized to ICritter format
- PC boxes must be stored separately in extended ISaveData
- PlayerParty.toJSON() provides serialization format

**Future Enhancement:**
Consider extending ISaveData to include pcBoxes array for full PC persistence.

## Leveling Examples

### Example 1: Level 5 Sparkit wins against Level 3 Rockpile
```
baseExp = 50
levelBonus = max(1, 3 - 5) = 1 (clamped)
experience = floor((50 * 3) / 7 + 1) = floor(21.43 + 1) = 22 EXP

Current EXP at Level 5 = 4 * 25 = 100
Current EXP at Level 6 = 4 * 36 = 144
Total needed for Level 6 = 44 more EXP

22 EXP gained, not enough to level up
```

### Example 2: Level 10 Embolt wins against Level 8 Sparkit (new level)
```
baseExp = 50
levelBonus = max(1, 8 - 10) = 1
experience = floor((50 * 8) / 7 + 1) = floor(57.14 + 1) = 58 EXP

Current EXP at Level 10 = 4 * 100 = 400
Needed for Level 11 = 4 * 121 = 484
Remaining needed = 84 EXP

Embolt gains 58 EXP, no level up (needs 84 more)
```

## Move Learning Examples

### Sparkit Learning Path
- Level 1: Learns Spark (starting move)
- Level 5: Learns Spark (redundant, already known)
- Level 12: Learns Spark (redundant)
- Level 20: Learns Thunderbolt!
  - If Sparkit has < 4 moves: Direct learn
  - If Sparkit has 4 moves: Prompt user to replace

### Evolution Move Learning
When Sparkit evolves to Voltrix at Level 20:
- Voltrix's moveset includes: Spark (1), Spark (5), Spark (12), Thunderbolt (20)
- If newly evolved Voltrix doesn't know Thunderbolt yet, it's added immediately
- Additional high-level moves may be learned on future level-ups

## Testing Checklist

- [ ] Create party with max 6 critters
- [ ] Remove critter from party
- [ ] Reorder party members
- [ ] View detailed stats for each critter
- [ ] Battle and gain experience
- [ ] Level up and learn new moves
- [ ] Replace moves when limit reached
- [ ] Evolve critter and verify stat changes
- [ ] Save/load with party intact
- [ ] HP bar displays correctly
- [ ] Fainting status shows in UI

## Future Enhancements

1. **Move Selection UI** - Interactive move replacement dialog
2. **PC Box Management** - Dedicated UI for depositing/withdrawing
3. **Item-Based Evolution** - Stones, trade, friendship-based evolution
4. **Move Tutors** - NPCs that teach special moves
5. **Breeding System** - Combine critters to create offspring
6. **Nature System** - Stat multipliers by critter nature
7. **Ability System** - Special passive effects per critter
8. **Move Reminders** - Relearn forgotten moves
