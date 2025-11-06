/**
 * Services barrel export - Game services
 */
export { SaveManager } from './SaveManager';
export type { ISaveSlot, ISaveResult, ILoadResult } from './SaveManager';

// New ported utility services
export { DataManager, dataManager } from './DataManager';
export type {
  DataManagerStoreKeys,
  TextSpeedOptions,
  BattleSceneOptions,
  BattleStyleOptions,
  SoundOptions,
  PlayerPosition,
  PlayerLocation,
  GameOptions,
  PlayerData,
  MonstersData,
  GlobalState,
} from './DataManager';

export { AudioManager } from './AudioManager';

export { SaveService, saveService } from './SaveService';
export { SaveSlot } from './SaveService';
export type { SaveSchema } from './SaveService';