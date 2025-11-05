# Z Key Issue - Debugging Guide

## Current Status
✅ Arrow keys are now working correctly
❌ Z key still not responding / not transitioning to Overworld

## Added Comprehensive Logging

To help diagnose the issue, we've added detailed console logging at every step:

### Z Key Handler Logs (Line 76-85)
```typescript
this.input.keyboard?.on('keydown-z', () => {
    console.log('Z key pressed. starterChoosing:', this.starterChoosing, 'isConfirming:', this.isConfirming);
    if (this.starterChoosing && !this.isConfirming) {
        console.log('Z key confirmed - calling selectStarter()');
        // ... proceed with selection
    } else {
        console.log('Z key ignored - conditions not met');
    }
});
```

### selectStarter() Logs (Line 155-189)
```typescript
private selectStarter()
{
    try {
        console.log('Selected starter:', starterId, 'at index', this.selectedStarterIndex);
        console.log('GameStateManager created');
        console.log('SceneContext initialized');
        console.log('Critter created:', starterCritter.speciesId);
        console.log('Critter added to party');
        console.log('Money added');
        console.log('Starting items added');
        console.log('Starting Overworld scene...');
        this.scene.start('Overworld', { mapId: 'starter-town' });
        console.log('Scene started successfully');
    } catch (error) {
        console.error('Error in selectStarter:', error);
        this.isConfirming = false;
    }
}
```

## How to Debug

### Step 1: Open Developer Console
1. Press **F12** to open Developer Tools
2. Go to the **Console** tab
3. Make sure "All messages" are visible (not just Errors)

### Step 2: Check Z Key Events
1. Press ENTER to enter starter selection
2. Press the **Z** key once
3. **Look for console logs**:
   - If you see `"Z key pressed. starterChoosing: true, isConfirming: false"` → Z key IS being detected
   - If you see `"Z key ignored - conditions not met"` → Check the flags (starterChoosing or isConfirming issue)
   - If you see NOTHING → Z key event is NOT being registered

### Step 3: Check selectStarter() Execution
If the Z key logs appear, look for selectStarter() logs:
1. `"Selected starter: embolt at index 0"` → Starter ID retrieved
2. `"GameStateManager created"` → GameStateManager instantiated
3. `"SceneContext initialized"` → Context setup successful
4. `"Critter created: embolt"` → Critter instantiated
5. `"Critter added to party"` → Party system working
6. `"Money added"` → Money system working
7. `"Starting items added"` → Item system working
8. `"Starting Overworld scene..."` → About to transition
9. `"Scene started successfully"` → Transition complete (if you see this, transition worked!)

### Step 4: Check for Errors
Look for red error messages like:
- `"Error in selectStarter: ..."` → Something failed inside selectStarter()
- Any stack traces

## Possible Issues and Solutions

### Scenario A: Z Key Not Detected At All
**Console shows:** Nothing when pressing Z

**Possible causes:**
1. Keyboard input not initialized
2. Z key is bound to something else in browser
3. Scene input is disabled

**Solutions to try:**
1. Try pressing ENTER again to re-enter selection mode
2. Try pressing other keys (LEFT, RIGHT) to confirm keyboard works
3. Check browser console for any errors during scene load

### Scenario B: Z Key Detected But selectStarter() Not Called
**Console shows:** `"Z key pressed..."` but NOT `"Z key confirmed - calling selectStarter()"`

**Possible causes:**
1. `starterChoosing === false` (not in starter selection mode)
2. `isConfirming === true` (already confirming, guard prevented re-entry)
3. Both conditions failed

**Solutions to try:**
1. Check the logged values: `starterChoosing: ___` and `isConfirming: ___`
2. If `isConfirming: true` and stuck, refresh the page
3. If `starterChoosing: false`, the selection screen didn't activate properly

### Scenario C: selectStarter() Called But Fails Mid-Process
**Console shows:** selectStarter logs stop at some point with no error

**Possible causes:**
1. GameStateManager or SceneContext initialization failed silently
2. Critter creation failed
3. Party system failed
4. Scene transition failed

**Solutions to try:**
1. Note which log appears last
2. Check if error logs appear below
3. Look for any red error messages in the next few lines

### Scenario D: selectStarter() Completes But No Transition
**Console shows:** `"Scene started successfully"` but still on menu

**Possible causes:**
1. Overworld scene doesn't exist or failed to load
2. Scene transition is queued but delayed
3. Overworld scene has initialization error

**Solutions to try:**
1. Wait 2-3 seconds (scene might be loading)
2. Check if Overworld scene shows up in Phaser's scene list
3. Look for errors specifically from Overworld scene

## Console Log Checklist

After pressing Z, look for these console messages:

```
✓ "Z key pressed. starterChoosing: true, isConfirming: false"
✓ "Z key confirmed - calling selectStarter()"
✓ "Selected starter: [critter-id] at index [0-2]"
✓ "GameStateManager created"
✓ "SceneContext initialized"
✓ "Critter created: [critter-id]"
✓ "Critter added to party"
✓ "Money added"
✓ "Starting items added"
✓ "Starting Overworld scene..."
✓ "Scene started successfully"
✓ [Game transitions to Overworld]
```

If ANY of these are missing, that's where the issue is.

## Testing Instructions

1. **Build the project:** `npm run build-nolog`
2. **Start dev server:** `npm run dev`
3. **Open http://localhost:3000 in Chrome/Firefox**
4. **Open DevTools (F12) → Console tab**
5. **Press ENTER** to enter starter selection
6. **Press LEFT/RIGHT** a few times to verify they work
7. **Press Z key** and watch the console
8. **Report what console logs you see** (or screenshot the console)

## Expected Console Output Examples

### Example 1: Successful Selection (What Should Happen)
```
Z key pressed. starterChoosing: true, isConfirming: false
Z key confirmed - calling selectStarter()
Selected starter: embolt at index 0
GameStateManager created
SceneContext initialized
Critter created: embolt
Critter added to party
Money added
Starting items added
Starting Overworld scene...
[Page transitions to Overworld scene]
Scene started successfully
```

### Example 2: Guard Prevented Action (isConfirming Flag)
```
Z key pressed. starterChoosing: true, isConfirming: true
Z key ignored - conditions not met
```
**Cause:** Already confirming, guard is working correctly. This happens if Z is pressed multiple times rapidly.

### Example 3: Not in Selection Mode
```
Z key pressed. starterChoosing: false, isConfirming: false
Z key ignored - conditions not met
```
**Cause:** User pressed Z before entering starter selection.

## If Still Having Issues

Please provide:
1. **Screenshot of console after pressing Z**
2. **The exact text of console messages you see**
3. **Any red error messages**
4. **Which console log appears last before it stops**

This will help identify exactly where the issue is occurring.
