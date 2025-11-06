import Phaser from 'phaser';
import { BaseScene } from './common/BaseScene';
import { SceneKeys, TextureKeys, AudioKeys, FontKeys } from '../assets';
import { Direction } from '../models/common';
import { DataManagerStoreKeys, dataManager } from '../services/DataManager';
import { NineSlice } from '../utils/NineSlice';
import { OptionMenuOptions } from '../models/Options';
import { saveService, SaveSlot } from '../services/SaveService';

const MENU_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = Object.freeze({
  fontFamily: FontKeys.KENNEY_FUTURE_NARROW,
  color: '#4D4A49',
  fontSize: '30px',
});

const PLAYER_INPUT_CURSOR_POSITION = Object.freeze({
  x: 150,
  y: 41,
});

enum MainMenuOptions {
  NEW_GAME = 'NEW_GAME',
  CONTINUE = 'CONTINUE',
  OPTIONS = 'OPTIONS',
}

export class Title extends BaseScene {
  private mainMenuCursor?: Phaser.GameObjects.Image;
  private selectedMenuOption: MainMenuOptions = MainMenuOptions.NEW_GAME;
  private isContinueButtonEnabled: boolean = false;
  private nineSliceMenu?: NineSlice;

  constructor() {
    super(SceneKeys.TITLE);
  }

  init(): void {
    super.init();
    this.nineSliceMenu = new NineSlice({
      cornerCutSize: 32,
      textureManager: this.sys.textures,
      assetKeys: [TextureKeys.MENU_BACKGROUND],
    });
  }

  create(): void {
    super.create();

    this.selectedMenuOption = MainMenuOptions.NEW_GAME;
    this.isContinueButtonEnabled = saveService.hasAnySaveData();

    this.createTitleBackground();
    this.createMenu();
    this.createCursor();
    this.setupTransitions();
    this.playBackgroundMusic();
  }

  update(time: number, delta: number): void {
    super.update(time, delta);

    if (this.isInputLocked()) {
      return;
    }

    if (this.inputManager.wasSpaceKeyPressed()) {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.lockInput();
      return;
    }

    const selectedDirection = this.inputManager.getDirectionKeyJustPressed();
    if (selectedDirection !== Direction.NONE) {
      this.moveMenuSelectCursor(selectedDirection);
    }
  }

  private createTitleBackground(): void {
    this.add.image(0, 0, TextureKeys.TITLE_BACKGROUND).setOrigin(0).setScale(0.58);
    this.add
      .image(this.scale.width / 2, 150, TextureKeys.TITLE_PANEL)
      .setScale(0.25, 0.25)
      .setAlpha(0.5);
    this.add
      .image(this.scale.width / 2, 150, TextureKeys.TITLE_LOGO)
      .setScale(0.55)
      .setAlpha(0.5);
  }

  private createMenu(): void {
    const menuBgWidth = 500;
    const menuBgContainer = this.nineSliceMenu!.createNineSliceContainer(
      this,
      menuBgWidth,
      200,
      TextureKeys.MENU_BACKGROUND
    );
    
    const newGameText = this.add.text(menuBgWidth / 2, 40, 'New Game', MENU_TEXT_STYLE).setOrigin(0.5);
    const continueText = this.add.text(menuBgWidth / 2, 90, 'Continue', MENU_TEXT_STYLE).setOrigin(0.5);
    if (!this.isContinueButtonEnabled) {
      continueText.setAlpha(0.5);
    }
    const optionText = this.add.text(menuBgWidth / 2, 140, 'Options', MENU_TEXT_STYLE).setOrigin(0.5);
    
    const menuContainer = this.add.container(0, 0, [menuBgContainer, newGameText, continueText, optionText]);
    menuContainer.setPosition(this.scale.width / 2 - menuBgWidth / 2, 300);
  }

  private createCursor(): void {
    this.mainMenuCursor = this.add
      .image(PLAYER_INPUT_CURSOR_POSITION.x, PLAYER_INPUT_CURSOR_POSITION.y, TextureKeys.CURSOR)
      .setOrigin(0.5)
      .setScale(2.5);
    
    this.tweens.add({
      delay: 0,
      duration: 500,
      repeat: -1,
      x: {
        from: PLAYER_INPUT_CURSOR_POSITION.x,
        start: PLAYER_INPUT_CURSOR_POSITION.x,
        to: PLAYER_INPUT_CURSOR_POSITION.x + 3,
      },
      targets: this.mainMenuCursor,
    });
  }

  private setupTransitions(): void {
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      if (this.selectedMenuOption === MainMenuOptions.OPTIONS) {
        this.transitionToScene(SceneKeys.OPTIONS);
        return;
      }

      if (this.selectedMenuOption === MainMenuOptions.NEW_GAME) {
        dataManager.startNewGame();
        saveService.setActiveSlot(SaveSlot.SLOT_1);
      } else if (this.selectedMenuOption === MainMenuOptions.CONTINUE) {
        const mostRecentSlot = saveService.getMostRecentSlot();
        if (mostRecentSlot) {
          saveService.loadGame(mostRecentSlot);
        } else {
          console.error('[Title:setupTransitions] No save data found for Continue option');
          return;
        }
      }

      // Get starting area from DataManager
      const playerLocation = dataManager.dataStore.get(DataManagerStoreKeys.PLAYER_LOCATION);
      this.transitionToScene(SceneKeys.WORLD, {
        area: playerLocation.area,
        isInterior: playerLocation.isInterior,
      });
    });
  }

  private playBackgroundMusic(): void {
    this.audioManager.playBackgroundMusic(AudioKeys.TITLE);
  }

  private moveMenuSelectCursor(direction: Direction): void {
    this.updateSelectedMenuOptionFromInput(direction);
    
    switch (this.selectedMenuOption) {
      case MainMenuOptions.NEW_GAME:
        this.mainMenuCursor!.setY(PLAYER_INPUT_CURSOR_POSITION.y);
        break;
      case MainMenuOptions.CONTINUE:
        this.mainMenuCursor!.setY(91);
        break;
      case MainMenuOptions.OPTIONS:
        this.mainMenuCursor!.setY(141);
        break;
    }
  }

  private updateSelectedMenuOptionFromInput(direction: Direction): void {
    switch (direction) {
      case Direction.UP:
        if (this.selectedMenuOption === MainMenuOptions.NEW_GAME) {
          return;
        }
        if (this.selectedMenuOption === MainMenuOptions.CONTINUE) {
          this.selectedMenuOption = MainMenuOptions.NEW_GAME;
          return;
        }
        if (this.selectedMenuOption === MainMenuOptions.OPTIONS && !this.isContinueButtonEnabled) {
          this.selectedMenuOption = MainMenuOptions.NEW_GAME;
          return;
        }
        this.selectedMenuOption = MainMenuOptions.CONTINUE;
        return;
      case Direction.DOWN:
        if (this.selectedMenuOption === MainMenuOptions.OPTIONS) {
          return;
        }
        if (this.selectedMenuOption === MainMenuOptions.CONTINUE) {
          this.selectedMenuOption = MainMenuOptions.OPTIONS;
          return;
        }
        if (this.selectedMenuOption === MainMenuOptions.NEW_GAME && !this.isContinueButtonEnabled) {
          this.selectedMenuOption = MainMenuOptions.OPTIONS;
          return;
        }
        this.selectedMenuOption = MainMenuOptions.CONTINUE;
        return;
      case Direction.LEFT:
      case Direction.RIGHT:
      case Direction.NONE:
        return;
    }
  }
}