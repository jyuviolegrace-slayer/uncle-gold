# Legacy Port Plan - Managers Bridge Integration

## Overview

This document describes the integration of ported gameplay systems with modern managers, React bridge, and PWA basics to ensure all systems work together cohesively.

## Integration Status

### ✅ Completed

#### SceneContext Enhancement
- Extended SceneContext to provide access to all modern managers
- Added SaveManager, LegacyDataManager, AudioManager, PoolManager, PerformanceMonitor
- Implemented consistent dependency injection pattern
- All scenes now use shared manager instances

#### EventBus Expansion
- Added comprehensive event catalog covering all gameplay systems
- Included legacy events: dialog, cutscene, options, notifications
- Added battle events: turn-complete, capture-attempt, level-up
- Added world events: area-changed, encounter, npc-interact, item-collected
- Added audio events for manager integration

#### React HUD Integration
- Enhanced HUD to handle new event types
- Added notification system with toast messages
- Added area change display
- Added battle state notifications
- Added save notifications
- Added menu state tracking

#### React Mobile Controls Integration
- Updated menu button to emit proper menu events
- Maintained keyboard event routing for touch input

#### Battle Scene Integration
- Integrated with SceneContext managers
- Added turn completion events
- Added capture attempt events
- Added level up events
- Proper manager cleanup and sharing

#### Overworld Scene Integration
- Integrated with SceneContext managers
- Added encounter start events
- Added area change events
- Added NPC interaction events
- Added item collection events
- Comprehensive event cleanup

#### SaveManager Notifications
- Added save success notifications
- Added save failure notifications
- Added auto-save notifications
- Integrated with EventBus for UI feedback

#### PWA Service Worker
- Updated cache list with new asset directories
- Added data files to precache
- Added map files to precache
- Ensured offline readiness

#### Documentation
- Created comprehensive EventBus integration guide
- Documented all event types and flows
- Added usage examples and patterns
- Included performance considerations

## Manager Integration Details

### AudioManager
- **Integration**: SceneContext + Battle Scene
- **Features**: Crossfading, pooling, volume control
- **Events**: audio:play, audio:stop, audio:volume-changed, audio:mute-changed
- **Usage**: Shared across scenes for consistent audio experience

### PoolManager
- **Integration**: SceneContext + Battle Scene
- **Features**: Object pooling for damage numbers, effects
- **Performance**: Reduces garbage collection, improves FPS
- **Usage**: Available for all scenes to pool transient objects

### PerformanceMonitor
- **Integration**: SceneContext + All Scenes
- **Features**: FPS tracking, frame time analysis, memory monitoring
- **Events**: performance:updated, performance:warning, toggle-debug
- **Usage**: Real-time performance optimization feedback

### SaveManager
- **Integration**: SceneContext + React Components
- **Features**: Multi-slot saves, auto-save, compression, IndexedDB fallback
- **Events**: game:saved, game:saveFailed, autosave:success, save:notification
- **Usage**: Persistent game state with user notifications

### LegacyDataManager
- **Integration**: SceneContext only
- **Features**: Legacy data compatibility, migration utilities
- **Purpose**: Bridge between old and new data formats
- **Usage**: Maintains backward compatibility

## Event Flow Architecture

### User Action → Event → Manager → UI Update
1. User performs action (e.g., saves game)
2. Scene emits appropriate event
3. Manager processes action
4. Manager emits result event
5. React components update UI
6. Notification shown to user

### Example: Save Game Flow
```
User: Presses save key
Scene: Calls SaveManager.saveGame()
Manager: Processes save, emits game:saved
EventBus: Routes game:saved + save:notification
HUD: Shows "Game saved!" notification
UI: Updates save slot display
```

## React Bridge Integration

### HUD Component Events
- **money:updated** → Update money display
- **badge:earned** → Update badge count + notification
- **party:updated** → Update party panel
- **area:changed** → Update location + notification
- **battle:start** → Show battle notification
- **battle:victory/defeat** → Show result notification
- **level:up** → Show level up notification
- **item:collected** → Show item notification
- **save:notification** → Show save notification
- **menu:open/close** → Update menu state

### MobileControls Component Events
- **menu:open** → Pause button emits menu event
- **Touch events** → Converted to keyboard events
- **Direction input** → Routed to game input system

## Performance Optimizations

### Object Pooling
- Damage numbers pooled in Battle scene
- Particle effects pooled for visual effects
- Reduces object creation/destruction overhead

### Audio Management
- Sound instances pooled for simultaneous playback
- Crossfading reduces audio glitches
- Volume management prevents audio spam

### Performance Monitoring
- Real-time FPS tracking
- Frame time variance analysis
- Memory usage monitoring
- Debug overlay for optimization

### Event System
- Efficient event routing
- Minimal event listener overhead
- Proper cleanup prevents memory leaks

## PWA Integration

### Service Worker Updates
- Precached critical assets
- Added data files to cache
- Added map files to cache
- Ensured offline functionality

### Asset Management
- All game assets cached for offline play
- Data files available immediately
- Maps load without network dependency

## Testing Checklist

### ✅ Manager Integration
- [x] All scenes use SceneContext managers
- [x] Managers shared across scenes properly
- [x] No ad-hoc localStorage usage
- [x] No raw audio playback

### ✅ React Bridge
- [x] HUD responds to all game events
- [x] Mobile controls route input correctly
- [x] Notifications display properly
- [x] No console errors in React components

### ✅ Save System
- [x] Manual saves trigger notifications
- [x] Auto-saves trigger notifications
- [x] Save failures show error messages
- [x] Settings persist properly

### ✅ Performance
- [x] Object pooling active in battle
- [x] Performance monitor tracking metrics
- [x] Audio manager pooling sounds
- [x] Debug overlay toggleable

### ✅ PWA
- [x] Service worker caches new assets
- [x] Game works offline
- [x] All critical files cached
- [x] Cache version updated

## Acceptance Criteria Status

### ✅ All ported code paths rely on modern managers
- No ad-hoc localStorage usage
- No raw audio playback
- All scenes use SceneContext managers
- Proper dependency injection

### ✅ React HUD/mobile controls reflect legacy feature set
- All legacy events have React handlers
- Notifications display for all game actions
- Touch input properly routed
- No console errors

### ✅ Autosave and manual save trigger React notifications
- Save success notifications shown
- Save failure notifications shown
- Auto-save notifications shown
- Settings changes propagate

### ✅ Updated documentation
- EventBus API documented
- Manager interactions documented
- Usage examples provided
- Performance considerations noted

### ✅ Build passes
- `npm run build-nolog` succeeds
- `npm run lint` succeeds
- `npx tsc --noEmit` succeeds
- All TypeScript errors resolved

## Future Work

### Short Term
- Add more granular audio events
- Implement cutscene system events
- Add achievement events
- Expand notification types

### Long Term
- Analytics integration
- Cloud save support
- Multi-language support
- Accessibility improvements

## Conclusion

The managers bridge integration successfully connects all ported gameplay systems with modern management infrastructure and React components. The EventBus provides a clean separation of concerns, while SceneContext ensures consistent manager access across all scenes. The React bridge provides responsive UI feedback for all game actions, and the PWA integration ensures reliable offline performance.

All acceptance criteria have been met, and the system is ready for production use.