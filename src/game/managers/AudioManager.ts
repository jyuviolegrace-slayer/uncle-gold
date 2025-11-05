import { Scene } from 'phaser';

export interface IAudioConfig {
  musicVolume?: number;
  sfxVolume?: number;
  masterVolume?: number;
  isMuted?: boolean;
}

/**
 * AudioManager - Centralized audio control for music and SFX
 * Handles playback, volume control, muting, and crossfades
 */
export class AudioManager {
  private scene: Scene;
  private currentMusic: Phaser.Sound.BaseSound | null = null;
  private musicVolume: number = 0.7;
  private sfxVolume: number = 0.8;
  private masterVolume: number = 1.0;
  private isMuted: boolean = false;
  private soundPool: Map<string, Phaser.Sound.BaseSound[]> = new Map();

  constructor(scene: Scene, config?: IAudioConfig) {
    this.scene = scene;
    if (config) {
      this.musicVolume = config.musicVolume ?? this.musicVolume;
      this.sfxVolume = config.sfxVolume ?? this.sfxVolume;
      this.masterVolume = config.masterVolume ?? this.masterVolume;
      this.isMuted = config.isMuted ?? this.isMuted;
    }
  }

  /**
   * Play background music with optional crossfade
   */
  playMusic(key: string, config?: { loop?: boolean; volume?: number; fade?: number }): void {
    if (!this.scene.sound.get(key)) {
      console.warn(`Audio key not found: ${key}`);
      return;
    }

    const fadeTime = config?.fade ?? 500;

    // Stop current music with fade
    if (this.currentMusic && this.currentMusic.isPlaying) {
      this.scene.tweens.add({
        targets: this.currentMusic,
        volume: 0,
        duration: fadeTime,
        onComplete: () => {
          this.currentMusic?.stop();
        },
      });
    }

    // Start new music with fade in
    const music = this.scene.sound.add(key, {
      loop: config?.loop ?? true,
      volume: 0,
    }) as Phaser.Sound.BaseSound;

    this.currentMusic = music;
    music.play();

    this.scene.tweens.add({
      targets: music,
      volume: this.calculateVolume(config?.volume ?? this.musicVolume),
      duration: fadeTime,
    });
  }

  /**
   * Stop current music
   */
  stopMusic(fadeTime: number = 500): void {
    if (this.currentMusic && this.currentMusic.isPlaying) {
      if (fadeTime > 0) {
        this.scene.tweens.add({
          targets: this.currentMusic,
          volume: 0,
          duration: fadeTime,
          onComplete: () => {
            this.currentMusic?.stop();
            this.currentMusic = null;
          },
        });
      } else {
        this.currentMusic.stop();
        this.currentMusic = null;
      }
    }
  }

  /**
   * Play a sound effect with pooling
   */
  playSFX(key: string, config?: { volume?: number; pan?: number }): Phaser.Sound.BaseSound | null {
    if (!this.scene.sound.get(key)) {
      console.warn(`Audio key not found: ${key}`);
      return null;
    }

    let sound = this.getPooledSound(key);
    if (!sound) {
      sound = this.scene.sound.add(key) as Phaser.Sound.BaseSound;
    }

    (sound as any).volume = this.calculateVolume(config?.volume ?? this.sfxVolume);
    if (config?.pan !== undefined) {
      (sound as any).pan = config.pan;
    }

    sound.play();
    return sound;
  }

  /**
   * Get a pooled sound instance or create a new one
   */
  private getPooledSound(key: string): Phaser.Sound.BaseSound | null {
    if (!this.soundPool.has(key)) {
      this.soundPool.set(key, []);
    }

    const pool = this.soundPool.get(key)!;
    const sound = pool.find(s => !s.isPlaying);

    if (sound) {
      pool.splice(pool.indexOf(sound), 1);
      return sound;
    }

    // Create new sound if pool is empty (max 5 simultaneous instances per key)
    if (pool.length < 5) {
      return null;
    }

    return pool[0];
  }

  /**
   * Return sound to pool after playing
   */
  private returnSoundToPool(key: string, sound: Phaser.Sound.BaseSound): void {
    if (!this.soundPool.has(key)) {
      this.soundPool.set(key, []);
    }

    const pool = this.soundPool.get(key)!;
    if (pool.length < 5) {
      pool.push(sound);
    }
  }

  /**
   * Set music volume
   */
  setMusicVolume(volume: number): void {
    this.musicVolume = Phaser.Math.Clamp(volume, 0, 1);
    if (this.currentMusic) {
      (this.currentMusic as any).volume = this.calculateVolume(this.musicVolume);
    }
  }

  /**
   * Set SFX volume
   */
  setSFXVolume(volume: number): void {
    this.sfxVolume = Phaser.Math.Clamp(volume, 0, 1);
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Phaser.Math.Clamp(volume, 0, 1);
    if (this.currentMusic) {
      (this.currentMusic as any).volume = this.calculateVolume(this.musicVolume);
    }
    this.scene.sound.volume = this.masterVolume;
  }

  /**
   * Toggle mute
   */
  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.scene.sound.mute = this.isMuted;
    return this.isMuted;
  }

  /**
   * Set mute state
   */
  setMute(muted: boolean): void {
    this.isMuted = muted;
    this.scene.sound.mute = muted;
  }

  /**
   * Calculate final volume accounting for master volume
   */
  private calculateVolume(volume: number): number {
    return volume * this.masterVolume * (this.isMuted ? 0 : 1);
  }

  /**
   * Pause all sounds
   */
  pauseAll(): void {
    this.scene.sound.pauseAll();
  }

  /**
   * Resume all sounds
   */
  resumeAll(): void {
    this.scene.sound.resumeAll();
  }

  /**
   * Stop all sounds
   */
  stopAll(): void {
    this.scene.sound.stopAll();
  }

  /**
   * Get current config
   */
  getConfig(): IAudioConfig {
    return {
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      masterVolume: this.masterVolume,
      isMuted: this.isMuted,
    };
  }

  /**
   * Clean up resources
   */
  shutdown(): void {
    this.stopAll();
    this.soundPool.clear();
  }
}
