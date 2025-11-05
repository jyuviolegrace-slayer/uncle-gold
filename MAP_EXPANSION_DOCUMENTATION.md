# Map Expansion & NPC System Documentation

## Overview

This documentation covers the expanded map system that includes:
- **Larger maps** (40x30 tiles, 35x28 tiles)
- **Points of Interest (POIs)** - Shops, Pokécenters, Gyms, etc.
- **Map Objects** - Buildings, trees, rocks, decorations
- **Ground Items** - Items placed on the map for players to find
- **Enhanced NPC System** - More NPCs and trainers per map
- **Improved Interaction System** - Interact with NPCs, trainers, POIs, and objects

## New Map Features

### 1. Map Objects (`IMapObject`)

Objects represent physical things on the map like buildings, trees, and decorations.

```typescript
interface IMapObject {
  id: string;
  type: 'building' | 'tree' | 'rock' | 'sign' | 'door' | 'flower' | 'fence' | 'water' | 'bridge' | 'other';
  x: number;                  // Grid X coordinate
  y: number;                  // Grid Y coordinate
  width?: number;             // Width in tiles (default: 1)
  height?: number;            // Height in tiles (default: 1)
  color?: string;             // Hex color or named color
  interactive?: boolean;      // Can be interacted with
  onInteract?: string;        // Action to trigger on interaction
  tint?: number;              // Color tint value
}
```

### 2. Points of Interest (`IPointOfInterest`)

POIs are special areas where the player can interact, like shops and healing centers.

```typescript
interface IPointOfInterest {
  id: string;
  name: string;
  type: 'shop' | 'pokecenter' | 'gym' | 'pokedex' | 'house' | 'landmark' | 'other';
  x: number;                  // Grid X coordinate
  y: number;                  // Grid Y coordinate
  width: number;              // Width in tiles
  height: number;             // Height in tiles
  description?: string;       // Description shown to player
  npcId?: string;             // Associated NPC (optional)
}
```

### 3. Ground Items (`IGroundItem`)

Items that can be found on the map floor.

```typescript
interface IGroundItem {
  id: string;
  itemId: string;             // Reference to item database
  x: number;                  // Grid X coordinate
  y: number;                  // Grid Y coordinate
  quantity?: number;          // Number of items
}
```

## Map Data Structure

Complete `IMapData` now includes:

```typescript
interface IMapData {
  id: string;                         // Unique map identifier
  name: string;                       // Display name
  width: number;                      // Width in tiles
  height: number;                     // Height in tiles
  tileSize: number;                   // Pixel size per tile (usually 32)
  backgroundTile: number;             // Default background tile ID
  tiles: number[];                    // Tile array (width × height)
  collisions: Record<number, boolean>;// Which tile IDs are collisions
  grassTiles: number[];               // Which tile IDs trigger encounters
  playerSpawn: { x: number; y: number }; // Player start position
  npcs: INPCSpawn[];                  // NPCs on this map
  trainers: ITrainerSpawn[];          // Trainers on this map
  objects?: IMapObject[];             // Map objects (NEW)
  pointsOfInterest?: IPointOfInterest[]; // POIs (NEW)
  groundItems?: IGroundItem[];        // Ground items (NEW)
}
```

## Available Maps

### 1. Central Plaza (`central-plaza`)
- **Size:** 40×30 tiles
- **Theme:** Urban hub with shops, gyms, and many NPCs
- **NPCs:** 7 NPCs including Mayor, Scholar, Vendors, Nurse Joy
- **Trainers:** 3 trainers (Youngster Leo, Ace Trainer Maria, Veteran Paul)
- **Objects:** 12 objects including buildings, trees, statues, benches
- **POIs:** 4 points of interest (Pokécenter, Poké Mart, Library, Gym)
- **Features:** Central fountain, multiple shops, training hub

