import Phaser from 'phaser';
import { BaseScene } from './common/BaseScene';
import { SceneKeys, TextureKeys, FontKeys } from '../assets';
import { Direction } from '../models/common';
import { 
  DataManagerStoreKeys, 
  TextSpeedOptions,
  BattleSceneOptions,
  BattleStyleOptions,
  SoundOptions,
  dataManager 
} from '../services/DataManager';
import { 
  OptionMenuOptions, 
  TextSpeedOptions as MenuTextSpeedOptions,
  BattleSceneOptions as MenuBattleSceneOptions,
  BattleStyleOptions as MenuBattleStyleOptions,
  SoundOptions as MenuSoundOptions,
  VolumeMenuOptions,
  MenuColorOptions
} from '../models/Options';
import { NineSlice } from '../utils/NineSlice';

const OPTIONS_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: FontKeys.KENNEY_FUTURE_NARROW,
  color: '#FFFFFF',
  fontSize: '30px',
};

const OPTION_MENU_OPTION_INFO_MSG = Object.freeze({
  TEXT_SPEED: 'Choose one of three text display speeds.',
  BATTLE_SCENE: 'Choose to display battle animations and effects or not.',
  BATTLE_STYLE: 'Choose to allow your monster to be recalled between rounds.',
  SOUND: 'Choose to enable or disable the sound.',
  VOLUME: 'Choose the volume of the music and sound effects of the game.',
  MENU_COLOR: 'Choose one of the three menu color options.',
  CONFIRM: 'Save your changes and go back to the main menu.',
});

const TEXT_FONT_COLORS = Object.freeze({
  NOT_SELECTED: '#FFFFFF',
  SELECTED: '#FF2222',
});

export class Options extends BaseScene {
  private mainContainer?: Phaser.GameObjects.Container;
  private nineSliceMainContainer?: NineSlice;
  private textSpeedOptionTextGameObjects?: Phaser.GameObjects.Group;
  private battleSceneOptionTextGameObjects?: Phaser.GameObjects.Group;
  private battleStyleOptionTextGameObjects?: Phaser.GameObjects.Group;
  private soundOptionTextGameObjects?: Phaser.GameObjects.Group;
  private volumeOptionsMenuCursor?: Phaser.GameObjects.Rectangle;
  private volumeOptionsValueText?: Phaser.GameObjects.Text;
  private selectedMenuColorTextGameObject?: Phaser.GameObjects.Text;
  private infoContainer?: Phaser.GameObjects.Container;
  private selectedOptionInfoMsgTextGameObject?: Phaser.GameObjects.Text;
  private optionsMenuCursor?: Phaser.GameObjects.Rectangle;
  private selectedOptionMenu: OptionMenuOptions = OptionMenuOptions.TEXT_SPEED;
  private selectedTextSpeedOption: MenuTextSpeedOptions = MenuTextSpeedOptions.MID;
  private selectedBattleSceneOption: MenuBattleSceneOptions = MenuBattleSceneOptions.ON;
  private selectedBattleStyleOption: MenuBattleStyleOptions = MenuBattleStyleOptions.SHIFT;
  private selectedSoundMenuOption: MenuSoundOptions = MenuSoundOptions.ON;
  private selectedVolumeOption: VolumeMenuOptions = 4;
  private selectedMenuColorOption: MenuColorOptions = 0;

  constructor() {
    super(SceneKeys.OPTIONS);
  }

