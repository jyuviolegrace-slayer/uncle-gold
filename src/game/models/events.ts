import { Direction, GameEventType, GameFlag } from './common';

export interface GameEventAddNpc {
  type: GameEventType.ADD_NPC;
  data: {
    direction: Direction;
    x: number;
    y: number;
    frame: number;
    id: number;
    animationKeyPrefix: string;
  };
}

export interface GameEventMoveToPlayer {
  type: GameEventType.MOVE_TO_PLAYER;
  data: {
    id: number;
  };
}

export interface GameEventRetracePath {
  type: GameEventType.RETRACE_PATH;
  data: {
    id: number;
    direction: Direction;
  };
}

export interface GameEventTalkToPlayer {
  type: GameEventType.TALK_TO_PLAYER;
  data: {
    id: number;
    messages: string[];
  };
}

export interface GameEventRemoveNpc {
  type: GameEventType.REMOVE_NPC;
  data: {
    id: number;
  };
}

export interface GameEventGiveMonster {
  type: GameEventType.GIVE_MONSTER;
  data: {
    id: number;
  };
}

export interface GameEventAddFlag {
  type: GameEventType.ADD_FLAG;
  data: {
    flag: GameFlag;
  };
}

export interface GameEventRemoveFlag {
  type: GameEventType.REMOVE_FLAG;
  data: {
    flag: GameFlag;
  };
}

export type GameEvent =
  | GameEventAddNpc
  | GameEventMoveToPlayer
  | GameEventRetracePath
  | GameEventRemoveNpc
  | GameEventTalkToPlayer
  | GameEventGiveMonster
  | GameEventAddFlag
  | GameEventRemoveFlag;

export interface EventDetails {
  requires: string[];
  events: GameEvent[];
}

export type EventData = Record<string, EventDetails>;
