import { ItemCategory, ItemEffect } from './common';

export interface ItemEffectData {
  type: string;
  value?: number;
  chance?: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: string;
  effect?: ItemEffectData;
}

export interface LegacyItem {
  id: number;
  name: string;
  description: string;
  category: ItemCategory;
  effect: ItemEffect;
}

export interface InventoryItem {
  item: Item;
  quantity: number;
}

export interface LegacyInventoryItem {
  item: {
    id: number;
  };
  quantity: number;
}
