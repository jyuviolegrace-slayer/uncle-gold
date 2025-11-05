import { Scene, GameObjects, Input } from 'phaser';
import { EventBus } from '../EventBus';
import { SceneContext } from './SceneContext';
import { CritterSpeciesDatabase, MoveDatabase } from '../models';

type ViewMode = 'party' | 'details' | 'moves' | 'stats';

/**
 * Party Scene - Party management and critter status
 * View party members, manage team composition, and detailed critter info
 */
export class Party extends Scene {
  private gameStateManager = SceneContext.getInstance().getGameStateManager();
  private partyListContainer: GameObjects.Container | null = null;
  private detailsContainer: GameObjects.Container | null = null;
  private selectedPartyIndex: number = 0;
  private viewMode: ViewMode = 'party';
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

    this.partyListContainer = this.add.container(30, 70);
    this.detailsContainer = this.add.container(400, 70);

    this.renderPartyList();
    this.renderDetails();

    this.infoText = this.add.text(width / 2, height - 30, 'UP/DOWN: Select | ENTER: Details | DEL: Remove | ESC: Back', {
      font: '11px Arial',
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
      const y = index * 65;
      const isSelected = index === this.selectedPartyIndex;
      const bgColor = isSelected ? 0x4444ff : 0x333333;
      const bg = this.add.rectangle(170, y + 30, 330, 60, bgColor);

      const hpRatio = critter.currentHP / critter.maxHP;
      const hpBarWidth = 150;
      const hpBarColor = hpRatio > 0.5 ? 0x00ff00 : hpRatio > 0.25 ? 0xffff00 : 0xff0000;
      const hpBar = this.add.rectangle(90, y + 40, hpBarWidth * hpRatio, 8, hpBarColor);

      const species = CritterSpeciesDatabase.getSpecies(critter.speciesId);
      const displayName = critter.nickname || species?.name || 'Unknown';

      const text = this.add.text(10, y + 10, `${displayName} Lvl ${critter.level}`, {
        font: '13px Arial',
        color: '#ffffff',
        fontStyle: critter.isFainted ? 'italic' : 'normal',
      });

      const hpText = this.add.text(10, y + 28, `HP: ${critter.currentHP}/${critter.maxHP}`, {
        font: '11px Arial',
        color: '#aaaaaa',
      });

      const moveText = this.add.text(10, y + 45, `Moves: ${critter.moves.length}/4`, {
        font: '11px Arial',
        color: '#88aa88',
      });

      this.partyListContainer?.add([bg, hpBar, text, hpText, moveText]);
    });

    if (party.length === 0) {
      const emptyText = this.add.text(170, 30, 'No critters in party', {
        font: '14px Arial',
        color: '#ff0000',
      });
      emptyText.setOrigin(0.5);
      this.partyListContainer.add(emptyText);
    }
  }

  private renderDetails() {
    if (!this.detailsContainer) return;

    this.detailsContainer.removeAll(true);

    const party = this.gameStateManager.getParty();
    const critter = party[this.selectedPartyIndex];

    if (!critter) {
      const noSelectText = this.add.text(0, 0, 'Select a critter', {
        font: '14px Arial',
        color: '#ffff00',
      });
      this.detailsContainer.add(noSelectText);
      return;
    }

    const species = CritterSpeciesDatabase.getSpecies(critter.speciesId);
    const displayName = critter.nickname || species?.name || 'Unknown';

    let y = 0;

    const nameText = this.add.text(0, y, `${displayName}`, {
      font: 'bold 14px Arial',
      color: '#ffff00',
    });
    y += 25;

    const levelText = this.add.text(0, y, `Level: ${critter.level}`, {
      font: '12px Arial',
      color: '#ffffff',
    });
    y += 20;

    const expText = this.add.text(0, y, `EXP: ${critter.experience}`, {
      font: '12px Arial',
      color: '#cccccc',
    });
    y += 20;

    y += 10;
    const statsBg = this.add.rectangle(100, y + 50, 200, 110, 0x222244);
    this.detailsContainer.add(statsBg);

    const statsLabel = this.add.text(0, y, 'Stats:', {
      font: 'bold 11px Arial',
      color: '#aaffaa',
    });
    y += 15;

    const stats = critter.currentStats;
    const statLines = [
      `ATK: ${stats.attack}`,
      `DEF: ${stats.defense}`,
      `SP.ATK: ${stats.spAtk}`,
      `SP.DEF: ${stats.spDef}`,
      `SPD: ${stats.speed}`,
    ];

    statLines.forEach(line => {
      const statText = this.add.text(10, y, line, {
        font: '10px Arial',
        color: '#cccccc',
      });
      y += 14;
    });

    y += 15;
    const movesLabel = this.add.text(0, y, `Moves (${critter.moves.length}/4):`, {
      font: 'bold 11px Arial',
      color: '#aaffaa',
    });
    y += 15;

    critter.moves.forEach((moveInstance, moveIdx) => {
      const moveData = MoveDatabase.getMove(moveInstance.moveId);
      const moveName = moveData?.name || moveInstance.moveId;
      const moveText = this.add.text(10, y, `${moveName} (${moveInstance.currentPP}/${moveInstance.maxPP})`, {
        font: '10px Arial',
        color: '#dddddd',
      });
      y += 12;
    });

    this.detailsContainer.add([nameText, levelText, expText, statsLabel, movesLabel]);
  }

  private setupInput() {
    this.input.keyboard?.on('keydown-UP_ARROW', () => {
      const party = this.gameStateManager.getParty();
      if (party.length > 0) {
        this.selectedPartyIndex = (this.selectedPartyIndex - 1 + party.length) % party.length;
        this.renderPartyList();
        this.renderDetails();
      }
    });

    this.input.keyboard?.on('keydown-DOWN_ARROW', () => {
      const party = this.gameStateManager.getParty();
      if (party.length > 0) {
        this.selectedPartyIndex = (this.selectedPartyIndex + 1) % party.length;
        this.renderPartyList();
        this.renderDetails();
      }
    });

    this.input.keyboard?.on('keydown-ENTER', () => {
      const party = this.gameStateManager.getParty();
      if (party.length > 0 && party[this.selectedPartyIndex]) {
        // Launch detailed monster party view
        this.scene.launch('MonsterParty', { 
          previousSceneName: 'Party',
          activeBattleMonsterPartyIndex: undefined
        });
        this.scene.pause('Party');
      }
    });

    this.input.keyboard?.on('keydown-DELETE', () => {
      const party = this.gameStateManager.getParty();
      if (party.length > 0) {
        this.gameStateManager.removeCritterFromParty(this.selectedPartyIndex);
        if (this.selectedPartyIndex >= party.length - 1 && this.selectedPartyIndex > 0) {
          this.selectedPartyIndex--;
        }
        this.renderPartyList();
        this.renderDetails();
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
      this.renderDetails();
    });

    // Handle returning from MonsterParty
    EventBus.on('monsterParty:closed', () => {
      this.scene.resume('Party');
    });
  }

  shutdown() {
    EventBus.off('party:updated');
    EventBus.off('monsterParty:closed');
  }
}
