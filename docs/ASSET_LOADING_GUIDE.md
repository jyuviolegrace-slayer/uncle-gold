# Asset Loading Guide

This guide describes how to load legacy assets using the new TypeScript asset keys in the game.

## Quick Start

All legacy assets are now available from `/assets/legacy/` and can be loaded using typed asset key constants.

### Basic Example

```typescript
import { AUDIO_ASSET_KEYS, UI_ASSET_KEYS, ATTACK_ASSET_KEYS } from '@/game/assets';

export class Preloader extends Scene {
    preload() {
        // Set base path to assets folder
        this.load.setPath('assets/legacy');
        
        // Load UI assets
        this.load.image(UI_ASSET_KEYS.BLUE_BUTTON, 'images/kenneys-assets/ui-pack/blue_button00.png');
        
        // Load audio
        this.load.audio(AUDIO_ASSET_KEYS.BATTLE, 'audio/xDeviruchi/Decisive-Battle.wav');
        
        // Load effects/attacks
        this.load.image(ATTACK_ASSET_KEYS.ICE_SHARD, 'images/pimen/ice-attack/active.png');
    }
}
```

## Asset Key Categories

### UI Assets (`UI_ASSET_KEYS`)

Loading button and UI element sprites:

```typescript
import { UI_ASSET_KEYS } from '@/game/assets';

this.load.setPath('assets/legacy');

// Blue buttons
this.load.image(UI_ASSET_KEYS.BLUE_BUTTON, 'images/kenneys-assets/ui-pack/blue_button00.png');
this.load.image(UI_ASSET_KEYS.BLUE_BUTTON_SELECTED, 'images/kenneys-assets/ui-pack/blue_button01.png');

// Menu backgrounds
this.load.image(UI_ASSET_KEYS.MENU_BACKGROUND, 'images/kenneys-assets/ui-space-expansion/glassPanel.png');
this.load.image(UI_ASSET_KEYS.MENU_BACKGROUND_GREEN, 'images/kenneys-assets/ui-space-expansion/glassPanel_green.png');
this.load.image(UI_ASSET_KEYS.MENU_BACKGROUND_PURPLE, 'images/kenneys-assets/ui-space-expansion/glassPanel_purple.png');

// Cursor assets
this.load.image(UI_ASSET_KEYS.CURSOR, 'images/kenneys-assets/board-game/cursor_hand_white.png');
this.load.image(UI_ASSET_KEYS.CURSOR_WHITE, 'images/kenneys-assets/board-game/cursor_hand_open.png');
```

### Health Bar Assets (`HEALTH_BAR_ASSET_KEYS`)

Loading segmented health bar components:

```typescript
import { HEALTH_BAR_ASSET_KEYS } from '@/game/assets';

this.load.setPath('assets/legacy');

// Blue health bar components
this.load.image(HEALTH_BAR_ASSET_KEYS.LEFT_CAP, 'images/kenneys-assets/ui-space-expansion/barHorizontal_blue_left.png');
this.load.image(HEALTH_BAR_ASSET_KEYS.MIDDLE, 'images/kenneys-assets/ui-space-expansion/barHorizontal_blue_mid.png');
this.load.image(HEALTH_BAR_ASSET_KEYS.RIGHT_CAP, 'images/kenneys-assets/ui-space-expansion/barHorizontal_blue_right.png');

// Shadow (background) components
this.load.image(HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW, 'images/kenneys-assets/ui-space-expansion/barHorizontal_shadow_left.png');
this.load.image(HEALTH_BAR_ASSET_KEYS.MIDDLE_SHADOW, 'images/kenneys-assets/ui-space-expansion/barHorizontal_shadow_mid.png');
this.load.image(HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW, 'images/kenneys-assets/ui-space-expansion/barHorizontal_shadow_right.png');
```

### Experience Bar Assets (`EXP_BAR_ASSET_KEYS`)

Loading experience bar components (green variant):