  init(): void {
    super.init();

    this.nineSliceMainContainer = new NineSlice({
      cornerCutSize: 32,
      textureManager: this.sys.textures,
      assetKeys: [
        TextureKeys.MENU_BACKGROUND,
        TextureKeys.MENU_BACKGROUND_GREEN,
        TextureKeys.MENU_BACKGROUND_PURPLE,
      ],
    });

    this.selectedOptionMenu = OptionMenuOptions.TEXT_SPEED;
    this.selectedTextSpeedOption = dataManager.dataStore.get(DataManagerStoreKeys.OPTIONS_TEXT_SPEED) as MenuTextSpeedOptions || MenuTextSpeedOptions.MID;
    this.selectedBattleSceneOption = dataManager.dataStore.get(DataManagerStoreKeys.OPTIONS_BATTLE_SCENE_ANIMATIONS) as MenuBattleSceneOptions || MenuBattleSceneOptions.ON;
    this.selectedBattleStyleOption = dataManager.dataStore.get(DataManagerStoreKeys.OPTIONS_BATTLE_STYLE) as MenuBattleStyleOptions || MenuBattleStyleOptions.SHIFT;
    this.selectedSoundMenuOption = dataManager.dataStore.get(DataManagerStoreKeys.OPTIONS_SOUND) as MenuSoundOptions || MenuSoundOptions.ON;
    this.selectedVolumeOption = dataManager.dataStore.get(DataManagerStoreKeys.OPTIONS_VOLUME) as VolumeMenuOptions || 4;
    this.selectedMenuColorOption = dataManager.dataStore.get(DataManagerStoreKeys.OPTIONS_MENU_COLOR) as MenuColorOptions || 0;
  }

  create(): void {
    super.create();

    const { width, height } = this.scale;
    const optionMenuWidth = width - 200;

    this.createMainContainer(optionMenuWidth);
    this.createMenuOptions();
    this.createOptionValues();
    this.createInfoContainer(optionMenuWidth, height);
    this.createOptionsMenuCursor();
    this.updateAllOptionDisplays();
    this.setupTransitions();
  }

  update(time: number, delta: number): void {
    super.update(time, delta);

    if (this.isInputLocked()) {
      return;
    }

    if (this.inputManager.wasBackKeyPressed()) {
      this.lockInput();
      this.cameras.main.fadeOut(500, 0, 0, 0);
      return;
    }

    if (this.inputManager.wasSpaceKeyPressed() && this.selectedOptionMenu === OptionMenuOptions.CONFIRM) {
      this.lockInput();
      this.updateOptionDataInDataManager();
      this.audioManager.updateGlobalSoundSettings();
      this.cameras.main.fadeOut(500, 0, 0, 0);
      return;
    }

    const selectedDirection = this.inputManager.getDirectionKeyJustPressed();
    if (selectedDirection !== Direction.NONE) {
      this.moveOptionMenuCursor(selectedDirection);
    }
  }

  private createMainContainer(optionMenuWidth: number): void {
    this.mainContainer = this.nineSliceMainContainer!.createNineSliceContainer(
      this,
      optionMenuWidth,
      432,
      TextureKeys.MENU_BACKGROUND
    );
    this.mainContainer!.setX(100).setY(20);
  }

  private createMenuOptions(): void {
    const { width } = this.scale;
    this.add.text(width / 2, 40, 'Options', OPTIONS_TEXT_STYLE).setOrigin(0.5);
    
    const menuOptionsPosition = {
      x: 25,
      yStart: 55,
      yIncrement: 55,
    };
    const menuOptions = ['Text Speed', 'Battle Scene', 'Battle Style', 'Sound', 'Volume', 'Menu Color', 'Close'];
    menuOptions.forEach((option, index) => {
      const x = menuOptionsPosition.x;
      const y = menuOptionsPosition.yStart + menuOptionsPosition.yIncrement * index;
      const textGameObject = this.add.text(x, y, option, OPTIONS_TEXT_STYLE);
      this.mainContainer?.add(textGameObject);
    });
  }

