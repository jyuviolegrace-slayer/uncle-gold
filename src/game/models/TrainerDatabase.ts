import { ITrainer, ITrainerCritterEntry, Critter } from './index';
import { CritterSpeciesDatabase } from './CritterSpeciesDatabase';
import { MoveDatabase } from './MoveDatabase';

/**
 * TrainerDatabase - manages trainer rosters and data
 * Builds critter party instances from trainer definitions
 */
export class TrainerDatabase {
  private static trainers: Map<string, ITrainer> = new Map();
  private static isInitialized = false;

  static initialize() {
    if (this.isInitialized) return;

    this.trainers.set('blaze-leader', {
      id: 'blaze-leader',
      name: 'Blaze',
      title: 'Gym Leader',
      type: 'Fire',
      badge: 'volcanic',
      badgeName: 'Volcanic Badge',
      moneyReward: 2000,
      party: [
        { speciesId: 'sparkit', level: 16 },
        { speciesId: 'embolt', level: 18 },
      ],
      dialogue: {
        intro: 'I am Blaze, master of fire! Let us see if your critters can withstand the heat!',
        victory: 'Amazing! Your critters burned with a fury I have rarely seen. You have earned the Volcanic Badge!',
        defeat: 'The power of fire reigns supreme! Better luck next time!',
      },
    });

    this.trainers.set('marina-leader', {
      id: 'marina-leader',
      name: 'Marina',
      title: 'Gym Leader',
      type: 'Water',
      badge: 'aquatic',
      badgeName: 'Aquatic Badge',
      moneyReward: 2000,
      party: [
        { speciesId: 'aqualis', level: 21 },
        { speciesId: 'tidecrown', level: 23 },
      ],
      dialogue: {
        intro: 'Welcome to Crystal Lake! I, Marina, guardian of the waters, shall test your resolve.',
        victory: 'Your skill flows like the currents themselves! You have earned the Aquatic Badge!',
        defeat: 'The waters are vast and deep. Perhaps next time you will dive deeper!',
      },
    });

    this.trainers.set('sage-leader', {
      id: 'sage-leader',
      name: 'Sage',
      title: 'Gym Leader',
      type: 'Psychic',
      badge: 'psychic',
      badgeName: 'Psychic Badge',
      moneyReward: 2000,
      party: [
        { speciesId: 'psychink', level: 26 },
        { speciesId: 'mindseer', level: 28 },
      ],
      dialogue: {
        intro: 'I sense your arrival... Your thoughts are clear. Are your critters equally sharp?',
        victory: 'Your mind is strong! The Psychic Badge is yours!',
        defeat: 'Your mental fortitude falters. Meditate and return stronger.',
      },
    });

    this.trainers.set('voltz-leader', {
      id: 'voltz-leader',
      name: 'Voltz',
      title: 'Gym Leader',
      type: 'Electric',
      badge: 'electric',
      badgeName: 'Electric Badge',
      moneyReward: 2000,
      party: [
        { speciesId: 'sparkit', level: 23 },
        { speciesId: 'voltrix', level: 25 },
      ],
      dialogue: {
        intro: 'Time to feel the power of electricity! Your journey ends here!',
        victory: 'Shocking! You have earned the Electric Badge! Impressive!',
        defeat: 'You were no match for the power of thunder!',
      },
    });

    this.trainers.set('granite-leader', {
      id: 'granite-leader',
      name: 'Granite',
      title: 'Gym Leader',
      type: 'Ground',
      badge: 'earth',
      badgeName: 'Earth Badge',
      moneyReward: 2000,
      party: [
        { speciesId: 'mudpupp', level: 29 },
        { speciesId: 'terrasmith', level: 31 },
      ],
      dialogue: {
        intro: 'The earth trembles beneath my feet! Can your critters stand firm?',
        victory: 'Your critters are as solid as stone! The Earth Badge is yours!',
        defeat: 'The ground shall swallow your ambitions!',
      },
    });

    this.trainers.set('shadow-leader', {
      id: 'shadow-leader',
      name: 'Shadow',
      title: 'Gym Leader',
      type: 'Dark',
      badge: 'shadow',
      badgeName: 'Shadow Badge',
      moneyReward: 2000,
      party: [
        { speciesId: 'houndrake', level: 31 },
        { speciesId: 'toxiclaw', level: 33 },
      ],
      dialogue: {
        intro: 'Welcome to the darkness... Few escape it! Will you?',
        victory: 'You have pierced the shadow! The Shadow Badge is yours!',
        defeat: 'You will remain in darkness!',
      },
    });

    this.trainers.set('aurora-leader', {
      id: 'aurora-leader',
      name: 'Aurora',
      title: 'Gym Leader',
      type: 'Fairy',
      badge: 'fairy',
      badgeName: 'Fairy Badge',
      moneyReward: 2000,
      party: [
        { speciesId: 'lightbringer', level: 36 },
        { speciesId: 'radianceking', level: 38 },
      ],
      dialogue: {
        intro: 'The magic of fairies flows through me! Let us dance in battle!',
        victory: 'Your magic shines brightly! The Fairy Badge is yours!',
        defeat: 'My enchantments are too strong for you.',
      },
    });

    this.trainers.set('champion', {
      id: 'champion',
      name: 'Champion Alex',
      title: 'Champion',
      badge: 'champion',
      badgeName: 'Champion Title',
      moneyReward: 5000,
      party: [
        { speciesId: 'boltiger', level: 48 },
        { speciesId: 'tidecrown', level: 48 },
        { speciesId: 'thornwick', level: 46 },
        { speciesId: 'mindseer', level: 47 },
        { speciesId: 'terrasmith', level: 47 },
        { speciesId: 'radianceking', level: 50 },
      ],
      dialogue: {
        intro: 'Welcome to the Champion Chamber! I have awaited this moment. Show me the strength you have gathered!',
        victory: 'You are incredible! You are the new Champion! Congratulations!',
        defeat: 'The Champion title remains with me. Your journey continues!',
      },
    });

    this.isInitialized = true;
  }

