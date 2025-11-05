import { ICritter } from './types';
import { Critter } from './Critter';
import { EventBus } from '../EventBus';

/**
 * PlayerParty - manages active team and PC storage system
 * Handles party composition, PC boxes, critter transfers, and persistence
 */
export class PlayerParty {
  private party: ICritter[] = [];
  private pcBoxes: ICritter[][] = [];
  private readonly MAX_PARTY_SIZE = 6;
  private readonly MAX_BOXES = 10;
  private readonly MAX_BOX_SIZE = 30;
  private currentBoxIndex: number = 0;

  constructor() {
    this.initializeBoxes();
  }

  /**
   * Initialize empty PC boxes
   */
  private initializeBoxes(): void {
    this.pcBoxes = [];
    for (let i = 0; i < this.MAX_BOXES; i++) {
      this.pcBoxes.push([]);
    }
  }

  /**
   * Get active party
   */
  getParty(): ICritter[] {
    return this.party;
  }

  /**
   * Get party size
   */
  getPartySize(): number {
    return this.party.length;
  }

  /**
   * Check if party is full
   */
  isPartyFull(): boolean {
    return this.party.length >= this.MAX_PARTY_SIZE;
  }

  /**
   * Add critter to party
   */
  addToParty(critter: ICritter): boolean {
    if (this.isPartyFull()) {
      return false;
    }
    this.party.push(critter);
    EventBus.emit('party:updated', { critters: this.party });
    return true;
  }

  /**
   * Remove critter from party by index
   */
  removeFromParty(index: number): boolean {
    if (index < 0 || index >= this.party.length) {
      return false;
    }
    this.party.splice(index, 1);
    EventBus.emit('party:updated', { critters: this.party });
    return true;
  }

  /**
   * Get critter at party index
   */
  getCritterAt(index: number): ICritter | null {
    if (index < 0 || index >= this.party.length) {
      return null;
    }
    return this.party[index];
  }

  /**
   * Reorder party (swap two critters)
   */
  reorderParty(fromIndex: number, toIndex: number): boolean {
    if (
      fromIndex < 0 || fromIndex >= this.party.length ||
      toIndex < 0 || toIndex >= this.party.length
    ) {
      return false;
    }

    const temp = this.party[fromIndex];
    this.party[fromIndex] = this.party[toIndex];
    this.party[toIndex] = temp;

    EventBus.emit('party:updated', { critters: this.party });
    return true;
  }

  /**
   * Deposit critter to PC box
   */
  depositToPC(critterIndex: number, boxIndex?: number): boolean {
    if (critterIndex < 0 || critterIndex >= this.party.length) {
      return false;
    }

    const critter = this.party[critterIndex];
    const targetBox = boxIndex !== undefined ? boxIndex : this.currentBoxIndex;
    
    if (targetBox < 0 || targetBox >= this.MAX_BOXES) {
      return false;
    }

    if (this.pcBoxes[targetBox].length >= this.MAX_BOX_SIZE) {
      return false;
    }

    this.party.splice(critterIndex, 1);
    this.pcBoxes[targetBox].push(critter);
    EventBus.emit('party:updated', { critters: this.party });
    EventBus.emit('pc:updated', { boxIndex: targetBox, critters: this.pcBoxes[targetBox] });
    return true;
  }

  /**
   * Withdraw critter from PC box
   */
  withdrawFromPC(boxIndex: number, critterIndex: number): boolean {
    if (boxIndex < 0 || boxIndex >= this.MAX_BOXES) {
      return false;
    }

    if (critterIndex < 0 || critterIndex >= this.pcBoxes[boxIndex].length) {
      return false;
    }

    if (this.isPartyFull()) {
      return false;
    }

    const critter = this.pcBoxes[boxIndex].splice(critterIndex, 1)[0];
    this.party.push(critter);

    EventBus.emit('pc:updated', { boxIndex, critters: this.pcBoxes[boxIndex] });
    EventBus.emit('party:updated', { critters: this.party });
    return true;
  }

  /**
   * Get current PC box
   */
  getCurrentBox(): ICritter[] {
    return this.pcBoxes[this.currentBoxIndex];
  }

  /**
   * Get specific PC box
   */
  getBox(boxIndex: number): ICritter[] | null {
    if (boxIndex < 0 || boxIndex >= this.MAX_BOXES) {
      return null;
    }
    return this.pcBoxes[boxIndex];
  }

  /**
   * Set current PC box
   */
  setCurrentBox(boxIndex: number): boolean {
    if (boxIndex < 0 || boxIndex >= this.MAX_BOXES) {
      return false;
    }
    this.currentBoxIndex = boxIndex;
    EventBus.emit('pc:boxChanged', { boxIndex });
    return true;
  }

  /**
   * Get all boxes
   */
  getAllBoxes(): ICritter[][] {
    return this.pcBoxes;
  }

  /**
   * Get total critters across party and PC
   */
  getTotalCritters(): number {
    return this.party.length + this.pcBoxes.reduce((sum, box) => sum + box.length, 0);
  }

  /**
   * Heal entire party (after battle)
   */
  healParty(): void {
    this.party.forEach(critter => {
      (critter as any).heal();
      (critter as any).resetMovePP();
    });
    EventBus.emit('party:healed');
  }

  /**
   * Distribute experience to all party members that participated
   * (Only active critters gain exp in turn-based formula)
   */
  distributeExperience(partyIndices: number[], experience: number): number[] {
    const levelUps: number[] = [];

    partyIndices.forEach(index => {
      const critter = this.getCritterAt(index);
      if (critter) {
        const levelsGained = (critter as any).addExperience(experience);
        levelUps.push(...levelsGained);
      }
    });

    EventBus.emit('party:experienceDistributed', { experience, levelUps });
    return levelUps;
  }

  /**
   * Serialize party and PC to JSON
   */
  toJSON(): {
    party: ICritter[];
    pcBoxes: ICritter[][];
    currentBoxIndex: number;
  } {
    return {
      party: this.party.map(c => c),
      pcBoxes: this.pcBoxes.map(box => box.map(c => c)),
      currentBoxIndex: this.currentBoxIndex,
    };
  }

  /**
   * Deserialize party and PC from JSON
   */
  static fromJSON(data: {
    party: ICritter[];
    pcBoxes: ICritter[][];
    currentBoxIndex: number;
  }): PlayerParty {
    const playerParty = new PlayerParty();
    playerParty.party = data.party;
    playerParty.pcBoxes = data.pcBoxes;
    playerParty.currentBoxIndex = data.currentBoxIndex;
    return playerParty;
  }
}
