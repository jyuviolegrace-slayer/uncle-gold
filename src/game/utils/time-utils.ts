import { Scene } from 'phaser';

/**
 * Time utility functions
 * Ported from archive/src/utils/time-utils.js
 */

/**
 * Used for allowing the code to wait a certain amount of time before executing
 * the next code.
 * @param milliseconds The number of milliseconds to wait
 * @param scene The Phaser Scene to use the time plugin from
 * @returns Promise that resolves after the specified time
 */
export function sleep(milliseconds: number, scene: Scene): Promise<void> {
  return new Promise((resolve) => {
    scene.time.delayedCall(milliseconds, () => {
      resolve();
    });
  });
}

/**
 * Create a delayed callback that returns a promise
 * @param milliseconds The number of milliseconds to wait
 * @param scene The Phaser Scene to use the time plugin from
 * @param callback The function to call after the delay
 * @returns Promise that resolves with the callback result
 */
export function delayedCallback<T>(milliseconds: number, scene: Scene, callback: () => T): Promise<T> {
  return new Promise((resolve) => {
    scene.time.delayedCall(milliseconds, () => {
      resolve(callback());
    });
  });
}

/**
 * Create a repeating timer that can be controlled
 * @param scene The Phaser Scene to use the time plugin from
 * @param delay The delay in milliseconds between repeats
 * @param callback The function to call on each repeat
 * @param repeatCount Number of times to repeat (0 = infinite)
 * @returns Timer event that can be used to control the timer
 */
export function createRepeatingTimer(
  scene: Scene,
  delay: number,
  callback: () => void,
  repeatCount: number = 0
): Phaser.Time.TimerEvent {
  return scene.time.addEvent({
    delay,
    callback,
    repeat: repeatCount - 1, // Phaser counts the first execution as 1, so subtract 1
  });
}

/**
 * Create a countdown timer
 * @param scene The Phaser Scene to use the time plugin from
 * @param duration The total duration in milliseconds
 * @param onUpdate Callback called every frame with remaining time
 * @param onComplete Callback called when timer completes
 * @returns Timer event that can be used to control the timer
 */
export function createCountdownTimer(
  scene: Scene,
  duration: number,
  onUpdate: (remainingTime: number) => void,
  onComplete: () => void
): Phaser.Time.TimerEvent {
  const startTime = scene.time.now;
  
  return scene.time.addEvent({
    delay: 16, // ~60fps update rate
    repeat: Math.floor(duration / 16),
    callback: () => {
      const elapsed = scene.time.now - startTime;
      const remaining = Math.max(0, duration - elapsed);
      onUpdate(remaining);
      
      if (remaining <= 0) {
        onComplete();
      }
    },
  });
}

/**
 * Debounce a function call
 * @param scene The Phaser Scene to use the time plugin from
 * @param func The function to debounce
 * @param delay The debounce delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => void>(
  scene: Scene,
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: Phaser.Time.TimerEvent | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      timeoutId.remove();
    }
    
    timeoutId = scene.time.delayedCall(delay, () => {
      func(...args);
      timeoutId = null;
    });
  };
}

/**
 * Throttle a function call
 * @param scene The Phaser Scene to use the time plugin from
 * @param func The function to throttle
 * @param delay The throttle delay in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => void>(
  scene: Scene,
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = scene.time.now;
    
    if (now - lastCall >= delay) {
      func(...args);
      lastCall = now;
    }
  };
}

/**
 * Get the current time in milliseconds from the scene's timer
 * @param scene The Phaser Scene to get time from
 * @returns Current time in milliseconds
 */
export function getCurrentTime(scene: Scene): number {
  return scene.time.now;
}

/**
 * Check if a certain amount of time has passed since a reference time
 * @param scene The Phaser Scene to get time from
 * @param referenceTime The reference time in milliseconds
 * @param elapsed The amount of time to check for in milliseconds
 * @returns True if the specified time has passed
 */
export function hasTimeElapsed(scene: Scene, referenceTime: number, elapsed: number): boolean {
  return (scene.time.now - referenceTime) >= elapsed;
}

/**
 * Convert milliseconds to a human-readable time string
 * @param milliseconds The time in milliseconds
 * @returns Formatted time string (MM:SS or HH:MM:SS)
 */
export function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}