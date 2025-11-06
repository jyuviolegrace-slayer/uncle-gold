/**
 * Options enums - Mirrors archive/src/common/options.js
 * Centralized constants for game options to ensure consistency
 */

export enum OptionMenuOptions {
  TEXT_SPEED = 'TEXT_SPEED',
  BATTLE_SCENE = 'BATTLE_SCENE',
  BATTLE_STYLE = 'BATTLE_STYLE',
  SOUND = 'SOUND',
  VOLUME = 'VOLUME',
  MENU_COLOR = 'MENU_COLOR',
  CONFIRM = 'CONFIRM',
}

export enum TextSpeedOptions {
  SLOW = 'SLOW',
  MID = 'MID',
  FAST = 'FAST',
}

export enum BattleSceneOptions {
  ON = 'ON',
  OFF = 'OFF',
}

export enum BattleStyleOptions {
  SET = 'SET',
  SHIFT = 'SHIFT',
}

export enum SoundOptions {
  ON = 'ON',
  OFF = 'OFF',
}

export type VolumeMenuOptions = 0 | 1 | 2 | 3 | 4;
export type MenuColorOptions = 0 | 1 | 2;