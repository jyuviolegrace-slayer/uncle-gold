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
}

