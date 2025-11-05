import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { DataLoader } from '../data/loader';
import { CritterSpeciesDatabase } from '../models/CritterSpeciesDatabase';
import { MoveDatabase } from '../models/MoveDatabase';
import { TypeChart } from '../models/TypeChart';
import { SaveManager } from '../services/SaveManager';
import { LegacyDataManager } from '../services/LegacyDataManager';
import { AudioManager } from '../managers/AudioManager';
import {
  EXTERNAL_LINKS_ASSET_KEYS,
  TITLE_ASSET_KEYS,
  UI_ASSET_KEYS,
  AUDIO_ASSET_KEYS,
  BATTLE_BACKGROUND_ASSET_KEYS,
  MONSTER_ASSET_KEYS,
  BATTLE_ASSET_KEYS,
  HEALTH_BAR_ASSET_KEYS,
  EXP_BAR_ASSET_KEYS,
  ATTACK_ASSET_KEYS,
  WORLD_ASSET_KEYS,
  BUILDING_ASSET_KEYS,
  CHARACTER_ASSET_KEYS,
  MONSTER_PARTY_ASSET_KEYS,
  INVENTORY_ASSET_KEYS,
} from '../assets/AssetKeys';

/**
 * Preloader Scene - Loads all game assets, data, and initializes managers
 * 
 * Responsibilities:
 * - Load all image, audio, and data assets from public/assets
 * - Load and parse JSON game data (critters, moves, types, items, areas)
 * - Load and parse legacy data (for backwards compatibility)
 * - Create animations from animation data
 * - Initialize managers (SaveManager, LegacyDataManager, AudioManager)
 * - Register game data with databases
 * - Emit `current-scene-ready` event for React integration
 * - Transition to MainMenu
 */
export class Preloader extends Scene {
    private progressText: Phaser.GameObjects.Text | null = null;
    private statusText: Phaser.GameObjects.Text | null = null;
    private loadingBar: Phaser.GameObjects.Rectangle | null = null;
    private SHOW_SOCIAL_LINKS: boolean = false;

    constructor() {
        super('Preloader');
    }

    init(): void {
        // Create loading UI
        this.add.image(512, 384, 'background');

        const progressBg = this.add.rectangle(512, 384, 468, 32)
            .setStrokeStyle(1, 0xffffff);

        this.loadingBar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

        this.progressText = this.add.text(512, 450, 'Loading...', {
            font: '16px Arial',
            color: '#ffffff',
        }).setOrigin(0.5);

        this.statusText = this.add.text(512, 320, 'Initializing...', {
            font: '14px Arial',
            color: '#cccccc',
        }).setOrigin(0.5);

        // Update progress bar as assets load
        this.load.on('progress', (progress: number) => {
            if (this.loadingBar) {
                this.loadingBar.width = 4 + (460 * progress);
            }
        });
    }

