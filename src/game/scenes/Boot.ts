import { Scene } from 'phaser';
import { PerformanceMonitor } from '../managers/PerformanceMonitor';
import { EventBus } from '../EventBus';

/**
 * Boot Scene - Initializes core systems and loads minimal assets for Preloader
 * 
 * Responsibilities:
 * - Setup input system (fullscreen, debug mode)
 * - Initialize PerformanceMonitor
 * - Load minimal assets needed for preloader UI
 * - Configure scale settings
 * - Transition to Preloader scene
 */
export class Boot extends Scene {
    private performanceMonitor: PerformanceMonitor | null = null;

    constructor() {
        super('Boot');
    }

    preload(): void {
        // Load minimal assets for boot/preloader UI
        this.load.image('background', 'assets/bg.png');
    }

    create(): void {
        try {
            // Initialize performance monitoring
            this.performanceMonitor = new PerformanceMonitor(this);
            
            // Store in game data for access from other scenes
            this.game.registry.set('performanceMonitor', this.performanceMonitor);
            
            // Setup input for debug toggle
            this.input.keyboard?.on('keydown-D', () => {
                if (this.performanceMonitor) {
                    this.performanceMonitor.toggleDebugDisplay();
                }
            });

            // Setup fullscreen toggle (F key from legacy controls)
            this.input.keyboard?.on('keydown-F', () => {
                if (this.scale.isFullscreen) {
                    this.scale.stopFullscreen();
                } else {
                    this.scale.startFullscreen();
                }
            });

            // Emit boot ready event for React integration
            EventBus.emit('current-scene-ready', this);

            // Transition to Preloader
            this.scene.start('Preloader');
        } catch (error) {
            console.error('Error in Boot scene create:', error);
            // Fallback to Preloader even on error
            this.scene.start('Preloader');
        }
    }

    update(time: number, deltaTime: number): void {
        if (this.performanceMonitor) {
            this.performanceMonitor.update(deltaTime);
        }
    }

    shutdown(): void {
        if (this.performanceMonitor) {
            this.performanceMonitor.shutdown();
        }
        this.input.keyboard?.off('keydown-D');
        this.input.keyboard?.off('keydown-F');
    }
}
