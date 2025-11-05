# Critter Quest - Optimization and Performance Guide

## Overview

This guide covers the optimization techniques, performance profiling, and architectural decisions made for Critter Quest to achieve consistent 60 FPS gameplay on mid-range hardware.

## Performance Targets

- **Desktop (60 FPS):** Chrome, Firefox, Safari on Windows/Mac/Linux
- **Mobile (50 FPS):** iOS Safari, Chrome on Android (mid-range devices)
- **Low-end (40 FPS):** Devices with CPU throttling enabled
- **Memory:** < 150 MB after 60 minutes of play
- **Load Time:** < 3 seconds initial, < 500 ms scene transitions

---

## Architecture Optimization

### 1. Object Pooling

Object pooling prevents garbage collection pauses by reusing instances instead of creating and destroying them repeatedly.

**Implementation:**
```typescript
// In Battle scene
this.poolManager = new PoolManager(this);
this.poolManager.createPool('damageNumber', DamageNumber, { maxSize: 20 });

// Get from pool
const damage = this.poolManager.getFromPool('damageNumber');

// Return to pool
this.poolManager.returnToPool('damageNumber', damageNumber);
```

**Benefits:**
- Reduces garbage collection pauses
- Improves frame consistency
- Faster object creation (reuse vs. instantiation)

**Current Pools:**
- Damage Numbers: 20 instances max
- Particle Effects: Recommended 50 instances
- UI Elements: Reused containers

### 2. Scene Management

Scenes are efficiently managed using Phaser's scene system:

**Pattern: Pause/Resume for Modals**
```typescript
// Opening menu (pause overworld)
this.scene.pause();
this.scene.launch('Menu', { previousScene: 'Overworld' });

// Closing menu (resume overworld)
this.scene.stop();
this.scene.resume('Overworld');
```

**Benefits:**
- Avoids creating multiple scene instances
- Maintains game state between transitions
- Smooth visual transitions

### 3. Audio Manager

Centralized audio with pooling and crossfading:

**Features:**
- Music crossfading (smooth transitions)
- SFX pooling (max 5 simultaneous per sound)
- Volume control (music/SFX/master)
- Mute toggle

**Usage:**
```typescript
const audioManager = new AudioManager(scene);

// Play music with fade
audioManager.playMusic('battle-theme', { fade: 500 });

// Play SFX with pooling
audioManager.playSFX('attack-sound', { volume: 0.8 });

// Control volume
audioManager.setMusicVolume(0.7);
audioManager.toggleMute();
```

### 4. Performance Monitoring

Real-time FPS and performance tracking:

**Debug Display (Press 'D' key):**
- FPS counter
- Average frame time
- Frame time variance
- Object count
- Memory usage (if available)

**Metrics:**
```typescript
const perfMonitor = this.game.registry.get('performanceMonitor');
const metrics = perfMonitor.getMetrics();

console.log(`FPS: ${metrics.fps}`);
console.log(`Frame Time: ${metrics.frameTime}ms`);
```

---

## Rendering Optimization

### 1. Sprite Management

**Best Practices:**
```typescript
// Reuse sprites instead of destroying
sprite.setActive(false);
sprite.setVisible(false);

// Later: reactivate
sprite.setActive(true);
sprite.setVisible(true);
```

### 2. Container Optimization

Containers batch multiple objects:
```typescript
// Good: Single container with children
const uiContainer = this.add.container(0, 0);
uiContainer.add([bg, text, button]);

// Bad: Multiple separate objects
this.add.rectangle(...);
this.add.text(...);
this.add.sprite(...);
```

### 3. Text Rendering

Static text is more performant:
```typescript
// Create once
this.hpText = this.add.text(100, 100, 'HP: 100/100');

// Update when needed (cheaper than destroying/recreating)
this.hpText.setText('HP: 80/100');

// Avoid creating text in update loop
```

### 4. Camera Optimization

