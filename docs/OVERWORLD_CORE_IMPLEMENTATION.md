# Overworld Core Implementation

## Overview

The Overworld Core system provides a complete top-down exploration experience with tilemap rendering, player movement, collision detection, random encounter triggers, and NPC/trainer interactions.

## Architecture

### Core Components

1. **MapManager** (`src/game/managers/MapManager.ts`)
   - Loads map data from JSON files
   - Provides tile lookup and collision detection
   - Caches loaded maps for performance

2. **MapRenderer** (`src/game/managers/MapRenderer.ts`)
   - Renders tilemap data as visual sprites
   - Creates collision bodies for collision tiles
   - Supports debug visualization

3. **PlayerController** (`src/game/managers/PlayerController.ts`)
   - Handles keyboard input (arrows, WASD)
   - Supports touch input for mobile
   - Manages player movement and direction

4. **EncounterSystem** (`src/game/managers/EncounterSystem.ts`)
   - Detects grass tile overlaps
   - Triggers random wild battles (~30% chance)
   - Debounces encounters to prevent spam

5. **Overworld Scene** (`src/game/scenes/Overworld.ts`)
   - Coordinates all overworld components
   - Manages NPC and trainer spawns
   - Handles interactions and battle transitions

## Map Format

Maps are stored as JSON files in `/public/assets/maps/`.

### Map Structure

```json
{
  "id": "starter-town",
  "name": "Starter Town",
  "width": 20,
  "height": 15,
  "tileSize": 32,
  "backgroundTile": 1,
  "tiles": [/* array of tile IDs, row-major order */],
  "collisions": {
    "2": true,
    "3": true
  },
  "grassTiles": [1],
  "playerSpawn": {"x": 10, "y": 7},
  "npcs": [
    {
      "id": "npc-1",
      "name": "Elder",
      "x": 3,
      "y": 3,
      "dialogue": "Welcome to Starter Town!"
    }
  ],
  "trainers": [
    {
      "id": "trainer-npc-1",
      "name": "Youngster Joey",
      "x": 8,
      "y": 10,
      "trainerId": "trainer-1"
    }
  ]
}
```

### Tile System

- **Tile ID**: Numeric identifier for tile type
- **collisions**: Map of tile IDs that block movement
- **grassTiles**: Array of tile IDs that trigger random encounters
- **tileSize**: Pixel dimensions of each tile (typically 32x32)
- **backgroundTile**: Default tile ID for the map background

### Tile Color Reference

| Tile ID | Color | Purpose |
|---------|-------|---------|
| 1 | Light Green | Grass (encounter tile) |
| 2 | Brown | Wall (collision) |
| 3 | Royal Blue | Building (collision) |
| 4 | Goldenrod | Roof (collision) |
| 5 | Forest Green | Forest floor (encounter tile) |
| 6 | Dark Brown | Tree trunk (collision) |

## Input Controls

### Desktop

- **Arrow Keys**: Move in four directions
- **WASD**: Alternative movement keys
- **Space**: Interact with nearby NPCs/Trainers
- **M**: Open menu
- **P**: Open party screen
- **S**: Open shop
- **B**: Start test battle

### Mobile/Touch

- **Touch Drag**: Move player in direction of touch
- **Tap**: Interact with nearby NPCs/Trainers (future: touch UI)

## Random Encounters

### Encounter Mechanics

1. **Grass Detection**: System checks if player is on a grass tile
2. **Encounter Chance**: 30% chance per tile overlap (configurable)
3. **Debounce**: 500ms minimum between encounters
4. **Species Selection**: Random from area's wildCritters list
5. **Level Range**: Uses area's levelRange for wild critter level

### Area Configuration

Areas are defined in `/public/assets/data/areas.json`:

```json
{
  "id": "starter-forest",
  "name": "Starter Forest",
  "type": "Fire",
  "description": "...",
  "levelRange": {"min": 2, "max": 8},
  "wildCritters": [
    {"speciesId": "embolt", "rarity": 35},
    {"speciesId": "aqualis", "rarity": 35},
    {"speciesId": "thornwick", "rarity": 30}
  ],
  "trainers": [],
  "landmarks": []
}
```

## NPC and Trainer Interactions

### NPC Spawning

NPCs are defined in the map file and spawn at creation:

```json
{
  "id": "npc-1",
  "name": "Elder",
  "x": 3,
  "y": 3,
  "dialogue": "Welcome to Starter Town!"
}
```

- NPCs rendered with **pink tint**
- Display name labels above sprite
- Trigger `npc:interact` event when player presses Space nearby

