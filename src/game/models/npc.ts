import { Direction, NpcEventType } from './common';

export interface NpcEventMessage {
  type: NpcEventType.MESSAGE;
  requires: string[];
  data: {
    messages: string[];
  };
}

export interface NpcEventSceneFadeInAndOut {
  type: NpcEventType.SCENE_FADE_IN_AND_OUT;
  requires: string[];
  data: {
    fadeInDuration: number;
    fadeOutDuration: number;
    waitDuration: number;
  };
}

export interface NpcEventHeal {
  type: NpcEventType.HEAL;
  requires: string[];
  data: Record<string, never>;
}

export type NpcEvent = NpcEventMessage | NpcEventSceneFadeInAndOut | NpcEventHeal;

export interface NpcDetails {
  frame: number;
  animationKeyPrefix: string;
  events: NpcEvent[];
}

export type NpcData = Record<string, NpcDetails>;
