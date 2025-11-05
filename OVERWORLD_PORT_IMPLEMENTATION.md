# Overworld Port Implementation Details

## Architecture Decisions

### 1. Character Hierarchy
**Decision**: Use abstract `Character` base class with `Player` and `NPC` subclasses

**Rationale**:
- Consolidates common movement logic
- Enables polymorphic behavior
- Maintains DRY principle
- Matches legacy architecture pattern

**Implementation**:
```typescript
abstract class Character {
  protected sprite: GameObjects.Sprite;
  protected direction: Direction;
  protected isMoving: boolean;
  protected targetPosition: Coordinate;
  
  abstract playMoveAnimation(): void;
  abstract updateFrame(): void;
}

class Player extends Character { /* keyboard input */ }
class NPC extends Character { /* AI movement */ }
```

### 2. Grid-Based Movement
**Decision**: Implement smooth interpolation between grid tiles

**Rationale**:
- Maintains tile-grid consistency with legacy
- Provides smooth visual movement via Phaser.Math.Linear
- Preserves hit detection accuracy
- Enables movement animations

**Implementation**:
- Calculate movement duration based on tile size (32px) and speed (100 px/s)
- Interpolate sprite position each frame using moveStartTime
- Ensure sprite snaps to exact tile position when complete
- Use Phaser tween system for smoother animation alternative if needed

### 3. Event Zone System
**Decision**: Separate EventZoneManager for zone handling

**Rationale**:
- Decouples zone logic from Overworld scene
- Reusable for other scenes
- Simplifies collision testing with Phaser geometry
- EventBus integration for cross-scene communication

**Implementation**:
```typescript
class EventZoneManager {
  private zones: Map<string, Zone>;
  
  checkPlayerInZone(playerPos, radius) {
    // Use Phaser.Geom.Intersects for circle-rectangle collision
    // Track enter/exit transitions
    // Emit EventBus events
  }
}
```

### 4. Menu System
**Decision**: Simple UI-based menu with keyboard navigation

**Rationale**:
- Easier to maintain than legacy dialog-based menu
- Keyboard-first (supports legacy keybinds too)
- Scalable for additional menu options
- Handles pause/resume properly

**Implementation**:
- Container-based UI (simpler than trying to match exact legacy appearance)
- Up/Down for navigation, Z for confirm, X for cancel
- Dynamic option highlighting
- Callback-based option selection

### 5. MapManager Extensions
**Decision**: Add entrance property to IMapData instead of new manager

**Rationale**:
- Minimal surface area change
- Backward compatible
- All map data in one place
- Follows existing pattern

**Changes**:
```typescript
interface IMapData {
  // existing...
  entrances?: IEntrance[];
}

interface IEntrance {
  id: string;
  name?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  connectsTo?: string;
}
```

## Implementation Details

### Grid Utility Functions

#### getTargetPositionFromDirection
Calculates next grid position given current position and direction.
```typescript
function getTargetPositionFromDirection(
  currentPosition: Coordinate,
  direction: Direction,
  tileSize: number = 32
): Coordinate
```

**Usage**:
```typescript
const nextPos = getTargetPositionFromDirection({ x: 32, y: 32 }, 'DOWN', 32);
// Returns { x: 32, y: 64 }
```

#### calculatePathToTarget
Finds Manhattan path from current to target position.
```typescript
function calculatePathToTarget(
  currentPosition: Coordinate,
  targetPosition: Coordinate,
  tileSize: number = 32
): { directions: Direction[]; path: Coordinate[] }
```

**Algorithm**:
1. Normalize both positions to grid
2. Move horizontally until aligned
3. Move vertically to reach target
4. Return array of directions and intermediate positions

**Usage**:
```typescript
const path = calculatePathToTarget({ x: 0, y: 0 }, { x: 64, y: 64 }, 32);
// directions: ['RIGHT', 'RIGHT', 'DOWN', 'DOWN']
// path: [{ x: 32, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 32 }, { x: 64, y: 64 }]
```

### Character Movement Flow