```typescript
import { EXP_BAR_ASSET_KEYS } from '@/game/assets';

this.load.setPath('assets/legacy');

this.load.image(EXP_BAR_ASSET_KEYS.EXP_LEFT_CAP, 'images/kenneys-assets/ui-space-expansion/barHorizontal_green_left.png');
this.load.image(EXP_BAR_ASSET_KEYS.EXP_MIDDLE, 'images/kenneys-assets/ui-space-expansion/barHorizontal_green_mid.png');
this.load.image(EXP_BAR_ASSET_KEYS.EXP_RIGHT_CAP, 'images/kenneys-assets/ui-space-expansion/barHorizontal_green_right.png');
```

### Attack/Effect Assets (`ATTACK_ASSET_KEYS`)

Loading visual effects for battle attacks:

```typescript
import { ATTACK_ASSET_KEYS } from '@/game/assets';

this.load.setPath('assets/legacy');

// Ice attack effects
this.load.image(ATTACK_ASSET_KEYS.ICE_SHARD_START, 'images/pimen/ice-attack/start.png');
this.load.image(ATTACK_ASSET_KEYS.ICE_SHARD, 'images/pimen/ice-attack/active.png');

// Slash attack effect
this.load.image(ATTACK_ASSET_KEYS.SLASH, 'images/pimen/slash.png');
```

### Audio Assets (`AUDIO_ASSET_KEYS`)

Loading music and sound effects:

```typescript
import { AUDIO_ASSET_KEYS } from '@/game/assets';

this.load.setPath('assets/legacy');

// Background music
this.load.audio(AUDIO_ASSET_KEYS.TITLE, 'audio/xDeviruchi/Title-Theme.wav');
this.load.audio(AUDIO_ASSET_KEYS.BATTLE, 'audio/xDeviruchi/Decisive-Battle.wav');
this.load.audio(AUDIO_ASSET_KEYS.MAIN, 'audio/xDeviruchi/And-the-Journey-Begins.wav');

// Sound effects
this.load.audio(AUDIO_ASSET_KEYS.CLAW, 'audio/leohpaz/03_Claw_03.wav');
this.load.audio(AUDIO_ASSET_KEYS.FLEE, 'audio/leohpaz/51_Flee_02.wav');
this.load.audio(AUDIO_ASSET_KEYS.GRASS, 'audio/leohpaz/03_Step_grass_03.wav');
this.load.audio(AUDIO_ASSET_KEYS.ICE, 'audio/leohpaz/13_Ice_explosion_01.wav');
```

### Character Assets (`CHARACTER_ASSET_KEYS`)

Loading player and NPC character sprites:

```typescript
import { CHARACTER_ASSET_KEYS } from '@/game/assets';

this.load.setPath('assets/legacy');

// Sprite sheets for character animations
this.load.spritesheet(
    CHARACTER_ASSET_KEYS.PLAYER,
    'images/axulart/character/player.png',
    { frameWidth: 32, frameHeight: 32 }
);

this.load.spritesheet(
    CHARACTER_ASSET_KEYS.NPC,
    'images/parabellum-games/characters.png',
    { frameWidth: 32, frameHeight: 48 }
);
```

### World/Tileset Assets (`WORLD_ASSET_KEYS`)

Loading Tiled map tilesets and backgrounds:

```typescript
import { WORLD_ASSET_KEYS } from '@/game/assets';

this.load.setPath('assets/legacy');

// Main area (grass field)
this.load.image(WORLD_ASSET_KEYS.MAIN_1_BACKGROUND, 'images/monster-tamer/map/main_1_background.png');
this.load.image(WORLD_ASSET_KEYS.MAIN_1_FOREGROUND, 'images/monster-tamer/map/main_1_foreground.png');
this.load.image(WORLD_ASSET_KEYS.GRASS, 'images/axulart/plains/grass.png');

// Forest area
this.load.image(WORLD_ASSET_KEYS.FOREST_1_BACKGROUND, 'images/monster-tamer/map/forest_1_background.png');
this.load.image(WORLD_ASSET_KEYS.FOREST_1_FOREGROUND, 'images/monster-tamer/map/forest_1_foreground.png');

// Beach area
this.load.image(WORLD_ASSET_KEYS.BEACH, 'images/axulart/beach/sand.png');
```

