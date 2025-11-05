import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export interface IPerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage?: number;
  renderTime: number;
  updateTime: number;
  physicsTime: number;
}

/**
 * PerformanceMonitor - Track and optimize game performance
 * Monitors FPS, frame time, and memory usage
 */
export class PerformanceMonitor {
  private scene: Scene;
  private enabled: boolean = true;
  private metrics: IPerformanceMetrics = {
    fps: 60,
    frameTime: 16.67,
    renderTime: 0,
    updateTime: 0,
    physicsTime: 0,
  };
  private frameCount: number = 0;
  private lastSecondTime: number = 0;
  private frameTimeHistory: number[] = [];
  private maxHistorySize: number = 100;
  private debugText: Phaser.GameObjects.Text | null = null;
  private showDebug: boolean = false;

  constructor(scene: Scene) {
    this.scene = scene;
    this.lastSecondTime = scene.time.now;
    this.setupEventListeners();
  }

  /**
   * Update performance metrics
   */
  update(deltaTime: number): void {
    if (!this.enabled) return;

    this.frameCount++;
    this.frameTimeHistory.push(deltaTime);
    if (this.frameTimeHistory.length > this.maxHistorySize) {
      this.frameTimeHistory.shift();
    }

    const currentTime = this.scene.time.now;
    const elapsedTime = currentTime - this.lastSecondTime;

    if (elapsedTime >= 1000) {
      this.metrics.fps = this.frameCount;
      this.metrics.frameTime = elapsedTime / this.frameCount;

      // Calculate average frame time
      const avgFrameTime = this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length;
      this.metrics.renderTime = avgFrameTime * 0.4;
      this.metrics.updateTime = avgFrameTime * 0.4;
      this.metrics.physicsTime = avgFrameTime * 0.2;

      // Memory usage (if available)
      if ((performance as any).memory) {
        this.metrics.memoryUsage = (performance as any).memory.usedJSHeapSize / 1048576;
      }

      this.frameCount = 0;
      this.lastSecondTime = currentTime;

      EventBus.emit('performance:updated', this.metrics);

      if (this.showDebug && this.debugText) {
        this.updateDebugDisplay();
      }
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): IPerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Check if performance is good
   */
  isFPSGood(): boolean {
    return this.metrics.fps >= 50;
  }

  /**
   * Get average frame time
   */
  getAverageFrameTime(): number {
    return this.frameTimeHistory.length > 0
      ? this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length
      : 0;
  }

  /**
   * Get frame time variance
   */
  getFrameTimeVariance(): number {
    const avg = this.getAverageFrameTime();
    const variance = this.frameTimeHistory.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) / this.frameTimeHistory.length;
    return Math.sqrt(variance);
  }

  /**
   * Toggle debug display
   */
  toggleDebugDisplay(): void {
    this.showDebug = !this.showDebug;
    if (this.showDebug) {
      this.createDebugDisplay();
    } else {
      this.debugText?.destroy();
      this.debugText = null;
    }
  }

  /**
   * Create debug overlay
   */
  private createDebugDisplay(): void {
    if (this.debugText) return;

    const width = this.scene.game.config.width as number;
    this.debugText = this.scene.add.text(10, 60, '', {
      font: '12px monospace',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 },
    });
    this.debugText.setScrollFactor(0);
    this.debugText.setDepth(10000);
    this.updateDebugDisplay();
  }

  /**
   * Update debug display text
   */
  private updateDebugDisplay(): void {
    if (!this.debugText) return;

    const metrics = this.metrics;
    const text = `
FPS: ${metrics.fps}
Frame Time: ${metrics.frameTime.toFixed(2)}ms
Avg Frame: ${this.getAverageFrameTime().toFixed(2)}ms
Variance: ${this.getFrameTimeVariance().toFixed(2)}ms
Objects: ${this.scene.children.list.length}
${this.metrics.memoryUsage ? `Memory: ${this.metrics.memoryUsage.toFixed(1)}MB` : ''}
    `.trim();

    this.debugText.setText(text);
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    EventBus.on('toggle-debug', () => {
      this.toggleDebugDisplay();
    });
  }

  /**
   * Get optimization suggestions based on performance
   */
  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];

    if (this.metrics.fps < 50) {
      suggestions.push('FPS below 50 - consider reducing visual effects or particle count');
    }

    if (this.metrics.frameTime > 20) {
      suggestions.push('Frame time > 20ms - check for expensive operations in update cycle');
    }

    if ((this.metrics.memoryUsage ?? 0) > 200) {
      suggestions.push('Memory usage high - consider optimizing asset loading or pooling');
    }

    if (this.scene.children.list.length > 500) {
      suggestions.push(`Too many objects (${this.scene.children.list.length}) - consider using object pooling`);
    }

    return suggestions;
  }

  /**
   * Clean up
   */
  shutdown(): void {
    this.debugText?.destroy();
    this.frameTimeHistory = [];
    EventBus.off('toggle-debug');
  }
}
