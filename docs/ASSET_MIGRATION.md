# Legacy Asset Migration

## Overview

Legacy game assets (images and audio) have been migrated from the excluded `/legacy/assets/` folder structure to `/public/assets/legacy/` to enable serving them through Next.js static export. This document describes the migration process, structure, and asset sourcing/licensing.

## Migration Timeline

- **Original Location**: `/legacy/assets/` (excluded from version control)
- **Current Location**: `/public/assets/legacy/` (tracked in version control)
- **Download Source**: [All Game Assets v2 Release](https://github.com/devshareacademy/monster-tamer/releases/download/assets/all-game-assets-v2.zip)
- **Total Size**: ~71 MB

## Directory Structure

```
public/assets/legacy/
├── audio/
│   ├── leohpaz/           # Sound effects
│   │   ├── 03_Claw_03.wav
│   │   ├── 51_Flee_02.wav
│   │   ├── 13_Ice_explosion_01.wav
│   │   └── 03_Step_grass_03.wav
│   └── xDeviruchi/        # Music tracks
│       ├── Decisive-Battle.wav
│       ├── Title-Theme.wav
│       └── And-the-Journey-Begins.wav
└── images/
    ├── axulart/           # Tilesets and characters
    │   ├── beach/
    │   ├── character/
    │   ├── interior/
    │   └── plains/
    ├── kenneys-assets/    # UI and UI expansions
    │   ├── ui-pack/
    │   └── ui-space-expansion/
    ├── monster-tamer/     # Game-specific assets
    ├── parabellum-games/  # NPC characters
    └── pimen/             # Attack effects
        ├── ice-attack/
        └── slash/
```

## Asset Keys

TypeScript asset key modules have been created to provide type-safe references to all assets:

### Module Structure

- **`src/game/assets/AssetKeys.ts`** - Main asset keys (images, audio, data)
  - `EXTERNAL_LINKS_ASSET_KEYS`
  - `BATTLE_BACKGROUND_ASSET_KEYS`
  - `MONSTER_ASSET_KEYS`
  - `BATTLE_ASSET_KEYS`
  - `HEALTH_BAR_ASSET_KEYS`
  - `EXP_BAR_ASSET_KEYS`
  - `UI_ASSET_KEYS`
  - `DATA_ASSET_KEYS`
  - `ATTACK_ASSET_KEYS`
  - `WORLD_ASSET_KEYS`
  - `BUILDING_ASSET_KEYS`
  - `CHARACTER_ASSET_KEYS`
  - `TITLE_ASSET_KEYS`
  - `MONSTER_PARTY_ASSET_KEYS`
  - `INVENTORY_ASSET_KEYS`
  - `AUDIO_ASSET_KEYS`

- **`src/game/assets/FontKeys.ts`** - Font family definitions
  - `FONT_KEYS.KENNEY_FUTURE_NARROW`

- **`src/game/assets/TiledKeys.ts`** - Tiled map editor layer/property names
  - `OBJECT_LAYER_NAMES`
  - `TILED_*_PROPERTY` groups

### Import Example

```typescript
import { AUDIO_ASSET_KEYS, UI_ASSET_KEYS } from '@/game/assets';

// Usage in Preloader or other scenes
this.load.audio(AUDIO_ASSET_KEYS.BATTLE, 'assets/legacy/audio/xDeviruchi/Decisive-Battle.wav');
this.load.image(UI_ASSET_KEYS.BLUE_BUTTON, 'assets/legacy/images/kenneys-assets/ui-pack/blue_button00.png');
```

## Asset Sources & Licensing

All assets are sourced from open-source creators and are properly licensed. Below is the complete attribution:

### Fonts

| Asset | Author | License | Source |
|-------|--------|---------|--------|
| Fonts (Kenney-Future-Narrow, etc.) | Kenney | CC0 | [Kenney Fonts](https://www.kenney.nl/assets/kenney-fonts) |

### Images

| Asset | Author | License | Source | Location |
|-------|--------|---------|--------|----------|
| UI Panel | Kenney | CC0 | [UI Pack Space Expansion](https://www.kenney.nl/assets/ui-pack-space-expansion) | `kenneys-assets/ui-space-expansion/` |
| UI Pack (buttons, etc.) | Kenney | CC0 | [UI Pack](https://www.kenney.nl/assets/ui-pack) | `kenneys-assets/ui-pack/` |
| Board Game Info | Kenney | CC0 | [Board Game Info Pack](https://www.kenney.nl/assets/board-game-info) | `kenneys-assets/` |
| NPC Characters | Parabellum Games | License-free | [Retro RPG Character Pack](https://parabellum-games.itch.io/retro-rpg-character-pack) | `parabellum-games/` |
| Player Characters | AxulArt | License-free | [Small 8-direction Characters](https://axulart.itch.io/small-8-direction-characters) | `axulart/character/` |
| Basic Plains Tileset | AxulArt | License-free | [BasicPlains Tileset Ver. 2](https://axulart.itch.io/axularts-basicplains-tileset-ver2) | `axulart/plains/` |
| Beach & Caves Tileset | AxulArt | License-free | [Beach and Caves Tileset](https://axulart.itch.io/axularts-beach-and-caves-tileset) | `axulart/beach/` |
| Building Interiors | AxulArt | License-free | [Basic Top-down Interior](https://axulart.itch.io/axularts-basic-top-down-interior) | `axulart/interior/` |
| Retro RPG Buildings | The Pixel Nook | License-free | [Retro RPG Buildings](https://the-pixel-nook.itch.io/rpg-building-pack) | `axulart/` |
| Ice Attack VFX | Pimen | License-free | [Ice Spell Effect 01](https://pimen.itch.io/ice-spell-effect-01) | `pimen/ice-attack/` |
| Slash Attack VFX | Pimen | License-free | [Battle VFX Slashes and Thrusts](https://pimen.itch.io/battle-vfx-slashes-and-thrusts) | `pimen/slash/` |

### Audio

| Asset | Author | License | Source | Location |
|-------|--------|---------|--------|----------|
| Game Music (BGM) | xdeviruchi | License-free | [xdeviruchi SoundCloud](https://soundcloud.com/xdeviruchi) | `audio/xDeviruchi/` |
| Sound Effects | leohpaz | Creative Commons (Attribution) | [RPG Essentials SFX Free](https://leohpaz.itch.io/rpg-essentials-sfx-free) | `audio/leohpaz/` |

## PWA & Service Worker Considerations

The service worker (`public/sw.js`) will automatically cache static assets from `/public/assets/` during installation. To ensure PWA compatibility:

1. All legacy assets remain in `/public/assets/legacy/` and are served as static files
2. Service worker precaching includes the legacy asset directory
3. Asset URLs use the correct `/assets/legacy/...` path in Preloader and game scenes
4. Manifest icons remain in `/public/` for PWA configuration

## Next.js Static Export

With `npm run build-nolog`, Next.js will:

1. Bundle all files from `/public/assets/` into the static export output
2. Include legacy assets as-is (binary files are copied, not processed)
3. Reference them via relative `/assets/legacy/...` paths
4. Output total build size: ~71 MB for legacy assets alone

## Integration Points

### Preloader Scene (`src/game/scenes/Preloader.ts`)

Update the asset loading to use the new paths and asset keys:

```typescript
import { AUDIO_ASSET_KEYS, UI_ASSET_KEYS } from '@/game/assets';

preload() {
  this.load.setPath('assets/legacy');
  
  // Load images
  this.load.image(UI_ASSET_KEYS.BLUE_BUTTON, 'images/kenneys-assets/ui-pack/blue_button00.png');
  
  // Load audio
  this.load.audio(AUDIO_ASSET_KEYS.BATTLE, 'audio/xDeviruchi/Decisive-Battle.wav');
}
```

### Build Verification

After running `npm run build-nolog`, verify:

1. Asset files appear in output directory (e.g., `.next/static/` or export folder)
2. No broken image/audio references in browser console
3. PWA manifest still valid and icons accessible
4. Total build size reasonable (~71 MB + other assets)

## Maintenance & Updates

To update legacy assets in the future:

1. Download the latest release from [Assets Repository](https://github.com/devshareacademy/monster-tamer/releases)
2. Extract `audio/` and `images/` folders
3. Replace contents of `/public/assets/legacy/audio/` and `/public/assets/legacy/images/`
4. Verify no new asset keys are needed in TypeScript modules
5. Run `npm run build-nolog` to verify build succeeds

## Troubleshooting

### Assets not loading in-game

- Verify paths use `/assets/legacy/...` in Preloader
- Check browser Network tab for 404 errors
- Ensure asset key strings match filenames (case-sensitive)
- Confirm service worker allows caching of new asset paths

### Build size too large

- Legacy assets (~71 MB) are expected to be large
- Consider implementing asset streaming/lazy loading for future optimization
- PWA can enable offline play but will require significant storage

### Missing licenses

If you modify or add new assets, ensure:
1. Proper attribution is included
2. License terms are respected
3. Updates are documented in this file

## References

- Original Legacy Project: [Monster Tamer GitHub](https://github.com/devshareacademy/monster-tamer)
- Asset Pack Release: [All Game Assets v2](https://github.com/devshareacademy/monster-tamer/releases/download/assets/all-game-assets-v2.zip)
- Legacy Port Plan: [/docs/LEGACY_PORT_PLAN.md](/docs/LEGACY_PORT_PLAN.md)
