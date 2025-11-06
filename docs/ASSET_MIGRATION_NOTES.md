# Asset Migration Notes

This repository now serves all runtime assets directly from `public/assets/**` so the game can run entirely offline. The following notes document the largest binaries that were migrated and should be monitored during future updates:

## Large Audio Assets

| Path | Size (approx.) | Notes |
| --- | --- | --- |
| `public/assets/audio/xDeviruchi/And-the-Journey-Begins.wav` | 20.8 MB | Main overworld BGM (xDeviruchi) |
| `public/assets/audio/xDeviruchi/Decisive-Battle.wav` | 20.2 MB | Battle theme (xDeviruchi) |
| `public/assets/audio/xDeviruchi/Title-Theme.wav` | 21.7 MB | Title screen theme (xDeviruchi) |

These tracks are required for the MVP experience but dominate the download size. Consider providing compressed OGG versions or dynamic streaming if a lighter build is ever required.

## Additional Observations

- All texture, spritesheet, and tilemap assets have been consolidated under `public/assets/images`. The manifest ensures cache keys line up with the enums defined in the TypeScript codebase.
- Legacy JSON data (monsters, encounters, NPCs, etc.) now lives under `public/assets/data/legacy`, while new schema-driven data remains in `public/assets/data`.
- The service worker cache (`critter-quest-v2`) pre-caches every asset referenced by the new preloader manifest so installs remain fully offline.

Please keep this file updated if new large binaries are introduced or if any assets are intentionally left external to limit bundle size.
