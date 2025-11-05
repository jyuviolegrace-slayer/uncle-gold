# Overworld Core - Usage Examples

## Starting the Overworld

### From MainMenu Scene

```typescript
// In MainMenu.ts or any other scene
EventBus.emit('scene:start', {
  scene: 'Overworld',
  data: { mapId: 'starter-town' }
});

// Or directly
this.scene.start('Overworld', { mapId: 'starter-town' });
```

### Default Map

If no mapId is provided, defaults to 'starter-town'

```typescript
this.scene.start('Overworld');
```

## Adding a New Map

### 1. Create Map File

Create `/public/assets/maps/my-forest.json`:

```json
{
  "id": "my-forest",
  "name": "My Forest",
  "width": 16,
  "height": 16,
  "tileSize": 32,
  "backgroundTile": 5,
  "tiles": [
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
    5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
    5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
    5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
    5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
    5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
    5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
    5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
    5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
    5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
    5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
    5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
    5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
    5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5
  ],
  "collisions": {
    "5": true,
    "6": true
  },
  "grassTiles": [1],
  "playerSpawn": {
    "x": 8,
    "y": 8
  },
  "npcs": [
    {
      "id": "npc-forest-ranger",
      "name": "Forest Ranger",
      "x": 4,
      "y": 4,
      "dialogue": "Welcome to the forest! Be careful of wild critters!"
    }
  ],
  "trainers": []
}
```

### 2. Load the Map

```typescript
this.scene.start('Overworld', { mapId: 'my-forest' });
```

## Handling Encounters

### Listening for Battle Requests

```typescript
// In any scene
EventBus.on('battle:request', (data) => {
  console.log('Battle requested:', data);
  // data.encounterType: 'wild' or 'trainer'
  // data.wildCritter: Critter instance (wild only)
  // data.areaId: string
});
```

### Custom Encounter Handling

If you want to customize encounter behavior, modify EncounterSystem in Overworld:

```typescript
// In Overworld.ts setupEncounters()
this.encounterSystem = new EncounterSystem({
  encounterChance: 20,  // 20% instead of 30%
  stepsBeforeNextEncounter: 2,  // Need 2 tiles in grass
  debounceMs: 1000,  // Wait 1 second between encounters
});
```

## NPC Interactions

### Handling NPC Interactions

```typescript
EventBus.on('npc:interact', (data) => {
  console.log('NPC interacted:', data);
  // data.npcId: string
  // data.npcName: string
  // data.dialogue: string
});
```

### Creating Dialog System Integration

In a Dialog system or Modal:

```typescript
private setupDialogSystem() {
  EventBus.on('npc:interact', (data) => {
    this.showDialog({
      speaker: data.npcName,
      text: data.dialogue,
      onComplete: () => {
        // Dialog closed
      }
    });
  });
}
```

## Trainer Battles

### Handling Trainer Challenges

```typescript
EventBus.on('trainer:challenge', (data) => {
  console.log('Trainer challenged:', data);
  // data.trainerId: string (references trainer data)
  // data.trainerName: string
});
```

### Starting Trainer Battle

```typescript
private handleTrainerChallenge(data: any) {
  const trainer = this.getTrainerData(data.trainerId);
  this.scene.pause();
  this.scene.start('Battle', {
    encounterType: 'trainer',
    trainer,
    trainerId: data.trainerId,
  });
}
```

## Player Movement

### Programmatic Movement

```typescript
// Move player to specific location
if (this.player) {
  this.player.setPosition(targetX, targetY);
  this.playerController?.setSpeed(250);  // Increase speed
}

// Stop player
this.playerController?.stop();

// Check if moving
if (this.playerController?.isMoving()) {
  console.log('Player is moving');
}

// Get direction
const dir = this.playerController?.getDirection();
console.log('Player facing:', dir);  // 'up', 'down', 'left', 'right'
```

## Map Management

### Preloading Maps

```typescript
// In Preloader scene
async preloadMaps() {
  try {
    await MapManager.loadMap('starter-town');
    await MapManager.loadMap('starter-forest');
  } catch (error) {
    console.error('Failed to preload maps:', error);
  }
}
```

