# Legacy Port Plan: Monster Tamer → Critter Quest TypeScript+Next.js

## Executive Summary

This document provides a comprehensive migration strategy for porting the legacy **Monster Tamer** JavaScript/Phaser 3 game to the modern **Critter Quest** TypeScript/Next.js/Phaser 3 stack. The legacy codebase is located in `/legacy/src`, while the current modern implementation is in `/src/game`.

**Key Objective:** Preserve gameplay features and assets from the legacy game while leveraging modern TypeScript type safety, React integration, advanced state management, and performance optimizations in the current architecture.

---

## 1. Architecture Comparison

### 1.1 Legacy Stack (JavaScript/Phaser 3)

**Structure:**
```
legacy/src/
├── main.js                          # Entry point, manual scene registration
├── config.js                        # Game configuration
├── scenes/                          # Scene classes
│   ├── preload-scene.js
│   ├── world-scene.js              # Main overworld
│   ├── battle-scene.js             # Turn-based battle
│   ├── title-scene.js
│   ├── monster-party-scene.js
│   ├── monster-details-scene.js
│   ├── inventory-scene.js
│   ├── options-scene.js
│   └── base-scene.js               # Base scene class
├── battle/                          # Battle subsystem
│   ├── attacks/
│   │   ├── attack-manager.js       # Attack orchestrator
│   │   ├── attack.js               # Base attack class
│   │   ├── ice-shard.js            # Specific attacks
│   │   └── slash.js
│   ├── monsters/
│   │   ├── battle-monster.js
│   │   ├── player-battle-monster.js
│   │   └── enemy-battle-monster.js
│   ├── ball.js                     # Capture ball UI
│   ├── background.js
│   └── ui/menu/                    # Battle menus
├── world/                           # Overworld subsystem
│   ├── characters/
│   │   ├── character.js            # Base character
│   │   ├── player.js
│   │   └── npc.js
│   ├── item.js                     # Ground items
│   └── world-menu.js               # Overworld menu
├── common/                          # Shared utilities
│   ├── menu/
│   │   ├── menu.js                 # Generic menu component
│   │   ├── confirmation-menu.js
│   │   ├── menu-config.js
│   │   └── menu-options.js
│   ├── animated-bar.js
│   ├── health-bar.js
│   ├── exp-bar.js
│   ├── direction.js
│   └── options.js
├── utils/                           # Utility functions
│   ├── data-manager.js             # Global save state manager
│   ├── data-utils.js               # Scene data access
│   ├── audio-utils.js
│   ├── camera-utils.js
│   ├── grid-utils.js
│   ├── state-machine.js
│   ├── scene-transition.js
│   ├── tiled-utils.js
│   ├── leveling-utils.js
│   ├── catch-utils.js
│   ├── random.js
│   ├── time-utils.js
│   ├── text-utils.js
│   └── guard.js                    # Type narrowing
├── assets/                          # Asset definitions
│   ├── asset-keys.js               # String constants for assets
│   ├── tiled-keys.js               # Tiled map object layer names
│   ├── font-keys.js
│   └── web-font-file-loader.js
├── types/
│   └── typedef.js                  # JSDoc type definitions
└── lib/
    ├── phaser.js
    ├── tweakpane.js
    └── webfontloader.js
```

**Key Characteristics:**
- Global `DataManager` singleton for persistent state
- Scene-based but coupled to global state
- Tiled editor integration (raw .json files)
- Manual asset key management
- JSDoc type annotations (not compiled)
- No built-in React integration

### 1.2 Current TypeScript Stack

