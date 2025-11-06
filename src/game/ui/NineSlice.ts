import { Scene, GameObjects } from 'phaser';

export enum AssetCutFrame {
  TL = 'TL',
  TM = 'TM',
  TR = 'TR',
  ML = 'ML',
  MM = 'MM',
  MR = 'MR',
  BL = 'BL',
  BM = 'BM',
  BR = 'BR',
}

export interface NineSliceConfig {
  cornerCutSize: number;
  textureManager: Phaser.Textures.TextureManager;
  assetKeys: string[];
}

export const ASSET_CUT_FRAME_DATA_MANAGER_NAME = 'assetCutFrame';

type Container = GameObjects.Container;
type Image = GameObjects.Image;

/**
 * NineSlice utility for creating scalable UI elements
 * Ported from archive/src/utils/nine-slice.js
 */
export class NineSlice {
  private cornerCutSize: number;

  constructor(config: NineSliceConfig) {
    this.cornerCutSize = config.cornerCutSize;
    config.assetKeys.forEach((assetKey) => {
      this.createNineSliceTextures(config.textureManager, assetKey);
    });
  }

  /**
   * Retrieves a texture from the Phaser 3 Texture Manager and adds nine new frames to the texture that represent the parts
   * of the image that will make up the nine slice cuts of the original image.
   */
  private createNineSliceTextures(textureManager: Phaser.Textures.TextureManager, assetKey: string): void {
    const methodName = 'createNineSliceTextures';

    const texture = textureManager.get(assetKey);
    if (texture.key === '__MISSING') {
      console.warn(`[NineSlice:${methodName}] the provided texture asset key was not found: ${assetKey}`);
      return;
    }

    // Get the original frame so we can use the image dimensions
    const frames = texture.frames as any;
    if (!frames['__BASE']) {
      console.warn(`[NineSlice:${methodName}] the provided texture asset key does not have a base texture: ${assetKey}`);
      return;
    }

    // Check to see if the texture already has more frames than the original base frame
    if (texture.getFrameNames(false).length !== 0) {
      console.debug(`[NineSlice:${methodName}] the provided texture asset key already has additional frames: ${assetKey}`);
      return;
    }

    const baseFrame = frames['__BASE'];

    // Start in the top left corner for our first cut
    texture.add(AssetCutFrame.TL, 0, 0, 0, this.cornerCutSize, this.cornerCutSize);
    // For the middle, we need to calculate the width remaining after we take our two cuts
    texture.add(
      AssetCutFrame.TM,
      0,
      this.cornerCutSize,
      0,
      baseFrame.width - this.cornerCutSize * 2,
      this.cornerCutSize
    );
    // For the top right side corner we just need to take the total width and remove the cut length
    texture.add(
      AssetCutFrame.TR,
      0,
      baseFrame.width - this.cornerCutSize,
      0,
      this.cornerCutSize,
      this.cornerCutSize
    );

    // For the middle left, we take the overall image height and subtract the size of the two corner cuts to get new height
    texture.add(
      AssetCutFrame.ML,
      0,
      0,
      this.cornerCutSize,
      this.cornerCutSize,
      baseFrame.height - this.cornerCutSize * 2
    );
    // For the middle, we need to take the overall image height and width, subtract the two corner cuts to get the new dimensions
    texture.add(
      AssetCutFrame.MM,
      0,
      this.cornerCutSize,
      this.cornerCutSize,
      baseFrame.width - this.cornerCutSize * 2,
      baseFrame.height - this.cornerCutSize * 2
    );
    // For the middle right, we need to do similar logic that was done for the middle left piece
    texture.add(
      AssetCutFrame.MR,
      0,
      baseFrame.width - this.cornerCutSize,
      this.cornerCutSize,
      this.cornerCutSize,
      baseFrame.height - this.cornerCutSize * 2
    );

    // For the bottom left, we take the overall image height and subtract the corner cut
    texture.add(
      AssetCutFrame.BL,
      0,
      0,
      baseFrame.height - this.cornerCutSize,
      this.cornerCutSize,
      this.cornerCutSize
    );
    // For the middle and right, we do the same logic we did in the tm and tr frames, just at a lower y value
    texture.add(
      AssetCutFrame.BM,
      0,
      this.cornerCutSize,
      baseFrame.height - this.cornerCutSize,
      baseFrame.width - this.cornerCutSize * 2,
      this.cornerCutSize
    );
    texture.add(
      AssetCutFrame.BR,
      0,
      baseFrame.width - this.cornerCutSize,
      baseFrame.height - this.cornerCutSize,
      this.cornerCutSize,
      this.cornerCutSize
    );
  }

