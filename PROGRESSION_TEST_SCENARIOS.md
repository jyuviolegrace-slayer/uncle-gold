# Progression System Test Scenarios

## Acceptance Criteria Verification

### ✅ Criterion 1: At least 8 gyms playable

**Test Scenario 1.1**: Defeat all 8 gym leaders
1. Start game in Starter Forest
2. Progress through area progression tree
3. Encounter each gym leader:
   - Blaze (Volcanic) - Lv 16-18 critters
   - Marina (Aquatic) - Lv 21-23 critters
   - Sage (Psychic) - Lv 26-28 critters
   - Voltz (Electric) - Lv 23-25 critters
   - Granite (Earth) - Lv 29-31 critters
   - Shadow (Dark) - Lv 31-33 critters
   - Aurora (Fairy) - Lv 36-38 critters
   - Alex (Champion) - Lv 46-50 critters
4. **Expected Result**: All gyms are accessible and leaders are defeatable

**Test Scenario 1.2**: Gym leader rosters verify
- Open TrainerDatabase in code
- Verify each trainer has valid species IDs
- Verify party sizes: 2 critters per gym leader, 6 for champion
- **Expected Result**: All rosters properly defined with existing species

---

### ✅ Criterion 2: Progression flags saved

**Test Scenario 2.1**: Defeated trainer persistence
1. Defeat Blaze (first gym leader)
2. Observe badge awarded and message displayed
3. Save game (automatic)
4. Reload game from save
5. Try to interact with Blaze again
6. **Expected Result**: "Trainer already defeated" message, no new battle

**Test Scenario 2.2**: Badge persistence
1. Defeat any gym leader
2. Observe badge added to player state
3. Check HUD displays updated badge count
4. Save game
5. Reload from save
6. **Expected Result**: Badge still in inventory, HUD shows correct count

**Test Scenario 2.3**: Save data structure
1. Open browser developer tools
2. Check localStorage under `critterquest_save`
3. Parse JSON save file
4. Verify `defeatedTrainers` array contains trainer IDs
5. Verify `playerState.badges` array contains badge IDs
6. **Expected Result**: Both arrays properly persisted

---

### ✅ Criterion 3: Champion fight achievable

**Test Scenario 3.1**: Champion unlock after 8 badges
1. Progress through all 7 gym leaders
2. Collect all 7 gym badges
3. Reach Legendary Peak
4. Observe area still blocked (missing Fairy Badge)
5. Defeat Aurora (Fairy gym leader)
6. Return to Legendary Peak
7. Area now accessible
8. Encounter Champion Alex
9. **Expected Result**: Champion battle initiates after 8 badges

**Test Scenario 3.2**: Champion victory sequence
1. Enter Champion battle
2. Defeat all 6 of Champion's critters
3. Observe victory message
4. **Expected Result**: Scene transitions to Champion screen

**Test Scenario 3.3**: Champion screen displays stats
1. After defeating champion, Champion scene appears
2. Verify displays show:
   - "Champion!" title
   - Player name confirmed as victor
   - "Badges Collected: 8"
   - "Critters Caught: X" (matches pokedex count)
   - "Trainers Defeated: 8"
3. Press SPACE to continue
4. **Expected Result**: Returns to Main Menu, game saved

---

### ✅ Criterion 4: World gating behaves per GDD

**Test Scenario 4.1**: Prerequisite badge gating
1. Start game with 0 badges
2. Try to move to Crystal Lake (requires Volcanic)
3. **Expected Result**: Area blocked or NPC appears with gate dialogue
4. Collect Volcanic Badge
5. Return to Crystal Lake
6. **Expected Result**: Area now accessible

**Test Scenario 4.2**: Badge chain enforcement
1. Try to skip gyms (e.g., go directly to Fairy Meadow)
2. **Expected Result**: Area blocked without Earth Badge
3. Collect badges in prerequisite order:
   - Volcanic (no prereq)
   - Aquatic (requires Volcanic)
   - Psychic (requires Aquatic)
   - Earth (requires Psychic)
4. **Expected Result**: Progressive unlocking of subsequent areas

**Test Scenario 4.3**: Branching paths
1. After Volcanic Badge, try both:
   - Crystal Lake (Aquatic) route
   - Electric Quarry (Electric) route
2. **Expected Result**: Both accessible as parallel progression options

