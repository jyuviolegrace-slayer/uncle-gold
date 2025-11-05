/**
 * Font key constants for the game.
 * These define the font families available for text rendering.
 * Fonts are loaded from Kenney's asset pack (https://www.kenney.nl/assets/kenney-fonts)
 */

export const FONT_KEYS = {
  KENNEY_FUTURE_NARROW: 'Kenney-Future-Narrow',
} as const;

export type FontKey = typeof FONT_KEYS[keyof typeof FONT_KEYS];
