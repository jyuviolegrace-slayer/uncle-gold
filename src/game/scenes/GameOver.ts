import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { SceneContext } from './SceneContext';

export class GameOver extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameOverText : Phaser.GameObjects.Text;
    private gameStateManager = SceneContext.getInstance().getGameStateManager();

    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        this.camera = this.cameras.main

        const isChampion = this.gameStateManager.getBadgeCount() >= 8;

        if (isChampion) {
            this.scene.start('Champion');
            return;
        }

        this.camera.setBackgroundColor(0xff0000);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);

        this.gameOverText = this.add.text(512, 384, 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        
        EventBus.emit('current-scene-ready', this);
    }

    changeScene ()
    {
        this.scene.start('Title');
    }
}
