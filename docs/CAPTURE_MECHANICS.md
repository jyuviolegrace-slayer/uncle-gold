# Capture Mechanics Implementation

## Overview
This document outlines the complete capture mechanics system for Critter Quest, including:
- Capture orbs with tiered effectiveness
- Inventory system with item management
- Catch probability calculation
- Battle UI integration for capture attempts
- Shop integration for item purchasing

## Architecture

### 1. Item Database (`src/game/models/ItemDatabase.ts`)
Central repository for all items in the game.

**Capture Orbs (Tier-based):**
- **Pokéball** (Tier 1): Base orb, 1.0x catch modifier, $200
- **Great Ball** (Tier 2): Enhanced, 1.5x catch modifier, $600
- **Ultra Ball** (Tier 3): High-power, 2.0x catch modifier, $1200
- **Master Ball** (Tier 4): Guaranteed, 100.0x catch modifier, $10000

**Healing Items:**
- **Potion**: Restores 20 HP, $300
- **Super Potion**: Restores 50 HP, $700
- **Hyper Potion**: Restores 100 HP, $1500
- **Revive**: Restores 50% HP to fainted critter, $2000
- **Antidote**: Cures poison, $100
- **Full Heal**: Fully heals HP and cures status, $600

**Key Items:**
- **Pokédex**: Device for recording critter data (non-consumable)

### 2. Inventory Management
Inventory is integrated into `GameStateManager` with:
- `addItem(itemId: string, quantity: number): boolean` - Add item to inventory
- `removeItem(itemId: string, quantity: number): boolean` - Remove item from inventory
- `getItemQuantity(itemId: string): number` - Query item quantity

**Inventory Events:**
- `inventory:full` - Fired when inventory at capacity and trying to add new item type
- `inventory:updated` - Fired when item quantity changes

**Starting Items:**
New games start with:
- 5x Pokéballs
- 3x Potions
- $1000 starting money

### 3. Catch Probability Formula

```typescript
catchChance = baseRate * orbModifier * statusBonus * (1 - currentHP / maxHP)
```

**Components:**
- **baseRate**: Critter's catch rate divided by 255 (species-specific, 0.0-1.0)
- **orbModifier**: Orb effectiveness multiplier (1.0-100.0)
- **statusBonus**: Status effect multiplier
  - Sleep/Freeze: 2.0x
  - Paralyze/Poison/Burn: 1.5x
  - No status: 1.0x
- **HP Factor**: How low the critter's health is (0.0-1.0)
  - 0% HP = 1.0x (highest catch chance)
  - 100% HP = 0.0x (impossible to catch)

**Example Calculations:**
- Weakened wild critter at 25% HP with Pokéball: `0.45 * 1.0 * 1.0 * 0.75 = 0.34 (34% chance)`
- Same critter with Great Ball: `0.45 * 1.5 * 1.0 * 0.75 = 0.51 (51% chance)`
- Poisoned critter at 25% HP with Great Ball: `0.45 * 1.5 * 1.5 * 0.75 = 0.76 (76% chance)`

### 4. Battle Manager Enhancements (`src/game/models/BattleManager.ts`)

**New Methods:**
- `calculateCatchProbability(wildCritter, orbModifier, statusBonus): number`
  - Returns probability (0.0-1.0) of successful catch
  
- `getStatusBonus(status): number`
  - Returns multiplier based on status condition
  
- `attemptCatch(wildCritter, orbModifier): boolean`
  - Executes catch attempt with probability check
  
- `simulateCatchAnimation(): number`
  - Returns number of shake stages (1-4) for animation

**Integration:**
- Catch rate calculation properly accounts for all modifiers
- Probability capped at 1.0 (100% on Master Ball)
- Status effects checked from critter's current status

### 5. Battle Scene Integration (`src/game/scenes/Battle.ts`)

**New UI Methods:**
- `createItemMenu()` - Displays available items in inventory
- `handleItemSelect(itemId)` - Routes item use to appropriate handler
- `attemptCatch(orbId)` - Executes capture sequence
- `animateCatchSuccess(wildCritter, orbName)` - Success animation
- `animateCatchFailure()` - Failure animation
- `handleCatchSuccess(wildCritter)` - Processes caught critter
- `useHealingItem(itemId)` - Uses healing item in battle

**Battle Flow for Capture:**
1. Player selects "Bag" action
2. `createItemMenu()` displays all items with quantities
3. Player selects orb item
4. `attemptCatch()` called:
   - Display "Throwing <Orb>..." message
   - Call `BattleManager.attemptCatch()` with orb modifier
   - If successful:
     - Show catch success animation
     - Remove orb from inventory
     - Check if party has space
     - If space: Add to party immediately
     - If full: Store in PC, emit `pc:storage-needed` event
     - Add to Pokédex
     - End battle with "caught" result
   - If failed:
     - Show catch failure animation
     - Remove orb from inventory
     - Display "The critter broke free!" message
     - Return to main action menu

