import { Scene, GameObjects, Physics } from 'phaser';
import { EventBus } from '../EventBus';
import { SceneContext } from './SceneContext';
import { Critter } from '../models';

/**
 * Overworld Scene - Main exploration and navigation scene
 * Handles player movement, wild encounters, NPC interactions
 */
export class Overworld extends Scene {
  private player: Physics.Arcade.Sprite | null = null;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private gameStateManager = SceneContext.getInstance().getGameStateManager();
  private entryPoint: string = 'starter-town';

  constructor() {
    super('Overworld');
  }

  init(data: any) {
    if (data?.entryPoint) {
      this.entryPoint = data.entryPoint;
    }
  }

  create() {
    this.setupWorld();
    this.setupPlayer();
    this.setupInput();
    this.setupEventListeners();
    this.launchHUD();

    EventBus.emit('current-scene-ready', this);
  }

  private setupWorld() {
    const width = this.game.config.width as number;
    const height = this.game.config.height as number;

    const background = this.add.rectangle(width / 2, height / 2, width, height, 0x228b22);
    background.setScrollFactor(0).setDepth(-1);

    const areaText = this.add.text(
      width / 2,
      height / 2,
      `${this.entryPoint.toUpperCase()}\n\nWelcome to Critter Quest!\nUse arrow keys to move`,
      {
        font: '20px Arial',
        color: '#ffffff',
        align: 'center',
      }
    );
    areaText.setOrigin(0.5);
  }

  private setupPlayer() {
    const width = this.game.config.width as number;
    const height = this.game.config.height as number;

    this.player = this.physics.add.sprite(width / 2, height / 2, 'star');
    this.player.setScale(1.5);
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, width, height);
  }

  private setupInput() {
    this.cursors = this.input.keyboard?.createCursorKeys() || null;

    this.input.keyboard?.on('keydown-M', () => {
      this.scene.start('Menu');
    });

    this.input.keyboard?.on('keydown-P', () => {
      this.scene.start('Party');
    });

    this.input.keyboard?.on('keydown-S', () => {
      this.scene.start('Shop');
    });

    this.input.keyboard?.on('keydown-B', () => {
      this.startBattle();
    });
  }

  private setupEventListeners() {
    EventBus.on('start-battle', (data: any) => {
      this.startBattle(data);
    });

    EventBus.on('open-menu', () => {
      this.scene.start('Menu');
    });

    EventBus.on('open-party', () => {
      this.scene.start('Party');
    });

    EventBus.on('open-shop', () => {
      this.scene.start('Shop');
    });
  }

  private launchHUD() {
    if (!this.scene.isActive('HUD')) {
      this.scene.launch('HUD');
    }
  }

  private startBattle(data?: any) {
    this.scene.pause('HUD');
    this.scene.start('Battle', data);
  }

  update() {
    if (!this.player || !this.cursors) return;

    this.player.setVelocity(0, 0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-200);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(200);
    }
  }

  shutdown() {
    EventBus.off('start-battle');
    EventBus.off('open-menu');
    EventBus.off('open-party');
    EventBus.off('open-shop');
  }
}