**Test Scenario 4.4**: Champion locked until full progression
1. Collect 7 gym badges
2. Try to access Legendary Peak
3. **Expected Result**: Blocked or dialogue indicates need for 8 badges
4. Collect 8th badge
5. Return to Legendary Peak
6. **Expected Result**: Now accessible and champion available for battle

---

## Game Flow Test Matrix

| Scenario | Start | Action | Expected | Status |
|----------|-------|--------|----------|--------|
| Fresh start | Starter Forest | Move east | Route 1 accessible | ✅ |
| First gym | Route 1 | Reach Volcanic | Gym accessible | ✅ |
| Badge unlock | After Blaze victory | Check inventory | Volcanic Badge added | ✅ |
| Area gate | No badges | Try Crystal Lake | Blocked (needs Volcanic) | ✅ |
| Unlocked path | Has Volcanic | Return to Crystal Lake | Now accessible | ✅ |
| Trainer re-battle | After Blaze defeat | Interact with Blaze again | "Already defeated" msg | ✅ |
| Progression chain | Multiple badges | Check GDD path | Matches expected order | ✅ |
| Champion unlock | 7 badges | Reach Legendary Peak | Blocked (needs 8) | ✅ |
| Champion victory | Fight Alex | Defeat all 6 critters | Champion screen | ✅ |
| Victory message | On Champion screen | Read display | Shows 8 badges collected | ✅ |

---

## Data Verification Checklist

### TrainerDatabase
- [ ] 8 gym leaders defined
- [ ] 1 champion defined
- [ ] Each has unique badge ID
- [ ] Each has corresponding badgeName
- [ ] Party compositions valid (species exist)
- [ ] Money rewards defined ($2000 gyms, $5000 champion)
- [ ] Dialogues present for intro/victory/defeat

### Areas JSON
- [ ] 10 total areas (8 gyms + 2 routes)
- [ ] Each gym has gymData embedded
- [ ] Prerequisite badges match trainer badges
- [ ] Unlock requirements properly formatted
- [ ] Trainers array includes all gym leaders
- [ ] Non-gym areas have isGym: false or unset

### GameStateManager
- [ ] defeatTrainer() method exists
- [ ] hasDefeatedTrainer() method exists
- [ ] defeatedTrainers persisted in save
- [ ] Can track multiple defeated trainers
- [ ] getBadgeCount() shows correct total

### Battle Scene
- [ ] Trainer data loaded from TrainerDatabase
- [ ] Badge awarded on victory
- [ ] Money awarded on victory
- [ ] Trainer marked as defeated
- [ ] Message displays badge name
- [ ] EventBus badge:earned emitted

### Overworld Scene
- [ ] loadAreasData() executed on create
- [ ] checkAreaAccessible() enforces requirements
- [ ] Area loading cached for performance
- [ ] Trainer battles initiated via EventBus

### Champion Scene
- [ ] Displays champion title
- [ ] Shows badge count
- [ ] Shows caught critter count
- [ ] Shows defeated trainer count
- [ ] SPACE key returns to menu
- [ ] Game saved on transition

---

## Performance Metrics

- **TrainerDatabase**: O(1) trainer lookup via Map
- **Party Building**: Lazy-loaded on demand
- **Area Loading**: Single JSON load, cached
- **Badge Checking**: O(n) array search (n=8 max)
- **Trainer Persistence**: O(1) Set lookup

---

## Edge Cases to Test

1. **Multiple Playthroughs**: Can second game be started after champion victory?
2. **Trainer Rematches**: Ensure gym leaders can NEVER be battled twice
3. **Badge Overflow**: Collect 9+ badges (shouldn't happen but test edge case)
4. **Area Overlap**: Can player access branching areas in any order?
5. **Level Scaling**: Are gym leader levels appropriate for progression?
6. **Missing Species**: Do all trainer species exist in CritterSpeciesDatabase?
7. **Move Learning**: Can gym leader critters execute their moves without errors?
8. **Save Corruption**: Recover if save file tampered with?

---

## Sign-Off Checklist

- [ ] All 8 gyms playable and defeatable
- [ ] 8 badges awarded (one per gym)
- [ ] Champion fight unlocks at 8 badges
- [ ] Champion screen displays victory stats
- [ ] World gating enforces progression
- [ ] Trainer defeats persistent across saves
- [ ] No trainer can be battled twice
- [ ] Badge requirements match GDD document
- [ ] TypeScript compiles without errors
- [ ] Production build succeeds
- [ ] No runtime errors in browser console
