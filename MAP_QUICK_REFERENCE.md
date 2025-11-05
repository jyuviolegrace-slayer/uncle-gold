# Map Expansion - Quick Reference

## What's New?

✅ **Bigger Maps** - Up to 40×30 tiles (Central Plaza), 35×28 tiles (Mountain Pass)
✅ **More NPCs** - 4-7 NPCs per map for richer interaction
✅ **Trainers** - Multiple trainer encounters per map
✅ **Objects** - Buildings, trees, rocks, decorative items
✅ **Points of Interest** - Shops, Pokécenters, Gyms, Libraries
✅ **Ground Items** - Items placed on map to collect
✅ **Interactive Locations** - Press SPACE to interact with POIs

## Quick Stats

| Map | Size | NPCs | Trainers | Objects | POIs |
|-----|------|------|----------|---------|------|
| Central Plaza | 40×30 | 7 | 3 | 12 | 4 |
| Mountain Pass | 35×28 | 4 | 2 | 8 | 2 |
| Starter Town | 20×15 | 2 | 1 | 0 | 0 |
| Starter Forest | 24×18 | 1 | 0 | 0 | 0 |

## Available Maps for Play

### Central Plaza
- **Accessible from:** Starter Town (upcoming transitions)
- **Difficulty:** Medium
- **Items available:** Pokéballs, Potions, Antidote
- **Best for:** Training, shopping, meeting NPCs

### Mountain Pass
- **Accessible from:** Central Plaza (upcoming transitions)
- **Difficulty:** Hard
- **Items available:** Super Potion, Full Heal, Revive
- **Best for:** Challenging battles, rare Critters

## Tile Types

```
1 = Grass (can trigger encounters)
2 = Wall/Border (blocks movement)
3 = Building (blocks movement)
4 = Roof (blocks movement)
5 = Forest (blocks movement, encounters)
6 = Tree (blocks movement)
```

## Interacting with the World

### NPCs (Pink)
- Walk near an NPC
- Press SPACE
- Read their dialogue

### Trainers (Blue)
- Walk near a trainer
- Automatically start battle (if not defeated)
- Battle badge/money reward

### POIs (Colored zones)
- Walk near POI
- Press SPACE
- See POI description

### Ground Items
- Will show on map as small items
- Walk near and interact (coming soon)

## Creating Your Own Map

### Step 1: Plan the layout
```
Map size: 40×30 (large), 30×20 (medium), 20×15 (small)
Tile ID: 1 (grass), 2 (walls), 3 (buildings), etc.
```

### Step 2: Create NPCs array
```json
"npcs": [
  {
    "id": "npc-1",
    "name": "John",
    "x": 10,
    "y": 5,
    "dialogue": "Hello trainer!"
  }
]
```

### Step 3: Add objects
```json
"objects": [
  {
    "id": "obj-shop",
    "type": "building",
    "x": 5,
    "y": 3,
    "width": 3,
    "height": 2,
    "color": "#FF6347"
  }
]
```

### Step 4: Add POIs
```json
"pointsOfInterest": [
  {
    "id": "poi-shop",
    "name": "Poké Mart",
    "type": "shop",
    "x": 5,
    "y": 3,
    "width": 3,
    "height": 2,
    "description": "Buy supplies here"
  }
]
```

### Step 5: Save to `/public/assets/maps/{map-id}.json`

## Object Types Quick List

| Type | Usage |
|------|-------|
| `building` | Houses, shops, gyms |
| `tree` | Forest/nature scenery |
| `rock` | Mountains, obstacles |
| `sign` | Information boards |
| `door` | Entryways |
| `flower` | Decorative plants |
| `fence` | Barriers |
| `water` | Fountains, water features |
| `bridge` | Paths over water |

## POI Types Quick List

| Type | Color | Purpose |
|------|-------|---------|
| `shop` | Red | Buy items |
| `pokecenter` | Cyan | Heal Critters |
| `gym` | Gold | Battle gyms |
| `pokedex` | Blue | Information |
| `house` | Brown | Residences |
| `landmark` | Gray | Notable locations |

## Color Hex Values

```
Buildings: #8B4513 (brown) or #FF6347 (red) or #4169E1 (blue)
Trees: #228B22 (forest green)
Rocks: #696969 (gray)
Water: #00BFFF (cyan)
Landmarks: #D3D3D3 (light gray)
Fences: #8B4513 (brown)
Flowers: #FF69B4 (pink)
```

## Testing Your Map

1. Add your map JSON file to `/public/assets/maps/`
2. Update game to load your map:
   ```typescript
   this.mapData = await MapManager.loadMap('your-map-id');
   ```
3. Run game and verify:
   - ✓ Player spawns at correct location
   - ✓ Walls block movement
   - ✓ NPCs appear with names
   - ✓ Objects display with correct colors
   - ✓ POIs show with labels
   - ✓ Trainers are visible
   - ✓ Encounters trigger on grass

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Objects not showing | Verify `renderObjects: true` in config |
| Can walk through walls | Check collision tile IDs |
| NPCs invisible | Verify coordinates within map bounds |
| POIs not interactive | Check distance threshold (64 pixels) |
| Performance slow | Reduce map size or object count |

## File Structure

```
Game files structure:
├── /public/assets/maps/
│   ├── central-plaza.json (NEW)
│   ├── mountain-pass.json (NEW)
│   ├── starter-town.json
│   └── starter-forest.json
│
├── /src/game/managers/
│   ├── MapManager.ts (UPDATED)
│   └── MapRenderer.ts (UPDATED)
│
└── /src/game/scenes/
    └── Overworld.ts (UPDATED)
```

## Events Emitted

```typescript
// NPC interaction
EventBus.on('npc:interact', (data) => {
  console.log(data.npcName, data.dialogue);
});

// POI interaction
EventBus.on('poi:interact', (data) => {
  console.log(data.poiName, data.poiType);
});

// Trainer defeated
EventBus.on('trainer:defeated', (data) => {
  console.log('Already beat', data.trainerName);
});
```

## Performance Tips

- Keep maps under 50×50 tiles
- Limit NPCs to under 15 per map
- Limit objects to under 50 per map
- Limit POIs to under 10 per map
- Use collision tiles strategically
- Test on lower-end devices

## What Works Now

✅ Load and display expanded maps
✅ Multiple NPCs with dialogue
✅ Multiple trainers with battles
✅ Building and object rendering
✅ POI rendering and interaction
✅ Random encounters on grass
✅ Camera following
✅ Movement and collisions

## What's Coming Next

🔜 Ground item pickup system
🔜 Inter-map transitions/portals
🔜 Dynamic NPC schedules
🔜 Custom tilesets
🔜 Animated objects
🔜 Weather effects
🔜 Quest markers
🔜 Hidden items

## Getting Started Now

1. **Explore Central Plaza** - Visit `central-plaza` map
2. **Meet 7 NPCs** - Talk to all NPCs for dialogue
3. **Face trainers** - Battle 3 trainers
4. **Find items** - Locate ground items on map
5. **Check out POIs** - Visit shops and gyms

## Reporting Issues

If you find problems:
1. Check console for errors
2. Verify map JSON is valid
3. Check tile IDs are 1-6
4. Verify coordinates are within bounds
5. Report with map name and description

## Questions?

See `MAP_EXPANSION_DOCUMENTATION.md` for complete details and examples.