### Trainer Spawning

Trainers are similar to NPCs but with trainer battle data:

```json
{
  "id": "trainer-npc-1",
  "name": "Youngster Joey",
  "x": 8,
  "y": 10,
  "trainerId": "trainer-1"
}
```

- Trainers rendered with **blue tint**
- Display name labels in yellow
- Trigger `trainer:challenge` event when player presses Space nearby

### Interaction Radius

- Default radius: 64 pixels
- Configurable in `Overworld.ts`

## Collision System

### Collision Detection

1. **Static Collision Group**: Created from all collision tiles
2. **Player-Collision Collider**: Prevents player from walking through walls
3. **Invisible Collision Bodies**: Positioned at tile centers, no visual representation

### Performance

- Collision bodies created once during map load
- Reused across all frames
- Efficiently handles large maps

## Camera System

### Camera Follow

- Camera follows player sprite at all times
- Camera bounds match world bounds (map size)
- Smooth scrolling on desktop
- Instant follow on mobile

### World Bounds

- Set based on map dimensions: `width * tileSize`, `height * tileSize`
- Player collides with world bounds
- Prevents leaving map boundaries

## Events

### EventBus Events

- **battle:request**: Emitted when wild encounter triggered
  - Data: `{ encounterType: 'wild', wildCritter, areaId }`

- **npc:interact**: Emitted when player interacts with NPC
  - Data: `{ npcId, npcName, dialogue }`

- **trainer:challenge**: Emitted when player interacts with trainer
  - Data: `{ trainerId, trainerName }`

## Scene Flow

### Overworld Scene Lifecycle

1. **init**: Parse entry data (mapId)
2. **create**:
   - Load map data from MapManager
   - Render map tiles with MapRenderer
   - Create player sprite and controller
   - Create collision bodies
   - Setup encounter system
   - Spawn NPCs and trainers
   - Setup input handlers
   - Launch HUD scene
3. **update**:
   - Update player controller (input → movement)
   - Check for random encounters
   - Trigger battles when encounter detected
4. **shutdown**:
   - Cleanup event listeners
   - Shutdown player controller
   - Clear sprite maps

### Battle Transition

When encounter triggered:
1. Player movement stops
2. Overworld scene pauses
3. Battle scene starts with encounter data
4. On battle completion, Overworld resumes

## Data Loading Pipeline

### Preloader

Map assets are referenced by their JSON files, no asset loading in Preloader needed.

### Overworld Creation

1. MapManager loads map JSON asynchronously
2. Waits for load to complete before creating scene
3. Falls back to MainMenu if load fails

## Performance Considerations

### Optimization

- **Map Caching**: Loaded maps stored in memory
- **Lazy Loading**: Maps loaded on demand
- **Physics World Bounds**: Only needed collision bodies created
- **Touch Input**: Calculated per-frame but minimal overhead

### Scaling

- Supports maps up to 50x50 tiles efficiently
- Collision detection uses static group (no per-frame updates)
- Encounter debounce prevents lag from frequent checks

## Future Enhancements

1. **Tiled Integration**: Load Tiled editor maps directly
2. **Animated Tiles**: Add water, lava animations
3. **Particle Effects**: Dust, splash effects during movement
4. **Dynamic Music**: Change music based on area
5. **Weather System**: Rain, snow overlays
6. **Day/Night Cycle**: Lighting changes
7. **NPC Pathfinding**: NPCs wander autonomously
8. **Teleportation**: Warp tiles between areas
9. **Ledges/Jumps**: Directional movement mechanics
10. **Vehicles**: Bikes, boats for faster travel

## Testing

### Manual Testing Checklist

- [ ] Player can move with arrow keys
- [ ] Player can move with WASD keys
- [ ] Player can move with touch (drag screen)
- [ ] Collisions prevent walking through walls
- [ ] Camera follows player correctly
- [ ] Player spawns at correct location
- [ ] Random encounters trigger in grass
- [ ] Encounters don't spam (debounce works)
- [ ] NPCs visible with labels
- [ ] Trainers visible with labels
- [ ] Space key triggers NPC interactions
- [ ] Battle scene loads when encounter triggered
- [ ] Overworld resumes after battle
- [ ] Map bounds prevent leaving world
- [ ] HUD displays correctly over map
- [ ] Multiple maps work correctly

### Browser Testing

- [x] Chrome Desktop
- [x] Firefox Desktop
- [ ] Safari Desktop
- [ ] Chrome Mobile
- [ ] Safari iOS
- [ ] Firefox Mobile
