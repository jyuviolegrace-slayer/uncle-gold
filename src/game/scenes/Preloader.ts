import Phaser from 'phaser';
import { BaseScene } from './common/BaseScene';
import {
    SceneKeys,
    imageAssets,
    spritesheetAssets,
    tilemapAssets,
    audioAssets,
    dataAssets,
    fontAssets,
    WebFontFileLoader,
} from '../assets';

export class Preloader extends BaseScene {
    private progressBar?: Phaser.GameObjects.Graphics;
    private progressBox?: Phaser.GameObjects.Graphics;
    private progressText?: Phaser.GameObjects.Text;
    private progressBounds?: { x: number; y: number; width: number; height: number };

    private readonly onLoadProgress = (value: number) => {
        if (!this.progressBar || !this.progressBounds || !this.progressText) {
            return;
        }

        const { x, y, width, height } = this.progressBounds;
        this.progressBar.clear();
        this.progressBar.fillStyle(0xffc107, 1);
        this.progressBar.fillRect(x, y, width * value, height);

        this.progressText.setText(`Loading... ${Math.round(value * 100)}%`);
        this.eventBus.emit('preload-progress', value);
    };

    private readonly onFileProgress = (file: Phaser.Loader.File) => {
        this.eventBus.emit('preload-file', { key: file.key, type: file.type });
    };

    private readonly onLoadComplete = () => {
        if (this.progressBar && this.progressBounds) {
            const { x, y, width, height } = this.progressBounds;
            this.progressBar.clear();
            this.progressBar.fillStyle(0x4caf50, 1);
            this.progressBar.fillRect(x, y, width, height);
        }

        if (this.progressText) {
            this.progressText.setText('Loading Complete');
        }

        this.eventBus.emit('preload-progress', 1);
    };

    constructor() {
        super(SceneKeys.PRELOAD);
    }

    preload(): void {
        super.preload();

        this.createLoadingUi();
        this.registerLoadEvents();
        this.loadFromManifest();
    }

    create(): void {
        super.create();

        this.progressBar?.destroy();
        this.progressBox?.destroy();
        this.progressText?.destroy();

        this.eventBus.emit('preload-complete');
    }

    private createLoadingUi(): void {
        const { width, height } = this.cameras.main;
        const barWidth = Math.min(480, width * 0.6);
        const barHeight = 24;
        const x = (width - barWidth) / 2;
        const y = (height - barHeight) / 2;

        this.progressBox = this.add.graphics();
        this.progressBox.fillStyle(0x1c1c1c, 0.85);
        this.progressBox.fillRoundedRect(x - 8, y - 8, barWidth + 16, barHeight + 16, 12);

        this.progressBar = this.add.graphics();
        this.progressBounds = { x, y, width: barWidth, height: barHeight };

        this.progressText = this.add
            .text(width / 2, y + barHeight + 32, 'Loading... 0%', {
                color: '#ffffff',
                fontSize: '18px',
                fontFamily: 'sans-serif',
            })
            .setOrigin(0.5);
    }

    private registerLoadEvents(): void {
        this.load.on('progress', this.onLoadProgress);
        this.load.on('fileprogress', this.onFileProgress);
        this.load.once('complete', this.onLoadComplete);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.load.off('progress', this.onLoadProgress);
            this.load.off('fileprogress', this.onFileProgress);
            this.load.off('complete', this.onLoadComplete);
        });
    }

    private loadFromManifest(): void {
        imageAssets.forEach(({ key, url }) => {
            this.load.image(key, url);
        });

        spritesheetAssets.forEach(({ key, url, frameConfig }) => {
            this.load.spritesheet(key, url, frameConfig);
        });

        tilemapAssets.forEach(({ key, url }) => {
            this.load.tilemapTiledJSON(key, url);
        });

        audioAssets.forEach(({ key, url, config }) => {
            this.load.audio(key, url, config);
        });

        dataAssets.forEach(({ key, url }) => {
            this.load.json(key, url);
        });

        fontAssets.forEach((descriptor) => {
            this.load.addFile(new WebFontFileLoader(this.load, descriptor));
        });
    }
}
