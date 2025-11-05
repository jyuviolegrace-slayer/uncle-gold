# Critter Quest - Testing and QA Checklist

## Overview

This document outlines the testing procedures, acceptance criteria, and QA checklist for Critter Quest. It covers unit tests, integration tests, manual testing scenarios, and performance benchmarks.

## Table of Contents

1. [Unit Tests](#unit-tests)
2. [Integration Tests](#integration-tests)
3. [Manual Testing Scenarios](#manual-testing-scenarios)
4. [Performance Testing](#performance-testing)
5. [QA Checklist](#qa-checklist)
6. [Bug Tracking](#bug-tracking)

---

## Unit Tests

### Testing Framework

**Framework:** Jest with TypeScript support

### Manager Tests

#### AudioManager Tests
- ✅ Should initialize with default config
- ✅ Should play music with fade in
- ✅ Should stop music with fade out
- ✅ Should play SFX with pooling
- ✅ Should control volume independently (music/sfx/master)
- ✅ Should toggle mute on/off
- ✅ Should pause/resume all sounds
- ✅ Should handle missing audio keys gracefully

#### PoolManager Tests
- ✅ Should create pools with max size
- ✅ Should get objects from pool
- ✅ Should return objects to pool
- ✅ Should reuse inactive objects
- ✅ Should create new objects when pool exhausted
- ✅ Should track pool statistics

#### PerformanceMonitor Tests
- ✅ Should measure FPS correctly
- ✅ Should calculate frame time variance
- ✅ Should provide optimization suggestions
- ✅ Should track memory usage (if available)
- ✅ Should toggle debug display

### Model Tests

#### Critter Tests
- ✅ Should create with correct stats
- ✅ Should level up and increase stats
- ✅ Should learn moves at level up
- ✅ Should evolve when conditions met
- ✅ Should apply status effects
- ✅ Should calculate damage correctly

#### BattleManager Tests
- ✅ Should initialize battles correctly
- ✅ Should resolve type effectiveness
- ✅ Should calculate damage with modifiers
- ✅ Should distribute experience
- ✅ Should handle critter fainting
- ✅ Should catch wild critters with probability

#### ItemDatabase Tests
- ✅ Should retrieve items by ID
- ✅ Should provide shop items
- ✅ Should manage inventory
- ✅ Should track item quantities

#### SaveSystem Tests
- ✅ Should save game state to storage
- ✅ Should load game state from storage
- ✅ Should handle multiple save slots
- ✅ Should fallback to IndexedDB
- ✅ Should export/import save data
- ✅ Should auto-save on interval

---

## Integration Tests

### Scene Flow Tests

#### MainMenu → Overworld
```typescript
Test: Starter selection flow
1. Start game
2. Press ENTER to show starter selection
3. Select starter with arrows
4. Press Z to confirm
5. Verify Overworld scene starts with correct mapId
✅ Expected: Game transitions to Overworld 'starter-town' scene
```

#### Overworld → Battle
```typescript
Test: Random encounter initiation
1. Walk in grass area with wild critters
2. Wait for random encounter
3. Verify Battle scene launches
4. Verify opponent has valid critter
✅ Expected: Battle starts with wild critter UI
```

#### Battle Flow
```typescript
Test: Complete battle resolution
1. Use move in battle
2. Observe damage calculation and animation
3. Switch party member
4. Use item (Pokéball to catch)
5. End battle
✅ Expected: All actions resolve without errors
```

#### Party Management
```typescript
Test: Party and PC system
1. Open Menu → Party
2. View party members
3. Switch party composition
4. Store critter in PC
5. Retrieve from PC
✅ Expected: Party updates reflected in overworld/battles
```

### Audio Integration Tests
```typescript
Test: Music transitions
1. Start Overworld (music plays)
2. Enter Battle (crossfade to battle music)
3. Use menu (audio continues)
4. Return to Overworld (crossfade back)
✅ Expected: Smooth transitions without gaps or overlaps
```

### Save/Load Integration Tests
```typescript
Test: Save persistence
1. Catch multiple critters
2. Earn badges
3. Save game (Menu → Save)
4. Close and reload page
5. Press ESC to load (Main Menu)
✅ Expected: All progress restored
```

---

## Manual Testing Scenarios

### Scenario 1: First Playthrough (Starter to First Badge)
**Duration:** 15-20 minutes

1. **Main Menu**
   - [ ] Logo animates on start
   - [ ] Press ENTER → starter selection
   - [ ] Select all three starters (left/right arrows)
   - [ ] Confirm selection (Z key)

2. **Overworld Exploration**
   - [ ] Walk around starter-town
   - [ ] Verify collision detection works
   - [ ] Talk to NPCs (SPACE key)
   - [ ] Check HUD displays correct money/badges

3. **Wild Encounter**
   - [ ] Wait for random encounter in grass
   - [ ] Verify Battle scene starts
   - [ ] Observe opponent critter

4. **Battle Mechanics**
   - [ ] Select move and use it
   - [ ] Damage calculation displays correctly
   - [ ] Use item (Pokéball)
   - [ ] Catch critter if probability succeeds
   - [ ] Win/lose battle

5. **Post-Battle**
   - [ ] Experience distributed
   - [ ] New party member shown in HUD
   - [ ] Continue exploring for first trainer

### Scenario 2: Item Shop and Inventory
**Duration:** 5 minutes

1. **Access Shop** (Press S in Overworld)
   - [ ] Shop scene displays items
   - [ ] Money shown correctly
   - [ ] Navigate items with arrows

2. **Purchase Flow**
   - [ ] Select item
   - [ ] Purchase with Z
   - [ ] Verify money deducted
   - [ ] Item added to inventory
   - [ ] Insufficient funds message (if applicable)

3. **Use Item in Battle**
   - [ ] Enter battle
   - [ ] Use Bag action
   - [ ] Select potion
   - [ ] Heal active critter
   - [ ] Verify HP updated

### Scenario 3: Party Management
**Duration:** 5 minutes

1. **Open Party Menu** (Press P or Menu)
   - [ ] Display all critters in party
   - [ ] Show HP bars (color coded: green/yellow/red)
   - [ ] Display move count and levels

2. **PC Storage**
   - [ ] Store critter in PC
   - [ ] Withdraw critter
   - [ ] Switch party members
   - [ ] Verify max party size enforced (6)

3. **Critter Details**
   - [ ] View stats
   - [ ] View moves and PP
   - [ ] Check status effects
   - [ ] View type and abilities

### Scenario 4: Trainer Battles
**Duration:** 10 minutes

1. **Trainer Encounter**
   - [ ] Walk up to trainer
   - [ ] Interact (SPACE)
   - [ ] Verify trainer party displayed
   - [ ] Battle starts correctly

2. **Multi-Turn Battle**
   - [ ] Use strategic moves
   - [ ] Switch critters if needed
   - [ ] Use items
   - [ ] Defeat trainer

3. **Victory Rewards**
   - [ ] Money earned
   - [ ] Badge awarded (visual confirmation)
   - [ ] Experience distributed
   - [ ] Trainer marked as defeated

### Scenario 5: Performance Testing
**Duration:** Varies

1. **Frame Rate Monitoring** (Debug mode: Press D)
   - [ ] FPS ≥ 50 on mid-range device
   - [ ] No frame drops during battles
   - [ ] Smooth animations (tweens)
   - [ ] No stuttering on transitions

2. **Memory Usage**
   - [ ] Monitor via browser DevTools
   - [ ] Should not exceed 150MB
   - [ ] No memory leaks on long play sessions
   - [ ] Consistent after multiple scene transitions

3. **Load Times**
   - [ ] Game startup < 3 seconds
   - [ ] Scene transitions smooth
   - [ ] Asset loading progressive

---

## Performance Testing

### Benchmarks

#### FPS Target
- **Desktop (Chrome/Firefox/Safari):** ≥ 60 FPS
- **Mobile (iOS Safari/Chrome):** ≥ 50 FPS
- **Low-end devices (throttled):** ≥ 40 FPS

#### Memory Usage
- **Initial Load:** < 80 MB
- **After 30 min play:** < 120 MB
- **After 60 min play:** < 150 MB

#### Load Times
- **Initial Game Load:** < 3 seconds
- **Scene Transitions:** < 500 ms
- **Battle Start:** < 800 ms

### Throttling Simulation

**Chrome DevTools:**
1. Open DevTools (F12)
2. Performance → CPU Throttling → 6x slowdown
3. Play game normally
4. Verify still playable at reduced FPS

**Network Throttling:**
1. Network → Fast 3G
2. Preload assets offline (PWA)
3. Verify no connectivity issues

---

## QA Checklist

### Pre-Release

#### Code Quality
- [ ] All TypeScript errors resolved (`npm run build`)
- [ ] ESLint passes (`npm run lint`)
- [ ] No console errors during gameplay
- [ ] No memory leaks detected

#### Functionality
- [ ] All scenes connect properly
- [ ] No infinite loops or hangs
- [ ] Save/load works reliably
- [ ] All audio plays correctly
- [ ] Controls responsive (keyboard/touch)

#### Visual Polish
- [ ] Animations smooth and non-jarring
- [ ] UI text readable and centered
- [ ] Colors consistent with theme
- [ ] No missing assets or broken sprites

#### Performance
- [ ] FPS ≥ 50 on target hardware
- [ ] Memory < 150 MB after extended play
- [ ] No frame rate drops during battles
- [ ] Transitions smooth

#### Cross-Platform
- [ ] Desktop (Windows/Mac/Linux):
  - [ ] Chrome ✅
  - [ ] Firefox ✅
  - [ ] Safari ✅
- [ ] Mobile (iOS/Android):
  - [ ] Touch controls work
  - [ ] Landscape orientation supported
  - [ ] Safe area respected
  - [ ] Virtual D-pad responsive

#### PWA Features
- [ ] Installable on home screen
- [ ] Offline playable
- [ ] Service worker caches assets
- [ ] Manifest valid

#### Accessibility
- [ ] Text readable (≥ 14px)
- [ ] Color contrast sufficient
- [ ] Keyboard controls complete
- [ ] Touch targets ≥ 48px

### Post-Release Monitoring

#### User Feedback
- [ ] Monitor for crash reports
- [ ] Track common issues
- [ ] Performance complaints
- [ ] Control issues on devices

#### Analytics (If Enabled)
- [ ] Play session duration
- [ ] Progression checkpoints
- [ ] Device/browser distribution
- [ ] Error tracking

---

## Bug Tracking

### Bug Report Template

```
**Title:** [Clear, concise description]

**Severity:** Critical | High | Medium | Low

**Environment:**
- Device: Desktop/Mobile
- Browser: Chrome/Firefox/Safari
- OS: Windows/Mac/Linux/iOS/Android

**Steps to Reproduce:**
1. ...
2. ...
3. ...

**Expected Behavior:**
...

**Actual Behavior:**
...

**Screenshots/Video:**
(If applicable)

**Logs:**
Console errors (F12 → Console tab)
```

### Known Issues

(To be updated during testing)

---

## Test Automation

### Unit Tests (Jest)

Run all unit tests:
```bash
npm test
```

Run specific test suite:
```bash
npm test -- AudioManager
```

Run with coverage:
```bash
npm test -- --coverage
```

### Integration Tests (Playwright/Cypress)

Install Playwright:
```bash
npm install --save-dev @playwright/test
```

Run tests:
```bash
npx playwright test
```

Example test (saves/loads game):
```typescript
test('Save and load game', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForFunction(() => window.phaserGame !== undefined);
  
  // Create starter
  await page.keyboard.press('Enter');
  await page.keyboard.press('z');
  
  // Wait for Overworld
  await page.waitForTimeout(1000);
  
  // Save game
  await page.keyboard.press('m'); // Open menu
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter'); // Save game
  
  // Reload
  await page.reload();
  
  // Load game
  await page.keyboard.press('Escape'); // Load
  
  // Verify game loaded
  const isLoaded = await page.evaluate(() => {
    const game = window.phaserGame;
    return game?.scene?.isActive('Overworld');
  });
  
  expect(isLoaded).toBe(true);
});
```

---

## Performance Profiling

### Using Phaser Debug

Press `D` key in-game to toggle debug overlay:
- FPS counter
- Frame time
- Object count
- Memory usage

### Using Chrome DevTools

1. **Performance Tab:**
   - Click Record
   - Play for 10-15 seconds
   - Click Stop
   - Analyze flame graph

2. **Memory Tab:**
   - Take heap snapshots
   - Compare before/after scenes
   - Check for retained objects

3. **Lighthouse:**
   - Generate report
   - Check performance score
   - Review recommendations

---

## Sign-Off

### QA Approval

- [ ] All tests passing
- [ ] No critical bugs
- [ ] Performance meets targets
- [ ] Cross-platform verified
- [ ] Documentation complete

**Tested by:** ________________  
**Date:** ________________  
**Sign-off:** ________________

---

## Appendix: Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run build-nolog     # Build without telemetry

# Testing
npm test                # Run unit tests
npm test -- --watch     # Watch mode
npm test -- --coverage  # Coverage report

# Code Quality
npm run lint            # ESLint check
npm run lint-fix        # Auto-fix issues

# Performance
npm run profile         # Generate profile data
npm run analyze         # Bundle analysis
```

---

**Last Updated:** November 5, 2024  
**Version:** 1.0
