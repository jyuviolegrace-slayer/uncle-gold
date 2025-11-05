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
    selectionIndicator: GameObjects.Rectangle | null = null;
    isConfirming: boolean = false;
    zKeyJustPressed: boolean = false;
    keyZ: Phaser.Input.Keyboard.Key | null = null;
    keyLeft: Phaser.Input.Keyboard.Key | null = null;
    keyRight: Phaser.Input.Keyboard.Key | null = null;

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

    update()
    {
        // Fallback keyboard checking for Z key using JustDown
        if (this.starterChoosing && !this.isConfirming && this.keyZ) {
            if (Phaser.Input.Keyboard.JustDown(this.keyZ)) {
                console.log('Z key detected via JustDown method');
                this.isConfirming = true;
                this.selectStarter();
            }
        }
    }

    shutdown()
    {
        console.log('MainMenu scene shutting down');
        if (this.logoTween) {
            this.logoTween.stop();
            this.logoTween = null;
        }
        this.input.keyboard?.off('keydown-ENTER');
        this.input.keyboard?.off('keydown-ESC');
        this.input.keyboard?.off('keydown-LEFT');
        this.input.keyboard?.off('keydown-RIGHT');
        this.input.keyboard?.off('keydown-z');
        this.input.keyboard?.off('keydown-Z');
    }

    private setupInput()
    {
        this.input.keyboard?.on('keydown-ENTER', () => {
            this.showStarterSelection();
        });

        this.input.keyboard?.on('keydown-ESC', () => {
            const gameStateManager = new GameStateManager();
            if (gameStateManager.hasSaveData()) {
                console.log('Loading saved game...');
                gameStateManager.loadGame();
                SceneContext.initialize(gameStateManager);
                console.log('Stopping MainMenu to load Overworld from save...');
                this.scene.stop();
                this.scene.start('Overworld', { mapId: gameStateManager.getPlayerState().currentArea });
            }
        });

        this.input.keyboard?.on('keydown-LEFT', () => {
            if (this.starterChoosing) {
                this.selectedStarterIndex = (this.selectedStarterIndex - 1 + 3) % 3;
                this.updateSelectionIndicator();
            }
        });

        this.input.keyboard?.on('keydown-RIGHT', () => {
            if (this.starterChoosing) {
                this.selectedStarterIndex = (this.selectedStarterIndex + 1) % 3;
                this.updateSelectionIndicator();
            }
        });

        const handleZKeyPress = () => {
            console.log('Z key pressed. starterChoosing:', this.starterChoosing, 'isConfirming:', this.isConfirming);
            if (this.starterChoosing && !this.isConfirming) {
                console.log('Z key confirmed - calling selectStarter()');
                this.isConfirming = true;
                this.selectStarter();
            } else {
                console.log('Z key ignored - conditions not met');
            }
        };

        this.input.keyboard?.on('keydown-z', handleZKeyPress);
        this.input.keyboard?.on('keydown-Z', handleZKeyPress);

        // Also add keyboard key references for robust input handling
        if (this.input.keyboard) {
            this.keyZ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
            this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
            this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
            console.log('Keyboard keys registered: Z, LEFT, RIGHT');
        }
    }

    private showStarterSelection()
    {
        if (this.logoTween)
        {
            this.logoTween.stop();
            this.logoTween = null;
        }

        this.starterChoosing = true;
        this.isConfirming = false;
        this.title.setText('Choose Your Starter Critter');
        this.infoText?.setText('Use LEFT/RIGHT arrows to select | Press Z to confirm');

        this.starterButtonsContainer = this.add.container(150, 350);
        this.renderStarterButtons();
        this.createSelectionIndicator();
        this.updateSelectionIndicator();
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
            const bg = this.add.rectangle(x + 70, 50, 120, 100, starter.color);
            const text = this.add.text(x + 10, 20, starter.name, {
                font: '16px Arial',
                color: '#000000'
            });

            this.starterButtonsContainer?.add([bg, text]);
        });
    }

    private createSelectionIndicator()
    {
        if (!this.selectionIndicator && this.starterButtonsContainer) {
            this.selectionIndicator = this.add.rectangle(0, 0, 140, 130)
                .setStrokeStyle(4, 0xffff00)
                .setFillStyle(undefined, 0)
                .setDepth(99);
            this.starterButtonsContainer.add(this.selectionIndicator);
        }
    }

    private updateSelectionIndicator()
    {
        if (!this.selectionIndicator) return;

        const x = this.selectedStarterIndex * 200 + 70;
        const y = 50;
        
        this.selectionIndicator.setPosition(x, y);
        
        this.tweens.add({
            targets: this.selectionIndicator,
            scaleX: { from: 0.9, to: 1.0, duration: 100 },
            scaleY: { from: 0.9, to: 1.0, duration: 100 },
            ease: 'Back.easeOut'
        });
    }

    private selectStarter()
    {
        try {
            const starters = ['embolt', 'aqualis', 'thornwick'];
            const starterId = starters[this.selectedStarterIndex];
            console.log('Selected starter:', starterId, 'at index', this.selectedStarterIndex);

            const gameStateManager = new GameStateManager('Player');
            console.log('GameStateManager created');
            
            SceneContext.initialize(gameStateManager);
            console.log('SceneContext initialized');

            const starterCritter = new Critter(starterId, 5);
            console.log('Critter created:', starterCritter.speciesId);
            
            gameStateManager.addCritterToParty(starterCritter);
            console.log('Critter added to party');
            
            gameStateManager.addMoney(1000);
            console.log('Money added');

            // Add starting items
            gameStateManager.addItem('pokeball', 5);
            gameStateManager.addItem('potion', 3);
            console.log('Starting items added');

            console.log('Starting Overworld scene...');
            console.log('Stopping MainMenu scene...');
            this.scene.stop();
            console.log('MainMenu stopped, now starting Overworld...');
            this.scene.start('Overworld', { mapId: 'starter-town' });
            console.log('Scene started successfully');
        } catch (error) {
            console.error('Error in selectStarter:', error);
            this.isConfirming = false;
        }
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
