export interface SignDetails {
  message: string;
}

export interface NpcDataDetails {
  frame: number;
  animationKeyPrefix: string;
  events: any[]; // Will be typed as NpcEvent[] when we import it
}

export type NpcData = Record<string, NpcDataDetails>;