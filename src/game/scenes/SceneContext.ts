import { GameStateManager } from '../models/GameStateManager';
import { AudioManager } from '../managers/AudioManager';
import { PoolManager } from '../managers/PoolManager';
import { PerformanceMonitor } from '../managers/PerformanceMonitor';
import { SaveManager, LegacyDataManager } from '../services';

/**
 * SceneContext provides a way to pass player state and references between scenes
 * without polluting global scope or relying on external state management
 * 
 * Now includes access to modern managers and services for consistent dependency injection
 */
export class SceneContext {
  private static instance: SceneContext | null = null;
  private gameStateManager: GameStateManager;
  private saveManager: SaveManager | null = null;
  private legacyDataManager: LegacyDataManager | null = null;
  private audioManager: AudioManager | null = null;
  private poolManager: PoolManager | null = null;
  private performanceMonitor: PerformanceMonitor | null = null;

  private constructor(gameStateManager: GameStateManager) {
    this.gameStateManager = gameStateManager;
  }

  static initialize(gameStateManager: GameStateManager): void {
    if (SceneContext.instance === null) {
      SceneContext.instance = new SceneContext(gameStateManager);
    }
  }

  static getInstance(): SceneContext {
    if (SceneContext.instance === null) {
      SceneContext.instance = new SceneContext(new GameStateManager());
    }
    return SceneContext.instance;
  }

  getGameStateManager(): GameStateManager {
    return this.gameStateManager;
  }

  setSaveManager(saveManager: SaveManager): void {
    this.saveManager = saveManager;
  }

  getSaveManager(): SaveManager | null {
    return this.saveManager;
  }

  setLegacyDataManager(legacyDataManager: LegacyDataManager): void {
    this.legacyDataManager = legacyDataManager;
  }

  getLegacyDataManager(): LegacyDataManager | null {
    return this.legacyDataManager;
  }

  setAudioManager(audioManager: AudioManager): void {
    this.audioManager = audioManager;
  }

  getAudioManager(): AudioManager | null {
    return this.audioManager;
  }

  setPoolManager(poolManager: PoolManager): void {
    this.poolManager = poolManager;
  }

  getPoolManager(): PoolManager | null {
    return this.poolManager;
  }

  setPerformanceMonitor(performanceMonitor: PerformanceMonitor): void {
    this.performanceMonitor = performanceMonitor;
  }

  getPerformanceMonitor(): PerformanceMonitor | null {
    return this.performanceMonitor;
  }

  reset(): void {
    this.gameStateManager = new GameStateManager();
    this.saveManager = null;
    this.legacyDataManager = null;
    this.audioManager = null;
    this.poolManager = null;
    this.performanceMonitor = null;
  }
}
