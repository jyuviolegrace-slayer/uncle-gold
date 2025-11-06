import { Scene } from 'phaser';
import { Item } from '../models/item';
import { CritterInstance } from '../models/critter';
import { Move } from '../models/move';
import { NpcDetails } from '../models/npc';
import { EventDetails } from '../models/events';
import { EncounterData } from '../models/encounter';
import { dataLoader } from '../data/DataLoader';

/**
 * TypeScript utility functions for accessing game data
 * Ported from archive/src/utils/data-utils.js
 */

export class DataUtils {
  /**
   * Retrieve a Move object by ID
   */
  static getMove(moveId: string): Move | undefined {
    return dataLoader.getMoveById(moveId);
  }

  /**
   * Retrieve all available moves
   */
  static getAllMoves(): Move[] {
    return dataLoader.getAllMoves();
  }

  /**
   * Retrieve an Item object by ID
   */
  static getItem(itemId: string): Item | undefined {
    return dataLoader.getItemById(itemId);
  }

  /**
   * Retrieve multiple Item objects by IDs
   */
  static getItems(itemIds: string[]): Item[] {
    // DataLoader doesn't have getItems method, so we'll get all items and filter
    const allItems = dataLoader.getAllItems();
    return allItems.filter(item => itemIds.includes(item.id));
  }

  /**
   * Retrieve all available items
   */
  static getAllItems(): Item[] {
    return dataLoader.getAllItems();
  }

  /**
   * Retrieve a Critter by ID
   */
  static getCritter(critterId: string): CritterInstance | undefined {
    const critterData = dataLoader.getCritterById(critterId);
    if (!critterData) {
      return undefined;
    }

    // Create a critter instance from the base critter data
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      critterId: critterData.id,
      name: critterData.name,
      assetKey: critterData.id.toLowerCase(),
      assetFrame: 0,
      currentLevel: 1,
      maxHp: critterData.baseStats.hp,
      currentHp: critterData.baseStats.hp,
      baseAttack: critterData.baseStats.attack,
      currentAttack: critterData.baseStats.attack,
      attackIds: critterData.moves.slice(0, 4).map((_, index) => index + 1), // Convert to move IDs
      baseExp: 50, // Default base experience
      currentExp: 0,
    };
  }

  /**
   * Retrieve all available critters
   */
  static getAllCritters(): CritterInstance[] {
    const critterDataList = dataLoader.getAllCritters();
    return critterDataList.map(critterData => {
      // Create a critter instance from the base critter data
      return {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        critterId: critterData.id,
        name: critterData.name,
        assetKey: critterData.id.toLowerCase(),
        assetFrame: 0,
        currentLevel: 1,
        maxHp: critterData.baseStats.hp,
        currentHp: critterData.baseStats.hp,
        baseAttack: critterData.baseStats.attack,
        currentAttack: critterData.baseStats.attack,
        attackIds: critterData.moves.slice(0, 4).map((_, index) => index + 1), // Convert to move IDs
        baseExp: 50, // Default base experience
        currentExp: 0,
      };
    });
  }

  /**
   * Get encounter area details for a specific area
   */
  static getEncounterAreaDetails(areaId: string): number[][] | undefined {
    const table = dataLoader.getEncounterTable(areaId);
    if (table && !table.areaId) {
      // Convert EncounterEntry[] to number[][] to match expected return type
      return table.encounters.map(entry => [entry.monsterId, entry.weight]);
    }
    return undefined;
  }

  /**
   * Get NPC data by ID
   */
  static getNpcData(npcId: string): NpcDetails | undefined {
    // NPC data not yet implemented in DataLoader
    console.warn('[DataUtils] getNpcData not yet implemented');
    return undefined;
    // return dataLoader.getNpcById(npcId);
  }

  /**
   * Get event data by ID
   */
  static getEventData(eventId: string): EventDetails | undefined {
    // Event data not yet implemented in DataLoader
    console.warn('[DataUtils] getEventData not yet implemented');
    return undefined;
    // return dataLoader.getEventById(eventId);
  }

  /**
   * Get all events
   */
  static getAllEvents(): EventDetails[] {
    // Event data not yet implemented in DataLoader
    console.warn('[DataUtils] getAllEvents not yet implemented');
    return [];
    // return dataLoader.getAllEvents();
  }

  /**
   * Legacy compatibility methods for transition from JavaScript version
   */

  /**
   * Legacy method for getting monster attack (for compatibility)
   */
  static getMonsterAttack(scene: Scene, attackId: number): any {
    console.warn('[DataUtils] getMonsterAttack is deprecated, use getMove instead');
    return this.getMove(attackId.toString());
  }

  /**
   * Legacy method for getting animations (for compatibility)
   */
  static getAnimations(scene: Scene): any[] {
    console.warn('[DataUtils] getAnimations is deprecated, animations should be handled by asset system');
    return [];
  }

  /**
   * Legacy method for getting monster by ID (for compatibility)
   */
  static getMonsterById(scene: Scene, monsterId: number): any {
    console.warn('[DataUtils] getMonsterById is deprecated, use getCritter instead');
    return this.getCritter(monsterId.toString());
  }

  /**
   * Legacy method for getting NPC data (for compatibility)
   */
  static getNpcDataLegacy(scene: Scene, npcId: number): any {
    console.warn('[DataUtils] getNpcDataLegacy is deprecated, use getNpcData instead');
    return this.getNpcData(npcId.toString());
  }

  /**
   * Legacy method for getting event data (for compatibility)
   */
  static getEventDataLegacy(scene: Scene, eventId: number): any {
    console.warn('[DataUtils] getEventDataLegacy is deprecated, use getEventData instead');
    return this.getEventData(eventId.toString());
  }

  /**
   * Legacy method for getting sign data (for compatibility)
   */
  static getSignData(scene: Scene, signId: number): any {
    console.warn('[DataUtils] getSignData is deprecated');
    return {
      id: signId,
      text: 'Sign text not implemented',
    };
  }
}