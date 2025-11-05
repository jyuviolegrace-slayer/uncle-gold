# EventBus Integration Documentation

## Overview

This document describes the EventBus events and manager interactions that integrate the ported gameplay systems with modern managers and React components.

## EventBus Events

### Save/Load Events
- `game:saved { slot, timestamp }` - Game successfully saved to slot
- `game:loaded { slot, playerName }` - Game loaded from slot
- `game:saveFailed { slot, error }` - Save operation failed
- `game:loadFailed { slot, error }` - Load operation failed
- `game:deleted { slot }` - Save slot deleted
- `autosave:success { slot }` - Auto-save completed successfully
- `autosave:failed { error }` - Auto-save failed
- `storage:unavailable { message }` - Storage system unavailable
- `save:notification { type, message }` - Save-related notification for UI

### Battle Events
- `battle:start { isWildEncounter }` - Battle started
- `battle:ended { outcome }` - Battle ended
- `battle:victory { totalExp }` - Battle won
- `battle:defeat {}` - Battle lost
- `battle:turn-complete { attacker, defender, damage, moveId }` - Turn completed
- `battle:capture-attempt { critterId, success }` - Capture attempt made
- `battle:level-up { critterId, newLevel }` - Critter leveled up

### Party/Inventory Events
- `party:updated { party }` - Party composition changed
- `party:full {}` - Party is full
- `party:switch { fromIndex, toIndex }` - Party members switched
- `inventory:updated { inventory }` - Inventory changed
- `inventory:full {}` - Inventory is full
- `inventory:use { itemId, targetId }` - Item used

### Progression Events
- `badge:earned { badgeId, totalBadges }` - Badge earned
- `pokedex:updated { entries }` - Pokedex updated
- `money:updated { money }` - Money amount changed
- `area:changed { fromArea, toArea }` - Player moved to new area
- `level:up { critterId, newLevel }` - Critter reached new level
- `evolution:start { critterId, speciesId }` - Evolution started
- `evolution:complete { critterId, newSpeciesId }` - Evolution completed

### Dialogue and Cutscene Events
- `dialog:open { text, speaker, options }` - Dialogue opened
- `dialog:close { choice }` - Dialogue closed
- `dialog:choice { optionIndex }` - Dialogue option selected
- `cutscene:start { cutsceneId }` - Cutscene started
- `cutscene:end { cutsceneId }` - Cutscene ended
- `cutscene:skip { cutsceneId }` - Cutscene skipped

### Menu and UI Events
- `menu:open { menuType }` - Menu opened
- `menu:close { menuType }` - Menu closed
- `menu:select { option }` - Menu option selected
- `options:changed { option, value }` - Game option changed
- `hud:show { component }` - HUD component shown
- `hud:hide { component }` - HUD component hidden

### World Events
- `encounter:start { area, encounterType }` - Encounter started
- `encounter:end { result }` - Encounter ended
- `npc:interact { npcId, npcName }` - NPC interaction
- `item:collected { itemId, quantity }` - Item collected
- `warp:start { destination }` - Warp started
- `warp:complete { destination }` - Warp completed

### Audio Events
- `audio:play { key, type }` - Audio playback started
- `audio:stop { key }` - Audio playback stopped
- `audio:volume-changed { type, volume }` - Volume changed
- `audio:mute-changed { isMuted }` - Mute state changed

### Performance Events
- `performance:updated { fps, frameTime, memoryUsage }` - Performance metrics updated
- `performance:warning { message }` - Performance warning
- `toggle-debug` - Toggle debug display

### Notification Events
- `notification:show { message, type, duration }` - Show notification
- `notification:hide { notificationId }` - Hide notification
- `toast:show { message, type }` - Show toast message

## SceneContext Integration

### Available Managers
- `SaveManager` - Handles save/load operations with notifications
- `LegacyDataManager` - Manages legacy game state
- `AudioManager` - Controls music and SFX playback
- `PoolManager` - Manages object pooling for performance
- `PerformanceMonitor` - Tracks performance metrics

### Usage Pattern
```typescript
const sceneContext = SceneContext.getInstance();

// Get manager
const audioManager = sceneContext.getAudioManager();
const saveManager = sceneContext.getSaveManager();

// Set manager (if creating new)
sceneContext.setAudioManager(new AudioManager(scene));
sceneContext.setSaveManager(new SaveManager());
```

## React Component Integration

### HUD Component
Handles:
- Money and badge display updates
- Party status changes
- Area change notifications
- Battle start/end notifications
- Level up notifications
- Item collection notifications
- Save notifications
- Menu state tracking

### MobileControls Component
Handles:
- Touch input routing to keyboard events
- Menu button press events
- Directional movement input

## Manager Integration Points

### AudioManager
- Used in Battle scene for music/SFX
- Available via SceneContext for all scenes
- Emits audio events for UI feedback

### PoolManager
- Used in Battle scene for damage numbers and effects
- Available via SceneContext for performance optimization
- Manages object lifecycle for better performance

### PerformanceMonitor
- Tracks FPS, frame time, and memory usage
- Emits performance events for debugging
- Available via SceneContext for all scenes

### SaveManager
- Handles manual and auto-save operations
- Emits save notifications for UI feedback
- Integrates with both localStorage and IndexedDB

## Event Flow Examples

### Battle Start
1. Overworld triggers encounter
2. `encounter:start` event emitted
3. Battle scene starts
4. `battle:start` event emitted
5. HUD shows battle notification

### Level Up
1. Battle awards experience
2. `level:up` event emitted
3. HUD shows level up notification
4. GameStateManager updates critter data

### Save Game
1. Player initiates save
2. SaveManager processes save
3. `game:saved` event emitted
4. `save:notification` event emitted
5. HUD shows save notification

## Performance Considerations

- All managers use object pooling where applicable
- Event emissions are batched to avoid spam
- Performance monitoring tracks real-time metrics
- Audio uses pooling for simultaneous sounds
- Save operations are async and non-blocking

## Debugging

- Use `toggle-debug` event to show performance overlay
- Check browser console for event logs
- Monitor Network tab for asset caching
- Use React DevTools for component state

## Future Enhancements

- Add more granular audio events
- Implement cutscene event system
- Add achievement events
- Expand notification types
- Add analytics events