  private createOptionValues(): void {
    this.textSpeedOptionTextGameObjects = this.add.group([
      this.add.text(420, 75, 'Slow', OPTIONS_TEXT_STYLE),
      this.add.text(590, 75, 'Mid', OPTIONS_TEXT_STYLE),
      this.add.text(760, 75, 'Fast', OPTIONS_TEXT_STYLE),
    ]);

    this.battleSceneOptionTextGameObjects = this.add.group([
      this.add.text(420, 130, 'On', OPTIONS_TEXT_STYLE),
      this.add.text(590, 130, 'Off', OPTIONS_TEXT_STYLE),
    ]);

    this.battleStyleOptionTextGameObjects = this.add.group([
      this.add.text(420, 185, 'Set', OPTIONS_TEXT_STYLE),
      this.add.text(590, 185, 'Shift', OPTIONS_TEXT_STYLE),
    ]);

    this.soundOptionTextGameObjects = this.add.group([
      this.add.text(420, 240, 'On', OPTIONS_TEXT_STYLE),
      this.add.text(590, 240, 'Off', OPTIONS_TEXT_STYLE),
    ]);

    this.add.rectangle(420, 312, 300, 4, 0xffffff, 1).setOrigin(0, 0.5);
    this.volumeOptionsMenuCursor = this.add.rectangle(710, 312, 10, 25, 0xff2222, 1).setOrigin(0, 0.5);
    this.volumeOptionsValueText = this.add.text(760, 295, '100%', OPTIONS_TEXT_STYLE);

    this.selectedMenuColorTextGameObject = this.add.text(590, 350, '', OPTIONS_TEXT_STYLE);
    this.add.image(530, 352, TextureKeys.CURSOR_WHITE).setOrigin(1, 0).setScale(2.5).setFlipX(true);
    this.add.image(660, 352, TextureKeys.CURSOR_WHITE).setOrigin(0, 0).setScale(2.5);
  }

  private createInfoContainer(optionMenuWidth: number, height: number): void {
    this.infoContainer = this.nineSliceMainContainer!.createNineSliceContainer(
      this,
      optionMenuWidth,
      100,
      TextureKeys.MENU_BACKGROUND
    );
    this.infoContainer!.setX(100).setY(height - 110);
    this.selectedOptionInfoMsgTextGameObject = this.add.text(125, 480, OPTION_MENU_OPTION_INFO_MSG.TEXT_SPEED, {
      ...OPTIONS_TEXT_STYLE,
      wordWrap: { width: this.scale.width - 250 },
    });
  }

  private createOptionsMenuCursor(): void {
    const { width } = this.scale;
    const optionMenuWidth = width - 200;
    this.optionsMenuCursor = this.add
      .rectangle(110, 70, optionMenuWidth - 20, 40, 0xffffff, 0)
      .setOrigin(0)
      .setStrokeStyle(4, 0xe4434a, 1);
  }

  private updateAllOptionDisplays(): void {
    this.updateTextSpeedGameObjects();
    this.updateBattleSceneOptionGameObjects();
    this.updateBattleStyleOptionGameObjects();
    this.updateSoundOptionGameObjects();
    this.updateVolumeSlider();
    this.updateMenuColorDisplayText();
  }

