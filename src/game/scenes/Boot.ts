import { Scene } from "phaser";
import { EventBus } from "../EventBus";

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
    constructor() {
        super("Boot");
    }

    preload(): void {
        this.load.image("background", "assets/bg.png");
    }

    create(): void {}

    update(time: number, deltaTime: number): void {}

    shutdown(): void {}
}

