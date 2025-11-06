import { BaseScene } from './common/BaseScene';
import { SceneKeys } from '../assets';

/**
 * Options Scene - Game settings and configuration
 * Placeholder implementation that logs activation
 */
export class Options extends BaseScene {
    constructor() {
        super(SceneKeys.OPTIONS);
    }

    create(): void {
        super.create();
        this.log('Options scene activated - placeholder implementation');
    }
}