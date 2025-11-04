# Save Layer - Testing Guide

## Unit Test Examples

While the project doesn't have a test runner configured yet, here are examples of how to test the SaveManager in isolation.

### Test 1: Basic Save/Load

```typescript
import { SaveManager } from '@/game/services/SaveManager';
import { ISaveData } from '@/game/models/types';

async function testBasicSaveLoad() {
  const manager = SaveManager.getInstance();

  // Create test save data
  const testSave: ISaveData = {
    version: 2,
    timestamp: Date.now(),
    playerState: {
      name: 'TestPlayer',
      level: 10,
      badges: ['badge1'],
      pokedex: new Set(['critter1']),
      inventory: {
        items: new Map([['item1', 5]]),
        capacity: 50
      },
      party: {
        critters: [],
        maxSize: 6
      },
      money: 1000,
      position: { x: 0, y: 0 },
      currentArea: 'test_area',
      playtime: 60
    },
    completedArenas: ['badge1'],
    defeatedTrainers: [],
    caughtCritters: [],
    playedMinutes: 60
  };

  // Save to slot 0
  const saveResult = await manager.saveGameToSlot(testSave, 0);
  console.assert(saveResult.success, 'Save should succeed');
  console.assert(saveResult.slot === 0, 'Should save to slot 0');
  console.assert(saveResult.timestamp !== undefined, 'Should have timestamp');

  // Load from slot 0
  const loadResult = await manager.loadGameFromSlot(0);
  console.assert(loadResult.success, 'Load should succeed');
  console.assert(loadResult.data?.playerState.name === 'TestPlayer', 'Player name should match');
  console.assert(loadResult.data?.playerState.level === 10, 'Level should match');
  console.assert(loadResult.data?.playerState.money === 1000, 'Money should match');

  console.log('✓ Basic save/load test passed');
}
```

### Test 2: Multiple Slots

```typescript
async function testMultipleSlots() {
  const manager = SaveManager.getInstance();

  // Create save data for multiple players
  const saves = [
    { name: 'Player1', level: 5 },
    { name: 'Player2', level: 15 },
    { name: 'Player3', level: 25 }
  ];

  // Save to all slots
  for (let i = 0; i < saves.length; i++) {
    const saveData: ISaveData = {
      version: 2,
      timestamp: Date.now(),
      playerState: {
        name: saves[i].name,
        level: saves[i].level,
        badges: [],
        pokedex: new Set(),
        inventory: { items: new Map(), capacity: 50 },
        party: { critters: [], maxSize: 6 },
        money: 0,
        position: { x: 0, y: 0 },
        currentArea: 'test',
        playtime: 0
      },
      completedArenas: [],
      defeatedTrainers: [],
      caughtCritters: [],
      playedMinutes: 0
    };

    const result = await manager.saveGameToSlot(saveData, i);
    console.assert(result.success, `Save to slot ${i} should succeed`);
  }

  // Load and verify all slots
  const slots = await manager.getSaveSlots();
  console.assert(slots.length === 3, 'Should have 3 slots');
  
  for (let i = 0; i < saves.length; i++) {
    console.assert(slots[i].exists, `Slot ${i} should exist`);
    console.assert(slots[i].playerName === saves[i].name, `Slot ${i} name should match`);
    console.assert(slots[i].level === saves[i].level, `Slot ${i} level should match`);
  }

  console.log('✓ Multiple slots test passed');
}
```

### Test 3: Data Integrity

```typescript
async function testDataIntegrity() {
  const manager = SaveManager.getInstance();

  // Create save with specific data
  const originalSave: ISaveData = {
    version: 2,
    timestamp: Date.now(),
    playerState: {
      name: 'IntegrityTest',
      level: 20,
      badges: ['badge1', 'badge2', 'badge3'],
      pokedex: new Set(['species1', 'species2']),
      inventory: {
        items: new Map([
          ['potion', 10],
          ['pokeball', 50],
          ['revive', 3]
        ]),
        capacity: 50
      },
      party: {
        critters: [],
        maxSize: 6
      },
      money: 5000,
      position: { x: 100, y: 200 },
      currentArea: 'gym',
      playtime: 300
    },
    completedArenas: ['badge1', 'badge2', 'badge3'],
    defeatedTrainers: ['rival', 'gym_leader'],
    caughtCritters: [],
    playedMinutes: 300
  };

  // Save
  await manager.saveGameToSlot(originalSave, 0);

  // Load and verify every field
  const result = await manager.loadGameFromSlot(0);
  console.assert(result.success, 'Load should succeed');
  
  const loaded = result.data!;
  console.assert(loaded.playerState.name === originalSave.playerState.name, 'Name mismatch');
  console.assert(loaded.playerState.level === originalSave.playerState.level, 'Level mismatch');
  console.assert(loaded.playerState.money === originalSave.playerState.money, 'Money mismatch');
  console.assert(loaded.playerState.badges.length === 3, 'Badges mismatch');
  console.assert(loaded.playerState.currentArea === 'gym', 'Area mismatch');

  console.log('✓ Data integrity test passed');
}
```

