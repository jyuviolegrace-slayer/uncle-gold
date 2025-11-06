import { BaseScene } from './common/BaseScene';
import { SceneKeys } from '../assets';

/**
 * Title Scene - Main menu and game title screen
 * Placeholder implementation that logs activation
 */
export class Title extends BaseScene {
    constructor() {
        super(SceneKeys.TITLE);
    }

    create(): void {
        super.create();
        this.log('Title scene activated - placeholder implementation');
    }
}