**Healing Item Usage:**
1. Player selects "Bag" action
2. Player selects potion/healing item
3. `useHealingItem()` called:
   - Calculate heal amount (min(currentHP deficit, item effect value))
   - Apply healing to active critter
   - Remove item from inventory
   - Execute opponent turn
   - Check battle status and continue or end

**Constraints:**
- Items only usable in wild encounters (not against trainers)
- Cannot catch trainer-owned critters
- Healing items cannot revive fainted critters (unless using Revive item)

### 6. Shop Scene Integration (`src/game/scenes/Shop.ts`)

**Updates:**
- Dynamic item list pulled from `ItemDatabase.getShopItems()`
- Proper price deduction from player money
- Navigation adjusted for variable item count
- Display format: `Item Name` with `Price: $XXXX`

**Shop Flow:**
1. Player navigates to shop
2. Up/Down arrows select items
3. Press Z to purchase:
   - Check player has sufficient funds
   - If yes: Deduct money, add item to inventory
   - If no: Display "Not enough money!" message

### 7. Game State Persistence

**Save Data Integration:**
- Inventory items saved in `playerState.inventory.items` as Map
- Money saved in `playerState.money`
- On save: Maps converted to arrays for JSON serialization
- On load: Arrays converted back to Maps

**Supported Save/Load Operations:**
- Full inventory preservation across save slots
- Money amount persisted
- Item quantities restored accurately

## EventBus Integration

**New Events:**
- `inventory:full` - Inventory at capacity
- `inventory:updated` - Item quantity changed (itemId, quantity)
- `pc:storage-needed` - Caught critter needs PC storage (critter)

**Existing Events (Enhanced):**
- `money:updated` - Emitted on purchase/earn
- `party:updated` - Emitted when critter added from catch
- `pokedex:updated` - Emitted when new critter species caught

## UI/UX Features

### Inventory Display
- Shows up to 6 items per screen
- Displays item name and current quantity
- Selected item highlighted
- "Back" button to return to main menu

### Catch Sequence
- "Throwing <Orb>..." message
- 1-4 shake stages based on success probability
- Success message with critter name
- Failure message "The critter broke free!"
- PC storage notification if party full

### Shop Display
- Dynamic item list from database
- Price clearly shown in yellow text
- Money display updated in real-time
- Success/error messages for purchases

## Testing Checklist

### Capture Mechanics
- [ ] Catch probability calculated correctly with formula
- [ ] Status effects apply proper multipliers
- [ ] HP percentage affects catch chance
- [ ] Master Ball has ~100% success rate
- [ ] Failed catches consume orb
- [ ] Successful catches consume orb

### Party Management
- [ ] Caught critter added to party if space available
- [ ] Pokédex updated on catch
- [ ] PC storage triggered when party full
- [ ] Same critter species can be caught multiple times

### Healing Items
- [ ] Potions restore correct HP amounts
- [ ] Healing items only usable in battle
- [ ] Item consumed after use
- [ ] Cannot overheal past max HP
- [ ] Full Heal cures status conditions

### Inventory System
- [ ] Items displayed correctly in inventory
- [ ] Quantities tracked accurately
- [ ] Removed items decrease quantity
- [ ] Inventory persists across battles
- [ ] Inventory saved/loaded correctly

### Shop System
- [ ] All items displayed in shop
- [ ] Prices shown correctly
- [ ] Money deducted on purchase
- [ ] Items added to inventory
- [ ] "Not enough money" error on insufficient funds
- [ ] Player money display updates in real-time

### Save/Load
- [ ] Inventory saved with save data
- [ ] Money amount restored on load
- [ ] Item quantities accurate after load
- [ ] Caught critters in party after load

## Future Enhancements

### Phase 2 Improvements
- **Ball Effects**: Different orb effects (faster capture in specific conditions)
- **Berry Items**: Consumable berries with various effects
- **TM Items**: Technical Machines for teaching moves
- **Held Items**: Critters can hold items for stat boosts
- **Trainer Items**: Items trainers can use
- **Shop Upgrades**: Different shops with different inventories
- **Bulk Buying**: Purchase multiple items at once

### Advanced Features
- **Item Crafting**: Combine items to create better versions
- **Item Trading**: Trade items between save files
- **Seasonal Shop Stock**: Items rotate based on game progression
- **Rare Items**: Limited availability legendary-quality orbs
- **Item Descriptions**: Full item detail view
- **Item Sell Feature**: Sell items back to shop for partial refund

## Performance Considerations

- ItemDatabase uses lazy initialization (first call to initialize)
- Items cached in memory after initialization (minimal overhead)
- Inventory queries O(1) using Map data structure
- Catch probability calculation efficient (no loops)
- Shop item list regenerated on each render (acceptable for shop scene only)

## Code Quality

- Full TypeScript type safety
- Consistent with existing codebase patterns
- EventBus for scene communication
- Proper error handling in catch attempts
- Clear method naming and documentation
- No hardcoded values outside constants
