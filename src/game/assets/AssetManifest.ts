import type Phaser from 'phaser';
import { TextureKeys } from './TextureKeys';
import { AudioKeys } from './AudioKeys';
import { FontKeys } from './FontKeys';
import { CoreDataKeys, LegacyDataKeys, type DataKey } from './DataKeys';
import type { FontAssetDescriptor } from './WebFontFileLoader';

export interface ImageAssetDescriptor {
  key: TextureKeys;
  url: string;
}

export interface SpritesheetAssetDescriptor {
  key: TextureKeys;
  url: string;
  frameConfig: Phaser.Types.Loader.FileTypes.ImageFrameConfig;
}

export interface TilemapAssetDescriptor {
  key: TextureKeys;
  url: string;
}

export interface AudioAssetDescriptor {
  key: AudioKeys;
  url: string | string[];
  config?: Phaser.Types.Loader.FileTypes.AudioFileConfig;
}

export interface DataAssetDescriptor<K extends DataKey = DataKey> {
  key: K;
  url: string;
}

const ASSET_BASE_PATH = 'assets';
const IMAGE_BASE_PATH = `${ASSET_BASE_PATH}/images`;
const AUDIO_BASE_PATH = `${ASSET_BASE_PATH}/audio`;
const DATA_BASE_PATH = `${ASSET_BASE_PATH}/data`;
const PLACEHOLDER_IMAGE = `${ASSET_BASE_PATH}/logo.png`;

