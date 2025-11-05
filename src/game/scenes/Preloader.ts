import { Scene } from 'phaser';
import { DataLoader } from '../data/loader';
import { CritterSpeciesDatabase } from '../models/CritterSpeciesDatabase';
import { MoveDatabase } from '../models/MoveDatabase';
import { TypeChart } from '../models/TypeChart';
import { SaveManager } from '../services/SaveManager';
import { LegacyDataManager } from '../services/LegacyDataManager';
import { EventBus } from '../EventBus';
import {
  EXTERNAL_LINKS_ASSET_KEYS,
  TITLE_ASSET_KEYS,
  UI_ASSET_KEYS,
  AUDIO_ASSET_KEYS,
} from '../assets/AssetKeys';

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

        // Load legacy title screen assets
        this.load.image(TITLE_ASSET_KEYS.BACKGROUND, 'legacy/images/monster-tamer/title-screen-background.png');
        this.load.image(TITLE_ASSET_KEYS.TITLE, 'legacy/images/monster-tamer/title.png');
        this.load.image(TITLE_ASSET_KEYS.PANEL, 'legacy/images/monster-tamer/title-panel.png');

        // Load UI assets
        this.load.image(UI_ASSET_KEYS.CURSOR, 'legacy/images/monster-tamer/ui/cursor.png');
        this.load.image(UI_ASSET_KEYS.CURSOR_WHITE, 'legacy/images/monster-tamer/ui/cursor_white.png');
        this.load.image(UI_ASSET_KEYS.MENU_BACKGROUND, 'legacy/images/kenneys-assets/ui-space-expansion/glassPanel.png');
        this.load.image(UI_ASSET_KEYS.MENU_BACKGROUND_GREEN, 'legacy/images/kenneys-assets/ui-space-expansion/glassPanel_green.png');
        this.load.image(UI_ASSET_KEYS.MENU_BACKGROUND_PURPLE, 'legacy/images/kenneys-assets/ui-space-expansion/glassPanel_purple.png');

        // Load audio
        this.load.audio(AUDIO_ASSET_KEYS.TITLE, 'legacy/audio/xDeviruchi/title-theme.mp3');
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
                this.progressText.setText('Initializing save system...');
            }

            // Initialize SaveManager singleton
            const saveManager = SaveManager.getInstance();
            this.game.registry.set('saveManager', saveManager);

            // Initialize LegacyDataManager
            const legacyDataManager = new LegacyDataManager();
            this.game.registry.set('legacyDataManager', legacyDataManager);

            if (this.progressText) {
                this.progressText.setText('Ready!');
            }

            EventBus.emit('current-scene-ready', this);

            this.time.delayedCall(500, () => {
                this.scene.start('Title');
            });
        } catch (error) {
            console.error('Failed to load game data during preload:', error);
            if (this.progressText) {
                this.progressText.setText('Error loading data. Check console.');
            }
            this.time.delayedCall(2000, () => {
                this.scene.start('Title');
            });
        }
    }
}
