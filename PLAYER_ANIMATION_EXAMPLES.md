# Player Animation System - Implementation Examples

## Quick Start: Adding a New Animation

### Scenario: Add "attack" animation to existing player

**Step 1: Add animation definition to PlayerConfig.ts**

```typescript
// src/game/config/PlayerConfig.ts

export const DEFAULT_PLAYER_CONFIG: PlayerAssetConfig = {
  // ... existing config ...
  animations: [
    { key: 'walk', frames: [0, 1, 2, 3], frameRate: 8, repeat: -1 },
    { key: 'idle', frames: [5, 6, 7, 8], frameRate: 8, repeat: -1 },
    // Add new animation here:
    {
      key: 'attack',
      frames: [45, 46, 47, 48, 47, 46],  // Sequence on spritesheet
      frameRate: 12,
      repeat: 0,  // Play once
    },
    // ... rest of animations ...
  ],
};
```

**Step 2: Use in Battle scene**

```typescript
// src/game/scenes/Battle.ts
playerEntity.playAnimationOnce('attack');
```

**Done!** The animator automatically creates the animation in scene initialization.

---

## Scenario: Create Multiple Character Variants

### Add Knight and Mage configs to PlayerConfig.ts

```typescript
// src/game/config/PlayerConfig.ts

export const KNIGHT_CONFIG: PlayerAssetConfig = {
  textureKey: 'player-knight',
  assetPath: 'assets/animations/knight48x48.png',
  frameWidth: 48,
  frameHeight: 48,
  scale: 2,
  animations: [
    { key: 'walk', frames: [0, 1, 2, 3], frameRate: 8, repeat: -1 },
    { key: 'idle', frames: [5, 6, 7, 8], frameRate: 8, repeat: -1 },
    {
      key: 'sword-attack',
      frames: [32, 33, 34, 35, 34, 33],
      frameRate: 10,
      repeat: 0,
    },
    { key: 'shield-block', frames: [48, 49], frameRate: 8, repeat: -1 },
  ],
};

export const MAGE_CONFIG: PlayerAssetConfig = {
  textureKey: 'player-mage',
  assetPath: 'assets/animations/mage48x48.png',
  frameWidth: 48,
  frameHeight: 48,
  scale: 2,
  animations: [
    { key: 'walk', frames: [0, 1, 2, 3], frameRate: 8, repeat: -1 },
    { key: 'idle', frames: [5, 6, 7, 8], frameRate: 8, repeat: -1 },
    {
      key: 'spell-cast',
      frames: [64, 65, 66, 67, 68],
      frameRate: 12,
      repeat: 0,
    },
  ],
};
```

### Load in Preloader.ts

```typescript
// src/game/scenes/Preloader.ts

preload() {
  this.load.setPath('assets');
  
  // Brawler (default)
  this.load.spritesheet('player-brawler', 'animations/brawler48x48.png', {
    frameWidth: 48,
    frameHeight: 48
  });
  
  // Knight
  this.load.spritesheet('player-knight', 'animations/knight48x48.png', {
    frameWidth: 48,
    frameHeight: 48
  });
  
  // Mage
  this.load.spritesheet('player-mage', 'animations/mage48x48.png', {
    frameWidth: 48,
    frameHeight: 48
  });
}
```

### Use based on selected starter in MainMenu

```typescript
// src/game/scenes/MainMenu.ts

private selectStarter() {
  const starterId = this.starterOptions[this.currentSelection].id;
  let playerConfig = DEFAULT_PLAYER_CONFIG;

  if (starterId === 'knight-starter') {
    playerConfig = KNIGHT_CONFIG;
  } else if (starterId === 'mage-starter') {
    playerConfig = MAGE_CONFIG;
  }

  // Pass to Overworld
  this.scene.stop();
  this.scene.start('Overworld', {
    mapId: 'starter-town',
    playerConfig: playerConfig,
  });
}
```

### Receive in Overworld