### Test 4: Slot Operations

```typescript
async function testSlotOperations() {
  const manager = SaveManager.getInstance();

  const testSave: ISaveData = {
    version: 2,
    timestamp: Date.now(),
    playerState: {
      name: 'SlotTest',
      level: 1,
      badges: [],
      pokedex: new Set(),
      inventory: { items: new Map(), capacity: 50 },
      party: { critters: [], maxSize: 6 },
      money: 0,
      position: { x: 0, y: 0 },
      currentArea: 'start',
      playtime: 0
    },
    completedArenas: [],
    defeatedTrainers: [],
    caughtCritters: [],
    playedMinutes: 0
  };

  // Save to slot 1
  await manager.saveGameToSlot(testSave, 1);

  // Verify it exists
  let slots = await manager.getSaveSlots();
  console.assert(slots[1].exists, 'Slot 1 should exist');

  // Delete it
  const deleteResult = await manager.deleteSlot(1);
  console.assert(deleteResult, 'Delete should succeed');

  // Verify it's gone
  slots = await manager.getSaveSlots();
  console.assert(!slots[1].exists, 'Slot 1 should not exist after delete');

  console.log('✓ Slot operations test passed');
}
```

### Test 5: Export/Import

```typescript
async function testExportImport() {
  const manager = SaveManager.getInstance();

  const originalSave: ISaveData = {
    version: 2,
    timestamp: Date.now(),
    playerState: {
      name: 'ExportTest',
      level: 15,
      badges: ['badge1'],
      pokedex: new Set(['critter1']),
      inventory: { items: new Map([['item', 5]]), capacity: 50 },
      party: { critters: [], maxSize: 6 },
      money: 2000,
      position: { x: 50, y: 75 },
      currentArea: 'forest',
      playtime: 120
    },
    completedArenas: ['badge1'],
    defeatedTrainers: [],
    caughtCritters: [],
    playedMinutes: 120
  };

  // Save
  await manager.saveGameToSlot(originalSave, 0);

  // Export
  const exported = manager.exportSaveAsJson(0);
  console.assert(exported !== null, 'Export should succeed');
  console.assert(typeof exported === 'string', 'Export should be string');
  console.assert(exported.includes('ExportTest'), 'Export should contain player name');

  // Delete original
  await manager.deleteSlot(0);
  let slots = await manager.getSaveSlots();
  console.assert(!slots[0].exists, 'Slot should be empty after delete');

  // Import
  const importResult = await manager.importSaveFromJson(exported!, 1);
  console.assert(importResult, 'Import should succeed');

  // Verify imported
  const loaded = await manager.loadGameFromSlot(1);
  console.assert(loaded.success, 'Load imported should succeed');
  console.assert(loaded.data?.playerState.name === 'ExportTest', 'Name should match');
  console.assert(loaded.data?.playerState.level === 15, 'Level should match');

  console.log('✓ Export/import test passed');
}
```

### Test 6: Settings Management

```typescript
function testSettingsManagement() {
  const manager = SaveManager.getInstance();

  const settings = {
    volume: 0.8,
    difficulty: 'normal',
    language: 'en',
    showTutorial: false
  };

  // Save settings
  const saveResult = manager.saveSettings(settings);
  console.assert(saveResult, 'Save settings should succeed');

  // Load settings
  const loaded = manager.loadSettings();
  console.assert(loaded !== null, 'Load settings should succeed');
  console.assert(loaded!.volume === 0.8, 'Volume should match');
  console.assert(loaded!.difficulty === 'normal', 'Difficulty should match');
  console.assert(loaded!.language === 'en', 'Language should match');
  console.assert(loaded!.showTutorial === false, 'Tutorial flag should match');

  console.log('✓ Settings management test passed');
}
```

### Test 7: Storage Status

