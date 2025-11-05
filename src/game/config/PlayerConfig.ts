/**
 * PlayerConfig - Centralized configuration for player animations and assets
 * Easy to update asset paths and animation definitions
 */

export interface AnimationDefinition {
  key: string;
  frames: number[];
  frameRate: number;
  repeat: number;
  repeatDelay?: number;
}

export interface PlayerAssetConfig {
  textureKey: string;
  assetPath: string;
  frameWidth: number;
  frameHeight: number;
  scale: number;
  animations: AnimationDefinition[];
}

export const DEFAULT_PLAYER_CONFIG: PlayerAssetConfig = {
  textureKey: 'player-brawler',
  assetPath: 'assets/animations/brawler48x48.png',
  frameWidth: 48,
  frameHeight: 48,
  scale: 2,
  animations: [
    {
      key: 'walk',
      frames: [0, 1, 2, 3],
      frameRate: 8,
      repeat: -1,
    },
    {
      key: 'idle',
      frames: [5, 6, 7, 8],
      frameRate: 8,
      repeat: -1,
    },
    {
      key: 'kick',
      frames: [10, 11, 12, 13, 10],
      frameRate: 8,
      repeat: -1,
      repeatDelay: 2000,
    },
    {
      key: 'punch',
      frames: [15, 16, 17, 18, 17, 15],
      frameRate: 8,
      repeat: -1,
      repeatDelay: 2000,
    },
    {
      key: 'jump',
      frames: [20, 21, 22, 23],
      frameRate: 8,
      repeat: -1,
    },
    {
      key: 'jumpkick',
      frames: [20, 21, 22, 23, 25, 23, 22, 21],
      frameRate: 8,
      repeat: -1,
    },
    {
      key: 'win',
      frames: [30, 31],
      frameRate: 8,
      repeat: -1,
      repeatDelay: 2000,
    },
    {
      key: 'die',
      frames: [35, 36, 37],
      frameRate: 8,
      repeat: 0,
    },
  ],
};