  /**
   * Uses the provided Phaser 3 Scene to create nine image game objects which use the nine slice image textures that were
   * created on this NineSlice instance. The objects are then positioned and aligned so that they form just one image that
   * is scaled properly. The new objects are returned in a Phaser 3 Container game object.
   */
  createNineSliceContainer(scene: Scene, targetWidth: number, targetHeight: number, assetKey: string): Container {
    const tl = scene.add.image(0, 0, assetKey, AssetCutFrame.TL).setOrigin(0);
    tl.setData(ASSET_CUT_FRAME_DATA_MANAGER_NAME, AssetCutFrame.TL);

    const tm = scene.add.image(tl.displayWidth, 0, assetKey, AssetCutFrame.TM).setOrigin(0);
    tm.displayWidth = targetWidth - this.cornerCutSize * 2;
    tm.setData(ASSET_CUT_FRAME_DATA_MANAGER_NAME, AssetCutFrame.TM);

    const tr = scene.add.image(tl.displayWidth + tm.displayWidth, 0, assetKey, AssetCutFrame.TR).setOrigin(0);
    tr.setData(ASSET_CUT_FRAME_DATA_MANAGER_NAME, AssetCutFrame.TR);

    const ml = scene.add.image(0, tl.displayHeight, assetKey, AssetCutFrame.ML).setOrigin(0);
    ml.displayHeight = targetHeight - this.cornerCutSize * 2;
    ml.setData(ASSET_CUT_FRAME_DATA_MANAGER_NAME, AssetCutFrame.ML);

    const mm = scene.add.image(ml.displayWidth, ml.y, assetKey, AssetCutFrame.MM).setOrigin(0);
    mm.displayHeight = targetHeight - this.cornerCutSize * 2;
    mm.displayWidth = targetWidth - this.cornerCutSize * 2;
    mm.setData(ASSET_CUT_FRAME_DATA_MANAGER_NAME, AssetCutFrame.MM);

    const mr = scene.add.image(ml.displayWidth + mm.displayWidth, ml.y, assetKey, AssetCutFrame.MR).setOrigin(0);
    mr.displayHeight = mm.displayHeight;
    mr.setData(ASSET_CUT_FRAME_DATA_MANAGER_NAME, AssetCutFrame.MR);

    const bl = scene.add.image(0, tl.displayHeight + ml.displayHeight, assetKey, AssetCutFrame.BL).setOrigin(0);
    bl.setData(ASSET_CUT_FRAME_DATA_MANAGER_NAME, AssetCutFrame.BL);

    const bm = scene.add.image(bl.displayWidth, bl.y, assetKey, AssetCutFrame.BM).setOrigin(0);
    bm.displayWidth = tm.displayWidth;
    bm.setData(ASSET_CUT_FRAME_DATA_MANAGER_NAME, AssetCutFrame.BM);

    const br = scene.add.image(bl.displayWidth + bm.displayWidth, bl.y, assetKey, AssetCutFrame.BR).setOrigin(0);
    br.setData(ASSET_CUT_FRAME_DATA_MANAGER_NAME, AssetCutFrame.BR);

    // Finally, create a container to group our new game objects together in
    return scene.add.container(0, 0, [tl, tm, tr, ml, mm, mr, bl, bm, br]);
  }

  /**
   * Updates the nine image game objects in the provided Phaser 3 container to use another nine slice texture that was previously created and stored
   * in the Phaser 3 Texture Manager.
   */
  updateNineSliceContainerTexture(textureManager: Phaser.Textures.TextureManager, container: Container, assetKey: string): void {
    const methodName = 'updateNineSliceContainerTexture';

    // Validate we have the provided texture for the given asset key
    const texture = textureManager.get(assetKey);
    if (texture.key === '__MISSING') {
      console.warn(`[NineSlice:${methodName}] the provided texture asset key was not found: ${assetKey}`);
      return;
    }
    // Check to see if the texture has more than the base frames defined
    if (texture.getFrameNames(false).length === 0) {
      console.warn(
        `[NineSlice:${methodName}] the provided texture asset key does not have the required nine slice frames: ${assetKey}`
      );
      return;
    }

    container.each((gameObject: any) => {
      const phaserImageGameObject = gameObject as Image;
      if (gameObject.type !== 'Image') {
        return;
      }
      const frameName = phaserImageGameObject.getData(ASSET_CUT_FRAME_DATA_MANAGER_NAME);
      if (frameName === undefined) {
        return;
      }
      phaserImageGameObject.setTexture(assetKey, frameName);
    });
  }

  /**
   * Resize an existing nine slice container to new dimensions
   */
  resizeNineSliceContainer(container: Container, targetWidth: number, targetHeight: number): void {
    const images = container.list as Image[];
    
    // Find each piece by its data and resize appropriately
    images.forEach((image) => {
      const frameName = image.getData(ASSET_CUT_FRAME_DATA_MANAGER_NAME);
      
      switch (frameName) {
        case AssetCutFrame.TM:
        case AssetCutFrame.BM:
          image.displayWidth = targetWidth - this.cornerCutSize * 2;
          break;
        case AssetCutFrame.ML:
        case AssetCutFrame.MR:
          image.displayHeight = targetHeight - this.cornerCutSize * 2;
          break;
        case AssetCutFrame.MM:
          image.displayWidth = targetWidth - this.cornerCutSize * 2;
          image.displayHeight = targetHeight - this.cornerCutSize * 2;
          break;
        case AssetCutFrame.TR:
        case AssetCutFrame.BR:
          image.x = targetWidth - this.cornerCutSize;
          break;
        case AssetCutFrame.MR:
          image.x = targetWidth - this.cornerCutSize;
          break;
        case AssetCutFrame.BL:
        case AssetCutFrame.BM:
        case AssetCutFrame.BR:
          image.y = targetHeight - this.cornerCutSize;
          break;
        case AssetCutFrame.ML:
        case AssetCutFrame.MM:
        case AssetCutFrame.MR:
          image.y = this.cornerCutSize;
          break;
      }
    });
  }
}