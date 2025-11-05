# Capture Mechanics - Manual Testing Guide

## Setup
1. Start a new game and select a starter critter
2. You'll start with:
   - 5x Pokéballs
   - 3x Potions
   - $1000 money
   - 1x Starter critter

## Testing Capture Mechanics

### Test 1: Basic Capture Attempt
1. Navigate to a wild area and encounter a critter
2. In battle, select "Bag" action
3. Verify inventory shows available items with quantities
4. Select "Pokéball"
5. Observe "Throwing Pokéball..." message
6. Result should show capture success or failure based on probability
7. Verify Pokéball consumed (quantity decreased by 1)
8. If successful: Critter added to party (verify in Party menu)
9. If failed: Return to battle menu for another attempt

### Test 2: Catch Probability with Different Health
1. Engage wild critter
2. Damage critter to 25% HP
3. Attempt capture with Pokéball
4. Success rate should be higher than undamaged critter
5. Repeat with different health levels (50%, 75%, 100%)
6. Observe: Lower HP = higher catch rate

### Test 3: Orb Effectiveness Tiers
1. Start a new game (or reload)
2. Visit shop and note available orbs:
   - Pokéball ($200, 1.0x modifier)
   - Great Ball ($600, 1.5x modifier)
   - Ultra Ball ($1200, 2.0x modifier)
   - Master Ball ($10000, 100.0x modifier)
3. Purchase each orb type
4. Test capture with same critter using each orb
5. Observe: Higher tier orbs have higher success rate
6. Master Ball should guarantee capture

### Test 4: Shop Purchase System
1. Open shop (via Overworld menu or navigation)
2. Verify current money displayed at top
3. Navigate with UP/DOWN arrows
4. Select Pokéball and purchase (Press Z)
5. Verify:
   - Money decreased by $200
   - Pokéball quantity increased by 1
   - Success message shown
6. Try to purchase item with insufficient money
7. Verify "Not enough money!" message shown
8. Money doesn't decrease on failed purchase

### Test 5: Status Effect Bonuses
1. Damage critter until half HP
2. If available, use move with status effect (e.g., Thunder Wave for Paralyze)
3. Attempt capture:
   - With status (Paralyze/Poison/Burn = 1.5x bonus)
   - With Sleep/Freeze (2.0x bonus)
4. Observe: Paralyzed/Poisoned critters have higher catch rate
5. Sleep/Frozen critters have even higher catch rate

### Test 6: Party Management on Capture
1. Build a full party (6 critters)
2. Encounter new wild critter
3. Weaken and capture it
4. Observe: "Party full! <Critter> stored in PC." message
5. Battle ends
6. Verify caught critter NOT in active party
7. Check PC to confirm critter stored (if PC access implemented)

### Test 7: Pokedex Updates
1. Capture a new species
2. Check Pokedex (if accessible in game)
3. Verify new species added to Pokedex entries

### Test 8: Healing Items in Battle
1. Encounter wild critter
2. Take damage (reduce player critter HP)
3. Select "Bag" action
4. Select Potion or Super Potion
5. Verify:
   - Message shows healing amount
   - Critter HP restored by correct amount (20 HP for Potion, 50 for Super Potion)
   - Potion quantity decreased by 1
   - Opponent still gets a turn
   - Battle continues normally

### Test 9: Inventory Display
1. Go to Battle with various items
2. Open Bag menu
3. Verify:
   - All items displayed with quantities
   - Format: `Item Name` with `×quantity`
   - Maximum 6 items shown per screen
   - "Back" button available
   - Correct items shown based on what you own

### Test 10: Save/Load Persistence
1. Acquire various items (orbs, potions)
2. Note money amount
3. Save game
4. Close and reload game
5. Verify:
   - All items preserved with correct quantities
   - Money amount unchanged
   - Can use items in battle as normal

