import { Scene, GameObjects } from 'phaser';
import { EventBus } from '../EventBus';
import { MONSTER_PARTY_ASSET_KEYS } from '../assets/AssetKeys';
import { ICritter, IMoveInstance } from '../models/types';
import { CritterSpeciesDatabase, MoveDatabase } from '../models';

/**
 * Scene data for monster details
 */
interface MonsterDetailsSceneData {
  monster: ICritter;
}

/**
 * Monster Details Scene - Detailed critter information
 * Shows comprehensive stats, moves, and information for a single critter
 */
export class MonsterDetails extends Scene {
  private monsterDetails: ICritter;
  private monsterAttacks: IMoveInstance[] = [];

  // Layout constants
  private readonly UI_TEXT_STYLE = {
    fontFamily: 'Arial',
    color: '#FFFFFF',
    fontSize: '24px',
  };

  private readonly MONSTER_MOVE_TEXT_STYLE = {
    fontFamily: 'Arial',
    color: '#000000',
    fontSize: '40px',
  };

  private readonly MONSTER_EXP_TEXT_STYLE = {
    fontFamily: 'Arial',
    color: '#000000',
    fontSize: '22px',
  };

  constructor() {
    super('MonsterDetails');
    
    // Initialize with empty monster for safety
    this.monsterDetails = {
      id: '',
      speciesId: '',
      nickname: '',
      level: 1,
      currentHP: 1,
      maxHP: 1,
      experience: 0,
      experienceToNext: 100,
      isFainted: false,
      moves: [],
      currentStats: {
        hp: 1,
        attack: 1,
        defense: 1,
        spAtk: 1,
        spDef: 1,
        speed: 1,
      },
      ivs: {
        hp: 0,
        attack: 0,
        defense: 0,
        spAtk: 0,
        spDef: 0,
        speed: 0,
      },
    };
  }

  init(data: MonsterDetailsSceneData) {
    this.monsterDetails = data.monster;

    // Fallback for testing
    if (!this.monsterDetails) {
      const party = this.registry.get('party') as ICritter[] || [];
      this.monsterDetails = party[0] || this.monsterDetails;
    }

    this.monsterAttacks = [];
    this.monsterDetails.moves.forEach((moveInstance) => {
      const moveData = MoveDatabase.getMove(moveInstance.moveId);
      if (moveData) {
        this.monsterAttacks.push(moveInstance);
      }
    });
  }

  create() {
    this.createBackground();
    this.createMonsterInfo();
    this.createStats();
    this.createMoves();
    this.setupInput();

    EventBus.emit('monsterDetails:ready', { monsterId: this.monsterDetails.id });
  }

  /**
   * Create background
   */
  private createBackground() {
    this.add.image(0, 0, MONSTER_PARTY_ASSET_KEYS.MONSTER_DETAILS_BACKGROUND).setOrigin(0);
    
    this.add.text(10, 0, 'Monster Details', {
      ...this.UI_TEXT_STYLE,
      fontSize: '48px',
    });
  }

  /**
   * Create monster basic information
   */
  private createMonsterInfo() {
    const species = CritterSpeciesDatabase.getSpecies(this.monsterDetails.speciesId);
    const displayName = this.monsterDetails.nickname || species?.name || 'Unknown';

    // Level and name
    this.add.text(20, 60, `Lv. ${this.monsterDetails.level}`, {
      ...this.UI_TEXT_STYLE,
      fontSize: '40px',
    });

    this.add.text(200, 60, displayName, {
      ...this.UI_TEXT_STYLE,
      fontSize: '40px',
    });

    // Monster image (placeholder)
    this.add.image(160, 310, species?.id || 'PLAYER').setOrigin(0, 1).setScale(0.7);

    // Type information
    if (species?.type) {
      const typeText = species.type.join(' / ');
      this.add.text(20, 100, `Type: ${typeText}`, this.UI_TEXT_STYLE);
    }
  }

  /**
   * Create stats display
   */
  private createStats() {
    let y = 400;

    // HP Bar
    this.createStatBar(20, y, 'HP', this.monsterDetails.currentHP, this.monsterDetails.maxHP, 0xFF0000);
    y += 40;

    // Experience Bar
    const expProgress = this.monsterDetails.experience / this.monsterDetails.experienceToNext;
    this.createStatBar(20, y, 'EXP', this.monsterDetails.experience, this.monsterDetails.experienceToNext, 0x00FF00, expProgress);
    y += 60;

    // Stats title
    this.add.text(20, y, 'Stats:', {
      ...this.UI_TEXT_STYLE,
      fontSize: '28px',
    });
    y += 35;

    // Individual stats
    const stats = [
      { name: 'HP', value: this.monsterDetails.currentStats.hp },
      { name: 'Attack', value: this.monsterDetails.currentStats.attack },
      { name: 'Defense', value: this.monsterDetails.currentStats.defense },
      { name: 'Sp. Atk', value: this.monsterDetails.currentStats.spAtk },
      { name: 'Sp. Def', value: this.monsterDetails.currentStats.spDef },
      { name: 'Speed', value: this.monsterDetails.currentStats.speed },
    ];

    stats.forEach((stat) => {
      this.add.text(40, y, `${stat.name}:`, {
        ...this.UI_TEXT_STYLE,
        fontSize: '20px',
      });

      this.add.text(200, y, `${stat.value}`, {
        ...this.UI_TEXT_STYLE,
        fontSize: '20px',
      });

      // Stat bar
      const barWidth = Math.min(200, stat.value);
      const statBar = this.add.rectangle(300, y + 10, barWidth, 8, 0x4488FF);
      statBar.setOrigin(0, 0.5);
      
      const statBarBg = this.add.rectangle(300, y + 10, 200, 8, 0x333333);
      statBarBg.setOrigin(0, 0.5);

      y += 25;
    });
  }

