/**
 * Types - Placeholder for future game model types
 */
export interface ISaveData {
  // Placeholder save data structure
  version: string;
  timestamp: number;
  // Add more fields as needed
}

export interface ICharacter {
  // Placeholder character data
  id: string;
  name: string;
  level: number;
}

export interface IMonster {
  // Placeholder monster data
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
}

export interface IItem {
  // Placeholder item data
  id: string;
  name: string;
  quantity: number;
}