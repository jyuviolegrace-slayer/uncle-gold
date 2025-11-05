# Starter Selection UI - Critical Bug Fixes

## Issues Fixed

### 1. Arrow Keys Not Working
**Root Cause:** Incorrect Phaser keyboard event names
- **Wrong:** `'keydown-LEFT_ARROW'` and `'keydown-RIGHT_ARROW'`
- **Correct:** `'keydown-LEFT'` and `'keydown-RIGHT'`

Phaser 3 uses the key constant names without the "ARROW" suffix. The underscore-separated names like `KEY_LEFT_ARROW` are internal constants, but the event names use just `LEFT` and `RIGHT`.

**Fix Location:** Lines 62 and 69 in MainMenu.ts
```typescript
// BEFORE (broken):
this.input.keyboard?.on('keydown-LEFT_ARROW', () => {
    // ...
});
this.input.keyboard?.on('keydown-RIGHT_ARROW', () => {
    // ...
});

// AFTER (fixed):
this.input.keyboard?.on('keydown-LEFT', () => {
    // ...
});
this.input.keyboard?.on('keydown-RIGHT', () => {
    // ...
});
```

---

### 2. Z Key Not Working / Menu Reloading
**Root Cause:** Two issues:
1. Incorrect key name case: `'keydown-Z'` should be `'keydown-z'` (lowercase)
2. Missing guard against multiple rapid Z key presses causing scene issues

**Fix Location:** Lines 76-80 in MainMenu.ts

#### Fix 2A: Lowercase Z Key Name
```typescript
// BEFORE (broken):
this.input.keyboard?.on('keydown-Z', () => {
    if (this.starterChoosing) {
        this.selectStarter();
    }
});

// AFTER (fixed):
this.input.keyboard?.on('keydown-z', () => {
    if (this.starterChoosing && !this.isConfirming) {
        this.isConfirming = true;
        this.selectStarter();
    }
});
```

#### Fix 2B: Added Confirmation Guard
Added a new property to prevent double-confirmation:
```typescript
isConfirming: boolean = false;  // Line 18
```

This flag is checked before confirming:
- Set to `false` when entering starter selection (line 93)
- Set to `true` when Z key is pressed (line 78)
- Prevents `selectStarter()` from being called multiple times

---

## Complete Changes Summary

### Properties Added
```typescript
// Line 18
isConfirming: boolean = false;
```

### Keyboard Event Names Fixed
| Event | Before | After | Status |
|-------|--------|-------|--------|
| Left Arrow | `'keydown-LEFT_ARROW'` | `'keydown-LEFT'` | ✅ Fixed |
| Right Arrow | `'keydown-RIGHT_ARROW'` | `'keydown-RIGHT'` | ✅ Fixed |
| Z Key | `'keydown-Z'` | `'keydown-z'` | ✅ Fixed |

### Logic Improvements
| Change | Location | Effect |
|--------|----------|--------|
| Added `isConfirming` flag check | Line 77 | Prevents double confirmation |
| Set `isConfirming = true` on Z press | Line 78 | Guards against rapid key presses |
| Reset `isConfirming = false` on selection start | Line 93 | Allows next confirmation |

---

## Why This Works

### Arrow Keys
- Phaser 3 event names use base key names: `'keydown-LEFT'`, `'keydown-RIGHT'`
- The keyboard detection now correctly responds to arrow key presses
- Selection index updates with modulo wrap-around: `(index ± 1) % 3`
- `updateSelectionIndicator()` animates the selection box to the new position

### Z Key
- Phaser 3 key events are lowercase by default: `'keydown-z'`
- The confirmation guard (`!this.isConfirming`) prevents multiple simultaneous transitions
- Transition to Overworld now proceeds correctly without scene resets
- Flag is reset on next starter selection entry

---

## Testing the Fix

### Test 1: Arrow Keys Navigate Selection
1. Press ENTER on main menu
2. Press LEFT arrow → Should see yellow border move left (or wrap to rightmost)
3. Press RIGHT arrow → Should see yellow border move right (or wrap to leftmost)
4. Repeat multiple times → Selection should respond smoothly

### Test 2: Z Key Confirms Selection
1. Press ENTER on main menu
2. Press RIGHT arrow 1-2 times to select a different starter
3. Press Z key → Should transition smoothly to Overworld
4. Check party screen → Correct starter should be present

### Test 3: No Scene Loop
1. Complete Test 2
2. If game launches correctly to Overworld, the bug is fixed
3. Should NOT return to main menu or restart the scene

---

## Build Verification
✅ Build succeeds with `npm run build-nolog`
✅ No TypeScript errors
✅ All keyboard event handlers properly typed
✅ No console errors during compilation

---

## Files Modified
- `/src/game/scenes/MainMenu.ts` (3 key fixes + 1 property addition)
