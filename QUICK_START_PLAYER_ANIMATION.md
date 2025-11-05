# Player Animation System - Quick Start Guide

## 🚀 30-Second Setup

Your player animation system is ready to use with your existing `brawler48x48.png` spritesheet!

## 📍 File Locations

```
✅ Spritesheet:  public/assets/brawler48x48.png
✅ Config:       src/game/config/PlayerConfig.ts
✅ Player Class: src/game/entities/Player.ts
✅ Animator:     src/game/entities/PlayerAnimator.ts
```

## 🎮 Use in Any Scene

```typescript
import { Player } from '@/game/entities/Player';
import { DEFAULT_PLAYER_CONFIG } from '@/game/config/PlayerConfig';

export class MyScene extends Scene {
  private player: Player | null = null;

  create() {
    // Create player (auto-loads your spritesheet)
    this.player = new Player(this, 400, 300, DEFAULT_PLAYER_CONFIG);
    
    // Get sprite for physics
    const sprite = this.player.getSprite();
  }

  update(cursors) {
    // Auto-plays walk/idle on movement
    if (cursors.left.isDown) {
      this.player?.setVelocity(-200, 0);
    } else if (cursors.right.isDown) {
      this.player?.setVelocity(200, 0);
    } else {
      this.player?.stop();
    }
  }

  attack() {
    // Play custom animation
    this.player?.playAnimation('kick');
  }

  victory() {
    // Play one-shot animation
    this.player?.playAnimationOnce('win');
  }
}
```

## 🎬 Available Animations

```
walk       - Walking cycle
idle       - Standing still
kick       - Kick attack
punch      - Punch attack
jump       - Jumping
jumpkick   - Jump kick combo
win        - Victory pose
die        - Death/hurt pose
```

## ⚙️ Update Animations

Edit `src/game/config/PlayerConfig.ts`:

```typescript
{
  key: 'walk',
  frames: [0, 1, 2, 3],    // ← Spritesheet frame indices
  frameRate: 8,            // ← Animation speed (lower = faster)
  repeat: -1,              // ← -1 = loop, 0 = play once
}
```

**No scene changes needed!**

## 🎨 Add New Animation

In PlayerConfig.ts animations array:

```typescript
{
  key: 'attack',
  frames: [40, 41, 42, 43, 42, 41],
  frameRate: 12,
  repeat: 0,  // Play once
}
```

Use anywhere:
```typescript
player.playAnimation('attack');
```

## 📊 API Cheat Sheet

```typescript
// Movement (auto-animates)
player.setVelocity(vx, vy)           // Start walk animation
player.stop()                         // Stop and play idle

// Animations
player.playAnimation('kick')          // Loop animation
player.playAnimationOnce('win')       // Play once

// Info
player.getSprite()                    // Physics sprite
player.getCurrentState()              // 'idle'|'moving'|'jumping'|'acting'
player.getAnimator()                  // Direct animator access

// Position
player.setPosition(x, y)
player.getPosition()                  // {x, y}
```

## 🎯 Common Tasks

### Play attack when spacebar pressed
```typescript
this.input.keyboard?.on('keydown-SPACE', () => {
  this.player?.playAnimationOnce('punch');
});
```

### Change animation speed
```typescript
const config = { ...DEFAULT_PLAYER_CONFIG };
config.animations[0].frameRate = 10;  // Slower walk
const player = new Player(this, x, y, config);
```

### Conditional animation
```typescript
if (this.player?.getVelocity().x !== 0) {
  // Currently moving
} else {
  // Currently idle
}
```

## 🔄 Create Character Variants

Define in PlayerConfig.ts:
```typescript
export const KNIGHT_CONFIG: PlayerAssetConfig = {
  textureKey: 'player-knight',
  assetPath: 'knight48x48.png',
  frameWidth: 48,
  frameHeight: 48,
  scale: 2,
  animations: [
    // Different frame indices for knight spritesheet
    { key: 'walk', frames: [0, 1, 2, 3], frameRate: 8, repeat: -1 },
    { key: 'sword-attack', frames: [32, 33, 34], frameRate: 12, repeat: 0 },
  ],
};
```

Use in scene:
```typescript
const player = new Player(this, x, y, KNIGHT_CONFIG);
```

Load spritesheet in Preloader:
```typescript
this.load.spritesheet('player-knight', 'knight48x48.png', {
  frameWidth: 48,
  frameHeight: 48
});
```

## ✅ Checklist

- ✅ Spritesheet at: `public/assets/brawler48x48.png`
- ✅ Config file: `src/game/config/PlayerConfig.ts`
- ✅ Loads in Preloader automatically
- ✅ TypeScript compiles without errors
- ✅ Build succeeds
- ✅ Ready for production

## 📖 For More Details

- `PLAYER_ANIMATION_FINAL_SETUP.md` - Complete setup guide
- `PLAYER_SYSTEM_README.md` - Full API reference
- `PLAYER_ANIMATION_MODULAR_GUIDE.md` - Architecture
- `PLAYER_ANIMATION_EXAMPLES.md` - Code examples
- `src/game/config/PlayerConfig.ts` - Animation definitions

## 🎉 You're Done!

Your player animation system is ready to use. Just import the Player class and create instances with the config. The spritesheet loads automatically and animations work out of the box!

---

**Questions?** Check the detailed guides above or review the code comments.

**Spritesheet not animating?** Make sure frame indices in PlayerConfig.ts match your spritesheet layout.

**Want to add animations?** Just add to the animations array in PlayerConfig.ts!

---

**Ready to deploy!** ✅