  static getTrainer(trainerId: string): ITrainer | null {
    if (!this.isInitialized) this.initialize();
    return this.trainers.get(trainerId) || null;
  }

  static getTrainerParty(trainerId: string): Critter[] {
    const trainer = this.getTrainer(trainerId);
    if (!trainer) return [];

    CritterSpeciesDatabase.initialize();
    MoveDatabase.initialize();

    return trainer.party
      .map(entry => {
        const species = CritterSpeciesDatabase.getSpecies(entry.speciesId);
        if (!species) return null;

        const critter = new Critter(entry.speciesId, entry.level);

        if (entry.moves) {
          critter.moves = entry.moves
            .map(moveId => {
              const move = MoveDatabase.getMove(moveId);
              if (!move) return null;
              return {
                id: `${critter.id}-${moveId}`,
                moveId,
                currentPP: move.basePP,
                maxPP: move.basePP,
              };
            })
            .filter(m => m !== null) as any;

          while (critter.moves.length < 4 && species.moves.length > 0) {
            const randomMoveId = species.moves[Math.floor(Math.random() * species.moves.length)];
            const move = MoveDatabase.getMove(randomMoveId);
            if (move && !critter.moves.find(m => m.moveId === randomMoveId)) {
              critter.moves.push({
                id: `${critter.id}-${randomMoveId}`,
                moveId: randomMoveId,
                currentPP: move.basePP,
                maxPP: move.basePP,
              });
            }
          }
        }

        return critter;
      })
      .filter(c => c !== null) as Critter[];
  }

  static getAllTrainers(): ITrainer[] {
    if (!this.isInitialized) this.initialize();
    return Array.from(this.trainers.values());
  }
}

export default TrainerDatabase;