**Structure:**
```
src/game/
├── main.ts                          # Entry point, scene registration
├── EventBus.ts                      # React↔Phaser communication
├── scenes/
│   ├── Boot.ts
│   ├── Preloader.ts
│   ├── MainMenu.ts
│   ├── Game.ts
│   ├── Overworld.ts                # Modern overworld
│   ├── Battle.ts                   # Modern battle
│   ├── Party.ts
│   ├── Shop.ts
│   ├── Menu.ts
│   ├── HUD.ts
│   ├── GameOver.ts
│   ├── Champion.ts
│   └── SceneContext.ts             # Centralized context
├── models/
│   ├── types.ts                    # TypeScript interfaces
│   ├── Critter.ts                  # Creature class
│   ├── CritterSpeciesDatabase.ts
│   ├── GameStateManager.ts
│   ├── BattleManager.ts            # Battle orchestrator
│   ├── AIDecisionMaker.ts
│   ├── MoveDatabase.ts
│   ├── TypeChart.ts
│   ├── EvolutionManager.ts
│   ├── MoveLearningManager.ts
│   ├── TrainerDatabase.ts
│   ├── PlayerParty.ts
│   ├── ItemDatabase.ts
│   └── index.ts
├── managers/
│   ├── MapManager.ts               # Map data management
│   ├── MapRenderer.ts              # Map rendering
│   ├── EncounterSystem.ts          # Random encounters
│   ├── AnimationManager.ts
│   ├── AudioManager.ts
│   ├── PlayerController.ts
│   ├── PoolManager.ts
│   ├── PerformanceMonitor.ts
│   └── index.ts
├── services/
│   ├── SaveManager.ts              # Advanced save system
│   └── index.ts
└── data/
    ├── loader.ts                   # JSON data loading
    └── index.ts
```

**Key Characteristics:**
- TypeScript strict mode with full type safety
- `SaveManager` singleton with versioning & compression
- `SceneContext` for inter-scene communication
- `EventBus` for React integration
- Modular manager architecture
- `MapManager` abstraction over raw Tiled files
- Async data loaders

---

## 2. Module-by-Module Migration Mapping

### 2.1 Data & State Management

| Legacy Module | Current Equivalent | Migration Strategy | Status | Priority |
|---|---|---|---|---|
| `data-manager.js` | `SaveManager.ts` + `GameStateManager.ts` | Port save logic to SaveManager, state to GameStateManager | Ready | **HIGH** |
| `data-utils.js` | `DataLoader.ts` + database classes | Create wrapper around JSON data access | Ready | **HIGH** |
| `typedef.js` | `types.ts` | Convert JSDoc to TypeScript interfaces | Ready | **HIGH** |
| N/A | `SceneContext.ts` | New system for scene coordination | Already exists | **HIGH** |

**Detailed Actions:**

**DataManager Migration:**
```typescript
// Legacy: global singleton dataManager with DATA_MANAGER_STORE_KEYS
// Current: SaveManager (save/load) + GameStateManager (current state)

// Action items:
// 1. Map legacy DATA_MANAGER_STORE_KEYS to GameStateManager properties
// 2. Move localStorage logic from DataManager to SaveManager
// 3. Migrate player position, direction, location, options, flags
// 4. Implement backward compatibility layer (if needed)
```

**Map of Legacy State → TypeScript:**
```typescript
// Legacy GlobalState structure:
{
  player: { position: {x,y}, direction, location: {area, isInterior} },
  options: { textSpeed, battleSceneAnimations, battleStyle, sound, volume, menuColor },
  gameStarted,
  monsters: { inParty: [] },
  inventory: [{ item: {id}, quantity }],
  itemsPickedUp: [],
  viewedEvents: [],
  flags: []
}

// Maps to:
// GameStateManager: holds current state during gameplay
// SaveManager: persists to localStorage with versioning
// ISaveData interface: defines save file structure
```

---

### 2.2 Scene Architecture

| Legacy Scene | Current Scene | Migration Path | Dependencies | Priority |
|---|---|---|---|---|
| `preload-scene.js` | `Preloader.ts` | Update asset loading for new format | DataLoader | **HIGH** |
| `title-scene.js` | `MainMenu.ts` | Refactor UI for React integration | EventBus | **HIGH** |
| `world-scene.js` | `Overworld.ts` | Port map logic to MapManager/MapRenderer | MapManager, EncounterSystem | **CRITICAL** |
| `battle-scene.js` | `Battle.ts` | Refactor to use new BattleManager | BattleManager, AIDecisionMaker | **CRITICAL** |
| `monster-party-scene.js` | `Party.ts` | Port to modern party UI | PlayerParty, EventBus | **HIGH** |
| `inventory-scene.js` | `Menu.ts` (partial) | Merge into modern menu system | ItemDatabase | **MEDIUM** |
| `monster-details-scene.js` | `Party.ts` (detail view) | Integrate into party scene | Critter model | **MEDIUM** |
| `options-scene.js` | `Menu.ts` (settings) | Migrate settings to React UI | SaveManager | **MEDIUM** |
| N/A | `HUD.ts` | New overlay for React display | EventBus | **HIGH** |
| N/A | `SceneContext.ts` | Replaces global state passing | All scenes | **HIGH** |