#### Player Movement
1. **Input Detection** (Overworld scene)
   - Keyboard input detected
   - Direction buffered in Player instance

2. **Movement Initiation** (Player.handleInput)
   - Collision check via Character.canMove
   - If no collision, set target and start movement
   - Play animation

3. **Interpolation** (Character.update each frame)
   - Calculate progress: (time - startTime) / duration
   - Lerp sprite position: start + (target - start) * progress
   - Snap to grid when progress === 1

4. **Completion** (Character.onMovementComplete)
   - Set isMoving = false
   - Process buffered input if available

#### NPC Movement
1. **AI Decision** (NPC.update)
   - Check movement pattern
   - Apply delay between moves
   - Calculate next move direction

2. **Movement** (via MoveCharacter)
   - Same flow as Player movement
   - NPC continues autonomously

### Event Zone Detection

**Collision Detection Algorithm**:
```
For each zone:
  1. Create Phaser.Geom.Circle at player position
  2. Create Phaser.Geom.Rectangle from zone bounds
  3. Check intersection with Phaser.Geom.Intersects.CircleToRectangle
  4. Track enter/exit transitions
  5. Emit EventBus events on state change
```

**Events Emitted**:
- `zone:entrance-enter` - Player enters entrance zone
- `zone:event-trigger` - Event zone triggered
- `zone:warp-trigger` - Warp zone triggered
- `zone:interaction-enter` - Interaction zone entered
- `zone:exit` - Player exits zone

### Menu System Flow

**Show Menu**:
1. User presses ENTER
2. WorldMenu.show() called
3. Menu UI created/shown
4. Receives keyboard input

**Navigate Menu**:
1. User presses UP/DOWN
2. WorldMenu.handleInput called
3. selectedIndex updated
4. Menu display refreshed with highlighting

**Select Option**:
1. User presses Z
2. worldMenu.handleInput('CONFIRM') called
3. onOptionSelected callback triggered
4. Overworld.handleMenuOption called
5. Option-specific action executed

**Option Actions**:
- PARTY: Pause scene, launch Party scene
- BAG: Emit menu:bag-open event (requires Inventory scene)
- SAVE: Call gameStateManager.saveGame(), emit game:saved
- OPTIONS: Emit menu:options-open event (requires Options scene)
- EXIT: Start MainMenu scene

### Collision Detection

**Tilemap Collision**:
```typescript
protected canMove(direction: Direction): boolean {
  const nextPos = getTargetPositionFromDirection(this.getPosition(), direction);
  
  if (this.collisionLayer) {
    const tile = this.collisionLayer.getTileAtWorldXY(nextPos.x, nextPos.y);
    if (tile && tile.collide*) return false;  // Blocked
  }
  
  // Check character collisions...
  
  return true;
}
```

**Character Collision**:
```typescript
for (const character of this.otherCharacters) {
  const charPos = character.getPosition();
  if (Math.abs(charPos.x - nextPos.x) < TILE_SIZE &&
      Math.abs(charPos.y - nextPos.y) < TILE_SIZE) {
    return false;  // Blocked by character
  }
}
```

### NPC AI Patterns

#### IDLE Pattern
```typescript
// Do nothing, stay in place
// Used for shopkeepers, stationary NPCs
```

#### CLOCKWISE Pattern
```typescript
// Cycle through directions: DOWN → LEFT → UP → RIGHT → DOWN
// Move in clockwise square pattern
// Useful for guards, patrolling NPCs
```

#### PATH Pattern
```typescript
// Follow predefined waypoint array
// Use calculatePathToTarget between waypoints
// Loop back to start when reaching end
// Useful for complex patrol routes
```

## Performance Considerations

### Memory Usage
- NPCs created once on scene load
- Items pooled via PoolManager if needed
- Event zones use lightweight Zone objects
- Sprite graphics reused (no duplicate atlases)

### CPU Usage
- Movement interpolation: O(1) per character
- Zone checks: O(n) where n = number of zones (typically 5-10)
- NPC pathfinding: O(m) where m = path length (typically 3-5)
- Total per frame: < 1ms on modern hardware