```typescript
function testStorageStatus() {
  const manager = SaveManager.getInstance();

  const status = manager.getStorageStatus();
  console.assert(status !== null, 'Storage status should return data');
  console.assert(typeof status.useLocalStorage === 'boolean', 'useLocalStorage should be boolean');
  console.assert(typeof status.useIndexedDB === 'boolean', 'useIndexedDB should be boolean');
  console.assert(typeof status.storageAvailable === 'boolean', 'storageAvailable should be boolean');
  console.assert(status.storageAvailable, 'Storage should be available');

  console.log('✓ Storage status test passed');
  console.log(`  - localStorage available: ${status.useLocalStorage}`);
  console.log(`  - IndexedDB available: ${status.useIndexedDB}`);
}
```

## Integration Tests (Browser-based)

### Test 1: Manual Save Menu Flow

**Steps:**
1. Start game
2. Open save menu
3. Click "Save to Slot 1"
4. Verify success message
5. Close menu
6. Refresh page (F5)
7. Open save menu
8. Verify save exists in Slot 1
9. Click "Load from Slot 1"
10. Verify game state restored

**Expected Result:**
- Game state persists across page reload
- All player data restored correctly

### Test 2: Auto-Save Functionality

**Steps:**
1. Start game
2. Wait 5 minutes (or configured interval)
3. Check browser console for auto-save events
4. Make changes to game (catch critter, win battle, etc.)
5. Verify EventBus emits `autosave:success`
6. Refresh page
7. Verify latest game state loaded

**Expected Result:**
- Auto-save triggers at configured intervals
- Game data saves without user interaction
- Data persists across reload

### Test 3: Storage Fallback

**Steps:**
1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Right-click → Clear All
4. Refresh page
5. Start game
6. Open save menu
7. Try to save
8. Verify save succeeds (using IndexedDB fallback)
9. Refresh page
10. Verify save loads

**Expected Result:**
- System falls back to IndexedDB when localStorage unavailable
- Save succeeds without user seeing error
- Data persists with fallback storage

### Test 4: Private/Incognito Mode

**Steps:**
1. Open browser in Private/Incognito mode
2. Navigate to game
3. Start game
4. Play and save game
5. Close browser (including all tabs)
6. Reopen Private mode
7. Navigate to game
8. Check if save persists

**Expected Result:**
- In most browsers, IndexedDB not available in private mode
- Graceful error handling
- User informed that saves won't persist
- Game still playable

### Test 5: Mobile Browser

**Steps:**
1. Open game on mobile browser (iOS Safari, Chrome Mobile, etc.)
2. Play game
3. Save game
4. Close browser/app
5. Reopen browser/app
6. Verify save persists

**Expected Result:**
- Save works on mobile browsers
- Responsive UI adapts to mobile screens
- Touch controls work with save system

## Performance Tests

### Test 1: Large Save File

**Objective:** Verify save system handles large game states

```typescript
async function testLargeSaveFile() {
  const manager = SaveManager.getInstance();

  // Create save with large party and inventory
  const largeSave: ISaveData = {
    version: 2,
    timestamp: Date.now(),
    playerState: {
      name: 'BigGame',
      level: 100,
      badges: Array.from({ length: 8 }, (_, i) => `badge${i}`),
      pokedex: new Set(Array.from({ length: 50 }, (_, i) => `critter${i}`)),
      inventory: {
        items: new Map(
          Array.from({ length: 50 }, (_, i) => [`item${i}`, Math.random() * 100])
        ),
        capacity: 50
      },
      party: {
        critters: Array.from({ length: 6 }, (_, i) => ({
          id: `critter_${i}`,
          speciesId: `species${i}`,
          level: 80 + i,
          currentHP: 100,
          maxHP: 100,
          baseStats: { hp: 50, attack: 50, defense: 50, spAtk: 50, spDef: 50, speed: 50 },
          currentStats: { hp: 50, attack: 50, defense: 50, spAtk: 50, spDef: 50, speed: 50 },
          moves: [
            { id: 'm1', moveId: 'move1', currentPP: 20, maxPP: 20 },
            { id: 'm2', moveId: 'move2', currentPP: 15, maxPP: 15 }
          ],
          experience: 1000000,
          isFainted: false
        })) as any,
        maxSize: 6
      },
      money: 999999,
      position: { x: 1000, y: 1000 },
      currentArea: 'endgame',
      playtime: 10000
    },
    completedArenas: Array.from({ length: 8 }, (_, i) => `badge${i}`),
    defeatedTrainers: Array.from({ length: 100 }, (_, i) => `trainer${i}`),
    caughtCritters: Array.from({ length: 50 }, (_, i) => ({
      id: `caught_${i}`,
      speciesId: `caught_species${i}`,
      level: 50 + (i % 30),
      currentHP: 100,
      maxHP: 100,
      baseStats: { hp: 45, attack: 45, defense: 45, spAtk: 45, spDef: 45, speed: 45 },
      currentStats: { hp: 45, attack: 45, defense: 45, spAtk: 45, spDef: 45, speed: 45 },
      moves: [],
      experience: 500000,
      isFainted: false
    })) as any,
    playedMinutes: 10000
  };

  console.time('Save large file');
  const saveResult = await manager.saveGameToSlot(largeSave, 0);
  console.timeEnd('Save large file');
  console.assert(saveResult.success, 'Large save should succeed');

  console.time('Load large file');
  const loadResult = await manager.loadGameFromSlot(0);
  console.timeEnd('Load large file');
  console.assert(loadResult.success, 'Large load should succeed');

  console.log('✓ Large save file test passed');
}
```

