import { BaseScene } from './common/BaseScene';
import { SceneKeys } from '../assets';

/**
 * Battle Scene - Turn-based combat system
 * Placeholder implementation that logs activation
 */
export class Battle extends BaseScene {
    constructor() {
        super(SceneKeys.BATTLE);
    }

    create(): void {
        super.create();
        this.log('Battle scene activated - placeholder implementation');
    }
}