import { BaseScene } from './common/BaseScene';
import { SceneKeys } from '../assets/SceneKeys';
import { EventBus } from '../EventBus';
import { sleep } from '../utils/time-utils';

export interface CutsceneSceneData {
  // Empty for now - can be extended for future use
}

export class Cutscene extends BaseScene {
  private topBar: Phaser.GameObjects.Rectangle | undefined;
  private bottomBar: Phaser.GameObjects.Rectangle | undefined;

  constructor() {
    super(SceneKeys.CUTSCENE);
  }

  init(data?: CutsceneSceneData): void {
    super.init(data);
  }

  create(): void {
    super.create();
    
    this.topBar = this.add.rectangle(0, 0, this.scale.width, 100, 0x000000, 0.8)
      .setOrigin(0)
      .setVisible(false);
    
    this.bottomBar = this.add.rectangle(0, this.scale.height - 100, this.scale.width, 100, 0x000000, 0.8)
      .setOrigin(0)
      .setVisible(false);
    
    this.scene.bringToTop();
  }

  async startCutScene(): Promise<void> {
    if (!this.topBar || !this.bottomBar) {
      return;
    }

    this.lockInput();
    
    // Emit event to pause HUD and other UI elements
    EventBus.emit('cutscene:started');

    this.topBar.setY(-100).setVisible(true);
    this.bottomBar.setY(this.scale.height).setVisible(true);

    await Promise.all([
      this.animateBar(this.topBar, -100, 0),
      this.animateBar(this.bottomBar, this.scale.height, this.scale.height - 100),
    ]);
  }

  async endCutScene(): Promise<void> {
    if (!this.topBar || !this.bottomBar) {
      return;
    }

    await Promise.all([
      this.animateBar(this.topBar, 0, -100),
      this.animateBar(this.bottomBar, this.scale.height - 100, this.scale.height),
    ]);

    this.topBar.setVisible(false);
    this.bottomBar.setVisible(false);
    
    this.unlockInput();
    
    // Emit event to resume HUD and other UI elements
    EventBus.emit('cutscene:ended');
    
    // Resume world scene
    this.scene.resume(SceneKeys.WORLD);
  }

  private animateBar(target: Phaser.GameObjects.Rectangle, startY: number, endY: number): Promise<void> {
    return new Promise((resolve) => {
      this.tweens.add({
        targets: target,
        delay: 0,
        duration: 800,
        y: {
          from: startY,
          start: startY,
          to: endY,
        },
        onComplete: () => resolve(),
      });
    });
  }

  /**
   * Execute a series of cutscene actions in sequence
   * This is a helper method for complex cutscenes
   */
  async executeCutsceneSequence(actions: CutsceneAction[]): Promise<void> {
    await this.startCutScene();
    
    try {
      for (const action of actions) {
        await this.executeAction(action);
      }
    } finally {
      await this.endCutScene();
    }
  }

  private async executeAction(action: CutsceneAction): Promise<void> {
    switch (action.type) {
      case 'WAIT':
        await sleep(action.duration!, this);
        break;
      case 'DIALOG':
        // TODO: Implement dialog integration with Dialog scene
        // For now, we'll just wait
        await sleep(2000, this);
        break;
      case 'CAMERA_PAN':
        await this.executeCameraPan(action);
        break;
      case 'FADE':
        await this.executeFade(action);
        break;
      default:
        console.warn(`Unknown cutscene action type: ${(action as any).type}`);
    }
  }

  private async executeCameraPan(action: CutsceneAction): Promise<void> {
    if (action.type !== 'CAMERA_PAN' || !action.x || !action.y || !action.duration) {
      return;
    }

    return new Promise((resolve) => {
      this.cameras.main.pan(action.x, action.y, action.duration, 'Linear', true, (camera, progress) => {
        if (progress === 1) {
          resolve();
        }
      });
    });
  }

  private async executeFade(action: CutsceneAction): Promise<void> {
    if (action.type !== 'FADE' || !action.duration) {
      return;
    }

    return new Promise((resolve) => {
      if (action.fadeIn) {
        this.cameras.main.fadeIn(action.duration);
        this.time.delayedCall(action.duration, () => {
          resolve();
        });
      } else {
        this.cameras.main.fadeOut(action.duration);
        this.time.delayedCall(action.duration, () => {
          resolve();
        });
      }
    });
  }

  shutdown(): void {
    super.shutdown();
    
    // Ensure bars are hidden
    if (this.topBar) {
      this.topBar.setVisible(false);
    }
    if (this.bottomBar) {
      this.bottomBar.setVisible(false);
    }
  }
}

export type CutsceneAction = 
  | { type: 'WAIT'; duration: number }
  | { type: 'DIALOG'; messages: string[] }
  | { type: 'CAMERA_PAN'; x: number; y: number; duration: number }
  | { type: 'FADE'; fadeIn: boolean; duration: number };