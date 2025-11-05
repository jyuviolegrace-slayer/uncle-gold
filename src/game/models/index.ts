/**
 * Central export for all game models, types, and managers
 */

// Type definitions
export * from './types';
export * from './legacyTypes';

// Classes and utilities
export { Critter } from './Critter';
export { TypeChart } from './TypeChart';
export { BattleManager } from './BattleManager';
export { GameStateManager } from './GameStateManager';
export { MoveDatabase } from './MoveDatabase';
export { CritterSpeciesDatabase } from './CritterSpeciesDatabase';
export { AIDecisionMaker } from './AIDecisionMaker';
export { PlayerParty } from './PlayerParty';
export { MoveLearningManager } from './MoveLearningManager';
export { EvolutionManager, type IEvolution } from './EvolutionManager';
export { ItemDatabase } from './ItemDatabase';
export { TrainerDatabase } from './TrainerDatabase';