### Test 11: Multiple Capture Attempts
1. Engage same species of critter twice
2. Capture first one successfully
3. Capture second one of same species
4. Verify:
   - Both critters can be caught
   - Each stored in party/PC appropriately
   - Pokedex only counts once

### Test 12: Failed Capture Flow
1. Attempt capture with full health critter (very low success rate)
2. Observe "The critter broke free!" message
3. Verify Pokéball consumed
4. Return to battle menu (not returned to main)
5. Can attempt capture again or use other actions

### Test 13: Master Ball Guarantee
1. Purchase Master Ball ($10000 - requires significant money)
2. Use Master Ball on any critter (even full health)
3. Observe: Should capture successfully
4. Verify: Only 1 Master Ball can be obtained per game (or check pricing)

### Test 14: Empty Inventory in Battle
1. Use up all Pokéballs/Potions
2. Select "Bag" in battle
3. Observe: "No items in bag!" message
4. Verify returned to main menu without crashing

### Test 15: Trainer Battle Item Restriction
1. Engage trainer battle (if implemented)
2. Select "Bag" action
3. Observe: "Cannot use items against trainers!" message
4. Verify game doesn't crash or behave unexpectedly

## Expected Behaviors

### Successful Captures
- Critter appears in party (if space available)
- Pokédex updated
- Orb consumed
- Battle ends with capture message
- Game can be saved with new critter

### Failed Captures
- "The critter broke free!" message shown
- Orb still consumed
- Battle continues with normal menu
- Can attempt again

### Party Full Scenario
- Message indicates PC storage
- Critter not visible in party immediately
- No party member removed
- Game should have system to retrieve from PC

### Healing Items
- Restore specific HP amounts
- Cannot overheal
- Consumed after use
- Don't end battle immediately (opponent gets turn)

### Shop
- All items accessible
- Prices clearly shown
- Money deducted correctly
- Items available immediately in battle

## Known Limitations (Expected for MVP)

1. No sprite animations (uses placeholder rectangles)
2. PC storage event emitted but may not have full UI (depends on implementation)
3. No item selling to shop
4. No bulk item purchases
5. No item descriptions beyond names
6. No item categories or sorting
7. Limited to basic healing items (no status cure in UI yet)

## Performance Notes

- No noticeable lag during item usage
- Smooth transitions between menus
- Inventory display responsive
- Catch probability calculated instantly
- No memory leaks from item operations

## Bug Testing

### Should NOT Occur
- ❌ Duplicate items after purchase
- ❌ Inventory quantity going negative
- ❌ Money going negative
- ❌ Critter added when party full without PC event
- ❌ Item consumed on failed use
- ❌ Trainer battles allowing item use
- ❌ Capture orbs usable outside battle

### Known Issues to Report
- Report any of the above
- Report any console errors
- Report any UI misalignments
- Report any save/load inconsistencies

## Test Completion Checklist

- [ ] Basic capture attempt works
- [ ] Catch probability varies with health
- [ ] All orb tiers purchasable
- [ ] Shop money deduction works
- [ ] Status effects affect capture rate
- [ ] Party full triggers PC storage
- [ ] Pokedex updates on capture
- [ ] Healing items restore HP
- [ ] Inventory displays correctly
- [ ] Save/load preserves items
- [ ] Multiple captures of same species work
- [ ] Failed captures consume orbs
- [ ] Master Ball guarantees capture
- [ ] Empty inventory handled gracefully
- [ ] Trainer battles block items
- [ ] No bugs or console errors

## Notes for QA

1. Each test should be repeatable
2. Test with different species (different catch rates)
3. Test with both keyboard and mouse (if applicable)
4. Test on different screen sizes if possible
5. Monitor console for errors during testing
6. Note any UI/UX improvements needed

## Performance Benchmarks (Expected)

- Capture calculation: < 1ms
- Item lookup: < 1ms
- Inventory display: < 100ms
- Shop rendering: < 200ms
- Save/load with items: < 500ms