export const imageAssets: ImageAssetDescriptor[] = [
  { key: TextureKeys.GITHUB_BANNER, url: PLACEHOLDER_IMAGE },
  { key: TextureKeys.LEARN_MORE_BACKGROUND, url: PLACEHOLDER_IMAGE },
  { key: TextureKeys.YOUTUBE_BUTTON, url: PLACEHOLDER_IMAGE },
  { key: TextureKeys.YOUTUBE_THUMB_NAIL, url: PLACEHOLDER_IMAGE },
  { key: TextureKeys.BATTLE_FOREST, url: `${IMAGE_BASE_PATH}/monster-tamer/battle-backgrounds/forest-background.png` },
  { key: TextureKeys.MONSTER_IGUANIGNITE, url: `${IMAGE_BASE_PATH}/monster-tamer/monsters/iguanignite.png` },
  { key: TextureKeys.MONSTER_CARNODUSK, url: `${IMAGE_BASE_PATH}/monster-tamer/monsters/carnodusk.png` },
  { key: TextureKeys.MONSTER_IGNIVOLT, url: `${IMAGE_BASE_PATH}/monster-tamer/monsters/Ignivolt.png` },
  { key: TextureKeys.MONSTER_AQUAVALOR, url: `${IMAGE_BASE_PATH}/monster-tamer/monsters/aquavalor.png` },
  { key: TextureKeys.MONSTER_FROSTSABER, url: `${IMAGE_BASE_PATH}/monster-tamer/monsters/frostsaber.png` },
  { key: TextureKeys.HEALTH_BAR_BACKGROUND, url: `${IMAGE_BASE_PATH}/kenneys-assets/ui-space-expansion/custom-ui.png` },
  { key: TextureKeys.BALL_THUMBNAIL, url: `${IMAGE_BASE_PATH}/monster-tamer/battle/cosmoball.png` },
  { key: TextureKeys.DAMAGED_BALL, url: `${IMAGE_BASE_PATH}/monster-tamer/battle/damagedBall.png` },
  { key: TextureKeys.HEALTH_LEFT_CAP, url: `${IMAGE_BASE_PATH}/kenneys-assets/ui-space-expansion/barHorizontal_green_left.png` },
  { key: TextureKeys.HEALTH_MIDDLE, url: `${IMAGE_BASE_PATH}/kenneys-assets/ui-space-expansion/barHorizontal_green_mid.png` },
  { key: TextureKeys.HEALTH_RIGHT_CAP, url: `${IMAGE_BASE_PATH}/kenneys-assets/ui-space-expansion/barHorizontal_green_right.png` },
  { key: TextureKeys.HEALTH_LEFT_CAP_SHADOW, url: `${IMAGE_BASE_PATH}/kenneys-assets/ui-space-expansion/barHorizontal_shadow_left.png` },
  { key: TextureKeys.HEALTH_MIDDLE_SHADOW, url: `${IMAGE_BASE_PATH}/kenneys-assets/ui-space-expansion/barHorizontal_shadow_mid.png` },
  { key: TextureKeys.HEALTH_RIGHT_CAP_SHADOW, url: `${IMAGE_BASE_PATH}/kenneys-assets/ui-space-expansion/barHorizontal_shadow_right.png` },
  { key: TextureKeys.EXP_LEFT_CAP, url: `${IMAGE_BASE_PATH}/kenneys-assets/ui-space-expansion/barHorizontal_blue_left.png` },
  { key: TextureKeys.EXP_MIDDLE, url: `${IMAGE_BASE_PATH}/kenneys-assets/ui-space-expansion/barHorizontal_blue_mid.png` },
  { key: TextureKeys.EXP_RIGHT_CAP, url: `${IMAGE_BASE_PATH}/kenneys-assets/ui-space-expansion/barHorizontal_blue_right.png` },
  { key: TextureKeys.CURSOR, url: `${IMAGE_BASE_PATH}/monster-tamer/ui/cursor.png` },
  { key: TextureKeys.CURSOR_WHITE, url: `${IMAGE_BASE_PATH}/monster-tamer/ui/cursor_white.png` },
  { key: TextureKeys.MENU_BACKGROUND, url: `${IMAGE_BASE_PATH}/kenneys-assets/ui-space-expansion/glassPanel.png` },
  { key: TextureKeys.MENU_BACKGROUND_GREEN, url: `${IMAGE_BASE_PATH}/kenneys-assets/ui-space-expansion/glassPanel_green.png` },
  { key: TextureKeys.MENU_BACKGROUND_PURPLE, url: `${IMAGE_BASE_PATH}/kenneys-assets/ui-space-expansion/glassPanel_purple.png` },
  { key: TextureKeys.BLUE_BUTTON, url: `${IMAGE_BASE_PATH}/kenneys-assets/ui-pack/blue_button01.png` },
  { key: TextureKeys.BLUE_BUTTON_SELECTED, url: `${IMAGE_BASE_PATH}/kenneys-assets/ui-pack/blue_button00.png` },
  { key: TextureKeys.WORLD_MAIN_1_BACKGROUND, url: `${IMAGE_BASE_PATH}/monster-tamer/map/main_1_level_background.png` },
  { key: TextureKeys.WORLD_MAIN_1_FOREGROUND, url: `${IMAGE_BASE_PATH}/monster-tamer/map/main_1_level_foreground.png` },
  { key: TextureKeys.WORLD_COLLISION, url: `${IMAGE_BASE_PATH}/monster-tamer/map/collision.png` },
  { key: TextureKeys.WORLD_ENCOUNTER_ZONE, url: `${IMAGE_BASE_PATH}/monster-tamer/map/encounter.png` },
  { key: TextureKeys.WORLD_FOREST_1_BACKGROUND, url: `${IMAGE_BASE_PATH}/monster-tamer/map/forest_1_level_background.png` },
  { key: TextureKeys.WORLD_FOREST_1_FOREGROUND, url: `${IMAGE_BASE_PATH}/monster-tamer/map/forest_1_level_foreground.png` },
  { key: TextureKeys.BUILDING_1_BACKGROUND, url: `${IMAGE_BASE_PATH}/monster-tamer/map/buildings/building_1_level_background.png` },
  { key: TextureKeys.BUILDING_1_FOREGROUND, url: `${IMAGE_BASE_PATH}/monster-tamer/map/buildings/building_1_level_foreground.png` },
  { key: TextureKeys.BUILDING_2_BACKGROUND, url: `${IMAGE_BASE_PATH}/monster-tamer/map/buildings/building_2_level_background.png` },
  { key: TextureKeys.BUILDING_2_FOREGROUND, url: `${IMAGE_BASE_PATH}/monster-tamer/map/buildings/building_2_level_foreground.png` },
  { key: TextureKeys.BUILDING_3_BACKGROUND, url: `${IMAGE_BASE_PATH}/monster-tamer/map/buildings/building_3_level_background.png` },
  { key: TextureKeys.BUILDING_3_FOREGROUND, url: `${IMAGE_BASE_PATH}/monster-tamer/map/buildings/building_3_level_foreground.png` },
  { key: TextureKeys.TITLE_BACKGROUND, url: `${IMAGE_BASE_PATH}/monster-tamer/ui/title/background.png` },
  { key: TextureKeys.TITLE_LOGO, url: `${IMAGE_BASE_PATH}/monster-tamer/ui/title/title_text.png` },
  { key: TextureKeys.TITLE_PANEL, url: `${IMAGE_BASE_PATH}/monster-tamer/ui/title/title_background.png` },
  { key: TextureKeys.PARTY_BACKGROUND, url: `${IMAGE_BASE_PATH}/monster-tamer/ui/monster-party/background.png` },
  { key: TextureKeys.MONSTER_DETAILS_BACKGROUND, url: `${IMAGE_BASE_PATH}/monster-tamer/ui/monster-party/monster-details-background.png` },
  { key: TextureKeys.INVENTORY_BACKGROUND, url: `${IMAGE_BASE_PATH}/monster-tamer/ui/inventory/bag_background.png` },
  { key: TextureKeys.INVENTORY_BAG, url: `${IMAGE_BASE_PATH}/monster-tamer/ui/inventory/bag.png` },
];

