/**
 * Tiled map editor object and property key constants.
 * These keys are used to identify custom layers, objects, and properties
 * defined in Tiled map files.
 */

export const OBJECT_LAYER_NAMES = {
  AREA_METADATA: 'Area-Metadata',
  CAMERA_BOUNDS: 'Camera-Bounds',
  EVENTS: 'Events',
  ITEM: 'Item',
  PLAYER_SPAWN_LOCATION: 'Player-Spawn-Location',
  REVIVE_LOCATION: 'Revive-Location',
  SCENE_TRANSITIONS: 'Scene-Transitions',
  SIGN: 'Sign',
} as const;

export const TILED_SIGN_PROPERTY = {
  ID: 'id',
} as const;

export const CUSTOM_TILED_TYPES = {
  NPC: 'npc',
  NPC_PATH: 'npc_path',
} as const;

export const TILED_NPC_PROPERTY = {
  MOVEMENT_PATTERN: 'movement_pattern',
  FRAME: 'frame',
  ID: 'id',
} as const;

export const TILED_ENCOUNTER_PROPERTY = {
  AREA: 'area',
  TILE_TYPE: 'tileType',
} as const;

export const TILED_ITEM_PROPERTY = {
  ITEM_ID: 'item_id',
  ID: 'id',
} as const;

export const TILED_AREA_METADATA_PROPERTY = {
  FAINT_LOCATION: 'faint_location',
  ID: 'id',
} as const;

export const TILED_EVENT_PROPERTY = {
  ID: 'id',
} as const;

/**
 * Type definitions for Tiled keys
 */
export type ObjectLayerName = typeof OBJECT_LAYER_NAMES[keyof typeof OBJECT_LAYER_NAMES];
export type TiledSignProperty = typeof TILED_SIGN_PROPERTY[keyof typeof TILED_SIGN_PROPERTY];
export type CustomTiledType = typeof CUSTOM_TILED_TYPES[keyof typeof CUSTOM_TILED_TYPES];
export type TiledNPCProperty = typeof TILED_NPC_PROPERTY[keyof typeof TILED_NPC_PROPERTY];
export type TiledEncounterProperty = typeof TILED_ENCOUNTER_PROPERTY[keyof typeof TILED_ENCOUNTER_PROPERTY];
export type TiledItemProperty = typeof TILED_ITEM_PROPERTY[keyof typeof TILED_ITEM_PROPERTY];
export type TiledAreaMetadataProperty = typeof TILED_AREA_METADATA_PROPERTY[keyof typeof TILED_AREA_METADATA_PROPERTY];
export type TiledEventProperty = typeof TILED_EVENT_PROPERTY[keyof typeof TILED_EVENT_PROPERTY];
