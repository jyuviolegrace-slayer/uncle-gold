import { MoveCategory } from './common';

export interface MoveEffect {
  type: string;
  chance?: number;
  value?: number;
}

export interface Move {
  id: string;
  name: string;
  type: string;
  power: number;
  accuracy: number;
  basePP: number;
  category: MoveCategory;
  effect?: MoveEffect;
}

export interface LegacyAttack {
  id: number;
  name: string;
  animationName: string;
  audioKey: string;
}