---

### 2.3 Battle & Combat Systems

| Legacy Module | Current Equivalent | Migration | Status | Priority |
|---|---|---|---|---|
| `attack-manager.js` | `BattleManager.ts` + `MoveDatabase.ts` | Port attack logic, create move definitions | **Partial** | **CRITICAL** |
| `battle-monster.js` | `Critter.ts` (in battle context) | Use Critter model with battle state | Ready | **HIGH** |
| `player-battle-monster.js` | `IBattleParticipant` (player) | Refactor to interface-based | Ready | **HIGH** |
| `enemy-battle-monster.js` | `IBattleParticipant` (opponent) | Refactor to interface-based | Ready | **HIGH** |
| `ball.js` | Merge into `Battle.ts` UI | Capture ball visual as UI element | **Partial** | **MEDIUM** |
| `background.js` | `Battle.ts` background | Port visual rendering | **Partial** | **MEDIUM** |

---

### 2.4 World & Character Systems

| Legacy Module | Current Equivalent | Migration | Status | Priority |
|---|---|---|---|---|
| `character.js` | (Base logic only) | Refactor movement to PlayerController | **Partial** | **MEDIUM** |
| `player.js` | `PlayerController.ts` | Port player movement & interactions | Ready | **HIGH** |
| `npc.js` | NPC data in maps + Overworld logic | Convert to map NPC definitions | Ready | **HIGH** |
| `item.js` | `ItemDatabase.ts` + ground items | Port ground item rendering | **Partial** | **MEDIUM** |
| `world-menu.js` | `Menu.ts` + EventBus | Refactor to React-driven menu | Ready | **MEDIUM** |

---

### 2.5 Data & Assets

| Category | Legacy Location | Current Location | Format Change | Action |
|---|---|---|---|---|
| **Creatures** | `legacy/assets/data/monsters.json` | `public/assets/data/critters.json` | ID: number → string | Convert |
| **Moves/Attacks** | `legacy/assets/data/attacks.json` | `public/assets/data/moves.json` | Add power, accuracy, type | Extend |
| **Items** | `legacy/assets/data/items.json` | `public/assets/data/items.json` | Verify compatibility | Review |
| **Type Chart** | Hardcoded in battle logic | `public/assets/data/types.json` | New structure | Create |
| **NPCs** | `legacy/assets/data/npcs.json` | Map files (distributed) | Relocate | Distribute |
| **Events** | `legacy/assets/data/events.json` | Event system (TBD) | Refactor | Redesign |
| **Animations** | `legacy/assets/data/animations.json` | Animation registry | Register in AnimationManager | Migrate |
| **Maps/Tiled** | `legacy/assets/data/*.json` (Tiled format) | `public/assets/maps/*.json` | Custom MapManager format | Convert |

---

## 3. Asset Inventory & Requirements

### 3.1 Binary Assets Checklist

**Status: PENDING (requires legacy release download)**

Binary assets are distributed separately via:
- GitHub Release: https://github.com/devshareacademy/monster-tamer/releases/download/assets/all-game-assets-v2.zip

**Estimated breakdown:**
```
Images (≈50-100 MB):
├── Player sprite sheet (8-direction, running/walking)
├── NPC sprite sheet (multiple characters, 8-direction)
├── Creature/Monster sprites (40+ creatures)
├── Tilesets (grass, forest, building, beach, cave, water)
├── Battle backgrounds
├── UI graphics (buttons, panels, cursors, icons)
├── Attack effect sprites (slash, ice shard, etc.)
└── Title screen graphics

Audio (≈50-100 MB):
├── Background music (title, overworld, battle, etc.)
├── Battle music (trainer, wild, victory, defeat)
└── Sound effects (menu select, attack hit, capture, etc.)

Total: ≈150-300 MB
```