```typescript
// src/game/scenes/Overworld.ts

private setupPlayer() {
  // ... existing code ...
  
  const config = this.sys.settings.data?.playerConfig || DEFAULT_PLAYER_CONFIG;
  this.player = new Player(this, playerX, playerY, config);
  
  // ... rest of setup ...
}
```

---

## Scenario: Dynamic Animation Speed

### Create speed variants based on critter stats

```typescript
// Utility function to scale animation frameRate
function createCritterAnimConfig(
  baseConfig: PlayerAssetConfig,
  speedModifier: number = 1.0
): PlayerAssetConfig {
  return {
    ...baseConfig,
    animations: baseConfig.animations.map(anim => ({
      ...anim,
      frameRate: Math.round(anim.frameRate * speedModifier),
    })),
  };
}

// Usage in Battle scene
const playerCritterStats = { speed: 50 }; // 50% speed
const speedFactor = playerCritterStats.speed / 100;
const animConfig = createCritterAnimConfig(DEFAULT_PLAYER_CONFIG, speedFactor);

const playerEntity = new Player(this, x, y, animConfig);
```

---

## Scenario: Combat Animation Sequence

### Play attack combo using animator

```typescript
// src/game/scenes/Battle.ts

async performAttackCombo(
  player: Player,
  moves: string[] = ['attack', 'spin', 'finisher']
) {
  const animator = player.getAnimator();
  
  for (const move of moves) {
    animator.playOnce(player.getSprite(), move);
    // Wait for animation to complete
    await new Promise(resolve => {
      this.time.delayedCall(500, resolve); // Adjust timing per animation
    });
  }

  // Return to idle
  player.playAnimation('idle');
}

// Usage
this.input.keyboard?.on('keydown-A', () => {
  performAttackCombo(this.player, ['kick', 'punch', 'victory']);
});
```

---

## Scenario: Conditional Animation Based on Direction

### Extend Player class for directional sprites

```typescript
// src/game/entities/PlayerDirectional.ts

export class PlayerDirectional extends Player {
  private facingDirection: 'left' | 'right' | 'up' | 'down' = 'down';

  setDirection(vx: number, vy: number) {
    if (Math.abs(vx) > Math.abs(vy)) {
      this.facingDirection = vx > 0 ? 'right' : 'left';
    } else if (vy !== 0) {
      this.facingDirection = vy > 0 ? 'down' : 'up';
    }

    // Apply direction modifier to sprite
    if (this.facingDirection === 'left') {
      this.getSprite().setFlipX(true);
    } else {
      this.getSprite().setFlipX(false);
    }
  }

  playDirectionalAnimation(baseKey: string) {
    const animKey = `${baseKey}-${this.facingDirection}`;
    this.playAnimation(animKey);
  }
}
```

### Config for directional sprites

```typescript
export const DIRECTIONAL_PLAYER_CONFIG: PlayerAssetConfig = {
  textureKey: 'player-directional',
  assetPath: 'assets/animations/player-directional48x48.png',
  frameWidth: 48,
  frameHeight: 48,
  scale: 2,
  animations: [
    // Directional walk
    { key: 'walk-down', frames: [0, 1, 2, 3], frameRate: 8, repeat: -1 },
    { key: 'walk-up', frames: [4, 5, 6, 7], frameRate: 8, repeat: -1 },
    { key: 'walk-left', frames: [8, 9, 10, 11], frameRate: 8, repeat: -1 },
    { key: 'walk-right', frames: [12, 13, 14, 15], frameRate: 8, repeat: -1 },
    
    // ... more directional animations ...
  ],
};
```

---

## Scenario: Custom Animator for Boss

### Extend animator for special behavior

```typescript
// src/game/entities/BossAnimator.ts

export class BossAnimator extends PlayerAnimator {
  playPatternAttack(sprite: Sprite, pattern: string[]) {
    let delay = 0;
    for (const move of pattern) {
      setTimeout(() => {
        this.play(sprite, move);
      }, delay);
      delay += 800;
    }
  }

  playPhaseTransition(sprite: Sprite) {
    this.playOnce(sprite, 'phase-2-transform');
  }

  playDefendMode(sprite: Sprite) {
    this.play(sprite, 'shield');
  }
}
```

