/**
 * Asset barrel export - Centralized access to all asset keys
 */
export { SceneKeys } from './SceneKeys';
export { TextureKeys } from './TextureKeys';
export { AudioKeys } from './AudioKeys';
export { FontKeys } from './FontKeys';
export { CoreDataKeys, LegacyDataKeys, type DataKey } from './DataKeys';
export {
  imageAssets,
  spritesheetAssets,
  tilemapAssets,
  audioAssets,
  dataAssets,
  fontAssets,
  type ImageAssetDescriptor,
  type SpritesheetAssetDescriptor,
  type TilemapAssetDescriptor,
  type AudioAssetDescriptor,
  type DataAssetDescriptor,
} from './AssetManifest';
export { WebFontFileLoader, type FontAssetDescriptor } from './WebFontFileLoader';
