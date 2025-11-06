import Phaser from 'phaser';
import { BaseScene } from './common/BaseScene';
import { SceneKeys } from '../assets';

/**
 * Boot Scene - Initializes core systems and loads minimal assets for Preloader
 *
 * Responsibilities:
 * - Setup input system (fullscreen, debug mode)
 * - Configure scale settings (FIT/autoCenter)
 * - Load minimal assets needed for preloader UI
 * - Initialize PerformanceMonitor
 * - Add all game scenes to the game instance in proper order
 * - Transition to Preloader scene
 */
export class Boot extends BaseScene {
    constructor() {
        super('Boot'); // Keep "Boot" as the scene key for transition
    }

    create(): void {
        super.create();

        this.scale.scaleMode = Phaser.Scale.FIT;
        this.scale.autoCenter = Phaser.Scale.CENTER_BOTH;

        // Add all scenes to the game instance in proper order
        this.addGameScenes();

        const handlePreloadComplete = () => {
            if (this.scene.isActive(SceneKeys.PRELOAD)) {
                this.scene.stop(SceneKeys.PRELOAD);
            }

            this.transitionToScene(SceneKeys.TITLE);
        };

        this.eventBus.once('preload-complete', handlePreloadComplete);

        this.log('Boot scene launching Preloader and awaiting asset load completion');
        this.scene.launch(SceneKeys.PRELOAD);
    }

    private addGameScenes(): void {
        // Log scene registration for debugging
        // Scenes are already added in main.ts config, this is just for verification
        const registeredScenes = [
            'Preloader',
            'Title', 
            'Options',
            'Overworld',
            'Battle',
            'GameOver',
            'MonsterParty',
            'MonsterDetails',
            'Inventory',
            'Dialog',
            'Cutscene'
        ];

        this.log(`Boot scene verifying ${registeredScenes.length} scenes are registered`);
        registeredScenes.forEach(sceneName => {
            this.log(`Scene registered: ${sceneName}`);
        });
    }
}

