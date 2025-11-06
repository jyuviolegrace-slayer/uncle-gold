import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { DataManagerStoreKeys, SoundOptions, dataManager } from './DataManager';

export class AudioManager {
  private scene: Scene;
  private eventBus: typeof EventBus;
  private currentMusicKey: string | null = null;
  private fadeTimers: Map<string, Phaser.Time.TimerEvent> = new Map();

  constructor(scene: Scene) {
    this.scene = scene;
    this.eventBus = EventBus;
    this.setupEventListeners();
  }

  /**
   * Play background music with loop, respecting sound settings
   */
  playBackgroundMusic(audioKey: string): void {
    if (!this.isSoundEnabled()) {
      return;
    }

    // If same music is already playing, don't restart it
    if (this.currentMusicKey === audioKey) {
      return;
    }

    // Stop all existing background music
    this.stopAllBackgroundMusic();

    // Play new background music
    this.currentMusicKey = audioKey;
    const sound = this.scene.sound.play(audioKey, {
      loop: true,
      volume: this.getMasterVolume(),
    });

    // Emit music transition event for scenes
    this.eventBus.emit('music:changed', audioKey);
  }

  /**
   * Play a sound effect once, respecting sound settings
   */
  playSoundFx(audioKey: string, volume: number = 1.0): void {
    if (!this.isSoundEnabled()) {
      return;
    }

    const baseVolume = this.getMasterVolume();
    this.scene.sound.play(audioKey, {
      volume: volume * baseVolume,
    });
  }

  /**
   * Stop all background music
   */
  stopAllBackgroundMusic(): void {
    const existingSounds = this.scene.sound.getAllPlaying();
    existingSounds.forEach((sound) => {
      // Check if it's a looping sound (background music)
      if ((sound as any).config?.loop) {
        sound.stop();
      }
    });
    this.currentMusicKey = null;
  }

  /**
   * Stop all sounds including music and effects
   */
  stopAllSounds(): void {
    this.scene.sound.getAllPlaying().forEach((sound) => {
      sound.stop();
    });
    this.currentMusicKey = null;
  }

  /**
   * Fade out background music over specified duration
   */
  async fadeOutBackgroundMusic(duration: number = 1000): Promise<void> {
    return new Promise((resolve) => {
      if (!this.currentMusicKey) {
        resolve();
        return;
      }

      const sound = this.scene.sound.get(this.currentMusicKey);
      if (!sound) {
        resolve();
        return;
      }

      // Clear any existing fade timer for this sound
      const existingTimer = this.fadeTimers.get(this.currentMusicKey);
      if (existingTimer) {
        existingTimer.remove();
      }

      const startVolume = (sound as any).volume || 1;
      const fadeSteps = 60; // 60 steps for smooth 60fps fade
      const volumeStep = startVolume / fadeSteps;
      const stepDuration = duration / fadeSteps;

      let currentStep = 0;
      const fadeTimer = this.scene.time.addEvent({
        delay: stepDuration,
        repeat: fadeSteps - 1,
        callback: () => {
          currentStep++;
          const newVolume = Math.max(0, startVolume - (volumeStep * currentStep));
          (sound as any).setVolume(newVolume);

          if (currentStep >= fadeSteps || newVolume <= 0) {
            sound.stop();
            this.fadeTimers.delete(this.currentMusicKey!);
            this.currentMusicKey = null;
            resolve();
          }
        },
      });

      this.fadeTimers.set(this.currentMusicKey, fadeTimer);
    });
  }

  /**
   * Fade in background music over specified duration
   */
  async fadeInBackgroundMusic(audioKey: string, duration: number = 1000): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isSoundEnabled()) {
        resolve();
        return;
      }

      // Stop existing music first
      this.stopAllBackgroundMusic();

      const targetVolume = this.getMasterVolume();
      const sound = this.scene.sound.play(audioKey, {
        loop: true,
        volume: 0, // Start at 0 volume for fade in
      });

      this.currentMusicKey = audioKey;

      const fadeSteps = 60;
      const volumeStep = targetVolume / fadeSteps;
      const stepDuration = duration / fadeSteps;

      let currentStep = 0;
      const fadeTimer = this.scene.time.addEvent({
        delay: stepDuration,
        repeat: fadeSteps - 1,
        callback: () => {
          currentStep++;
          const newVolume = Math.min(targetVolume, volumeStep * currentStep);
          (sound as any).setVolume(newVolume);

          if (currentStep >= fadeSteps || newVolume >= targetVolume) {
            this.fadeTimers.delete(audioKey);
            resolve();
          }
        },
      });

      this.fadeTimers.set(audioKey, fadeTimer);
      this.eventBus.emit('music:changed', audioKey);
    });
  }

  /**
   * Crossfade from current music to new music
   */
  async crossfadeMusic(newAudioKey: string, duration: number = 1500): Promise<void> {
    if (!this.isSoundEnabled()) {
      return;
    }

    // If no current music, just fade in the new one
    if (!this.currentMusicKey) {
      await this.fadeInBackgroundMusic(newAudioKey, duration);
      return;
    }

    // If same music, do nothing
    if (this.currentMusicKey === newAudioKey) {
      return;
    }

    // Fade out current music while fading in new music
    await Promise.all([
      this.fadeOutBackgroundMusic(duration),
      this.fadeInBackgroundMusic(newAudioKey, duration),
    ]);
  }

  /**
   * Update global sound settings based on data manager
   */
  updateGlobalSoundSettings(): void {
    const volume = this.getMasterVolume();
    const isMuted = !this.isSoundEnabled();

    this.scene.sound.setVolume(volume);
    this.scene.sound.setMute(isMuted);
  }

  /**
   * Get master volume from data manager (0-10 scale, converted to 0-1)
   */
  private getMasterVolume(): number {
    const volumeSetting = dataManager.dataStore.get(DataManagerStoreKeys.OPTIONS_VOLUME) as number || 4;
    return (volumeSetting / 10) * 0.25; // Scale to 0-0.25 range like original
  }

  /**
   * Check if sound is enabled in data manager
   */
  private isSoundEnabled(): boolean {
    const soundOption = dataManager.dataStore.get(DataManagerStoreKeys.OPTIONS_SOUND) as SoundOptions;
    return soundOption === SoundOptions.ON;
  }

  /**
   * Setup event listeners for sound setting changes
   */
  private setupEventListeners(): void {
    // Listen for volume changes
    this.eventBus.on('volume:changed', () => {
      this.updateGlobalSoundSettings();
    });

    // Listen for sound on/off changes
    this.eventBus.on('sound:toggled', () => {
      this.updateGlobalSoundSettings();
    });
  }

  /**
   * Cleanup when scene is destroyed
   */
  destroy(): void {
    // Clear all fade timers
    this.fadeTimers.forEach((timer) => {
      timer.remove();
    });
    this.fadeTimers.clear();

    // Remove event listeners
    this.eventBus.off('volume:changed');
    this.eventBus.off('sound:toggled');
  }
}