  private setupTransitions(): void {
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.transitionToScene(SceneKeys.TITLE);
    });
  }

  private updateOptionDataInDataManager(): void {
    dataManager.dataStore.set({
      [DataManagerStoreKeys.OPTIONS_TEXT_SPEED]: this.selectedTextSpeedOption,
      [DataManagerStoreKeys.OPTIONS_BATTLE_SCENE_ANIMATIONS]: this.selectedBattleSceneOption,
      [DataManagerStoreKeys.OPTIONS_BATTLE_STYLE]: this.selectedBattleStyleOption,
      [DataManagerStoreKeys.OPTIONS_SOUND]: this.selectedSoundMenuOption,
      [DataManagerStoreKeys.OPTIONS_VOLUME]: this.selectedVolumeOption,
      [DataManagerStoreKeys.OPTIONS_MENU_COLOR]: this.selectedMenuColorOption,
    });
    dataManager.saveData();
  }

  private moveOptionMenuCursor(direction: Direction): void {
    if (direction === Direction.NONE) {
      return;
    }

    this.updateSelectedOptionMenuFromInput(direction);

    switch (this.selectedOptionMenu) {
      case OptionMenuOptions.TEXT_SPEED:
        this.optionsMenuCursor?.setY(70);
        break;
      case OptionMenuOptions.BATTLE_SCENE:
        this.optionsMenuCursor?.setY(125);
        break;
      case OptionMenuOptions.BATTLE_STYLE:
        this.optionsMenuCursor?.setY(180);
        break;
      case OptionMenuOptions.SOUND:
        this.optionsMenuCursor?.setY(235);
        break;
      case OptionMenuOptions.VOLUME:
        this.optionsMenuCursor?.setY(290);
        break;
      case OptionMenuOptions.MENU_COLOR:
        this.optionsMenuCursor?.setY(345);
        break;
      case OptionMenuOptions.CONFIRM:
        this.optionsMenuCursor?.setY(400);
        break;
    }
    this.selectedOptionInfoMsgTextGameObject?.setText(OPTION_MENU_OPTION_INFO_MSG[this.selectedOptionMenu]);
  }

  private updateSelectedOptionMenuFromInput(direction: Direction): void {
    if (direction === Direction.NONE) {
      return;
    }

    if (this.selectedOptionMenu === OptionMenuOptions.TEXT_SPEED) {
      switch (direction) {
        case Direction.DOWN:
          this.selectedOptionMenu = OptionMenuOptions.BATTLE_SCENE;
          return;
        case Direction.UP:
          this.selectedOptionMenu = OptionMenuOptions.CONFIRM;
          return;
        case Direction.LEFT:
        case Direction.RIGHT:
          this.updateTextSpeedOption(direction);
          this.updateTextSpeedGameObjects();
          return;
      }
      return;
    }

    if (this.selectedOptionMenu === OptionMenuOptions.BATTLE_SCENE) {
      switch (direction) {
        case Direction.DOWN:
          this.selectedOptionMenu = OptionMenuOptions.BATTLE_STYLE;
          return;
        case Direction.UP:
          this.selectedOptionMenu = OptionMenuOptions.TEXT_SPEED;
          return;
        case Direction.LEFT:
        case Direction.RIGHT:
          this.updateBattleSceneOption(direction);
          this.updateBattleSceneOptionGameObjects();
          return;
      }
      return;
    }

    if (this.selectedOptionMenu === OptionMenuOptions.BATTLE_STYLE) {
      switch (direction) {
        case Direction.DOWN:
          this.selectedOptionMenu = OptionMenuOptions.SOUND;
          return;
        case Direction.UP:
          this.selectedOptionMenu = OptionMenuOptions.BATTLE_SCENE;
          return;
        case Direction.LEFT:
        case Direction.RIGHT:
          this.updateBattleStyleOption(direction);
          this.updateBattleStyleOptionGameObjects();
          return;
      }
      return;
    }

    if (this.selectedOptionMenu === OptionMenuOptions.SOUND) {
      switch (direction) {
        case Direction.DOWN:
          this.selectedOptionMenu = OptionMenuOptions.VOLUME;
          return;
        case Direction.UP:
          this.selectedOptionMenu = OptionMenuOptions.BATTLE_STYLE;
          return;
        case Direction.LEFT:
        case Direction.RIGHT:
          this.updateSoundOption(direction);
          this.updateSoundOptionGameObjects();
          return;
      }
      return;
    }

    if (this.selectedOptionMenu === OptionMenuOptions.VOLUME) {
      switch (direction) {
        case Direction.DOWN:
          this.selectedOptionMenu = OptionMenuOptions.MENU_COLOR;
          return;
        case Direction.UP:
          this.selectedOptionMenu = OptionMenuOptions.SOUND;
          return;
        case Direction.LEFT:
        case Direction.RIGHT:
          this.updateVolumeOption(direction);
          this.updateVolumeSlider();
          return;
      }
      return;
    }

    if (this.selectedOptionMenu === OptionMenuOptions.MENU_COLOR) {
      switch (direction) {
        case Direction.DOWN:
          this.selectedOptionMenu = OptionMenuOptions.CONFIRM;
          return;
        case Direction.UP:
          this.selectedOptionMenu = OptionMenuOptions.VOLUME;
          return;
        case Direction.LEFT:
        case Direction.RIGHT:
          this.updateMenuColorOption(direction);
          this.updateMenuColorDisplayText();
          return;
      }
      return;
    }

    if (this.selectedOptionMenu === OptionMenuOptions.CONFIRM) {
      switch (direction) {
        case Direction.DOWN:
          this.selectedOptionMenu = OptionMenuOptions.TEXT_SPEED;
          return;
        case Direction.UP:
          this.selectedOptionMenu = OptionMenuOptions.MENU_COLOR;
          return;
        case Direction.LEFT:
        case Direction.RIGHT:
          return;
      }
      return;
    }
  }

  private updateTextSpeedOption(direction: Direction): void {
    if (direction === Direction.LEFT) {
      if (this.selectedTextSpeedOption === MenuTextSpeedOptions.SLOW) {
        return;
      }
      if (this.selectedTextSpeedOption === MenuTextSpeedOptions.MID) {
        this.selectedTextSpeedOption = MenuTextSpeedOptions.SLOW;
        return;
      }
      if (this.selectedTextSpeedOption === MenuTextSpeedOptions.FAST) {
        this.selectedTextSpeedOption = MenuTextSpeedOptions.MID;
        return;
      }
      return;
    }

    if (direction === Direction.RIGHT) {
      if (this.selectedTextSpeedOption === MenuTextSpeedOptions.FAST) {
        return;
      }
      if (this.selectedTextSpeedOption === MenuTextSpeedOptions.MID) {
        this.selectedTextSpeedOption = MenuTextSpeedOptions.FAST;
        return;
      }
      if (this.selectedTextSpeedOption === MenuTextSpeedOptions.SLOW) {
        this.selectedTextSpeedOption = MenuTextSpeedOptions.MID;
        return;
      }
      return;
    }
  }

  private updateTextSpeedGameObjects(): void {
    const textGameObjects = this.textSpeedOptionTextGameObjects!.getChildren() as Phaser.GameObjects.Text[];

    textGameObjects.forEach((obj) => {
      obj.setColor(TEXT_FONT_COLORS.NOT_SELECTED);
    });

    if (this.selectedTextSpeedOption === MenuTextSpeedOptions.SLOW) {
      textGameObjects[0].setColor(TEXT_FONT_COLORS.SELECTED);
      return;
    }

    if (this.selectedTextSpeedOption === MenuTextSpeedOptions.MID) {
      textGameObjects[1].setColor(TEXT_FONT_COLORS.SELECTED);
      return;
    }

    if (this.selectedTextSpeedOption === MenuTextSpeedOptions.FAST) {
      textGameObjects[2].setColor(TEXT_FONT_COLORS.SELECTED);
      return;
    }
  }

  private updateBattleSceneOption(direction: Direction): void {
    if (direction === Direction.LEFT) {
      if (this.selectedBattleSceneOption === MenuBattleSceneOptions.ON) {
        this.selectedBattleSceneOption = MenuBattleSceneOptions.OFF;
      } else {
        this.selectedBattleSceneOption = MenuBattleSceneOptions.ON;
      }
      return;
    }

    if (direction === Direction.RIGHT) {
      if (this.selectedBattleSceneOption === MenuBattleSceneOptions.ON) {
        this.selectedBattleSceneOption = MenuBattleSceneOptions.OFF;
      } else {
        this.selectedBattleSceneOption = MenuBattleSceneOptions.ON;
      }
      return;
    }
  }

  private updateBattleSceneOptionGameObjects(): void {
    const textGameObjects = this.battleSceneOptionTextGameObjects!.getChildren() as Phaser.GameObjects.Text[];

    textGameObjects.forEach((obj) => {
      obj.setColor(TEXT_FONT_COLORS.NOT_SELECTED);
    });

    if (this.selectedBattleSceneOption === MenuBattleSceneOptions.ON) {
      textGameObjects[0].setColor(TEXT_FONT_COLORS.SELECTED);
      return;
    }

    if (this.selectedBattleSceneOption === MenuBattleSceneOptions.OFF) {
      textGameObjects[1].setColor(TEXT_FONT_COLORS.SELECTED);
      return;
    }
  }

  private updateBattleStyleOption(direction: Direction): void {
    if (direction === Direction.LEFT) {
      if (this.selectedBattleStyleOption === MenuBattleStyleOptions.SET) {
        this.selectedBattleStyleOption = MenuBattleStyleOptions.SHIFT;
      } else {
        this.selectedBattleStyleOption = MenuBattleStyleOptions.SET;
      }
      return;
    }

    if (direction === Direction.RIGHT) {
      if (this.selectedBattleStyleOption === MenuBattleStyleOptions.SET) {
        this.selectedBattleStyleOption = MenuBattleStyleOptions.SHIFT;
      } else {
        this.selectedBattleStyleOption = MenuBattleStyleOptions.SET;
      }
      return;
    }
  }

  private updateBattleStyleOptionGameObjects(): void {
    const textGameObjects = this.battleStyleOptionTextGameObjects!.getChildren() as Phaser.GameObjects.Text[];

    textGameObjects.forEach((obj) => {
      obj.setColor(TEXT_FONT_COLORS.NOT_SELECTED);
    });

    if (this.selectedBattleStyleOption === MenuBattleStyleOptions.SET) {
      textGameObjects[0].setColor(TEXT_FONT_COLORS.SELECTED);
      return;
    }

    if (this.selectedBattleStyleOption === MenuBattleStyleOptions.SHIFT) {
      textGameObjects[1].setColor(TEXT_FONT_COLORS.SELECTED);
      return;
    }
  }

  private updateSoundOption(direction: Direction): void {
    if (direction === Direction.LEFT) {
      if (this.selectedSoundMenuOption === MenuSoundOptions.ON) {
        this.selectedSoundMenuOption = MenuSoundOptions.OFF;
      } else {
        this.selectedSoundMenuOption = MenuSoundOptions.ON;
      }
      return;
    }

    if (direction === Direction.RIGHT) {
      if (this.selectedSoundMenuOption === MenuSoundOptions.ON) {
        this.selectedSoundMenuOption = MenuSoundOptions.OFF;
      } else {
        this.selectedSoundMenuOption = MenuSoundOptions.ON;
      }
      return;
    }
  }

  private updateSoundOptionGameObjects(): void {
    const textGameObjects = this.soundOptionTextGameObjects!.getChildren() as Phaser.GameObjects.Text[];

    textGameObjects.forEach((obj) => {
      obj.setColor(TEXT_FONT_COLORS.NOT_SELECTED);
    });

    if (this.selectedSoundMenuOption === MenuSoundOptions.ON) {
      textGameObjects[0].setColor(TEXT_FONT_COLORS.SELECTED);
      return;
    }

    if (this.selectedSoundMenuOption === MenuSoundOptions.OFF) {
      textGameObjects[1].setColor(TEXT_FONT_COLORS.SELECTED);
      return;
    }
  }

  private updateVolumeOption(direction: Direction): void {
    if (direction === Direction.LEFT) {
      if (this.selectedVolumeOption > 0) {
        this.selectedVolumeOption--;
      }
      return;
    }

    if (direction === Direction.RIGHT) {
      if (this.selectedVolumeOption < 4) {
        this.selectedVolumeOption++;
      }
      return;
    }
  }

  private updateVolumeSlider(): void {
    const cursorX = 420 + (this.selectedVolumeOption / 4) * 290;
    this.volumeOptionsMenuCursor?.setX(cursorX);
    this.volumeOptionsValueText?.setText(`${(this.selectedVolumeOption / 4) * 100}%`);
  }

  private updateMenuColorOption(direction: Direction): void {
    if (direction === Direction.LEFT) {
      if (this.selectedMenuColorOption > 0) {
        this.selectedMenuColorOption--;
      }
      return;
    }

    if (direction === Direction.RIGHT) {
      if (this.selectedMenuColorOption < 2) {
        this.selectedMenuColorOption++;
      }
      return;
    }
  }

  private updateMenuColorDisplayText(): void {
    const colorNames = ['Blue', 'Green', 'Purple'];
    this.selectedMenuColorTextGameObject?.setText(colorNames[this.selectedMenuColorOption]);
  }
}