    preload(): void {
        this.setStatusText('Loading assets...');

        // Asset paths from legacy project
        const monsterTamerAssetPath = 'legacy/images/monster-tamer';
        const kenneysAssetPath = 'legacy/images/kenneys-assets';
        const pimenAssetPath = 'legacy/images/pimen';
        const axulArtAssetPath = 'legacy/images/axulart';
        const pbGamesAssetPath = 'legacy/images/parabellum-games';

        // External social links (optional)
        if (this.SHOW_SOCIAL_LINKS) {
            this.load.image(
                EXTERNAL_LINKS_ASSET_KEYS.GITHUB_BANNER,
                'legacy/images/external-social/forkme_right_red_aa0000.webp'
            );
            this.load.image(
                EXTERNAL_LINKS_ASSET_KEYS.YOUTUBE_BUTTON,
                'legacy/images/external-social/WatchonYouTube-white-3xPNG.png'
            );
            this.load.image(
                EXTERNAL_LINKS_ASSET_KEYS.LEARN_MORE_BACKGROUND,
                'legacy/images/external-social/blank.png'
            );
            this.load.image(
                EXTERNAL_LINKS_ASSET_KEYS.YOUTUBE_THUMB_NAIL,
                'legacy/images/external-social/thumbnail.jpeg'
            );
        }

        // Battle backgrounds
        this.load.image(
            BATTLE_BACKGROUND_ASSET_KEYS.FOREST,
            `${monsterTamerAssetPath}/battle-backgrounds/forest-background.png`
        );

        // Battle UI assets
        this.load.image(
            BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND,
            `${kenneysAssetPath}/ui-space-expansion/custom-ui.png`
        );
        this.load.image(
            BATTLE_ASSET_KEYS.BALL_THUMBNAIL,
            `${monsterTamerAssetPath}/battle/cosmoball.png`
        );
        this.load.image(
            BATTLE_ASSET_KEYS.DAMAGED_BALL,
            `${monsterTamerAssetPath}/battle/damagedBall.png`
        );

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
        // Health bar assets
        this.load.image(
            HEALTH_BAR_ASSET_KEYS.RIGHT_CAP,
            `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_right.png`
        );
        this.load.image(
            HEALTH_BAR_ASSET_KEYS.MIDDLE,
            `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_mid.png`
        );
        this.load.image(
            HEALTH_BAR_ASSET_KEYS.LEFT_CAP,
            `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_left.png`
        );

        // Experience bar assets
        this.load.image(
            EXP_BAR_ASSET_KEYS.EXP_RIGHT_CAP,
            `${kenneysAssetPath}/ui-space-expansion/barHorizontal_blue_right.png`
        );
        this.load.image(
            EXP_BAR_ASSET_KEYS.EXP_MIDDLE,
            `${kenneysAssetPath}/ui-space-expansion/barHorizontal_blue_mid.png`
        );
        this.load.image(
            EXP_BAR_ASSET_KEYS.EXP_LEFT_CAP,
            `${kenneysAssetPath}/ui-space-expansion/barHorizontal_blue_left.png`
        );

        // Health bar shadows
        this.load.image(
            HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW,
            `${kenneysAssetPath}/ui-space-expansion/barHorizontal_shadow_right.png`
        );
        this.load.image(
            HEALTH_BAR_ASSET_KEYS.MIDDLE_SHADOW,
            `${kenneysAssetPath}/ui-space-expansion/barHorizontal_shadow_mid.png`
        );
        this.load.image(
            HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW,
            `${kenneysAssetPath}/ui-space-expansion/barHorizontal_shadow_left.png`
        );

        // Critter sprites (legacy monsters)
        this.load.image(MONSTER_ASSET_KEYS.CARNODUSK, `${monsterTamerAssetPath}/monsters/carnodusk.png`);
        this.load.image(MONSTER_ASSET_KEYS.IGUANIGNITE, `${monsterTamerAssetPath}/monsters/iguanignite.png`);
        this.load.image(MONSTER_ASSET_KEYS.AQUAVALOR, `${monsterTamerAssetPath}/monsters/aquavalor.png`);
        this.load.image(MONSTER_ASSET_KEYS.FROSTSABER, `${monsterTamerAssetPath}/monsters/frostsaber.png`);
        this.load.image(MONSTER_ASSET_KEYS.IGNIVOLT, `${monsterTamerAssetPath}/monsters/ignivolt.png`);

        // UI assets
        this.load.image(UI_ASSET_KEYS.CURSOR, `${monsterTamerAssetPath}/ui/cursor.png`);
        this.load.image(UI_ASSET_KEYS.CURSOR_WHITE, `${monsterTamerAssetPath}/ui/cursor_white.png`);
        this.load.image(UI_ASSET_KEYS.MENU_BACKGROUND, `${kenneysAssetPath}/ui-space-expansion/glassPanel.png`);
        this.load.image(
            UI_ASSET_KEYS.MENU_BACKGROUND_PURPLE,
            `${kenneysAssetPath}/ui-space-expansion/glassPanel_purple.png`
        );
        this.load.image(
            UI_ASSET_KEYS.MENU_BACKGROUND_GREEN,
            `${kenneysAssetPath}/ui-space-expansion/glassPanel_green.png`
        );
        this.load.image(UI_ASSET_KEYS.BLUE_BUTTON, `${kenneysAssetPath}/ui-pack/blue_button01.png`);
        this.load.image(UI_ASSET_KEYS.BLUE_BUTTON_SELECTED, `${kenneysAssetPath}/ui-pack/blue_button00.png`);

        // Attack effect spritesheets
        this.load.spritesheet(ATTACK_ASSET_KEYS.ICE_SHARD, `${pimenAssetPath}/ice-attack/active.png`, {
            frameWidth: 32,
            frameHeight: 32,
        });
        this.load.spritesheet(ATTACK_ASSET_KEYS.ICE_SHARD_START, `${pimenAssetPath}/ice-attack/start.png`, {
            frameWidth: 32,
            frameHeight: 32,
        });
        this.load.spritesheet(ATTACK_ASSET_KEYS.SLASH, `${pimenAssetPath}/slash.png`, {
            frameWidth: 48,
            frameHeight: 48,
        });

        // World assets
        this.load.spritesheet(WORLD_ASSET_KEYS.GRASS, `${monsterTamerAssetPath}/map/bushes.png`, {
            frameWidth: 64,
            frameHeight: 64,
        });
        this.load.image(
            WORLD_ASSET_KEYS.MAIN_1_BACKGROUND,
            `${monsterTamerAssetPath}/map/main_1_level_background.png`
        );
        this.load.tilemapTiledJSON(WORLD_ASSET_KEYS.MAIN_1_LEVEL, 'legacy/data/main_1.json');
        this.load.image(
            WORLD_ASSET_KEYS.WORLD_COLLISION,
            `${monsterTamerAssetPath}/map/collision.png`
        );
        this.load.image(
            WORLD_ASSET_KEYS.MAIN_1_FOREGROUND,
            `${monsterTamerAssetPath}/map/main_1_level_foreground.png`
        );
        this.load.image(
            WORLD_ASSET_KEYS.WORLD_ENCOUNTER_ZONE,
            `${monsterTamerAssetPath}/map/encounter.png`
        );
        this.load.spritesheet(WORLD_ASSET_KEYS.BEACH, `${axulArtAssetPath}/beach/crushed.png`, {
            frameWidth: 64,
            frameHeight: 64,
        });

        // Building assets
        this.load.image(
            BUILDING_ASSET_KEYS.BUILDING_1_FOREGROUND,
            `${monsterTamerAssetPath}/map/buildings/building_1_level_foreground.png`
        );
        this.load.image(
            BUILDING_ASSET_KEYS.BUILDING_1_BACKGROUND,
            `${monsterTamerAssetPath}/map/buildings/building_1_level_background.png`
        );
        this.load.tilemapTiledJSON(BUILDING_ASSET_KEYS.BUILDING_1_LEVEL, 'legacy/data/building_1.json');
        this.load.image(
            BUILDING_ASSET_KEYS.BUILDING_2_FOREGROUND,
            `${monsterTamerAssetPath}/map/buildings/building_2_level_foreground.png`
        );
        this.load.image(
            BUILDING_ASSET_KEYS.BUILDING_2_BACKGROUND,
            `${monsterTamerAssetPath}/map/buildings/building_2_level_background.png`
        );
        this.load.tilemapTiledJSON(BUILDING_ASSET_KEYS.BUILDING_2_LEVEL, 'legacy/data/building_2.json');
        this.load.image(
            BUILDING_ASSET_KEYS.BUILDING_3_FOREGROUND,
            `${monsterTamerAssetPath}/map/buildings/building_3_level_foreground.png`
        );
        this.load.image(
            BUILDING_ASSET_KEYS.BUILDING_3_BACKGROUND,
            `${monsterTamerAssetPath}/map/buildings/building_3_level_background.png`
        );
        this.load.tilemapTiledJSON(BUILDING_ASSET_KEYS.BUILDING_3_LEVEL, 'legacy/data/building_3.json');

        // Forest assets
        this.load.image(
            WORLD_ASSET_KEYS.FOREST_1_BACKGROUND,
            `${monsterTamerAssetPath}/map/forest_1_level_background.png`
        );
        this.load.image(
            WORLD_ASSET_KEYS.FOREST_1_FOREGROUND,
            `${monsterTamerAssetPath}/map/forest_1_level_foreground.png`
        );
        this.load.tilemapTiledJSON(WORLD_ASSET_KEYS.FOREST_1_LEVEL, 'legacy/data/forest_1.json');

        // Character sprites
        this.load.spritesheet(CHARACTER_ASSET_KEYS.PLAYER, `${axulArtAssetPath}/character/custom.png`, {
            frameWidth: 64,
            frameHeight: 88,
        });
        this.load.spritesheet(CHARACTER_ASSET_KEYS.NPC, `${pbGamesAssetPath}/characters.png`, {
            frameWidth: 16,
            frameHeight: 16,
        });

        // Title screen assets
        this.load.image(TITLE_ASSET_KEYS.BACKGROUND, `${monsterTamerAssetPath}/ui/title/background.png`);
        this.load.image(TITLE_ASSET_KEYS.PANEL, `${monsterTamerAssetPath}/ui/title/title_background.png`);
        this.load.image(TITLE_ASSET_KEYS.TITLE, `${monsterTamerAssetPath}/ui/title/title_text.png`);

        // Party/monster selection UI
        this.load.image(
            MONSTER_PARTY_ASSET_KEYS.PARTY_BACKGROUND,
            `${monsterTamerAssetPath}/ui/monster-party/background.png`
        );
        this.load.image(
            MONSTER_PARTY_ASSET_KEYS.MONSTER_DETAILS_BACKGROUND,
            `${monsterTamerAssetPath}/ui/monster-party/monster-details-background.png`
        );

        // Inventory UI
        this.load.image(
            INVENTORY_ASSET_KEYS.INVENTORY_BACKGROUND,
            `${monsterTamerAssetPath}/ui/inventory/bag_background.png`
        );
        this.load.image(
            INVENTORY_ASSET_KEYS.INVENTORY_BAG,
            `${monsterTamerAssetPath}/ui/inventory/bag.png`
        );

        // Audio tracks
        this.load.setPath('legacy/audio/xDeviruchi');
        this.load.audio(AUDIO_ASSET_KEYS.MAIN, 'And-the-Journey-Begins.wav');
        this.load.audio(AUDIO_ASSET_KEYS.BATTLE, 'Decisive-Battle.wav');
        this.load.audio(AUDIO_ASSET_KEYS.TITLE, 'Title-Theme.wav');

        this.load.setPath('legacy/audio/leohpaz');
        this.load.audio(AUDIO_ASSET_KEYS.CLAW, '03_Claw_03.wav');
        this.load.audio(AUDIO_ASSET_KEYS.GRASS, '03_Step_grass_03.wav');
        this.load.audio(AUDIO_ASSET_KEYS.ICE, '13_Ice_explosion_01.wav');
        this.load.audio(AUDIO_ASSET_KEYS.FLEE, '51_Flee_02.wav');

        // Load data files from public/assets/data
        this.load.setPath('data');
        this.load.json('ANIMATIONS', 'legacy/animations.json');
    }

