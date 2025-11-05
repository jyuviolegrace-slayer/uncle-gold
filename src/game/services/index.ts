export { SaveManager } from './SaveManager';
export type { ISaveSlot, ISaveResult, ILoadResult } from './SaveManager';
export { LegacyDataManager } from './LegacyDataManager';
export type {
  TextSpeedOption,
  BattleSceneOption,
  BattleStyleOption,
  SoundOption,
  ILegacyPlayerLocation,
  ILegacyPlayerPosition,
  ILegacyPlayer,
  ILegacyOptions,
  ILegacyMonsterData,
  ILegacyInventoryItem,
  IGlobalState,
} from './LegacyDataManager';
export { LegacyDataUtils } from './LegacyDataUtils';
export type {
  IAttack,
  IAnimation,
  IItem as ILegacyItem,
  IMonster,
  IEncounterData,
  INpcDetails,
  IEventDetails,
  ISignDetails,
} from './LegacyDataUtils';
export {
  convertLegacyInventoryToModern,
  convertModernInventoryToLegacy,
  convertLegacyCrittersToModern,
  convertModernCrittersToLegacy,
  convertLegacyStateToSaveData,
  convertSaveDataToLegacyState,
  mergeModernSaveWithLegacyOptions,
  extractLegacyOptions,
  validateLegacyState,
  validateSaveData,
  DataCompatibilityWrapper,
} from './SaveManagerAdapters';
