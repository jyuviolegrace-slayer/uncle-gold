import { Scene } from 'phaser';
import { EventBus } from '../../EventBus';
import { AudioManager } from '../../services/AudioManager';
import { InputManager } from '../../managers/InputManager';

/**
 * BaseScene - Abstract base class for all game scenes
 * Mirrors archive/src/scenes/base-scene.js functionality with TypeScript enhancements
 * 
 * Provides shared functionality:
 * - Input locking/unlocking
 * - EventBus integration
 * - Scene lifecycle logging
 * - Cleanup hooks
 * - Fullscreen toggle (F key)
 */
export abstract class BaseScene extends Scene {
  protected inputLocked: boolean = false;
  protected eventBus: typeof EventBus;
  protected audioManager: AudioManager;
  protected inputManager: InputManager;

  constructor(key: string) {
    super(key);
    this.eventBus = EventBus;
    
    if (this.constructor === BaseScene) {
      throw new Error('BaseScene is an abstract class and cannot be instantiated.');
    }
  }

  init(data?: any): void {
    this.log(`[${this.constructor.name}:init] invoked${data ? `, data provided: ${JSON.stringify(data)}` : ''}`);
  }

  preload(): void {
    this.log(`[${this.constructor.name}:preload] invoked`);
  }

  create(): void {
    this.log(`[${this.constructor.name}:create] invoked`);
    
    // Initialize shared managers
    this.audioManager = new AudioManager(this);
    this.inputManager = new InputManager(this);
    
    // Setup event listeners for scene lifecycle
    this.events.on('resume', this.handleSceneResume, this);
    this.events.once('shutdown', this.handleSceneCleanup, this);
    
    // Bring scene to top when created
    this.scene.bringToTop();
    
    // Emit scene change event for React integration
    this.eventBus.emit('currentScene', this);
  }

  update(time: number, delta: number): void {
    // Handle fullscreen toggle with F key
    if (this.input.keyboard && this.input.keyboard.checkDown(this.input.keyboard.addKey('F'), 100)) {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    }
  }

  /**
   * Lock input to prevent player actions during cutscenes, dialogs, etc.
   */
  lockInput(): void {
    this.inputLocked = true;
    if (this.inputManager) {
      this.inputManager.lockInput();
    }
  }

  /**
   * Unlock input to allow player actions
   */
  unlockInput(): void {
    this.inputLocked = false;
    if (this.inputManager) {
      this.inputManager.unlockInput();
    }
  }

  /**
   * Check if input is currently locked
   */
  isInputLocked(): boolean {
    return this.inputLocked || (this.inputManager?.isInputLocked ?? false);
  }

  /**
   * Handle scene resume event
   */
  protected handleSceneResume(sys: any, data?: any): void {
    this.unlockInput();
    this.log(`[${this.constructor.name}:handleSceneResume] invoked${data ? `, data provided: ${JSON.stringify(data)}` : ''}`);
  }

  /**
   * Handle scene cleanup event
   */
  protected handleSceneCleanup(): void {
    this.log(`[${this.constructor.name}:handleSceneCleanup] invoked`);
    
    // Cleanup managers
    if (this.audioManager) {
      this.audioManager.destroy();
    }
    if (this.inputManager) {
      this.inputManager.destroy();
    }
    
    this.events.off('resume', this.handleSceneResume, this);
  }

  /**
   * Logging helper for scene debugging
   */
  protected log(message: string): void {
    console.log(`%c${message}`, 'color: orange; background: black;');
  }

  /**
   * Handle scene shutdown
   */
  shutdown(): void {
    this.handleSceneCleanup();
  }

  /**
   * Safe scene transition with error handling
   */
  protected transitionToScene(sceneKey: string, data?: any): void {
    try {
      this.scene.start(sceneKey, data);
    } catch (error) {
      this.log(`Failed to transition to scene ${sceneKey}: ${error}`);
    }
  }

  /**
   * Launch scene as overlay (for menus, dialogs, etc.)
   */
  protected launchOverlay(sceneKey: string, data?: any): void {
    try {
      this.scene.launch(sceneKey, data);
    } catch (error) {
      this.log(`Failed to launch overlay ${sceneKey}: ${error}`);
    }
  }

  /**
   * Stop overlay scene
   */
  protected stopOverlay(sceneKey: string): void {
    try {
      this.scene.stop(sceneKey);
    } catch (error) {
      this.log(`Failed to stop overlay ${sceneKey}: ${error}`);
    }
  }
}