export const spritesheetAssets: SpritesheetAssetDescriptor[] = [
  {
    key: TextureKeys.ATTACK_ICE_SHARD,
    url: `${IMAGE_BASE_PATH}/pimen/ice-attack/active.png`,
    frameConfig: { frameWidth: 32, frameHeight: 32 },
  },
  {
    key: TextureKeys.ATTACK_ICE_SHARD_START,
    url: `${IMAGE_BASE_PATH}/pimen/ice-attack/start.png`,
    frameConfig: { frameWidth: 32, frameHeight: 32 },
  },
  {
    key: TextureKeys.ATTACK_SLASH,
    url: `${IMAGE_BASE_PATH}/pimen/slash.png`,
    frameConfig: { frameWidth: 48, frameHeight: 48 },
  },
  {
    key: TextureKeys.WORLD_BEACH,
    url: `${IMAGE_BASE_PATH}/axulart/beach/crushed.png`,
    frameConfig: { frameWidth: 64, frameHeight: 64 },
  },
  {
    key: TextureKeys.WORLD_GRASS,
    url: `${IMAGE_BASE_PATH}/monster-tamer/map/bushes.png`,
    frameConfig: { frameWidth: 64, frameHeight: 64 },
  },
  {
    key: TextureKeys.CHARACTER_PLAYER,
    url: `${IMAGE_BASE_PATH}/axulart/character/custom.png`,
    frameConfig: { frameWidth: 64, frameHeight: 88 },
  },
  {
    key: TextureKeys.CHARACTER_NPC,
    url: `${IMAGE_BASE_PATH}/parabellum-games/characters.png`,
    frameConfig: { frameWidth: 16, frameHeight: 16 },
  },
];

export const tilemapAssets: TilemapAssetDescriptor[] = [
  { key: TextureKeys.WORLD_MAIN_1_LEVEL, url: `${DATA_BASE_PATH}/legacy/main_1.json` },
  { key: TextureKeys.WORLD_FOREST_1_LEVEL, url: `${DATA_BASE_PATH}/legacy/forest_1.json` },
  { key: TextureKeys.BUILDING_1_LEVEL, url: `${DATA_BASE_PATH}/legacy/building_1.json` },
  { key: TextureKeys.BUILDING_2_LEVEL, url: `${DATA_BASE_PATH}/legacy/building_2.json` },
  { key: TextureKeys.BUILDING_3_LEVEL, url: `${DATA_BASE_PATH}/legacy/building_3.json` },
];

export const audioAssets: AudioAssetDescriptor[] = [
  { key: AudioKeys.MAIN, url: `${AUDIO_BASE_PATH}/xDeviruchi/And-the-Journey-Begins.wav` },
  { key: AudioKeys.BATTLE, url: `${AUDIO_BASE_PATH}/xDeviruchi/Decisive-Battle.wav` },
  { key: AudioKeys.TITLE, url: `${AUDIO_BASE_PATH}/xDeviruchi/Title-Theme.wav` },
  { key: AudioKeys.CLAW, url: `${AUDIO_BASE_PATH}/leohpaz/03_Claw_03.wav` },
  { key: AudioKeys.GRASS, url: `${AUDIO_BASE_PATH}/leohpaz/03_Step_grass_03.wav` },
  { key: AudioKeys.ICE, url: `${AUDIO_BASE_PATH}/leohpaz/13_Ice_explosion_01.wav` },
  { key: AudioKeys.FLEE, url: `${AUDIO_BASE_PATH}/leohpaz/51_Flee_02.wav` },
];