### 2. Mountain Pass (`mountain-pass`)
- **Size:** 35×28 tiles
- **Theme:** High-altitude terrain with cabins and climbing challenges
- **NPCs:** 4 NPCs including Mountain Guide, Miner, Explorer, Hiker
- **Trainers:** 2 trainers (Climber Rick, Expert Dan)
- **Objects:** 8 objects including cabins, rocks, campfires
- **POIs:** 2 points of interest (Mountain Cabin, Explorer's Lodge)
- **Features:** Rocky terrain, multiple elevation zones, cabins for shelter

### 3. Starter Town (`starter-town`)
- **Size:** 20×15 tiles
- **Theme:** Small peaceful town
- **NPCs:** 2 NPCs
- **Trainers:** 1 trainer
- **Status:** Compatible with new system (optional objects/POIs)

### 4. Starter Forest (`starter-forest`)
- **Size:** 24×18 tiles
- **Theme:** Natural forest with clearings
- **NPCs:** 1 NPC
- **Trainers:** 0 trainers
- **Status:** Compatible with new system (optional objects/POIs)

## Creating a New Map

### Map JSON Structure

Create a new file in `/public/assets/maps/` named `{map-id}.json`:

```json
{
  "id": "map-id",
  "name": "Map Name",
  "width": 40,
  "height": 30,
  "tileSize": 32,
  "backgroundTile": 1,
  "tiles": [
    // Tile array: width × height total tiles
    // 1 = grass, 2 = wall, 3 = building, 4 = roof, 5 = forest, 6 = tree, etc.
    1, 1, 1, 1, 1, ..., 2, 2, 2, 2, 2
    // (1200 tiles for 40×30)
  ],
  "collisions": {
    "2": true,    // Walls block movement
    "3": true,    // Buildings block movement
    "4": true,    // Roofs block movement
    "5": true     // Forest edges block movement
  },
  "grassTiles": [1],  // Only tile 1 triggers random encounters
  "playerSpawn": {
    "x": 20,
    "y": 15
  },
  "npcs": [
    {
      "id": "npc-unique-id",
      "name": "NPC Name",
      "x": 10,
      "y": 5,
      "dialogue": "What the NPC says when interacted with"
    }
  ],
  "trainers": [
    {
      "id": "trainer-visual-id",
      "name": "Trainer Name",
      "x": 15,
      "y": 10,
      "trainerId": "trainer-unique-id"
    }
  ],
  "objects": [
    {
      "id": "obj-building-1",
      "type": "building",
      "x": 2,
      "y": 2,
      "width": 4,
      "height": 3,
      "color": "#8B4513"
    },
    {
      "id": "obj-tree-1",
      "type": "tree",
      "x": 5,
      "y": 8,
      "color": "#228B22"
    }
  ],
  "pointsOfInterest": [
    {
      "id": "poi-shop",
      "name": "Poké Mart",
      "type": "shop",
      "x": 8,
      "y": 2,
      "width": 4,
      "height": 2,
      "description": "Buy items and supplies"
    }
  ],
  "groundItems": [
    {
      "id": "item-1",
      "itemId": "item-pokeball",
      "x": 10,
      "y": 5,
      "quantity": 3
    }
  ]
}
```

## Tile IDs Reference

| ID | Name | Color | Collision | Encounters |
|----|------|-------|-----------|------------|
| 1 | Grass | Light Green (#90EE90) | No | Yes |
| 2 | Wall | Brown (#8B4513) | Yes | No |
| 3 | Building | Royal Blue (#4169E1) | Yes | No |
| 4 | Roof | Goldenrod (#DAA520) | Yes | No |
| 5 | Forest Floor | Forest Green (#228B22) | Yes | Yes |
| 6 | Tree Trunk | Dark Brown (#654321) | Yes | No |

**Note:** You can add more tile IDs as needed. Just define their colors in `MapRenderer.renderMap()`.

## Object Types

| Type | Symbol | Purpose |
|------|--------|---------|
| `building` | 🏠 | Houses, shops, gyms, centers |
| `tree` | 🌲 | Natural scenery, blocking paths |
| `rock` | 🪨 | Boulders, mountain features |
| `sign` | 🪧 | Informational signs |
| `door` | 🚪 | Entryways |
| `flower` | 🌸 | Decorative plants |
| `fence` | 🚧 | Barriers, property lines |
| `water` | 💧 | Fountains, decorative water |
| `bridge` | 🌉 | Crossings |
| `other` | ◼ | Miscellaneous objects |

## POI Types & Colors

| Type | Color | Typical Use |
|------|-------|------------|
| `shop` | Tomato (#FF6347) | Item stores |
| `pokecenter` | Dark Turquoise (#00CED1) | Healing centers |
| `gym` | Gold (#FFD700) | Battle gyms |
| `pokedex` | Royal Blue (#4169E1) | Information centers |
| `house` | Saddle Brown (#8B4513) | Residences |
| `landmark` | Dim Gray (#696969) | Notable locations |
| `other` | Gray (#808080) | Miscellaneous |

## Interaction System

### NPC Interaction
```typescript
// Fires when player is near NPC and presses SPACE
EventBus.on('npc:interact', (data) => {
  console.log(`Talked to ${data.npcName}: ${data.dialogue}`);
  // data.npcId, data.npcName, data.dialogue
});
```

### Trainer Interaction
```typescript
// Automatically triggered when near trainer
// Initiates battle if not already defeated
// Or shows "Trainer defeated" message if already beaten
```

### POI Interaction
```typescript
// Fires when player is near POI and presses SPACE
EventBus.on('poi:interact', (data) => {
  console.log(`Entered ${data.poiName}: ${data.description}`);
  // data.poiId, data.poiName, data.poiType, data.description
});
```

### Ground Items
Currently displayed on map but not yet implemented for pickup. You can extend the system by:
1. Adding ground item sprites to the map
2. Implementing pickup logic in the interaction system
3. Adding items to player inventory

## Rendering Configuration

MapRenderer now supports additional options:

```typescript
MapRenderer.renderMap(scene, mapData, {
  tileSize: 32,           // Pixel size per tile
  showCollisions: false,  // Show collision boxes for debugging
  renderObjects: true,    // Display map objects (default: true)
  renderPOIs: true       // Display POI labels (default: true)
});
```

## Color Formats

Objects support both hex and named colors:

```typescript
// Hex format
"color": "#FF0000"

// Named colors
"color": "red"
"color": "blue"
"color": "green"

// Supported named colors: black, white, red, green, blue, yellow, cyan, magenta, gray
```

## Performance Considerations

### Optimal Map Sizes
- **Small maps:** 20×15 (300 tiles)
- **Medium maps:** 30×20 (600 tiles)
- **Large maps:** 40×30 (1,200 tiles)

Maps larger than 50×40 may impact performance on low-end devices.

### Optimization Tips

1. **Use collision tiles efficiently** - Don't make every tile colliding
2. **Limit objects** - Keep object count under 50 per map
3. **Limit POIs** - Keep POIs under 10 per map
4. **Limit NPCs** - Keep NPCs under 15 per map
5. **Batch interactions** - Reuse event handlers when possible

## Future Enhancement Ideas

### Additional Features to Add
- [ ] Ground item pickup system
- [ ] Multi-tile buildings with interiors
- [ ] Dynamic weather effects
- [ ] Time-based NPC schedules
- [ ] Quest markers on map
- [ ] Teleportation points
- [ ] Hidden items system
- [ ] Dynamic NPC dialogue based on game state
- [ ] Map transitions/portals
- [ ] Environmental hazards

### Asset Integration
- Custom tileset images (when available)
- NPC sprite animations
- Object animations (water, fire, etc.)
- Weather overlays
- Day/night cycle visuals

## Troubleshooting

### Objects not appearing
1. Check that `renderObjects: true` in map rendering config
2. Verify object coordinates are within map bounds
3. Ensure color format is valid hex or named color

### POIs not interactive
1. Check that player is within interaction radius (64 pixels)
2. Verify POI coordinates and dimensions
3. Check console for POI event emissions

### Performance issues
1. Reduce map size or object count
2. Enable collision display to verify collision count
3. Check browser console for warnings
4. Profile using browser DevTools

### NPCs not showing
1. Verify NPC x, y coordinates are within map bounds
2. Check that NPC sprite asset is loaded
3. Ensure NPC IDs are unique

## File Locations

```
/public/assets/maps/
├── central-plaza.json          (NEW - Large urban hub)
├── mountain-pass.json          (NEW - Mountain terrain)
├── starter-town.json           (Existing)
└── starter-forest.json         (Existing)

/src/game/managers/
├── MapManager.ts               (Updated - New interfaces)
└── MapRenderer.ts              (Updated - Object/POI rendering)

/src/game/scenes/
└── Overworld.ts               (Updated - Object/POI handling)
```

## Next Steps

### For Players
1. Explore the Central Plaza to meet many NPCs
2. Visit the Mountain Pass for challenging trainers
3. Check out POIs for items and healing
4. Return to original maps to find new features

### For Developers
1. Create custom maps using provided templates
2. Add new object and POI types as needed
3. Implement ground item pickup system
4. Add map transitions/portals between areas
5. Create themed areas (caves, water routes, etc.)

## Examples

### Simple Shop Building
```json
{
  "id": "obj-shop-1",
  "type": "building",
  "x": 10,
  "y": 5,
  "width": 3,
  "height": 2,
  "color": "#FF6347"
}
```

### Tree Forest Area
```json
{
  "id": "obj-forest-trees",
  "type": "tree",
  "x": 15,
  "y": 10,
  "color": "#228B22"
}
```

### Pokécenter POI
```json
{
  "id": "poi-pokecenter-main",
  "name": "Pokécenter",
  "type": "pokecenter",
  "x": 5,
  "y": 3,
  "width": 4,
  "height": 3,
  "description": "Restore your Critters' health"
}
```

## Support for Additional Assets

If you need additional tileset assets or sprite assets, please provide:

1. **Custom tilesets:** PNG images (recommend 32x32 tile size)
2. **NPC sprites:** Directional sprites for animation
3. **Object sprites:** Visual representations of map objects
4. **Background patterns:** Repeating textures for terrain

Include details about:
- Image dimensions
- Color palette
- Animation frames (if applicable)
- Tile IDs that correspond to the tileset

We can then integrate these assets into the rendering system.