### Monster/Creature Assets (`MONSTER_ASSET_KEYS`)

Loading monster/critter sprite assets:

```typescript
import { MONSTER_ASSET_KEYS } from '@/game/assets';

this.load.setPath('assets/legacy');

// Monster/Critter battle sprites
this.load.spritesheet(
    MONSTER_ASSET_KEYS.IGUANIGNITE,
    'images/monster-tamer/monsters/iguanignite.png',
    { frameWidth: 64, frameHeight: 64 }
);

this.load.spritesheet(
    MONSTER_ASSET_KEYS.CARNODUSK,
    'images/monster-tamer/monsters/carnodusk.png',
    { frameWidth: 64, frameHeight: 64 }
);
```

### Battle Background Assets (`BATTLE_BACKGROUND_ASSET_KEYS`)

Loading battle scene backgrounds:

```typescript
import { BATTLE_BACKGROUND_ASSET_KEYS } from '@/game/assets';

this.load.setPath('assets/legacy');

this.load.image(
    BATTLE_BACKGROUND_ASSET_KEYS.FOREST,
    'images/monster-tamer/battle-backgrounds/forest.png'
);
```

### UI Container Assets (`TITLE_ASSET_KEYS`, `INVENTORY_ASSET_KEYS`, `MONSTER_PARTY_ASSET_KEYS`)

Loading UI containers and menu backgrounds:

```typescript
import { TITLE_ASSET_KEYS, INVENTORY_ASSET_KEYS, MONSTER_PARTY_ASSET_KEYS } from '@/game/assets';

this.load.setPath('assets/legacy');

// Title screen
this.load.image(TITLE_ASSET_KEYS.BACKGROUND, 'images/monster-tamer/ui/title/background.png');
this.load.image(TITLE_ASSET_KEYS.TITLE, 'images/monster-tamer/ui/title/title.png');
this.load.image(TITLE_ASSET_KEYS.PANEL, 'images/monster-tamer/ui/title/panel.png');

// Inventory screen
this.load.image(INVENTORY_ASSET_KEYS.INVENTORY_BACKGROUND, 'images/monster-tamer/ui/inventory/background.png');
this.load.image(INVENTORY_ASSET_KEYS.INVENTORY_BAG, 'images/monster-tamer/ui/inventory/bag.png');

// Monster party screen
this.load.image(MONSTER_PARTY_ASSET_KEYS.PARTY_BACKGROUND, 'images/monster-tamer/ui/monster-party/background.png');
this.load.image(MONSTER_PARTY_ASSET_KEYS.MONSTER_DETAILS_BACKGROUND, 'images/monster-tamer/ui/monster-party/details.png');
```

## Building Assets and Using Them

### In Scenes

Once assets are preloaded, use them by their key:

```typescript
import { UI_ASSET_KEYS } from '@/game/assets';

create() {
    // Add an image using the preloaded asset
    const button = this.add.image(100, 100, UI_ASSET_KEYS.BLUE_BUTTON);
    
    // Add text
    this.add.text(100, 100, 'Click Me', {
        font: '16px Arial',
        color: '#ffffff'
    });
}
```

### In Game Objects

```typescript
import { CHARACTER_ASSET_KEYS } from '@/game/assets';

create() {
    // Create sprite from preloaded spritesheet
    const player = this.add.sprite(100, 100, CHARACTER_ASSET_KEYS.PLAYER, 0);
    
    // Play animation
    player.play('player-walk-down');
}
```

### Audio Playback

```typescript
import { AUDIO_ASSET_KEYS } from '@/game/assets';

playBattleMusic() {
    this.sound.play(AUDIO_ASSET_KEYS.BATTLE, { loop: true });
}

stopMusic() {
    this.sound.stopByKey(AUDIO_ASSET_KEYS.BATTLE);
}
```

