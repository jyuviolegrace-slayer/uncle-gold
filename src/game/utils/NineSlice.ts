import Phaser from 'phaser';

enum AssetCutFrames {
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

const ASSET_CUT_FRAME_DATA_MANAGER_NAME = 'assetCutFrame';

export interface NineSliceConfig {
  cornerCutSize: number;
  textureManager: Phaser.Textures.TextureManager;
  assetKeys: string[];
}

export class NineSlice {
  private cornerCutSize: number;

  constructor(config: NineSliceConfig) {
    this.cornerCutSize = config.cornerCutSize;
    config.assetKeys.forEach((assetKey) => {
      this.createNineSliceTextures(config.textureManager, assetKey);
    });
  }

  private createNineSliceTextures(textureManager: Phaser.Textures.TextureManager, assetKey: string): void {
    const methodName = 'createNineSliceTextures';

    const texture = textureManager.get(assetKey);
    if (texture.key === '__MISSING') {
      console.warn(`[${NineSlice.name}:${methodName}] the provided texture asset key was not found`);
      return;
    }

    if (!(texture.frames as any)['__BASE']) {
      console.warn(`[${NineSlice.name}:${methodName}] the provided texture asset key does not have a base texture`);
      return;
    }

    if (texture.getFrameNames(false).length !== 0) {
      console.debug(`[${NineSlice.name}:${methodName}] the provided texture asset key already has additional frames`);
      return;
    }

    const baseFrame = (texture.frames as any)['__BASE'];

    texture.add(AssetCutFrames.TL, 0, 0, 0, this.cornerCutSize, this.cornerCutSize);
    texture.add(
      AssetCutFrames.TM,
      0,
      this.cornerCutSize,
      0,
      baseFrame.width - this.cornerCutSize * 2,
      this.cornerCutSize
    );
    texture.add(
      AssetCutFrames.TR,
      0,
      baseFrame.width - this.cornerCutSize,
      0,
      this.cornerCutSize,
      this.cornerCutSize
    );

    texture.add(
      AssetCutFrames.ML,
      0,
      0,
      this.cornerCutSize,
      this.cornerCutSize,
      baseFrame.height - this.cornerCutSize * 2
    );
    texture.add(
      AssetCutFrames.MM,
      0,
      this.cornerCutSize,
      this.cornerCutSize,
      baseFrame.width - this.cornerCutSize * 2,
      baseFrame.height - this.cornerCutSize * 2
    );
    texture.add(
      AssetCutFrames.MR,
      0,
      baseFrame.width - this.cornerCutSize,
      this.cornerCutSize,
      this.cornerCutSize,
      baseFrame.height - this.cornerCutSize * 2
    );

    texture.add(
      AssetCutFrames.BL,
      0,
      0,
      baseFrame.height - this.cornerCutSize,
      this.cornerCutSize,
      this.cornerCutSize
    );
    texture.add(
      AssetCutFrames.BM,
      0,
      this.cornerCutSize,
      baseFrame.height - this.cornerCutSize,
      baseFrame.width - this.cornerCutSize * 2,
      this.cornerCutSize
    );
    texture.add(
      AssetCutFrames.BR,
      0,
      baseFrame.width - this.cornerCutSize,
      baseFrame.height - this.cornerCutSize,
      this.cornerCutSize,
      this.cornerCutSize
    );
  }

  createNineSliceContainer(scene: Phaser.Scene, targetWidth: number, targetHeight: number, assetKey: string): Phaser.GameObjects.Container {
    const tl = scene.add.image(0, 0, assetKey, AssetCutFrames.TL).setOrigin(0);
    tl.setData(ASSET_CUT_FRAME_DATA_MANAGER_NAME, AssetCutFrames.TL);

    const tm = scene.add.image(tl.displayWidth, 0, assetKey, AssetCutFrames.TM).setOrigin(0);
    tm.displayWidth = targetWidth - this.cornerCutSize * 2;
    tm.setData(ASSET_CUT_FRAME_DATA_MANAGER_NAME, AssetCutFrames.TM);

    const tr = scene.add.image(tl.displayWidth + tm.displayWidth, 0, assetKey, AssetCutFrames.TR).setOrigin(0);
    tr.setData(ASSET_CUT_FRAME_DATA_MANAGER_NAME, AssetCutFrames.TR);

    const ml = scene.add.image(0, tl.displayHeight, assetKey, AssetCutFrames.ML).setOrigin(0);
    ml.displayHeight = targetHeight - this.cornerCutSize * 2;
    ml.setData(ASSET_CUT_FRAME_DATA_MANAGER_NAME, AssetCutFrames.ML);

    const mm = scene.add.image(ml.displayWidth, ml.y, assetKey, AssetCutFrames.MM).setOrigin(0);
    mm.displayHeight = targetHeight - this.cornerCutSize * 2;
    mm.displayWidth = targetWidth - this.cornerCutSize * 2;
    mm.setData(ASSET_CUT_FRAME_DATA_MANAGER_NAME, AssetCutFrames.MM);

    const mr = scene.add.image(ml.displayWidth + mm.displayWidth, ml.y, assetKey, AssetCutFrames.MR).setOrigin(0);
    mr.displayHeight = mm.displayHeight;
    mr.setData(ASSET_CUT_FRAME_DATA_MANAGER_NAME, AssetCutFrames.MR);

    const bl = scene.add.image(0, tl.displayHeight + ml.displayHeight, assetKey, AssetCutFrames.BL).setOrigin(0);
    bl.setData(ASSET_CUT_FRAME_DATA_MANAGER_NAME, AssetCutFrames.BL);

    const bm = scene.add.image(bl.displayWidth, bl.y, assetKey, AssetCutFrames.BM).setOrigin(0);
    bm.displayWidth = tm.displayWidth;
    bm.setData(ASSET_CUT_FRAME_DATA_MANAGER_NAME, AssetCutFrames.BM);

    const br = scene.add.image(bl.displayWidth + bm.displayWidth, bl.y, assetKey, AssetCutFrames.BR).setOrigin(0);
    br.setData(ASSET_CUT_FRAME_DATA_MANAGER_NAME, AssetCutFrames.BR);

    return scene.add.container(0, 0, [tl, tm, tr, ml, mm, mr, bl, bm, br]);
  }

  updateNineSliceContainerTexture(textureManager: Phaser.Textures.TextureManager, container: Phaser.GameObjects.Container, assetKey: string): void {
    const methodName = 'updateNineSliceContainerTexture';

    const texture = textureManager.get(assetKey);
    if (texture.key === '__MISSING') {
      console.warn(`[${NineSlice.name}:${methodName}] the provided texture asset key was not found`);
      return;
    }
    if (texture.getFrameNames(false).length === 0) {
      console.warn(
        `[${NineSlice.name}:${methodName}] the provided texture asset key does not have the required nine slice frames`
      );
      return;
    }

    container.each((gameObject: Phaser.GameObjects.GameObject) => {
      const phaserImageGameObject = gameObject as Phaser.GameObjects.Image;
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
}