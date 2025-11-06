import { Scene, GameObjects } from 'phaser';

/**
 * Text utility functions
 * Ported from archive/src/utils/text-utils.js
 */

export interface AnimateTextConfig {
  callback?: () => void;
  delay?: number;
}

/**
 * Animate text display character by character
 * @param scene the Phaser 3 Scene the time event will be added to
 * @param target the Phaser 3 Text Game Object that will be animated
 * @param text the text to display on the target game object
 * @param config optional configuration for animation
 */
export function animateText(
  scene: Scene,
  target: GameObjects.Text,
  text: string,
  config?: AnimateTextConfig
): void {
  const length = text.length;
  let i = 0;
  target.setText('');
  
  scene.time.addEvent({
    callback: () => {
      target.text += text[i];
      ++i;
      if (i === length - 1 && config?.callback) {
        config.callback();
      }
    },
    repeat: length - 1,
    delay: config?.delay || 25,
  });
}

export const CANNOT_READ_SIGN_TEXT = 'You cannot read the sign from this direction.';
export const SAMPLE_TEXT = 'Make sure you talk to npcs for helpful tips!';
export const LONG_SAMPLE_TEXT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Enim sed faucibus turpis in eu mi bibendum.';