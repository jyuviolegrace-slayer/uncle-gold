import { ICritter, ICritterSpecies, IMove, IMoveInstance, Stats, StatusEffect, CritterType } from './types';

/**
 * Critter class - represents an individual caught/trained critter
 * Handles stats, moves, leveling, and serialization
 */
export class Critter implements ICritter {
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

  constructor(speciesId: string, level: number = 5, nickname?: string) {
    this.id = this.generateId();
    this.speciesId = speciesId;
    this.nickname = nickname;
    this.level = level;
    this.experience = this.calculateExperienceForLevel(level);
    this.baseStats = { hp: 35, attack: 35, defense: 35, spAtk: 35, spDef: 35, speed: 35 };
    this.currentStats = { ...this.baseStats };
    this.maxHP = this.calculateHP();
    this.currentHP = this.maxHP;
    this.moves = [];
    this.isFainted = false;
  }

  /**
   * Generate unique ID for critter instance
   */
  private generateId(): string {
    return `critter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate HP based on level and base stat
   */
  private calculateHP(): number {
    const baseStat = this.baseStats.hp;
    const hp = Math.floor((2 * baseStat + 31 + 100) * this.level / 100 + 5);
    return Math.max(1, hp);
  }

  /**
   * Calculate stat with IV/nature considerations
   */
  private calculateStat(baseStat: number): number {
    const iv = 31;
    const nature = 1;
    const stat = Math.floor(((2 * baseStat + iv) * this.level / 100 + 5) * nature);
    return Math.max(1, stat);
  }

  /**
   * Recalculate all stats based on level
   */
  recalculateStats(): void {
    this.currentStats.attack = this.calculateStat(this.baseStats.attack);
    this.currentStats.defense = this.calculateStat(this.baseStats.defense);
    this.currentStats.spAtk = this.calculateStat(this.baseStats.spAtk);
    this.currentStats.spDef = this.calculateStat(this.baseStats.spDef);
    this.currentStats.speed = this.calculateStat(this.baseStats.speed);

    const newMaxHP = this.calculateHP();
    const hpRatio = this.currentHP / this.maxHP;
    this.maxHP = newMaxHP;
    this.currentHP = Math.ceil(newMaxHP * hpRatio);
  }

  /**
   * Calculate experience needed for a given level
   * Formula: 4 × Level²
   */
  private calculateExperienceForLevel(level: number): number {
    return 4 * Math.pow(level, 2);
  }

  /**
   * Add experience and handle level ups
   */
  addExperience(amount: number): number[] {
    const levelUpsMissed: number[] = [];
    this.experience += amount;

    let targetExp = this.calculateExperienceForLevel(this.level + 1);
    while (this.experience >= targetExp) {
      this.level += 1;
      levelUpsMissed.push(this.level);
      this.recalculateStats();
      targetExp = this.calculateExperienceForLevel(this.level + 1);
    }

    return levelUpsMissed;
  }

  /**
   * Restore HP to maximum
   */
  heal(): void {
    this.currentHP = this.maxHP;
    this.status = undefined;
    this.isFainted = false;
  }

  /**
   * Apply damage to critter
   */
  takeDamage(damage: number): void {
    this.currentHP = Math.max(0, this.currentHP - damage);
    if (this.currentHP === 0) {
      this.isFainted = true;
    }
  }

  /**
   * Add a move to critter
   */
  addMove(moveInstance: IMoveInstance): void {
    if (this.moves.length < 4) {
      this.moves.push(moveInstance);
    }
  }

  /**
   * Remove a move from critter
   */
  removeMove(moveId: string): void {
    this.moves = this.moves.filter(m => m.id !== moveId);
  }

  /**
   * Apply status condition
   */
  applyStatus(status: StatusEffect): void {
    this.status = status;
  }

  /**
   * Clear status condition
   */
  clearStatus(): void {
    this.status = undefined;
  }

  /**
   * Serialize critter to JSON
   */
  toJSON(): ICritter {
    return {
      id: this.id,
      speciesId: this.speciesId,
      nickname: this.nickname,
      level: this.level,
      currentHP: this.currentHP,
      maxHP: this.maxHP,
      baseStats: { ...this.baseStats },
      currentStats: { ...this.currentStats },
      moves: this.moves.map(m => ({ ...m })),
      status: this.status,
      experience: this.experience,
      isFainted: this.isFainted,
    };
  }

  /**
   * Deserialize critter from JSON
   */
  static fromJSON(data: ICritter): Critter {
    const critter = new Critter(data.speciesId, data.level, data.nickname);
    critter.id = data.id;
    critter.currentHP = data.currentHP;
    critter.maxHP = data.maxHP;
    critter.baseStats = { ...data.baseStats };
    critter.currentStats = { ...data.currentStats };
    critter.moves = data.moves.map(m => ({ ...m }));
    critter.status = data.status;
    critter.experience = data.experience;
    critter.isFainted = data.isFainted;
    return critter;
  }

  /**
   * Get display name (nickname or species name)
   */
  getDisplayName(speciesName: string): string {
    return this.nickname || speciesName;
  }

  /**
   * Reset move PP after battle
   */
  resetMovePP(): void {
    this.moves.forEach(moveInstance => {
      moveInstance.currentPP = moveInstance.maxPP;
    });
  }
}
