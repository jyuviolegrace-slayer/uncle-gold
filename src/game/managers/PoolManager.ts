import { Scene, GameObjects } from 'phaser';

export interface IPoolConfig {
  maxSize?: number;
  runChildUpdate?: boolean;
}

/**
 * PoolManager - Object pooling for battle effects, particles, and damage numbers
 * Improves performance by reusing instances instead of creating/destroying
 */
export class PoolManager {
  private scene: Scene;
  private pools: Map<string, GameObjects.Group> = new Map();

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Create or get a pool for a class type
   */
  createPool<T extends GameObjects.GameObject>(
    key: string,
    classType: any,
    config?: IPoolConfig
  ): GameObjects.Group {
    if (this.pools.has(key)) {
      return this.pools.get(key)!;
    }

    const pool = this.scene.add.group({
      classType: classType,
      maxSize: config?.maxSize ?? 50,
      runChildUpdate: config?.runChildUpdate ?? true,
    });

    this.pools.set(key, pool);
    return pool;
  }

  /**
   * Get an object from the pool
   */
  getFromPool<T extends GameObjects.GameObject>(key: string): T | null {
    const pool = this.pools.get(key);
    if (!pool || pool.countActive() === 0) {
      return null;
    }

    const obj = pool.getFirst(false) as T;
    if (obj) {
      obj.setActive(true);
      (obj as any).setVisible?.(true);
    }
    return obj;
  }

  /**
   * Return an object to the pool
   */
  returnToPool(key: string, obj: GameObjects.GameObject): void {
    const pool = this.pools.get(key);
    if (!pool) return;

    obj.setActive(false);
    (obj as any).setVisible?.(false);
    pool.killAndHide(obj);
  }

  /**
   * Get all objects from a pool
   */
  getPool(key: string): GameObjects.Group | undefined {
    return this.pools.get(key);
  }

  /**
   * Get pool statistics
   */
  getPoolStats(key: string): { active: number; total: number; available: number } | null {
    const pool = this.pools.get(key);
    if (!pool) return null;

    return {
      active: pool.countActive(),
      total: pool.children.size,
      available: pool.children.size - pool.countActive(),
    };
  }

  /**
   * Clear a specific pool
   */
  clearPool(key: string): void {
    const pool = this.pools.get(key);
    if (pool) {
      pool.clear(true);
      this.pools.delete(key);
    }
  }

  /**
   * Clear all pools
   */
  clearAllPools(): void {
    this.pools.forEach((pool) => {
      pool.clear(true);
    });
    this.pools.clear();
  }

  /**
   * Get all pool keys
   */
  getPools(): string[] {
    return Array.from(this.pools.keys());
  }
}

/**
 * Damage number sprite for pooling in battles
 */
export class DamageNumber extends GameObjects.Text {
  constructor(scene: Scene, x: number, y: number, text: string = '0') {
    super(scene, x, y, text, {
      fontSize: '24px',
      color: '#ff0000',
      fontStyle: 'bold',
    });
    this.setOrigin(0.5);
    this.scene.add.existing(this);
  }

  show(x: number, y: number, damage: number, isCritical: boolean = false): void {
    this.setPosition(x, y);
    this.setText(damage.toString());
    this.setColor(isCritical ? '#ffff00' : '#ff0000');
    this.setScale(isCritical ? 1.5 : 1.0);
    this.setActive(true);
    this.setVisible(true);

    const targetY = y - 60;
    this.scene.tweens.add({
      targets: this,
      y: targetY,
      alpha: 0,
      duration: 1000,
      ease: 'Quad.Out',
      onComplete: () => {
        this.setAlpha(1);
        this.setActive(false);
        this.setVisible(false);
      },
    });
  }

  preUpdate(): void {
    // Intentionally left empty - can be extended if needed
  }
}

/**
 * Particle effect sprite for pooling
 */
export class ParticleEffect extends GameObjects.Sprite {
  constructor(scene: Scene, x: number, y: number, texture: string = '') {
    super(scene, x, y, texture);
    this.scene.add.existing(this);
    this.setOrigin(0.5);
  }

  playEffect(x: number, y: number, animationKey: string, callback?: () => void): void {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);

    this.once('animationcomplete', () => {
      this.setActive(false);
      this.setVisible(false);
      if (callback) callback();
    });

    super.play(animationKey);
  }

  preUpdate(): void {
    // Intentionally left empty - can be extended if needed
  }
}