### Clearing Map Cache

```typescript
// Clear all cached maps (useful for memory management)
MapManager.clearCache();

// Then reload on demand
const map = await MapManager.loadMap('starter-town');
```

## Collision Testing

### Checking if Position is Walkable

```typescript
const isWalkable = MapManager.isWalkableAtWorldXY(
  this.mapData!,
  playerX,
  playerY
);

if (!isWalkable) {
  console.log('Cannot walk here!');
}
```

### Checking if Position is Grass

```typescript
const isGrass = MapManager.isGrassAtWorldXY(
  this.mapData!,
  playerX,
  playerY
);

if (isGrass) {
  console.log('Player in tall grass!');
}
```

## Camera Control

### Manual Camera Position

```typescript
// Override auto-follow temporarily
this.cameras.main.stopFollow();
this.cameras.main.pan(targetX, targetY, 500);

// Resume following player
this.cameras.main.startFollow(this.player);
```

## Touch Controls

### Enabling/Disabling Touch

```typescript
// Already enabled by default, but can disable
const controller = this.playerController;
// Touch is built-in to update()

// For mobile-specific UI
if (this.input.activePointer.isTouch) {
  console.log('Touch input detected');
}
```

## Scene Transitions

### Exiting to Menu

```typescript
this.scene.start('MainMenu');
```

### Switching Maps

```typescript
// Smooth transition between maps
this.scene.stop();
this.scene.start('Overworld', { mapId: 'new-map' });

// Or with effect
this.cameras.main.fadeOut(500, 0, 0, 0);
this.time.delayedCall(500, () => {
  this.scene.start('Overworld', { mapId: 'new-map' });
});
```

## Performance Tips

### Optimize Large Maps

```typescript
// Reduce encounter chance for large areas
this.encounterSystem = new EncounterSystem({
  encounterChance: 15,  // 15% instead of 30%
  debounceMs: 800,
});
```

### Memory Management

```typescript
// Clear unused maps to save memory
if (currentMap !== 'starter-town' && currentMap !== 'starter-forest') {
  MapManager.clearCache();
}
```

## Debugging

### Enable Collision Visualization

Currently, the MapRenderer has support for collision debug rendering:

```typescript
// In setupWorld() of Overworld.ts, modify:
MapRenderer.renderMap(this, this.mapData, { showCollisions: true });
```

### Log Player Position

```typescript
// In update()
console.log(
  `Player at: (${this.player?.x}, ${this.player?.y}), ` +
  `Direction: ${this.playerController?.getDirection()}`
);
```

### Test Encounter System

```typescript
// In setupEncounters()
this.encounterSystem = new EncounterSystem({
  encounterChance: 100,  // Always encounter (for testing)
  debounceMs: 100,
});
```

## Integration with Battle System

### Full Battle Flow

```typescript
// 1. Overworld detects encounter
// 2. EncounterSystem triggers wildCritter
// 3. EventBus emits 'battle:request'
// 4. Overworld pause() and starts Battle scene

// In Battle scene on completion:
EventBus.emit('battle:complete', {
  result: 'won',  // or 'lost', 'ran'
  wildCritter: battledCritter,
  playerXP: 150,
});

// Back in Overworld or Menu, listen:
EventBus.on('battle:complete', (data) => {
  if (data.result === 'won') {
    // Award items, XP, etc.
    gameStateManager.addMoney(100);
  }
  // Resume game
  this.scene.resume();
});
```

## Common Issues and Solutions

### Map Not Loading

```typescript
// Check console for errors
// Verify map file exists in /public/assets/maps/
// Check map ID matches filename (without .json extension)
// Verify map JSON is valid
```

### Collisions Not Working

```typescript
// Verify collision tile IDs in map JSON
// Check that collision group is created properly
// Ensure physics system is enabled
```

### Player Stuck

```typescript
// Check for overlapping collision bodies
// Verify player spawn point is not on collision tile
// Test movement on different areas
```

### Encounters Not Triggering

```typescript
// Verify area data exists in /public/assets/data/areas.json
// Check encounter chance is > 0
// Confirm grass tile IDs are correct in map
// Monitor debounce timer
```