### Boss config

```typescript
export const BOSS_CONFIG: PlayerAssetConfig = {
  textureKey: 'boss-dragon',
  assetPath: 'assets/animations/boss-dragon64x64.png',
  frameWidth: 64,
  frameHeight: 64,
  scale: 3,
  animations: [
    { key: 'idle', frames: [0, 1, 2], frameRate: 5, repeat: -1 },
    { key: 'fireball', frames: [16, 17, 18, 19], frameRate: 10, repeat: 0 },
    { key: 'phase-2-transform', frames: [32, 33, 34, 35, 36], frameRate: 8, repeat: 0 },
    { key: 'shield', frames: [48, 49], frameRate: 4, repeat: -1 },
  ],
};
```

---

## Scenario: Mobile-Optimized Frame Rates

### Reduce animation smoothness on low-end devices

```typescript
// Utility to adapt config for device performance
function getOptimizedPlayerConfig(device: 'high' | 'mid' | 'low'): PlayerAssetConfig {
  const baseConfig = DEFAULT_PLAYER_CONFIG;
  const frameRateMultiplier = {
    high: 1.0,   // Full quality
    mid: 0.8,    // 80% smooth
    low: 0.6,    // 60% smooth (reduces jank)
  }[device];

  return {
    ...baseConfig,
    animations: baseConfig.animations.map(anim => ({
      ...anim,
      frameRate: Math.ceil(anim.frameRate * frameRateMultiplier),
    })),
  };
}

// Usage in Preloader
const deviceTier = detectDeviceCapabilities(); // 'high' | 'mid' | 'low'
const playerConfig = getOptimizedPlayerConfig(deviceTier);
// Pass to Overworld
```

---

## Best Practices

### ✅ DO

- Keep animation configs separate in PlayerConfig.ts
- Use descriptive animation keys: `'attack-spin'` not `'anim2'`
- Define frame sequences visually (map to spritesheet grid)
- Use play once for non-looping animations
- Document which frames correspond to which sprites

### ❌ DON'T

- Hardcode animation data in scenes
- Use dynamic frame calculations in Player class
- Mix UI and animation logic
- Create animations without checking if they exist
- Forget to cleanup animator on scene shutdown

---

## Full Battle Integration Example

```typescript
// src/game/scenes/Battle.ts

export class Battle extends Scene {
  private playerEntity: Player | null = null;
  private enemyEntity: Player | null = null;

  async startPlayerAttack(moveType: 'physical' | 'special') {
    if (!this.playerEntity) return;

    const animKey = moveType === 'physical' ? 'attack' : 'spell-cast';
    
    this.playerEntity.playAnimationOnce(animKey);
    
    // Play hit effect after animation completes
    await new Promise(resolve => {
      this.time.delayedCall(600, resolve);
    });

    // Damage enemy
    this.enemyEntity?.playAnimation('hurt');
  }

  async enemyDefends() {
    if (!this.enemyEntity) return;

    this.enemyEntity.playAnimation('shield');
    
    await new Promise(resolve => {
      this.time.delayedCall(1000, resolve);
    });

    this.enemyEntity.playAnimation('idle');
  }

  async battleEnd(playerWon: boolean) {
    const victor = playerWon ? this.playerEntity : this.enemyEntity;
    const loser = playerWon ? this.enemyEntity : this.playerEntity;

    victor?.playAnimation('win');
    loser?.playAnimation('die');

    await new Promise(resolve => {
      this.time.delayedCall(2000, resolve);
    });

    // Return to overworld
    this.scene.stop('Battle');
    this.scene.resume('Overworld');
  }
}
```

---

## Summary Checklist

- [ ] Add animation frames to spritesheet
- [ ] Update PlayerConfig.ts with new animation definition
- [ ] Load new spritesheet in Preloader.ts (if needed)
- [ ] Use `player.playAnimation(key)` in scene
- [ ] Test animation plays correctly
- [ ] Remove debug logs before shipping

Done! Your animation system is modular and maintainable.