    async create(): Promise<void> {
        try {
            this.setStatusText('Loading game data...');

            // Load modern game data
            const gameData = await DataLoader.loadAllGameData();

            this.setStatusText('Loading legacy data...');

            // Load legacy data for compatibility
            const legacyData = await DataLoader.loadAllLegacyData();

            this.setStatusText('Initializing databases...');

            // Register critters in database
            gameData.critters.forEach(critter => {
                CritterSpeciesDatabase.registerSpecies(critter);
            });

            // Register moves in database
            gameData.moves.forEach(move => {
                MoveDatabase.registerMove(move);
            });

            // Initialize type effectiveness chart
            TypeChart.initializeFromMatrix(gameData.typeMatrix.matrix);

            if (this.progressText) {
                this.progressText.setText('Initializing save system...');
            }

            if (this.progressText) {
                this.progressText.setText('Ready!');
            }

            EventBus.emit('current-scene-ready', this);

            this.setStatusText('Creating animations...');

            // Create animations from data
            this.createAnimations();

            this.setStatusText('Initializing managers...');

            // Use previously initialized managers
            const saveMgr = SaveManager.getInstance();
            const legacyDataMgr = new LegacyDataManager();

            // Initialize AudioManager with legacy options
            const audioManager = new AudioManager(this, {
                musicVolume: 0.7,
                sfxVolume: 0.8,
                masterVolume: 1.0,
                isMuted: false,
            });

            // Store managers in game registry for access from other scenes
            this.game.registry.set('saveManager', saveMgr);
            this.game.registry.set('legacyDataManager', legacyDataMgr);
            this.game.registry.set('audioManager', audioManager);

            this.setStatusText('Ready!');

            // Emit preloader ready event for React integration
            EventBus.emit('current-scene-ready', this);

            // Transition to MainMenu
            this.time.delayedCall(500, () => {
                this.scene.start('Title');
            });
        } catch (error) {
            console.error('Failed to load game data during preload:', error);
            this.setStatusText('Error loading data. Check console.');

            // Attempt fallback to MainMenu after delay
            this.time.delayedCall(2000, () => {
                this.scene.start('Title');
                try {
                    this.scene.start('MainMenu');
                } catch (err) {
                    console.error('Failed to start MainMenu:', err);
                }
            });
        }
    }

