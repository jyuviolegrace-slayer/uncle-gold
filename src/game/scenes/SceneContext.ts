import { GameStateManager } from '../models/GameStateManager';

/**
 * SceneContext provides a way to pass player state and references between scenes
 * without polluting global scope or relying on external state management
 */
export class SceneContext {
  private static instance: SceneContext | null = null;
  private gameStateManager: GameStateManager;

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

  reset(): void {
    this.gameStateManager = new GameStateManager();
  }
}
