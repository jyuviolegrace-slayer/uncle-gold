import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';
import { SceneContext } from './SceneContext';
import { GameStateManager, Critter, CritterSpeciesDatabase } from '../models';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    logoTween: Phaser.Tweens.Tween | null;
    selectedStarterIndex: number = 0;
    starterButtonsContainer: GameObjects.Container | null = null;
    infoText: GameObjects.Text | null = null;
    starterChoosing: boolean = false;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.background = this.add.image(512, 384, 'background');

        this.logo = this.add.image(512, 300, 'logo').setDepth(100);

        this.title = this.add.text(512, 460, 'Main Menu', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.infoText = this.add.text(512, 550, 'Press ENTER to start or ESC for load game', {
            fontFamily: 'Arial', fontSize: 16, color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.setupInput();

        EventBus.emit('current-scene-ready', this);
    }

    private setupInput()
    {
        this.input.keyboard?.on('keydown-ENTER', () => {
            this.showStarterSelection();
        });

        this.input.keyboard?.on('keydown-ESC', () => {
            const gameStateManager = new GameStateManager();
            if (gameStateManager.hasSaveData()) {
                gameStateManager.loadGame();
                SceneContext.initialize(gameStateManager);
                this.scene.start('Overworld', { entryPoint: gameStateManager.getPlayerState().currentArea });
            }
        });

        this.input.keyboard?.on('keydown-LEFT_ARROW', () => {
            if (this.starterChoosing) {
                this.selectedStarterIndex = Math.max(0, this.selectedStarterIndex - 1);
                this.renderStarterButtons();
            }
        });

        this.input.keyboard?.on('keydown-RIGHT_ARROW', () => {
            if (this.starterChoosing) {
                this.selectedStarterIndex = Math.min(2, this.selectedStarterIndex + 1);
                this.renderStarterButtons();
            }
        });

        this.input.keyboard?.on('keydown-Z', () => {
            if (this.starterChoosing) {
                this.selectStarter();
            }
        });
    }

    private showStarterSelection()
    {
        if (this.logoTween)
        {
            this.logoTween.stop();
            this.logoTween = null;
        }

        this.starterChoosing = true;
        this.title.setText('Choose Your Starter Critter');
        this.infoText?.setText('Use LEFT/RIGHT arrows to select | Press Z to confirm');

        this.starterButtonsContainer = this.add.container(150, 350);
        this.renderStarterButtons();
    }

    private renderStarterButtons()
    {
        if (!this.starterButtonsContainer) return;

        this.starterButtonsContainer.removeAll(true);

        const starters = [
            { id: 'embolt', name: 'Embolt', color: 0xff6600 },
            { id: 'aqualis', name: 'Aqualis', color: 0x0066ff },
            { id: 'thornwick', name: 'Thornwick', color: 0x00cc00 }
        ];

        starters.forEach((starter, index) => {
            const x = index * 200;
            const isSelected = index === this.selectedStarterIndex;
            const bgColor = isSelected ? 0xffff00 : starter.color;
            const bg = this.add.rectangle(x + 70, 50, 120, 100, bgColor);
            const text = this.add.text(x + 10, 20, starter.name, {
                font: '16px Arial',
                color: '#000000'
            });

            this.starterButtonsContainer?.add([bg, text]);
        });
    }

    private selectStarter()
    {
        const starters = ['embolt', 'aqualis', 'thornwick'];
        const starterId = starters[this.selectedStarterIndex];

        const gameStateManager = new GameStateManager('Player');
        SceneContext.initialize(gameStateManager);

        const starterCritter = new Critter(starterId, 5);
        gameStateManager.addCritterToParty(starterCritter);
        gameStateManager.addMoney(1000);

        this.scene.start('Overworld', { entryPoint: 'starter-town' });
    }
    
    changeScene ()
    {
        if (this.logoTween)
        {
            this.logoTween.stop();
            this.logoTween = null;
        }

        this.scene.start('Game');
    }

    moveLogo (reactCallback: ({ x, y }: { x: number, y: number }) => void)
    {
        if (this.logoTween)
        {
            if (this.logoTween.isPlaying())
            {
                this.logoTween.pause();
            }
            else
            {
                this.logoTween.play();
            }
        } 
        else
        {
            this.logoTween = this.tweens.add({
                targets: this.logo,
                x: { value: 750, duration: 3000, ease: 'Back.easeInOut' },
                y: { value: 80, duration: 1500, ease: 'Sine.easeOut' },
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    if (reactCallback)
                    {
                        reactCallback({
                            x: Math.floor(this.logo.x),
                            y: Math.floor(this.logo.y)
                        });
                    }
                }
            });
        }
    }
}