## File Organization

All legacy assets follow this structure:

```
public/assets/legacy/
├── audio/
│   ├── leohpaz/           # Sound effects
│   └── xDeviruchi/        # Music
└── images/
    ├── axulart/           # Tilesets and terrain
    ├── kenneys-assets/    # UI components
    ├── monster-tamer/     # Game-specific graphics
    ├── parabellum-games/  # NPC characters
    └── pimen/             # Attack effects
```

## Best Practices

1. **Always use asset keys**: Never hardcode asset key strings. Always import and use the constants.
   ```typescript
   // ✅ Good
   this.load.image(UI_ASSET_KEYS.BLUE_BUTTON, 'images/kenneys-assets/ui-pack/blue_button00.png');
   
   // ❌ Bad
   this.load.image('BLUE_BUTTON', 'images/kenneys-assets/ui-pack/blue_button00.png');
   ```

2. **Set path once**: Use `this.load.setPath()` once per preload section to avoid repeating directory paths.
   ```typescript
   this.load.setPath('assets/legacy');
   this.load.image(UI_ASSET_KEYS.BLUE_BUTTON, 'images/kenneys-assets/ui-pack/blue_button00.png');
   this.load.image(CHARACTER_ASSET_KEYS.PLAYER, 'images/axulart/character/player.png');
   ```

3. **Group related loads**: Organize asset loading by category.
   ```typescript
   preload() {
       this.load.setPath('assets/legacy');
       
       // UI assets
       this.load.image(UI_ASSET_KEYS.BLUE_BUTTON, '...');
       
       // Audio
       this.load.audio(AUDIO_ASSET_KEYS.BATTLE, '...');
   }
   ```

4. **Add progress tracking**: Show loading progress for better UX with large asset files.
   ```typescript
   this.load.on('progress', (progress: number) => {
       bar.width = 460 * progress;
   });
   ```

## Asset Availability Reference

| Category | Key Constant | Files Available |
|----------|---|---|
| UI | `UI_ASSET_KEYS` | Buttons, panels, cursors |
| Audio | `AUDIO_ASSET_KEYS` | Music tracks, SFX |
| Health Bars | `HEALTH_BAR_ASSET_KEYS` | Bar segments (blue) |
| XP Bars | `EXP_BAR_ASSET_KEYS` | Bar segments (green) |
| Attacks | `ATTACK_ASSET_KEYS` | Ice, Slash effects |
| Characters | `CHARACTER_ASSET_KEYS` | Player, NPC sprites |
| Monsters | `MONSTER_ASSET_KEYS` | Creature graphics |
| World/Map | `WORLD_ASSET_KEYS` | Tilesets, terrain |
| Battle BG | `BATTLE_BACKGROUND_ASSET_KEYS` | Scene backgrounds |
| Titles | `TITLE_ASSET_KEYS` | Title screen assets |
| Inventory | `INVENTORY_ASSET_KEYS` | Inventory UI |
| Party | `MONSTER_PARTY_ASSET_KEYS` | Party screen UI |

## Troubleshooting

### Asset Not Found (404 errors)

- Verify the file exists: `ls /home/engine/project/public/assets/legacy/{path}`
- Check that `this.load.setPath('assets/legacy')` is called
- Ensure relative path is correct after base path

### Type Errors

- Import asset keys at the top of your file:
  ```typescript
  import { UI_ASSET_KEYS } from '@/game/assets';
  ```
- Use the exact key name (case-sensitive)

### Assets Not Loading in Build

- Run `npm run build-nolog` to verify build succeeds
- Check `/dist/assets/legacy/` folder exists
- Verify assets weren't stripped during export

## Further Reading

- [Asset Migration Guide](/docs/ASSET_MIGRATION.md) - Technical overview of migration
- [Legacy Port Plan](/docs/LEGACY_PORT_PLAN.md) - Full legacy project port strategy
- [TypeScript Asset Keys](../src/game/assets/) - Type definitions and exports
