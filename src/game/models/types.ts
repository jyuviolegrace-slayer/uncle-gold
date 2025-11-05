/**
 * Core TypeScript interfaces for Critter Quest game
 * Defines all major data structures and game entities
 */

/**
 * Stat interface for base and current critter stats
 */
export interface Stats {
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
}

/**
 * Type effectiveness matrix row
 */
export type TypeEffectivenessRow = Record<CritterType, number>;

/**
 * Available critter types (8 types)
 */
export type CritterType =
  | 'Fire'
  | 'Water'
  | 'Grass'
  | 'Electric'
  | 'Psychic'
  | 'Ground'
  | 'Dark'
  | 'Fairy';

/**
 * Move categories
 */
export type MoveCategory = 'Physical' | 'Special' | 'Status';

/**
 * Status condition effects
 */
export type StatusEffect =
  | 'Burn'
  | 'Poison'
  | 'Paralyze'
  | 'Sleep'
  | 'Freeze'
  | 'Confusion';

/**
 * Move instance - move used by a critter in party
 */
export interface IMoveInstance {
  id: string;
  moveId: string;
  currentPP: number;
  maxPP: number;
}

/**
 * Core move definition
 */
export interface IMove {
  id: string;
  name: string;
  type: CritterType;
  power: number;
  accuracy: number;
  basePP: number;
  category: MoveCategory;
  effect?: {
    type: string;
    chance?: number;
    value?: number;
  };
}

/**
 * Critter species template
 */
export interface ICritterSpecies {
  id: string;
  name: string;
  type: CritterType[];
  baseStats: Stats;
  moves: string[];
  evolvesFrom?: string;
  evolvesInto?: string;
  evolutionLevel?: number;
  pokedexEntry: string;
  height: number;
  weight: number;
  catchRate: number;
}

/**
 * Individual critter instance (party member)
 */
export interface ICritter {
  id: string;
  speciesId: string;
  nickname?: string;
  level: number;
  currentHP: number;
  maxHP: number;
  baseStats: Stats;
  currentStats: Stats;
  moves: IMoveInstance[];
  status?: StatusEffect;
  experience: number;
  isFainted: boolean;
}

/**
 * Item definition
 */
export interface IItem {
  id: string;
  name: string;
  description: string;
  type: 'Pokeball' | 'Potion' | 'Key Item' | 'TM' | 'Berry' | 'Other';
  effect?: {
    type: string;
    value?: number;
  };
}

/**
 * Player inventory
 */
export interface IInventory {
  items: Map<string, number>;
  capacity: number;
}

/**
 * Player party (up to 6 critters)
 */
export interface IPlayerParty {
  critters: ICritter[];
  maxSize: number;
}

/**
 * Player game state and progression
 */
export interface IPlayerState {
  name: string;
  level: number;
  badges: string[];
  pokedex: Set<string>;
  inventory: IInventory;
  party: IPlayerParty;
  money: number;
  position: { x: number; y: number };
  currentArea: string;
  playtime: number;
}

/**
 * Single move turn in battle
 */
export interface IBattleTurn {
  actorId: string;
  action: 'move' | 'switch' | 'item' | 'flee';
  targetId?: string;
  moveId?: string;
  itemId?: string;
  critterToSwitchIn?: string;
}

/**
 * Battle participant
 */
export interface IBattleParticipant {
  id: string;
  name: string;
  party: ICritter[];
  currentCritterIndex: number;
}

/**
 * Battle state
 */
export interface IBattle {
  id: string;
  player: IBattleParticipant;
  opponent: IBattleParticipant;
  turnCount: number;
  log: string[];
  isWildEncounter: boolean;
  isTrainerBattle: boolean;
  battleStatus: 'Active' | 'PlayerWon' | 'OpponentWon' | 'Fled' | 'Error';
}

/**
 * Trainer definition (Gym Leaders, Elite Four, Champion, etc.)
 */
export interface ITrainer {
  id: string;
  name: string;
  title: string;
  type?: CritterType;
  party: ICritterSpecies[];
  badge?: string;
  dialogue: {
    intro: string;
    victory: string;
    defeat: string;
  };
}

/**
 * Game area/route definition
 */
export interface IArea {
  id: string;
  name: string;
  type: CritterType;
  description: string;
  levelRange: { min: number; max: number };
  wildCritters: Array<{ speciesId: string; rarity: number }>;
  trainers: ITrainer[];
  landmarks: string[];
}

/**
 * Save file structure
 */
export interface ISaveData {
  version: number;
  timestamp: number;
  playerState: IPlayerState;
  completedArenas: string[];
  defeatedTrainers: string[];
  caughtCritters: ICritter[];
  playedMinutes: number;
}
