import { BaseScene } from './common/BaseScene';
import { SceneKeys } from '../assets';

/**
 * Preloader Scene - Loads game assets
 * Placeholder implementation that logs activation
 */
export class Preloader extends BaseScene {
    constructor() {
        super(SceneKeys.PRELOAD);
    }

    create(): void {
        super.create();
        this.log('Preloader scene activated - placeholder implementation');
    }
}