export const dataAssets: DataAssetDescriptor[] = [
  { key: CoreDataKeys.AREAS, url: `${DATA_BASE_PATH}/areas.json` },
  { key: CoreDataKeys.AREAS_SCHEMA, url: `${DATA_BASE_PATH}/areas.schema.json` },
  { key: CoreDataKeys.CRITTERS, url: `${DATA_BASE_PATH}/critters.json` },
  { key: CoreDataKeys.CRITTERS_SCHEMA, url: `${DATA_BASE_PATH}/critters.schema.json` },
  { key: CoreDataKeys.ITEMS, url: `${DATA_BASE_PATH}/items.json` },
  { key: CoreDataKeys.ITEMS_SCHEMA, url: `${DATA_BASE_PATH}/items.schema.json` },
  { key: CoreDataKeys.MOVES, url: `${DATA_BASE_PATH}/moves.json` },
  { key: CoreDataKeys.MOVES_SCHEMA, url: `${DATA_BASE_PATH}/moves.schema.json` },
  { key: CoreDataKeys.TYPES, url: `${DATA_BASE_PATH}/types.json` },
  { key: CoreDataKeys.TYPES_SCHEMA, url: `${DATA_BASE_PATH}/types.schema.json` },
  { key: CoreDataKeys.SHOPS, url: `${DATA_BASE_PATH}/shops.json` },
  { key: CoreDataKeys.LEGACY_CRITTER_INDEX, url: `${DATA_BASE_PATH}/legacy-critters.json` },
  { key: CoreDataKeys.LEGACY_ENCOUNTER_INDEX, url: `${DATA_BASE_PATH}/legacy-encounters.json` },
  { key: CoreDataKeys.LEGACY_EVENT_INDEX, url: `${DATA_BASE_PATH}/legacy-events.json` },
  { key: CoreDataKeys.LEGACY_ID_MAPPINGS, url: `${DATA_BASE_PATH}/legacy-id-mappings.json` },
  { key: CoreDataKeys.LEGACY_ITEM_INDEX, url: `${DATA_BASE_PATH}/legacy-items.json` },
  { key: CoreDataKeys.LEGACY_MOVE_INDEX, url: `${DATA_BASE_PATH}/legacy-moves.json` },
  { key: CoreDataKeys.LEGACY_NPC_INDEX, url: `${DATA_BASE_PATH}/legacy-npcs.json` },
  { key: CoreDataKeys.LEGACY_SIGN_INDEX, url: `${DATA_BASE_PATH}/legacy-signs.json` },
  { key: LegacyDataKeys.LEGACY_ATTACKS, url: `${DATA_BASE_PATH}/legacy/attacks.json` },
  { key: LegacyDataKeys.LEGACY_ANIMATIONS, url: `${DATA_BASE_PATH}/legacy/animations.json` },
  { key: LegacyDataKeys.LEGACY_ITEMS, url: `${DATA_BASE_PATH}/legacy/items.json` },
  { key: LegacyDataKeys.LEGACY_MONSTERS, url: `${DATA_BASE_PATH}/legacy/monsters.json` },
  { key: LegacyDataKeys.LEGACY_ENCOUNTERS, url: `${DATA_BASE_PATH}/legacy/encounters.json` },
  { key: LegacyDataKeys.LEGACY_NPCS, url: `${DATA_BASE_PATH}/legacy/npcs.json` },
  { key: LegacyDataKeys.LEGACY_EVENTS, url: `${DATA_BASE_PATH}/legacy/events.json` },
  { key: LegacyDataKeys.LEGACY_SIGNS, url: `${DATA_BASE_PATH}/legacy/signs.json` },
  { key: LegacyDataKeys.BUILDING_1, url: `${DATA_BASE_PATH}/legacy/building_1.json` },
  { key: LegacyDataKeys.BUILDING_2, url: `${DATA_BASE_PATH}/legacy/building_2.json` },
  { key: LegacyDataKeys.BUILDING_3, url: `${DATA_BASE_PATH}/legacy/building_3.json` },
  { key: LegacyDataKeys.FOREST_1, url: `${DATA_BASE_PATH}/legacy/forest_1.json` },
  { key: LegacyDataKeys.MAIN_1, url: `${DATA_BASE_PATH}/legacy/main_1.json` },
  { key: LegacyDataKeys.LEVEL, url: `${DATA_BASE_PATH}/legacy/level.json` },
  { key: LegacyDataKeys.LEVEL_OLD, url: `${DATA_BASE_PATH}/legacy/level_old.json` },
];

export const fontAssets: FontAssetDescriptor[] = [
  {
    key: FontKeys.KENNEY_FUTURE_NARROW,
    source: 'local("Arial"), local("Helvetica"), local("sans-serif")',
    descriptors: { style: 'normal', weight: '400', stretch: 'normal' },
  },
];
