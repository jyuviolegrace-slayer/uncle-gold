import { Scene, GameObjects, Input } from 'phaser';
import { EventBus } from '../EventBus';
import { SceneContext } from './SceneContext';

/**
 * Party Scene - Party management and critter status
 * View party members, manage team composition
 */
export class Party extends Scene {
  private gameStateManager = SceneContext.getInstance().getGameStateManager();
  private partyListContainer: GameObjects.Container | null = null;
  private selectedPartyIndex: number = 0;
  private infoText: GameObjects.Text | null = null;

  constructor() {
    super('Party');
  }

  create() {
    const width = this.game.config.width as number;
    const height = this.game.config.height as number;

    const background = this.add.rectangle(width / 2, height / 2, width, height, 0x1a2a4a);
    background.setScrollFactor(0);

    const titleText = this.add.text(width / 2, 20, 'PARTY', {
      font: '24px Arial',
      color: '#ffffff',
    });
    titleText.setOrigin(0.5);

    this.partyListContainer = this.add.container(50, 70);
    this.renderPartyList();

    this.infoText = this.add.text(width / 2, height - 80, 'Press ENTER to confirm | ESC to back', {
      font: '12px Arial',
      color: '#cccccc',
    });
    this.infoText.setOrigin(0.5);

    this.setupInput();
    this.setupEventListeners();

    EventBus.emit('current-scene-ready', this);
  }

  private renderPartyList() {
    if (!this.partyListContainer) return;

    this.partyListContainer.removeAll(true);

    const party = this.gameStateManager.getParty();

    party.forEach((critter, index) => {
      const y = index * 60;
      const isSelected = index === this.selectedPartyIndex;
      const bgColor = isSelected ? 0x4444ff : 0x333333;
      const bg = this.add.rectangle(150, y + 30, 300, 50, bgColor);
      
      const text = this.add.text(10, y + 5, `${critter.nickname} Lvl ${critter.level}`, {
        font: '14px Arial',
        color: '#ffffff',
      });

      const hpText = this.add.text(10, y + 25, `HP: ${critter.currentHP}/${critter.maxHP}`, {
        font: '12px Arial',
        color: '#00ff00',
      });

      this.partyListContainer?.add([bg, text, hpText]);
    });

    if (party.length === 0) {
      const emptyText = this.add.text(10, 30, 'No critters in party', {
        font: '14px Arial',
        color: '#ff0000',
      });
      this.partyListContainer.add(emptyText);
    }
  }

  private setupInput() {
    this.input.keyboard?.on('keydown-UP_ARROW', () => {
      const party = this.gameStateManager.getParty();
      if (party.length > 0) {
        this.selectedPartyIndex = (this.selectedPartyIndex - 1 + party.length) % party.length;
        this.renderPartyList();
      }
    });

    this.input.keyboard?.on('keydown-DOWN_ARROW', () => {
      const party = this.gameStateManager.getParty();
      if (party.length > 0) {
        this.selectedPartyIndex = (this.selectedPartyIndex + 1) % party.length;
        this.renderPartyList();
      }
    });

    this.input.keyboard?.on('keydown-ENTER', () => {
      const critter = this.gameStateManager.getParty()[this.selectedPartyIndex];
      if (critter) {
        this.infoText?.setText(`Selected: ${critter.nickname}`);
      }
    });

    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('Overworld');
    });
  }

  private setupEventListeners() {
    EventBus.on('party:updated', () => {
      this.selectedPartyIndex = 0;
      this.renderPartyList();
    });
  }

  shutdown() {
    EventBus.off('party:updated');
  }
}