- Use `setScrollFactor(0)` for UI (doesn't follow camera)
- Batch render with appropriate depth values
- Avoid excessive camera panning

---

## Asset Optimization

### 1. Sprite Sheets

Spritesheets reduce draw calls and improve memory efficiency:

**Format:** PNG atlas with JSON metadata
- Pack related sprites together
- Trim transparent pixels
- Use texture atlasing tools

**Loading:**
```typescript
this.load.atlas('critters', 'assets/critters.png', 'assets/critters.json');
```

### 2. Audio Assets

Compress audio to reduce file size:

**Format Guidelines:**
- **Music:** MP3 @ 128-192 kbps
- **SFX:** MP3 @ 96-128 kbps
- **Voice:** MP3 @ 64-128 kbps

**Tools:**
- FFmpeg: `ffmpeg -i input.wav -ab 128k output.mp3`
- Audacity: Export with quality compression

### 3. Map Data

JSON-based tilemaps are efficient:
```typescript
// Load tilemap
const map = await MapManager.loadMap('starter-town');

// References tiles by ID (compact format)
// Each tile: 1-2 bytes instead of full sprite objects
```

---

## Physics Optimization

### Arcade Physics

The lightweight Arcade Physics system is used:

**Optimization Tips:**
1. **Use Static Groups for non-moving colliders:**
   ```typescript
   const walls = this.physics.add.staticGroup();
   // Cheaper than dynamic sprites
   ```

2. **Disable physics for non-moving objects:**
   ```typescript
   // NPC sprite (no physics needed)
   const npc = this.add.sprite(x, y, 'npc');
   
   // Player sprite (needs physics)
   const player = this.physics.add.sprite(x, y, 'player');
   ```

3. **Batch collision checks:**
   ```typescript
   this.physics.add.overlap(playerGroup, itemGroup, handleCollect);
   // Better than checking individually in update()
   ```

---

## Code-Level Optimization

### 1. Caching Expensive Calculations

```typescript
// Bad: Calculated every frame
update() {
  const avg = this.someArray.reduce((a, b) => a + b) / this.someArray.length;
  // ...
}

// Good: Calculated once, cached
private avgValue: number = 0;
calculateAverage() {
  this.avgValue = this.someArray.reduce((a, b) => a + b) / this.someArray.length;
}
```

### 2. Lazy Initialization

```typescript
// Defer expensive initialization
private database: CritterDatabase | null = null;

getDatabase() {
  if (!this.database) {
    this.database = new CritterDatabase();
    this.database.initialize();
  }
  return this.database;
}
```

### 3. Avoid Allocation in Hot Loops

```typescript
// Bad: Creates new objects every frame
update() {
  for (let i = 0; i < 100; i++) {
    const pos = { x: i * 10, y: i * 10 }; // New object each iteration
  }
}

// Good: Reuse object
private tempPos = { x: 0, y: 0 };
update() {
  for (let i = 0; i < 100; i++) {
    this.tempPos.x = i * 10;
    this.tempPos.y = i * 10;
  }
}
```

---

## Memory Optimization

### 1. String Interning

Reuse common strings to reduce memory:
```typescript
// Create once
const POKEMON_TYPE = 'pokemon';
const MOVE_TYPE = 'move';

// Reuse throughout code
sprite.setData('type', POKEMON_TYPE);
```

### 2. Singleton Pattern

For databases and managers:
```typescript
export class CritterDatabase {
  private static instance: CritterDatabase;

  static getInstance(): CritterDatabase {
    if (!this.instance) {
      this.instance = new CritterDatabase();
    }
    return this.instance;
  }
}
```

### 3. Cleanup on Scene Shutdown

```typescript
shutdown() {
  // Stop tweens
  this.tweens.killAll();

  // Stop animations
  this.anims.stopOnGameOut();

  // Clear pools
  if (this.poolManager) {
    this.poolManager.clearAllPools();
  }

  // Remove event listeners
  EventBus.off('event-name');

  // Destroy containers
  this.containers.forEach(c => c.destroy());
}
```

---

## Browser-Specific Optimization

### Chrome/Chromium

- **Enabled:** Hardware acceleration, multi-threaded rendering
- **Optimization:** Use requestAnimationFrame (Phaser does this)

### Firefox

- **Enabled:** WebGL rendering
- **Optimization:** Maintain consistent frame timing

### Safari (iOS)

- **Considerations:**
  - Smaller memory budget
  - More aggressive garbage collection
  - Audio context restrictions (requires user interaction)

**iOS Optimization:**
```typescript
// Request user interaction for audio
document.addEventListener('touchstart', () => {
  audioManager.resumeAll();
}, { once: true });
```

---

## Profiling and Debugging

### 1. Using Browser DevTools

**Performance Tab:**
1. Open DevTools (F12)
2. Go to Performance tab
3. Click Record
4. Play game for 10-15 seconds
5. Click Stop
6. Analyze frame timeline

**Look for:**
- Yellow: Processing
- Purple: Rendering
- Blue: Memory/GC

### 2. Memory Profiling

**DevTools Memory Tab:**
1. Take heap snapshot
2. Play game
3. Take second snapshot
4. Compare
5. Look for retained objects

### 3. In-Game Debug Display

Press 'D' to toggle debug overlay:
- FPS: Target ≥ 50
- Frame Time: < 20ms = good
- Objects: < 500 is ideal for mobile
- Memory: Monitor growth over time

---

## Performance Checklist

### Before Shipping

- [ ] FPS ≥ 50 on target hardware
- [ ] Memory < 150 MB after extended play
- [ ] No memory leaks detected
- [ ] All scenes transition smoothly
- [ ] Audio crossfades properly
- [ ] Damage numbers use pooling
- [ ] Particles use pooling
- [ ] All assets compressed
- [ ] Build size optimized
- [ ] No console errors

### Monitoring

- [ ] Set up error tracking
- [ ] Monitor FPS distribution
- [ ] Track memory usage
- [ ] Log performance metrics
- [ ] Collect user feedback

---

## Common Performance Issues and Solutions

### Issue: FPS Drops During Battles

**Causes:**
- Too many particles/tweens
- Unoptimized animations
- Physics calculations

**Solutions:**
1. Reduce particle count
2. Use object pooling
3. Optimize animation frames
4. Profile with DevTools

### Issue: Memory Growth Over Time

**Causes:**
- Event listeners not removed
- Objects not destroyed
- Textures not released

**Solutions:**
1. Implement proper cleanup in shutdown()
2. Use single EventBus instance
3. Destroy unused textures
4. Profile with heap snapshots

### Issue: Slow Asset Loading

**Causes:**
- Large uncompressed assets
- Too many simultaneous requests
- Network latency

**Solutions:**
1. Compress images/audio
2. Use spritesheet atlasing
3. Implement progressive loading
4. Consider asset caching

---

## Future Optimization Opportunities

1. **WebWorkers:** Move physics calculations off main thread
2. **Canvas Rendering:** Fallback for low-end devices
3. **Instancing:** Batch similar sprites
4. **LOD System:** Reduce detail at distance
5. **Streaming Assets:** Load areas on-demand

---

## References

- [Phaser 3 Performance Tips](https://labs.phaser.io)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [WebGL Best Practices](https://www.khronos.org/webgl/wiki/WebGL_and_WebGL_2_Differences)

---

**Last Updated:** November 5, 2024  
**Version:** 1.0
