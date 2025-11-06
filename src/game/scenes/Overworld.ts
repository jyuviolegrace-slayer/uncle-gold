import { BaseScene } from './common/BaseScene';
import { SceneKeys } from '../assets';

/**
 * Overworld Scene - Main game world exploration
 * Placeholder implementation that logs activation
 */
export class Overworld extends BaseScene {
    constructor() {
        super(SceneKeys.WORLD);
    }

    create(): void {
        super.create();
        this.log('Overworld scene activated - placeholder implementation');
    }
}