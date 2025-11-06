export interface CritterBaseStats {
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
}

export interface Critter {
  id: string;
  name: string;
  types: string[];
  baseStats: CritterBaseStats;
  moves: string[];
  evolvesInto?: string;
  evolvesFrom?: string;
  evolutionLevel?: number;
  pokedexEntry: string;
  height: number;
  weight: number;
  catchRate: number;
}

export interface CritterInstance {
  id: string;
  critterId: string;
  name: string;
  assetKey: string;
  assetFrame: number;
  currentLevel: number;
  maxHp: number;
  currentHp: number;
  baseAttack: number;
  currentAttack: number;
  attackIds: number[];
  baseExp: number;
  currentExp: number;
}

export interface LegacyMonster {
  id: string;
  monsterId: number;
  name: string;
  assetKey: string;
  assetFrame: number;
  currentHp: number;
  maxHp: number;
  attackIds: number[];
  baseAttack: number;
  currentAttack: number;
  currentLevel: number;
  baseExp: number;
  currentExp: number;
}
