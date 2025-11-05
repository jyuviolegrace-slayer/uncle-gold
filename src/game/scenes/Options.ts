import { Scene, GameObjects } from 'phaser';
import { EventBus } from '../EventBus';
import { InputManager } from '../common/InputManager';
import { Direction } from '../common/Direction';
import {
  OptionMenu,
  TextSpeedOption,
  BattleSceneOption,
  BattleStyleOption,
  SoundOption,
  VolumeOption,
  MenuColorOption,
  GameOptions,
  DEFAULT_OPTIONS,
  TEXT_SPEED_OPTIONS,
  BATTLE_SCENE_OPTIONS,
  BATTLE_STYLE_OPTIONS,
  SOUND_OPTIONS,
} from '../common/Options';
import { UI_ASSET_KEYS } from '../assets/AssetKeys';
import { LegacyDataManager } from '../services/LegacyDataManager';

export class Options extends Scene {
  private inputManager: InputManager | null = null;
  private selectedMenu: OptionMenu = OptionMenu.TEXT_SPEED;
  private fadeOutInProgress: boolean = false;

  private selectedTextSpeed: TextSpeedOption = DEFAULT_OPTIONS.textSpeed;
  private selectedBattleScene: BattleSceneOption = DEFAULT_OPTIONS.battleSceneAnimations;
  private selectedBattleStyle: BattleStyleOption = DEFAULT_OPTIONS.battleStyle;
  private selectedSound: SoundOption = DEFAULT_OPTIONS.sound;
  private selectedVolume: VolumeOption = DEFAULT_OPTIONS.volume;
  private selectedMenuColor: MenuColorOption = DEFAULT_OPTIONS.menuColor;

  private optionsCursor: GameObjects.Rectangle | null = null;
  private infoText: GameObjects.Text | null = null;

  constructor() {
    super('Options');
  }

  create(): void {
    const width = this.scale.width;
    const height = this.scale.height;

    this.inputManager = new InputManager(this);

    // Load current options from LegacyDataManager
    const legacyDataManager = this.game.registry.get('legacyDataManager') as LegacyDataManager;
    if (legacyDataManager) {
      const options = legacyDataManager.getOptions();
      this.selectedTextSpeed = options.textSpeed as TextSpeedOption;
      this.selectedBattleScene = options.battleSceneAnimations as BattleSceneOption;
      this.selectedBattleStyle = options.battleStyle as BattleStyleOption;
      this.selectedSound = options.sound as SoundOption;
      this.selectedVolume = options.volume as VolumeOption;
      this.selectedMenuColor = options.menuColor as MenuColorOption;
    }

    // Background
    this.add.rectangle(0, 0, width, height, 0x000000, 0.5).setOrigin(0);

    // Title
    const titleStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'Arial',
      fontSize: '38px',
      color: '#ffffff',
      align: 'center',
    };
    this.add.text(width / 2, 40, 'Options', titleStyle).setOrigin(0.5);