  /**
   * Create stat bar with label
   */
  private createStatBar(x: number, y: number, label: string, current: number, max: number, color: number, progress?: number) {
    const actualProgress = progress !== undefined ? progress : current / max;
    
    // Label
    this.add.text(x, y - 10, label, {
      ...this.UI_TEXT_STYLE,
      fontSize: '18px',
    });

    // Background bar
    const bgBar = this.add.rectangle(x + 80, y + 5, 200, 20, 0x333333);
    bgBar.setOrigin(0, 0.5);

    // Current value bar
    const barWidth = Math.max(4, 200 * actualProgress);
    const bar = this.add.rectangle(x + 80, y + 5, barWidth, 20, color);
    bar.setOrigin(0, 0.5);

    // Text
    this.add.text(x + 300, y, `${current}/${max}`, {
      ...this.UI_TEXT_STYLE,
      fontSize: '16px',
    });
  }

  /**
   * Create moves display
   */
  private createMoves() {
    let x = 500;
    let y = 100;

    // Moves title
    this.add.text(x, y, 'Moves:', {
      ...this.UI_TEXT_STYLE,
      fontSize: '32px',
    });
    y += 50;

    // Display up to 4 moves
    for (let i = 0; i < 4; i++) {
      const moveInstance = this.monsterAttacks[i];
      
      if (moveInstance) {
        const moveData = MoveDatabase.getMove(moveInstance.moveId);
        
        if (moveData) {
          // Move name
          this.add.text(x + 20, y, moveData.name, this.MONSTER_MOVE_TEXT_STYLE);

          // PP
          this.add.text(x + 20, y + 35, `PP: ${moveInstance.currentPP}/${moveInstance.maxPP}`, {
            ...this.MONSTER_EXP_TEXT_STYLE,
            fontSize: '18px',
          });

          // Type
          this.add.text(x + 200, y + 35, `Type: ${moveData.type}`, {
            ...this.MONSTER_EXP_TEXT_STYLE,
            fontSize: '18px',
          });

          // Power
          if (moveData.power > 0) {
            this.add.text(x + 350, y + 35, `Power: ${moveData.power}`, {
              ...this.MONSTER_EXP_TEXT_STYLE,
              fontSize: '18px',
            });
          }

          // Accuracy
          if (moveData.accuracy < 100) {
            this.add.text(x + 500, y + 35, `Acc: ${moveData.accuracy}%`, {
              ...this.MONSTER_EXP_TEXT_STYLE,
              fontSize: '18px',
            });
          }
        }
      } else {
        // Empty move slot
        this.add.text(x + 20, y, '---', this.MONSTER_MOVE_TEXT_STYLE);
        this.add.text(x + 20, y + 35, 'No move', {
          ...this.MONSTER_EXP_TEXT_STYLE,
          fontSize: '18px',
          color: '#666666',
        });
      }

      y += 80;
    }

    // Additional info
    y += 20;
    const species = CritterSpeciesDatabase.getSpecies(this.monsterDetails.speciesId);
    if (species?.pokedexEntry) {
      this.add.text(x, y, 'Dex Entry:', {
        ...this.UI_TEXT_STYLE,
        fontSize: '20px',
      });
      y += 25;

      // Word wrap the pokedex entry
      const words = species.pokedexEntry.split(' ');
      let line = '';
      const maxWidth = 40; // characters per line
      
      words.forEach((word) => {
        if ((line + word).length > maxWidth) {
          this.add.text(x, y, line, {
            ...this.UI_TEXT_STYLE,
            fontSize: '14px',
            wordWrap: { width: 600 },
          });
          line = word + ' ';
          y += 18;
        } else {
          line += word + ' ';
        }
      });

      if (line) {
        this.add.text(x, y, line, {
          ...this.UI_TEXT_STYLE,
          fontSize: '14px',
          wordWrap: { width: 600 },
        });
      }
    }
  }

  /**
   * Setup input handling
   */
  private setupInput() {
    // ESC or X to go back
    this.input.keyboard?.on('keydown-ESC', () => {
      this.goBack();
    });

    this.input.keyboard?.on('keydown-X', () => {
      this.goBack();
    });

    // Any other key to go back
    this.input.keyboard?.on('keydown-ENTER', () => {
      this.goBack();
    });

    this.input.keyboard?.on('keydown-Z', () => {
      this.goBack();
    });
  }

  /**
   * Go back to previous scene
   */
  private goBack() {
    this.scene.stop('MonsterDetails');
    this.scene.resume('MonsterParty');
    
    EventBus.emit('monsterDetails:closed', { monsterId: this.monsterDetails.id });
  }

  shutdown() {
    EventBus.off('monsterDetails:ready');
    EventBus.off('monsterDetails:closed');
  }
}