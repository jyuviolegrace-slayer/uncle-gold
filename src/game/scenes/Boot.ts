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
        super("Boot"); // Keep "Boot" as the scene key for transition
    }

    create(): void {
        super.create();
        
        // Configure scale settings
        this.scale.scaleMode = Phaser.Scale.FIT;
        this.scale.autoCenter = Phaser.Scale.CENTER_BOTH;
        
        // Log boot completion
        this.log('Boot scene completed - transitioning to Preloader');
        
        // Transition to Preloader scene
        setTimeout(() => {
            this.transitionToScene(SceneKeys.PRELOAD);
        }, 100);
    }
}