    // Options menu text style
    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
      align: 'left',
    };

    const optionsList = [
      'Text Speed',
      'Battle Scene',
      'Battle Style',
      'Sound',
      'Volume',
      'Menu Color',
      'Close',
    ];

    const startY = 100;
    const lineHeight = 50;

    optionsList.forEach((option, index) => {
      this.add.text(50, startY + index * lineHeight, option, textStyle);
    });

    // Text Speed options
    this.add.text(400, startY, 'Slow', textStyle);
    this.add.text(500, startY, 'Mid', textStyle);
    this.add.text(600, startY, 'Fast', textStyle);

    // Battle Scene options
    this.add.text(400, startY + lineHeight, 'On', textStyle);
    this.add.text(500, startY + lineHeight, 'Off', textStyle);

    // Battle Style options
    this.add.text(400, startY + lineHeight * 2, 'Set', textStyle);
    this.add.text(500, startY + lineHeight * 2, 'Shift', textStyle);

    // Sound options
    this.add.text(400, startY + lineHeight * 3, 'On', textStyle);
    this.add.text(500, startY + lineHeight * 3, 'Off', textStyle);

    // Volume slider
    this.add.rectangle(400, startY + lineHeight * 4, 200, 4, 0xffffff, 1).setOrigin(0, 0.5);
    const volumeX = 400 + (this.selectedVolume / 4) * 200;
    this.add.rectangle(volumeX, startY + lineHeight * 4, 10, 20, 0xff2222, 1).setOrigin(0.5);
    this.add.text(650, startY + lineHeight * 4 - 20, `${Math.round((this.selectedVolume / 4) * 100)}%`, textStyle);

    // Menu Color options
    this.add.text(400, startY + lineHeight * 5, 'Color 0', textStyle);
    this.add.text(500, startY + lineHeight * 5, 'Color 1', textStyle);
    this.add.text(600, startY + lineHeight * 5, 'Color 2', textStyle);

    // Info box
    const infoBgWidth = width - 100;
    this.add.rectangle(width / 2, height - 80, infoBgWidth, 100, 0x000000, 0.7)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0xffffff);

    this.infoText = this.add.text(width / 2, height - 80, 'Select an option', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: infoBgWidth - 40 },
    }).setOrigin(0.5);

    // Create cursor rectangle
    this.optionsCursor = this.add.rectangle(40, startY + 5, width - 80, 40, 0xffffff, 0)
      .setOrigin(0, 0)
      .setStrokeStyle(3, 0xff0000, 1);

    // Input handlers
    this.input.keyboard?.on('keydown-UP', () => this.moveUp());
    this.input.keyboard?.on('keydown-DOWN', () => this.moveDown());
    this.input.keyboard?.on('keydown-LEFT', () => this.moveLeft());
    this.input.keyboard?.on('keydown-RIGHT', () => this.moveRight());
    this.input.keyboard?.on('keydown-SPACE', () => this.selectOption());
    this.input.keyboard?.on('keydown-ENTER', () => this.selectOption());
    this.input.keyboard?.on('keydown-SHIFT', () => this.goBack());
    this.input.keyboard?.on('keydown-ESC', () => this.goBack());

    this.updateCursorPosition();
    this.updateOptionValues();

    EventBus.emit('current-scene-ready', this);
  }

  update(): void {
    if (!this.inputManager || this.fadeOutInProgress) return;

    if (this.inputManager.isInputLocked) return;

    const direction = this.inputManager.getDirectionKeyJustPressed();
    if (direction === Direction.UP) {
      this.moveUp();
    } else if (direction === Direction.DOWN) {
      this.moveDown();
    } else if (direction === Direction.LEFT) {
      this.moveLeft();
    } else if (direction === Direction.RIGHT) {
      this.moveRight();
    }

    if (this.inputManager.wasSpaceKeyPressed()) {
      this.selectOption();
    }

    if (this.inputManager.wasBackKeyPressed() || this.inputManager.wasFKeyPressed()) {
      this.goBack();
    }
  }

  shutdown(): void {
    this.input.keyboard?.off('keydown-UP');
    this.input.keyboard?.off('keydown-DOWN');
    this.input.keyboard?.off('keydown-LEFT');
    this.input.keyboard?.off('keydown-RIGHT');
    this.input.keyboard?.off('keydown-SPACE');
    this.input.keyboard?.off('keydown-ENTER');
    this.input.keyboard?.off('keydown-SHIFT');
    this.input.keyboard?.off('keydown-ESC');
    if (this.inputManager) {
      this.inputManager.shutdown();
      this.inputManager = null;
    }
  }

  private moveUp(): void {
    const menuValues = Object.values(OptionMenu);
    const currentIndex = menuValues.indexOf(this.selectedMenu);
    if (currentIndex > 0) {
      this.selectedMenu = menuValues[currentIndex - 1] as OptionMenu;
      this.updateCursorPosition();
      this.updateOptionValues();
    }
  }

  private moveDown(): void {
    const menuValues = Object.values(OptionMenu);
    const currentIndex = menuValues.indexOf(this.selectedMenu);
    if (currentIndex < menuValues.length - 1) {
      this.selectedMenu = menuValues[currentIndex + 1] as OptionMenu;
      this.updateCursorPosition();
      this.updateOptionValues();
    }
  }

  private moveLeft(): void {
    switch (this.selectedMenu) {
      case OptionMenu.TEXT_SPEED:
        if (this.selectedTextSpeed === 'MID') {
          this.selectedTextSpeed = 'SLOW';
          this.updateOptionValues();
        } else if (this.selectedTextSpeed === 'FAST') {
          this.selectedTextSpeed = 'MID';
          this.updateOptionValues();
        }
        break;
      case OptionMenu.BATTLE_SCENE:
        if (this.selectedBattleScene === 'OFF') {
          this.selectedBattleScene = 'ON';
          this.updateOptionValues();
        }
        break;
      case OptionMenu.BATTLE_STYLE:
        if (this.selectedBattleStyle === 'SHIFT') {
          this.selectedBattleStyle = 'SET';
          this.updateOptionValues();
        }
        break;
      case OptionMenu.SOUND:
        if (this.selectedSound === 'OFF') {
          this.selectedSound = 'ON';
          this.updateOptionValues();
        }
        break;
      case OptionMenu.VOLUME:
        if (this.selectedVolume > 0) {
          this.selectedVolume = (Math.max(0, this.selectedVolume - 1)) as VolumeOption;
          this.updateOptionValues();
        }
        break;
      case OptionMenu.MENU_COLOR:
        if (this.selectedMenuColor > 0) {
          this.selectedMenuColor = (this.selectedMenuColor - 1) as MenuColorOption;
          this.updateOptionValues();
        }
        break;
    }
  }

  private moveRight(): void {
    switch (this.selectedMenu) {
      case OptionMenu.TEXT_SPEED:
        if (this.selectedTextSpeed === 'SLOW') {
          this.selectedTextSpeed = 'MID';
          this.updateOptionValues();
        } else if (this.selectedTextSpeed === 'MID') {
          this.selectedTextSpeed = 'FAST';
          this.updateOptionValues();
        }
        break;
      case OptionMenu.BATTLE_SCENE:
        if (this.selectedBattleScene === 'ON') {
          this.selectedBattleScene = 'OFF';
          this.updateOptionValues();
        }
        break;
      case OptionMenu.BATTLE_STYLE:
        if (this.selectedBattleStyle === 'SET') {
          this.selectedBattleStyle = 'SHIFT';
          this.updateOptionValues();
        }
        break;
      case OptionMenu.SOUND:
        if (this.selectedSound === 'ON') {
          this.selectedSound = 'OFF';
          this.updateOptionValues();
        }
        break;
      case OptionMenu.VOLUME:
        if (this.selectedVolume < 4) {
          this.selectedVolume = (Math.min(4, this.selectedVolume + 1)) as VolumeOption;
          this.updateOptionValues();
        }
        break;
      case OptionMenu.MENU_COLOR:
        if (this.selectedMenuColor < 2) {
          this.selectedMenuColor = (this.selectedMenuColor + 1) as MenuColorOption;
          this.updateOptionValues();
        }
        break;
    }
  }

  private selectOption(): void {
    if (this.selectedMenu === OptionMenu.CONFIRM) {
      this.saveAndClose();
    }
  }

  private updateCursorPosition(): void {
    if (!this.optionsCursor) return;

    const startY = 100;
    const lineHeight = 50;
    const menuValues = Object.values(OptionMenu);
    const index = menuValues.indexOf(this.selectedMenu);

    this.optionsCursor.setY(startY + index * lineHeight + 5);
  }

  private updateOptionValues(): void {
    if (!this.infoText) return;

    let infoMsg = 'Adjust options here';

    switch (this.selectedMenu) {
      case OptionMenu.TEXT_SPEED:
        infoMsg = `Text Speed: ${this.selectedTextSpeed}`;
        break;
      case OptionMenu.BATTLE_SCENE:
        infoMsg = `Battle Scene Animations: ${this.selectedBattleScene}`;
        break;
      case OptionMenu.BATTLE_STYLE:
        infoMsg = `Battle Style: ${this.selectedBattleStyle}`;
        break;
      case OptionMenu.SOUND:
        infoMsg = `Sound: ${this.selectedSound}`;
        break;
      case OptionMenu.VOLUME:
        infoMsg = `Volume: ${Math.round((this.selectedVolume / 4) * 100)}%`;
        break;
      case OptionMenu.MENU_COLOR:
        infoMsg = `Menu Color: Option ${this.selectedMenuColor}`;
        break;
      case OptionMenu.CONFIRM:
        infoMsg = 'Save options and return to title';
        break;
    }

    this.infoText.setText(infoMsg);
  }

  private goBack(): void {
    if (this.fadeOutInProgress || !this.inputManager) return;

    this.fadeOutInProgress = true;
    this.inputManager.lockInput = true;

    this.saveOptions();

    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        this.scene.start('Title');
      }
    );
  }

  private saveAndClose(): void {
    this.goBack();
  }

  private saveOptions(): void {
    const legacyDataManager = this.game.registry.get('legacyDataManager') as LegacyDataManager;
    if (legacyDataManager) {
      legacyDataManager.updateOptions({
        textSpeed: this.selectedTextSpeed,
        battleSceneAnimations: this.selectedBattleScene,
        battleStyle: this.selectedBattleStyle,
        sound: this.selectedSound,
        volume: this.selectedVolume,
        menuColor: this.selectedMenuColor,
      });
    }

    EventBus.emit('options:changed', {
      textSpeed: this.selectedTextSpeed,
      battleScene: this.selectedBattleScene,
      battleStyle: this.selectedBattleStyle,
      sound: this.selectedSound,
      volume: this.selectedVolume,
      menuColor: this.selectedMenuColor,
    });
  }
}
