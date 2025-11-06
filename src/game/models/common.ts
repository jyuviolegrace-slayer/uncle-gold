export enum Direction {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  UP = 'UP',
  DOWN = 'DOWN',
  NONE = 'NONE',
}

export interface Coordinate {
  x: number;
  y: number;
}

export enum ItemCategory {
  HEAL = 'HEAL',
  CAPTURE = 'CAPTURE',
  POKEBALL = 'Pokeball',
  POTION = 'Potion',
  BERRY = 'Berry',
  TM = 'TM',
  KEY_ITEM = 'Key Item',
}

export enum ItemEffect {
  HEAL_30 = 'HEAL_30',
  CAPTURE_1 = 'CAPTURE_1',
}

export enum MoveCategory {
  PHYSICAL = 'Physical',
  SPECIAL = 'Special',
  STATUS = 'Status',
}

export enum EncounterTileType {
  NONE = 'NONE',
  GRASS = 'GRASS',
}

export enum GameFlag {
  LOOKING_FOR_PROFESSOR = 'LOOKING_FOR_PROFESSOR',
  FOUND_PROFESSOR = 'FOUND_PROFESSOR',
}

export enum NpcEventType {
  MESSAGE = 'MESSAGE',
  SCENE_FADE_IN_AND_OUT = 'SCENE_FADE_IN_AND_OUT',
  HEAL = 'HEAL',
  TRADE = 'TRADE',
  ITEM = 'ITEM',
  BATTLE = 'BATTLE',
  SHOP = 'SHOP',
}

export enum GameEventType {
  ADD_NPC = 'ADD_NPC',
  MOVE_TO_PLAYER = 'MOVE_TO_PLAYER',
  RETRACE_PATH = 'RETRACE_PATH',
  TALK_TO_PLAYER = 'TALK_TO_PLAYER',
  REMOVE_NPC = 'REMOVE_NPC',
  GIVE_MONSTER = 'GIVE_MONSTER',
  ADD_FLAG = 'ADD_FLAG',
  REMOVE_FLAG = 'REMOVE_FLAG',
}