### 3.2 Missing Data Files

Must create/verify:
- `critters.json` - Creature database (partially exists)
- `moves.json` - Move definitions (NEW)
- `types.json` - Type effectiveness matrix (exists, verify format)
- `items.json` - Item database (verify compatibility)
- `trainers.json` - Trainer definitions (NEW)
- `areas.json` - Area/region data (exists, verify format)
- Map JSON files - Convert from Tiled format

---

## 4. Phased Migration Strategy

### Phase 1: Assets & Data (Weeks 1-2)

**Goals:**
- Acquire and organize binary assets
- Create data migration mappings
- Set up asset loading infrastructure

**Key Tickets:**
1. Fetch and organize binary assets from legacy release
2. Create data format conversion mappings
3. Verify asset paths and availability
4. Test data loading with new format

---

### Phase 2: Core Systems (Weeks 3-4)

**Goals:**
- Port core game systems to modern architecture
- Establish manager pattern
- Create necessary databases

**Key Tickets:**
1. Port DataManager → SaveManager + GameStateManager
2. Implement MoveDatabase & attack animations
3. Implement TrainerDatabase
4. Enhance EncounterSystem with legacy data
5. Implement Critter evolution system

---

### Phase 3: Scenes (Weeks 5-7)

**Goals:**
- Port and refactor legacy scenes
- Implement EventBus integration
- Create React HUD components

**Key Tickets:**
1. Refactor Overworld scene (map loading, NPCs, encounters)
2. Refactor Battle scene (turn logic, animations, captures)
3. Refactor Party scene (creature display, stats)
4. Create Shop scene (item purchasing)
5. Implement HUD system (React components)
6. Refactor MainMenu scene

---

### Phase 4: Polish & Testing (Weeks 8-9)

**Goals:**
- Ensure feature parity with legacy
- Performance optimization
- Comprehensive testing

**Key Tickets:**
1. UI polish and responsive design
2. Audio integration and volume controls
3. Performance profiling and optimization
4. Comprehensive testing (combat, encounters, save/load)
5. Documentation updates

---

### Phase 5: Cleanup (Week 10)

**Goals:**
- Archive legacy code
- Clean up temporary files
- Finalize documentation

---

## 5. Risk Assessment

### High-Risk Items

| Risk | Impact | Mitigation |
|---|---|---|
| Binary assets unavailable | Game unplayable | Document fallback strategy, schedule asset download early |
| Tiled format incompatibility | Map loading fails | Create conversion tool or manual process |
| Combat balance differs | Game broken | Calibrate formulas, test extensively |
| Performance regression | Unplayable on low-end | Profile early and often |
| NPC event system complexity | Scope creep | Define MVP, postpone advanced features |
| React integration issues | Input lag, crashes | Test EventBus thoroughly, handle errors |

---

## 6. Recommended Ticket Ordering

### Tier 1: Foundation (Required First)
1. **Fetch & organize binary assets** (2 days)
2. **Create data migration mappings** (3 days)
3. **Port DataManager → SaveManager/GameStateManager** (4 days)

### Tier 2: Systems (Parallel)
4. **Implement MoveDatabase** (5 days)
5. **Implement TrainerDatabase** (3 days)
6. **Enhance EncounterSystem** (3 days)
7. **Implement Critter evolution** (4 days)

### Tier 3: Scenes
8. **Refactor Overworld scene** (8 days)
9. **Refactor Battle scene** (8 days)
10. **Refactor Party scene** (5 days)
11. **Create HUD system** (6 days)

### Tier 4: Polish & Testing
12. **Performance optimization** (5 days)
13. **Comprehensive testing** (10 days)
14. **UI polish & audio** (5 days)

**Estimated Total: 10-12 weeks**

---

## 7. Success Criteria

- ✅ All legacy scenes converted to TypeScript
- ✅ All game systems ported and working
- ✅ Data format migrations complete
- ✅ Binary assets integrated
- ✅ EventBus integration functional
- ✅ 60 FPS performance target met
- ✅ Feature parity with legacy maintained
- ✅ Comprehensive test coverage
- ✅ Documentation complete

---

**Document Status:** Ready for Implementation Planning  
**Version:** 1.0