    shutdown(): void {
        this.load.off('progress');
    }

    /**
     * Update status message on loading screen
     */
    private setStatusText(message: string): void {
        if (this.statusText) {
            this.statusText.setText(message);
        }
        console.log(`[Preloader] ${message}`);
    }

    /**
     * Create animations from loaded animation data
     * Animation data should be in format: { key, assetKey, frames?, frameRate, repeat, delay, yoyo }
     */
    private createAnimations(): void {
        try {
            // Load animations from JSON if available
            const animationsData = this.cache.json.get('ANIMATIONS') as any[];

            if (!animationsData || !Array.isArray(animationsData)) {
                console.warn('Animation data not found in cache');
                return;
            }

            animationsData.forEach((animConfig: any) => {
                try {
                    const frames = animConfig.frames
                        ? this.anims.generateFrameNumbers(animConfig.assetKey, { frames: animConfig.frames })
                        : this.anims.generateFrameNumbers(animConfig.assetKey);

                    this.anims.create({
                        key: animConfig.key,
                        frames: frames,
                        frameRate: animConfig.frameRate || 8,
                        repeat: animConfig.repeat !== undefined ? animConfig.repeat : -1,
                        delay: animConfig.delay || 0,
                        yoyo: animConfig.yoyo || false,
                    });
                } catch (err) {
                    console.warn(`Failed to create animation ${animConfig.key}:`, err);
                }
            });

            console.log(`Created ${animationsData.length} animations`);
        } catch (err) {
            console.warn('Error creating animations:', err);
        }
    }
}
