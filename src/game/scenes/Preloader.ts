import { Scene } from 'phaser';
import { DataLoader } from '../data/loader';
import { CritterSpeciesDatabase } from '../models/CritterSpeciesDatabase';
import { MoveDatabase } from '../models/MoveDatabase';
import { TypeChart } from '../models/TypeChart';

export class Preloader extends Scene
{
    private progressText: Phaser.GameObjects.Text | null = null;

    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        this.add.image(512, 384, 'background');

        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        this.progressText = this.add.text(512, 450, 'Loading...', {
            font: '16px Arial',
            color: '#ffffff',
        }).setOrigin(0.5);

        this.load.on('progress', (progress: number) => {
            bar.width = 4 + (460 * progress);
        });
    }

    preload ()
    {
        this.load.setPath('assets');

        this.load.image('logo', 'logo.png');
        this.load.image('star', 'star.png');
    }

    async create ()
    {
        try {
            if (this.progressText) {
                this.progressText.setText('Loading game data...');
            }

            const gameData = await DataLoader.loadAllGameData();

            if (this.progressText) {
                this.progressText.setText('Initializing databases...');
            }

            gameData.critters.forEach(critter => {
                CritterSpeciesDatabase.registerSpecies(critter);
            });

            gameData.moves.forEach(move => {
                MoveDatabase.registerMove(move);
            });

            TypeChart.initializeFromMatrix(gameData.typeMatrix.matrix);

            if (this.progressText) {
                this.progressText.setText('Ready!');
            }

            this.time.delayedCall(500, () => {
                this.scene.start('MainMenu');
            });
        } catch (error) {
            console.error('Failed to load game data during preload:', error);
            if (this.progressText) {
                this.progressText.setText('Error loading data. Check console.');
            }
            this.time.delayedCall(2000, () => {
                this.scene.start('MainMenu');
            });
        }
    }
}
