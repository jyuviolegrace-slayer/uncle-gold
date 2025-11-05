import { Scene } from 'phaser';
import { PerformanceMonitor } from '../managers/PerformanceMonitor';

export class Boot extends Scene
{
    private performanceMonitor: PerformanceMonitor | null = null;

    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

        this.load.image('background', 'assets/bg.png');
    }

    create ()
    {
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

        this.scene.start('Preloader');
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
    }
}
