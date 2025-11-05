/**
 * EncounterSystem - Manages random wild encounters
 * Triggers battles when player moves through grass tiles
 */

import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import MapManager, { IMapData } from './MapManager';
import { CritterSpeciesDatabase } from '../models/CritterSpeciesDatabase';
import { Critter } from '../models/Critter';

export interface IEncounterConfig {
  encounterChance?: number;
  stepsBeforeNextEncounter?: number;
  debounceMs?: number;
}

export class EncounterSystem {
  private mapData: IMapData | null = null;
  private stepsInGrass: number = 0;
  private encounterChance: number;
  private stepsBeforeNextEncounter: number;
  private lastEncounterTime: number = 0;
  private debounceMs: number;

  constructor(config: IEncounterConfig = {}) {
    this.encounterChance = config.encounterChance || 30; // 30% chance
    this.stepsBeforeNextEncounter = config.stepsBeforeNextEncounter || 1;
    this.debounceMs = config.debounceMs || 500; // Prevent rapid encounters
  }

  /**
   * Set the current map
   */
  setMap(mapData: IMapData): void {
    this.mapData = mapData;
    this.stepsInGrass = 0;
  }

  /**
   * Check for encounter at current player position
   */
  checkEncounter(playerX: number, playerY: number): boolean {
    if (!this.mapData) return false;

    // Debounce encounters
    const now = Date.now();
    if (now - this.lastEncounterTime < this.debounceMs) {
      return false;
    }

    // Check if on grass tile
    if (!MapManager.isGrassAtWorldXY(this.mapData, playerX, playerY)) {
      this.stepsInGrass = 0;
      return false;
    }

    this.stepsInGrass++;

    // Check if enough steps taken and roll for encounter
    if (this.stepsInGrass >= this.stepsBeforeNextEncounter) {
      if (Phaser.Math.Between(1, 100) <= this.encounterChance) {
        this.stepsInGrass = 0;
        this.lastEncounterTime = now;
        return true;
      }
    }

    return false;
  }

  /**
   * Trigger a wild encounter
   */
  async triggerWildEncounter(areaId: string): Promise<void> {
    try {
      // Load area data to get wild critters
      const areas = await fetch('/assets/data/areas.json')
        .then(r => r.json())
        .then(data => data as any[])
        .catch(err => {
          console.error('Failed to load areas:', err);
          return [];
        });

      const area = areas.find((a: any) => a.id === areaId);
      if (!area) {
        console.warn(`Area ${areaId} not found`);
        return;
      }

      // Select random wild critter
      const wildCritterEntry = area.wildCritters[
        Phaser.Math.Between(0, area.wildCritters.length - 1)
      ];

      if (!wildCritterEntry) {
        console.warn('No wild critters in area');
        return;
      }

      // Create wild critter instance
      const species = CritterSpeciesDatabase.getSpecies(wildCritterEntry.speciesId);
      if (!species) {
        console.warn(`Species ${wildCritterEntry.speciesId} not found`);
        return;
      }

      const level = Phaser.Math.Between(area.levelRange.min, area.levelRange.max);
      const wildCritter = new Critter(wildCritterEntry.speciesId, level);

      // Emit encounter event
      EventBus.emit('battle:request', {
        encounterType: 'wild',
        wildCritter,
        areaId,
      });
    } catch (error) {
      console.error('Error triggering wild encounter:', error);
    }
  }

  /**
   * Reset encounter state
   */
  reset(): void {
    this.stepsInGrass = 0;
    this.lastEncounterTime = 0;
  }
}

export default EncounterSystem;
