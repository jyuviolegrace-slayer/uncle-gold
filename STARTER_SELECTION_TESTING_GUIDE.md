# Starter Selection UI - Manual Testing Guide

## Pre-Test Setup
1. Build the project: `npm run build-nolog`
2. Start dev server: `npm run dev`
3. Navigate to http://localhost:3000
4. The game should load with Phaser running

## Test Scenarios

### Test 1: Visual Indicator Appears on Screen Load
**Steps:**
1. Wait for main menu to fully load
2. Press ENTER to enter starter selection

**Expected Result:**
- "Choose Your Starter Critter" text appears
- Three colored boxes appear (Orange=Embolt, Blue=Aqualis, Green=Thornwick)
- Yellow border outline is visible around the first starter (Embolt)
- Instructions text shows "Use LEFT/RIGHT arrows to select | Press Z to confirm"

**Pass Criteria:**
- [ ] Yellow border clearly visible
- [ ] Border is around first starter by default
- [ ] Border does not obscure the starter sprite

---

### Test 2: Left Arrow Moves Selection
**Steps:**
1. After starter selection loads, press LEFT arrow once
2. Press LEFT arrow again
3. Press LEFT arrow a third time
4. Press LEFT arrow a fourth time

**Expected Result:**
- After 1st press: Selection moves from Embolt (0) to Thornwick (2) - WRAPS
- After 2nd press: Selection moves from Thornwick (2) to Aqualis (1)
- After 3rd press: Selection moves from Aqualis (1) to Embolt (0)
- After 4th press: Selection moves from Embolt (0) to Thornwick (2) - WRAPS AGAIN

**Pass Criteria:**
- [ ] Yellow border moves left with each press
- [ ] Selection wraps around from first to last
- [ ] Animation plays smoothly (scale 0.9→1.0)
- [ ] No lag or delay in response

---

### Test 3: Right Arrow Moves Selection
**Steps:**
1. Press ENTER to start new starter selection session
2. Press RIGHT arrow once
3. Press RIGHT arrow again
4. Press RIGHT arrow a third time
5. Press RIGHT arrow a fourth time

**Expected Result:**
- After 1st press: Selection moves from Embolt (0) to Aqualis (1)
- After 2nd press: Selection moves from Aqualis (1) to Thornwick (2)
- After 3rd press: Selection moves from Thornwick (2) to Embolt (0) - WRAPS
- After 4th press: Selection moves from Embolt (0) to Aqualis (1)

**Pass Criteria:**
- [ ] Yellow border moves right with each press
- [ ] Selection wraps around from last to first
- [ ] Animation plays smoothly
- [ ] Consistent response time

---

### Test 4: Combined Navigation (Left + Right)
**Steps:**
1. Start starter selection
2. Press RIGHT twice (should be at Thornwick)
3. Press LEFT once (should be at Aqualis)
4. Press RIGHT three times (should be at Aqualis again - full wrap)
5. Press LEFT twice (should be at Embolt)

**Expected Result:**
- Selection indicator follows navigation correctly
- Wrap-around works in both directions
- No selection index corruption

**Pass Criteria:**
- [ ] All navigation works as expected
- [ ] Position calculations are correct
- [ ] No visual glitches

---

### Test 5: Z Key Confirms Embolt Selection
**Steps:**
1. Start new game (press ENTER)
2. Don't press any arrow keys (stay on Embolt - index 0)
3. Press Z to confirm

**Expected Result:**
- Game transitions to Overworld
- Player appears in starter town
- Party screen should show Embolt as the starter
- Level 5 starter critter with initial moves
- Inventory: 5x Pokéballs, 3x Potions
- Money: $1000

**Pass Criteria:**
- [ ] No menu reload or scene loop
- [ ] Transition is smooth
- [ ] Correct starter in party
- [ ] Correct starting items and money

---

### Test 6: Z Key Confirms Aqualis Selection
**Steps:**
1. Start new game (press ENTER)
2. Press RIGHT arrow once to select Aqualis (index 1)
3. Press Z to confirm

**Expected Result:**
- Game transitions to Overworld
- Aqualis (blue water critter) should be in party
- Level 5 with water-type moves
- Same starting items

**Pass Criteria:**
- [ ] Correct starter species
- [ ] Type-appropriate moves
- [ ] Game starts successfully

---

### Test 7: Z Key Confirms Thornwick Selection
**Steps:**
1. Start new game (press ENTER)
2. Press RIGHT arrow twice to select Thornwick (index 2)
3. Press Z to confirm

**Expected Result:**
- Game transitions to Overworld
- Thornwick (green grass critter) should be in party
- Level 5 with grass-type moves
- Same starting items

**Pass Criteria:**
- [ ] Correct starter species
- [ ] Type-appropriate moves
- [ ] Game starts successfully

---

### Test 8: Multiple Selection Changes Before Confirm
**Steps:**
1. Start new game (press ENTER)
2. Press RIGHT (Aqualis)
3. Press RIGHT (Thornwick)
4. Press LEFT (Aqualis)
5. Press LEFT (Embolt)
6. Press RIGHT three times (full wrap back to Embolt)
7. Press Z to confirm

**Expected Result:**
- Final selection is Embolt (index 0)
- Game confirms with Embolt
- No state corruption from multiple presses

**Pass Criteria:**
- [ ] Selection tracking is accurate
- [ ] Correct final starter confirmed
- [ ] No animation lag from multiple tweens

---

### Test 9: No Regression - Main Menu Still Works
**Steps:**
1. Start game normally (no starter selection)
2. From main menu, press ESC to load a save game (if exists)
3. Or press ENTER and go through starter selection
4. Verify logo animation still works

**Expected Result:**
- Main menu functionality unchanged
- ESC loads game if save exists
- ENTER enters starter selection
- No broken references or errors

**Pass Criteria:**
- [ ] Menu navigation still responsive
- [ ] Load game functionality works
- [ ] No console errors

---

### Test 10: No Console Errors
**Steps:**
1. Open browser developer tools (F12)
2. Go to Console tab
3. Play through entire starter selection flow
4. Confirm selection and enter game

**Expected Result:**
- No red error messages
- No TypeScript errors
- Smooth console output

**Pass Criteria:**
- [ ] Console is clean
- [ ] No warnings about missing assets
- [ ] No animation errors

---

## Quick Pass/Fail Summary

### All Tests Pass If:
- [x] Visual indicator (yellow border) appears on load
- [x] LEFT arrow navigates left with wrap-around
- [x] RIGHT arrow navigates right with wrap-around
- [x] Z key confirms and starts game with correct starter
- [x] All three starters can be selected and confirmed
- [x] Multiple navigation changes work correctly
- [x] Game transitions smoothly to Overworld
- [x] No console errors
- [x] Main menu functionality unchanged
- [x] Selection indicator animates smoothly

## Notes
- The selection indicator is a yellow border (4px stroke)
- Animation duration is 100ms with Back.easeOut easing
- Wrap-around uses modulo arithmetic: `(index + 1) % 3` and `(index - 1 + 3) % 3`
- Starting critter is always level 5 with default moves for species
- Z key check only works during starter selection phase
