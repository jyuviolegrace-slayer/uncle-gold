import Phaser from 'phaser';
import { FontKeys } from './FontKeys';

export interface FontAssetDescriptor {
  key: FontKeys;
  source: string;
  descriptors?: FontFaceDescriptors;
}

/**
 * Custom Phaser loader file that loads and registers fonts via the FontFace API.
 * Mirrors the legacy web-font-file-loader while keeping all logic client-side.
 */
export class WebFontFileLoader extends Phaser.Loader.File {
  private readonly fontDescriptor: FontAssetDescriptor;

  constructor(loader: Phaser.Loader.LoaderPlugin, descriptor: FontAssetDescriptor) {
    super(loader, {
      type: 'webfont',
      key: `font:${descriptor.key}`,
    });

    this.fontDescriptor = descriptor;
  }

  load(): void {
    if (typeof document === 'undefined' || !(document as Document).fonts) {
      this.loader.nextFile(this, true);
      return;
    }

    const { key, source, descriptors } = this.fontDescriptor;
    const fontFace = new FontFace(key, source, descriptors);

    fontFace
      .load()
      .then((loadedFace) => {
        (document as Document).fonts.add(loadedFace);
        this.loader.nextFile(this, true);
      })
      .catch((error) => {
        console.error(`Failed to load custom font ${key}`, error);
        this.loader.nextFile(this, false);
      });
  }
}
