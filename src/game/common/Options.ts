export type TextSpeedOption = 'SLOW' | 'MID' | 'FAST';
export type BattleSceneOption = 'ON' | 'OFF';
export type BattleStyleOption = 'SET' | 'SHIFT';
export type SoundOption = 'ON' | 'OFF';
export type VolumeOption = 0 | 1 | 2 | 3 | 4;
export type MenuColorOption = 0 | 1 | 2;

export const TEXT_SPEED_OPTIONS = {
  SLOW: 'SLOW' as const,
  MID: 'MID' as const,
  FAST: 'FAST' as const,
};

export const BATTLE_SCENE_OPTIONS = {
  ON: 'ON' as const,
  OFF: 'OFF' as const,
};

export const BATTLE_STYLE_OPTIONS = {
  SET: 'SET' as const,
  SHIFT: 'SHIFT' as const,
};

export const SOUND_OPTIONS = {
  ON: 'ON' as const,
  OFF: 'OFF' as const,
};

export enum OptionMenu {
  TEXT_SPEED = 'TEXT_SPEED',
  BATTLE_SCENE = 'BATTLE_SCENE',
  BATTLE_STYLE = 'BATTLE_STYLE',
  SOUND = 'SOUND',
  VOLUME = 'VOLUME',
  MENU_COLOR = 'MENU_COLOR',
  CONFIRM = 'CONFIRM',
}

export interface GameOptions {
  textSpeed: TextSpeedOption;
  battleSceneAnimations: BattleSceneOption;
  battleStyle: BattleStyleOption;
  sound: SoundOption;
  volume: VolumeOption;
  menuColor: MenuColorOption;
}

export const DEFAULT_OPTIONS: GameOptions = {
  textSpeed: 'MID',
  battleSceneAnimations: 'ON',
  battleStyle: 'SHIFT',
  sound: 'ON',
  volume: 3,
  menuColor: 0,
};