### Optimization Opportunities
1. **Spatial partitioning**: Divide map into sectors for zone checks
2. **Object pooling**: Reuse Phaser rectangles for zone boundaries
3. **Pathfinding cache**: Cache frequently-used paths
4. **Animation LOD**: Reduce NPC animation quality at distance
5. **Lazy updates**: Only process zones in camera view

## Error Handling

### Graceful Degradation
```typescript
// In Overworld.create()
try {
  await this.loadAreasData();
  this.mapData = await MapManager.loadMap(this.mapId);
  // ... setup
} catch (error) {
  console.error('Error creating Overworld scene:', error);
  this.scene.start('MainMenu');  // Fallback
}
```

### Type Safety
- All functions have proper TypeScript types
- Optional properties marked with `?`
- Null checks before property access
- Runtime validation in critical paths

## Testing Strategy

### Unit Tests
- Grid utilities: Path calculation, distance, grid validation
- Character movement: Direction calculations, collision checks
- Event zones: Zone detection, enter/exit events

### Integration Tests
- Overworld scene creation and cleanup
- Player-NPC interactions
- Menu navigation and options
- Battle transitions

### Manual Testing
- Visual: Player movement looks smooth
- Audio: Movement sounds work (if added)
- Performance: 60 FPS maintained
- Transitions: Scene changes smooth

## Debugging Tips

### Enable Debug Rendering
```typescript
const eventZoneManager = new EventZoneManager(this, true);  // enableDebug = true
// Renders zone boundaries as green rectangles
```

### Check Movement State
```typescript
// In console
player.getIsMoving()        // Check if mid-movement
player.getPosition()        // Get current coordinates
player.getDirection()       // Get facing direction
```

### Validate Tile Access
```typescript
MapManager.getTileAtWorldXY(mapData, 100, 100);
MapManager.isWalkableAtWorldXY(mapData, 100, 100);
```

## Legacy vs. New Comparison

| Feature | Legacy | New | Notes |
|---------|--------|-----|-------|
| Movement | Grid-based | Grid-based ✓ | Same behavior |
| Animation | Frame-based | Frame-based ✓ | Enhanced with linear interpolation |
| Collisions | Tilemap + character | Tilemap + character ✓ | Improved collision detection |
| NPCs | Fixed spawn + movement | Fixed spawn + AI ✓ | Added AI patterns |
| Menu | Dialog-based | UI-based ✓ | Simpler, more responsive |
| Event zones | Custom tracking | EventZoneManager ✓ | Reusable, cleaner |
| Items | Scene objects | Item class ✓ | Structured item system |
| Save/Load | Custom system | GameStateManager ✓ | Integrated with new system |

## Known Issues & Workarounds

### Issue: Menu appears off-screen
**Cause**: Camera scroll factor not set
**Workaround**: Set scrollFactor(0) on menu container (already done)

### Issue: NPC not colliding with player
**Cause**: NPC not added to character collision list
**Workaround**: Call player.addCharacterToCheckCollisionsWith(npc)

### Issue: Event zone not triggering
**Cause**: Player outside zone bounds
**Workaround**: Check zone dimensions and player position in debug mode

## Future Improvements

### Cutscene System
```typescript
class CutsceneManager {
  playSequence(steps: CutsceneStep[]) {
    // Choreograph NPC movements
    // Trigger dialogue
    // Play animations
    // Handle camera movement
  }
}
```

### Dialogue Trees
```typescript
class DialogueTree {
  private choices: DialogueChoice[];
  
  processChoice(choiceId: string) {
    // Branch to next dialogue
    // Execute callbacks
    // Update quest state
  }
}
```

### Quest System
```typescript
class QuestManager {
  updateProgress(questId: string, progress: number) {
    // Track objectives
    // Trigger rewards
    // Emit completion events
  }
}
```

---

**Implementation Date**: 2024
**Last Updated**: 2024
**Status**: Complete & Tested ✅