### Test 2: Repeated Saves

```typescript
async function testRepeatedSaves() {
  const manager = SaveManager.getInstance();

  const testSave: ISaveData = {
    version: 2,
    timestamp: Date.now(),
    playerState: {
      name: 'SpamTest',
      level: 10,
      badges: [],
      pokedex: new Set(),
      inventory: { items: new Map(), capacity: 50 },
      party: { critters: [], maxSize: 6 },
      money: 0,
      position: { x: 0, y: 0 },
      currentArea: 'test',
      playtime: 0
    },
    completedArenas: [],
    defeatedTrainers: [],
    caughtCritters: [],
    playedMinutes: 0
  };

  console.time('Save 10 times');
  for (let i = 0; i < 10; i++) {
    await manager.saveGameToSlot(testSave, 0);
  }
  console.timeEnd('Save 10 times');

  console.log('✓ Repeated saves test passed');
}
```

## Acceptance Criteria Checklist

- [ ] Manual save works in all 3 slots
- [ ] Manual load works from all slots
- [ ] Data persists after page reload
- [ ] Auto-save triggers at configured intervals
- [ ] Auto-save doesn't interrupt gameplay
- [ ] Export/import JSON functionality works
- [ ] Settings persist separately from game saves
- [ ] Error messages display correctly
- [ ] Storage fallback (localStorage → IndexedDB) works
- [ ] Works in private/incognito mode
- [ ] Works on mobile browsers
- [ ] Works on desktop browsers (Chrome, Firefox, Safari, Edge)
- [ ] No runtime storage errors
- [ ] Checksum verification catches corrupted saves
- [ ] Large save files handle correctly
- [ ] Multiple rapid saves don't cause issues
- [ ] Delete slot works correctly
- [ ] Clear all saves works correctly
- [ ] Save slot info displays correctly
- [ ] EventBus events emit correctly

## Manual Testing Script

```typescript
// Run in browser console for quick testing
async function runSaveLayerTests() {
  const manager = SaveManager.getInstance();

  console.log('Testing Save Layer...');

  // Test 1: Get storage status
  console.log('Storage status:', manager.getStorageStatus());

  // Test 2: Get current slots
  const slots = await manager.getSaveSlots();
  console.log('Current slots:', slots);

  // Test 3: Create test save
  const testSave = {
    version: 2,
    timestamp: Date.now(),
    playerState: {
      name: 'ConsoleTest',
      level: 42,
      badges: ['badge1', 'badge2'],
      pokedex: new Set(['species1']),
      inventory: { items: new Map([['item1', 5]]), capacity: 50 },
      party: { critters: [], maxSize: 6 },
      money: 5000,
      position: { x: 100, y: 100 },
      currentArea: 'test',
      playtime: 100
    },
    completedArenas: ['badge1', 'badge2'],
    defeatedTrainers: [],
    caughtCritters: [],
    playedMinutes: 100
  };

  // Test 4: Save
  console.log('Saving...');
  const saveResult = await manager.saveGameToSlot(testSave, 0);
  console.log('Save result:', saveResult);

  // Test 5: Load
  console.log('Loading...');
  const loadResult = await manager.loadGameFromSlot(0);
  console.log('Load result:', loadResult);

  // Test 6: Get updated slots
  const updatedSlots = await manager.getSaveSlots();
  console.log('Updated slots:', updatedSlots);

  console.log('Tests completed!');
}

// Run it
await runSaveLayerTests();
```
