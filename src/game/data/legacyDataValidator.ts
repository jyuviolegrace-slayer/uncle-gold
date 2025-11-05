/**
 * Legacy Data Validator
 * Provides utilities to validate and report on legacy data loading
 * Can be used for debugging and verification during development
 */

import DataLoader from './loader';
import { ILegacyConversionResult } from '../models/legacyTypes';

export class LegacyDataValidator {
  /**
   * Validate all legacy data and return a summary report
   */
  static async validateAllLegacyData(): Promise<ILegacyConversionResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let successCount = 0;

    try {
      const allData = await DataLoader.loadAllLegacyData();

      successCount += 1;
      console.log('✓ Legacy critters loaded:', allData.critters.length);
      if (allData.critters.length === 0) {
        errors.push('No legacy critters loaded');
      }

      successCount += 1;
      console.log('✓ Legacy moves loaded:', allData.moves.length);
      if (allData.moves.length === 0) {
        errors.push('No legacy moves loaded');
      }

      successCount += 1;
      console.log('✓ Legacy items loaded:', allData.items.length);
      if (allData.items.length === 0) {
        errors.push('No legacy items loaded');
      }

      const areaCount = Object.keys(allData.encounters).length;
      successCount += 1;
      console.log('✓ Legacy encounters loaded for', areaCount, 'areas');
      if (areaCount === 0) {
        errors.push('No legacy encounters loaded');
      }

      successCount += 1;
      console.log('✓ Legacy NPCs loaded:', allData.npcs.length);
      if (allData.npcs.length === 0) {
        warnings.push('No legacy NPCs loaded');
      }

      successCount += 1;
      console.log('✓ Legacy events loaded:', allData.events.length);
      if (allData.events.length === 0) {
        warnings.push('No legacy events loaded');
      }

      successCount += 1;
      console.log('✓ Legacy signs loaded:', allData.signs.length);
      if (allData.signs.length === 0) {
        warnings.push('No legacy signs loaded');
      }

      successCount += 1;
      console.log('✓ Legacy ID mappings loaded');
      if (
        Object.keys(allData.mappings.monsterIdMap).length === 0 ||
        Object.keys(allData.mappings.attackIdMap).length === 0
      ) {
        errors.push('ID mappings incomplete');
      }

      return { errors, warnings, successCount };
    } catch (error) {
      errors.push(`Failed to load legacy data: ${error instanceof Error ? error.message : String(error)}`);
      return { errors, warnings, successCount };
    }
  }

  /**
   * Validate individual critter species
   */
  static async validateCritters(): Promise<ILegacyConversionResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let successCount = 0;

    try {
      const critters = await DataLoader.loadLegacyCritters();
      successCount = critters.length;

      critters.forEach((critter, index) => {
        if (!critter.id) errors.push(`Critter ${index}: missing id`);
        if (!critter.name) errors.push(`Critter ${index}: missing name`);
        if (!critter.type || critter.type.length === 0) {
          errors.push(`Critter ${index} (${critter.id}): missing or empty types`);
        }
        if (!critter.baseStats) {
          errors.push(`Critter ${index} (${critter.id}): missing baseStats`);
        } else {
          const stats = critter.baseStats;
          if (typeof stats.hp !== 'number') errors.push(`Critter ${critter.id}: invalid hp stat`);
          if (typeof stats.attack !== 'number') errors.push(`Critter ${critter.id}: invalid attack stat`);
          if (typeof stats.defense !== 'number') errors.push(`Critter ${critter.id}: invalid defense stat`);
        }
      });

      return { errors, warnings, successCount };
    } catch (error) {
      errors.push(`Failed to validate critters: ${error instanceof Error ? error.message : String(error)}`);
      return { errors, warnings, successCount };
    }
  }

  /**
   * Validate individual moves
   */
  static async validateMoves(): Promise<ILegacyConversionResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let successCount = 0;

    try {
      const moves = await DataLoader.loadLegacyMoves();
      successCount = moves.length;

      moves.forEach((move, index) => {
        if (!move.id) errors.push(`Move ${index}: missing id`);
        if (!move.name) errors.push(`Move ${index}: missing name`);
        if (!move.type) errors.push(`Move ${index} (${move.id}): missing type`);
        if (typeof move.power !== 'number') errors.push(`Move ${move.id}: invalid power`);
        else if (move.power < 0 || move.power > 150)
          errors.push(`Move ${move.id}: power out of range (${move.power})`);

        if (typeof move.accuracy !== 'number') errors.push(`Move ${move.id}: invalid accuracy`);
        else if (move.accuracy < 0 || move.accuracy > 100)
          errors.push(`Move ${move.id}: accuracy out of range (${move.accuracy})`);

        if (typeof move.basePP !== 'number') errors.push(`Move ${move.id}: invalid basePP`);
        if (!move.category) errors.push(`Move ${move.id}: missing category`);
      });

      return { errors, warnings, successCount };
    } catch (error) {
      errors.push(`Failed to validate moves: ${error instanceof Error ? error.message : String(error)}`);
      return { errors, warnings, successCount };
    }
  }

  /**
   * Validate individual items
   */
  static async validateItems(): Promise<ILegacyConversionResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let successCount = 0;

    try {
      const items = await DataLoader.loadLegacyItems();
      successCount = items.length;

      items.forEach((item, index) => {
        if (!item.id) errors.push(`Item ${index}: missing id`);
        if (!item.name) errors.push(`Item ${index}: missing name`);
        if (!item.description) errors.push(`Item ${index} (${item.id}): missing description`);
        if (!item.type) errors.push(`Item ${index} (${item.id}): missing type`);
      });

      return { errors, warnings, successCount };
    } catch (error) {
      errors.push(`Failed to validate items: ${error instanceof Error ? error.message : String(error)}`);
      return { errors, warnings, successCount };
    }
  }

  /**
   * Validate ID mappings
   */
  static async validateIDMappings(): Promise<ILegacyConversionResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let successCount = 0;

    try {
      const mappings = await DataLoader.loadLegacyIDMappings();

      if (Object.keys(mappings.monsterIdMap).length > 0) {
        successCount += 1;
        console.log('✓ Monster ID map has', Object.keys(mappings.monsterIdMap).length, 'entries');
      } else {
        errors.push('Monster ID map is empty');
      }

      if (Object.keys(mappings.attackIdMap).length > 0) {
        successCount += 1;
        console.log('✓ Attack ID map has', Object.keys(mappings.attackIdMap).length, 'entries');
      } else {
        errors.push('Attack ID map is empty');
      }

      if (Object.keys(mappings.itemIdMap).length > 0) {
        successCount += 1;
        console.log('✓ Item ID map has', Object.keys(mappings.itemIdMap).length, 'entries');
      } else {
        errors.push('Item ID map is empty');
      }

      if (Object.keys(mappings.areaIdMap).length > 0) {
        successCount += 1;
        console.log('✓ Area ID map has', Object.keys(mappings.areaIdMap).length, 'entries');
      } else {
        warnings.push('Area ID map is empty');
      }

      return { errors, warnings, successCount };
    } catch (error) {
      errors.push(`Failed to validate ID mappings: ${error instanceof Error ? error.message : String(error)}`);
      return { errors, warnings, successCount };
    }
  }

  /**
   * Print validation report to console
   */
  static printReport(result: ILegacyConversionResult): void {
    console.log('\n========== VALIDATION REPORT ==========');
    console.log(`Successful operations: ${result.successCount}`);
    console.log(`Warnings: ${result.warnings.length}`);
    console.log(`Errors: ${result.errors.length}`);

    if (result.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      result.warnings.forEach((w, i) => console.log(`  ${i + 1}. ${w}`));
    }

    if (result.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      result.errors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
    } else if (result.warnings.length === 0) {
      console.log('\n✅ All validations passed!');
    }

    console.log('========================================\n');
  }
}

export default LegacyDataValidator;
