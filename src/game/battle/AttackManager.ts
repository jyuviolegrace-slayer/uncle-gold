import { Scene } from 'phaser';
import { BattleMonster } from './BattleMonster';
import { Move } from '../models/move';
import { dataLoader } from '../data/DataLoader';

export enum AttackTarget {
  ENEMY = 'ENEMY',
  PLAYER = 'PLAYER'
}

export interface AttackResult {
  damage: number;
  effectiveness: number;
  criticalHit: boolean;
  missed: boolean;
}

export interface AttackConfig {
  attacker: BattleMonster;
  defender: BattleMonster;
  move: Move;
  target: AttackTarget;
}

/**
 * Attack Manager
 * Handles attack calculations, animations, and damage resolution
 */
export class AttackManager {
  private scene: Scene;
  private skipAnimations: boolean;

  constructor(scene: Scene, skipAnimations: boolean = false) {
    this.scene = scene;
    this.skipAnimations = skipAnimations;
  }

  /**
   * Execute an attack
   */
  async executeAttack(config: AttackConfig): Promise<AttackResult> {
    const { attacker, defender, move, target } = config;

    // Play attacker animation
    await attacker.playAttackAnimation();

    // Calculate damage
    const result = this.calculateDamage(attacker, defender, move);

    // Check if attack missed
    if (result.missed) {
      this.showMissMessage(target);
      return result;
    }

    // Apply damage
    await defender.takeDamage(result.damage);

    // Show damage number
    this.showDamageNumber(defender, result.damage, result.effectiveness, result.criticalHit);

    // Play hit sound effect
    this.playHitSound();

    return result;
  }

  /**
   * Calculate damage for an attack
   */
  private calculateDamage(attacker: BattleMonster, defender: BattleMonster, move: Move): AttackResult {
    const attackerDetails = attacker.getMonsterDetails();
    const defenderDetails = defender.getMonsterDetails();

    // Check accuracy
    const accuracyRoll = Math.random() * 100;
    if (accuracyRoll > move.accuracy) {
      return {
        damage: 0,
        effectiveness: 1,
        criticalHit: false,
        missed: true
      };
    }

    // Base damage calculation (simplified version of Pokémon formula)
    const level = attackerDetails.currentLevel;
    const attack = attackerDetails.baseAttack;
    const defense = defenderDetails.baseAttack; // Using baseAttack as defense for now
    const power = move.power;

    // Critical hit check (6.25% chance)
    const criticalHit = Math.random() < 0.0625;
    const criticalMultiplier = criticalHit ? 2 : 1;

    // Type effectiveness (simplified)
    const effectiveness = this.calculateTypeEffectiveness(move.type, defenderDetails);

    // Random factor (85-100%)
    const randomFactor = 0.85 + Math.random() * 0.15;

    // Damage formula
    const damage = Math.floor(
      ((2 * level + 10) / 250 * (attack / defense) * power + 2) *
      criticalMultiplier *
      effectiveness *
      randomFactor
    );

    return {
      damage,
      effectiveness,
      criticalHit,
      missed: false
    };
  }

  /**
   * Calculate type effectiveness
   */
  private calculateTypeEffectiveness(attackType: string, defender: any): number {
    // Simplified type effectiveness - in a real game this would be more complex
    const typeChart: Record<string, Record<string, number>> = {
      fire: { grass: 2, water: 0.5, fire: 0.5 },
      water: { fire: 2, grass: 0.5, water: 0.5 },
      grass: { water: 2, fire: 0.5, grass: 0.5 }
    };

    const defenderType = defender.types?.[0] || 'normal';
    return typeChart[attackType]?.[defenderType] || 1;
  }

  /**
   * Show damage number animation
   */
  private showDamageNumber(target: BattleMonster, damage: number, effectiveness: number, criticalHit: boolean): void {
    const targetGameObject = target['phaserGameObject'] as Phaser.GameObjects.Image;
    const targetPos = targetGameObject.getCenter();
    
    if (!targetPos || targetPos.x === undefined || targetPos.y === undefined) {
      return;
    }
    
    let color = '#ffffff';
    let message = damage.toString();

    if (criticalHit) {
      message += '!';
      color = '#ff0000';
    } else if (effectiveness > 1) {
      message += '!';
      color = '#00ff00';
    } else if (effectiveness < 1) {
      message += '.';
      color = '#808080';
    }

    const damageText = this.scene.add.text(targetPos.x, targetPos.y, message, {
      fontSize: '20px',
      color: color,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    if (!this.skipAnimations) {
      this.scene.tweens.add({
        targets: damageText,
        y: targetPos.y - 30,
        alpha: 0,
        duration: 1000,
        onComplete: () => damageText.destroy()
      });
    } else {
      damageText.destroy();
    }
  }

  /**
   * Show miss message
   */
  private showMissMessage(target: AttackTarget): void {
    const message = 'Missed!';
    const y = target === AttackTarget.ENEMY ? 150 : 300;
    
    const missText = this.scene.add.text(240, y, message, {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    if (!this.skipAnimations) {
      this.scene.tweens.add({
        targets: missText,
        alpha: 0,
        duration: 1500,
        onComplete: () => missText.destroy()
      });
    } else {
      missText.destroy();
    }
  }

  /**
   * Play hit sound effect
   */
  private playHitSound(): void {
    // This would play a hit sound effect
    // For now, we'll just log it
    console.log('[AttackManager] Playing hit sound effect');
  }

  /**
   * Get available moves for a monster
   */
  getMonsterMoves(monster: BattleMonster): Move[] {
    const monsterDetails = monster.getMonsterDetails();
    const moves: Move[] = [];

    if ('attackIds' in monsterDetails) {
      // Legacy monster
      monsterDetails.attackIds.forEach(attackId => {
        const move = dataLoader.getMoveById(attackId.toString());
        if (move) {
          moves.push(move);
        }
      });
    } else if ('attackIds' in monsterDetails) {
      // New critter instance with attackIds
      (monsterDetails as any).attackIds.forEach((attackId: number) => {
        const move = dataLoader.getMoveById(attackId.toString());
        if (move) {
          moves.push(move);
        }
      });
    } else if ('moveIds' in monsterDetails) {
      // New critter instance with moveIds
      (monsterDetails as any).moveIds.forEach((moveId: number) => {
        const move = dataLoader.getMoveById(moveId.toString());
        if (move) {
          moves.push(move);
        }
      });
    }

    return moves;
  }
}