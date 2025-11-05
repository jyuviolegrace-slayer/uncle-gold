import { IItem } from './types';

/**
 * ItemDatabase - central repository for all items in the game
 * Includes capture orbs, potions, and other consumables
 */
export class ItemDatabase {
  private static items: Map<string, IItem> = new Map();
  private static initialized: boolean = false;

  /**
   * Initialize item database with all items
   */
  static initialize(): void {
    if (this.initialized) return;

    // Capture Orbs - standard progression
    this.registerItem({
      id: 'pokeball',
      name: 'Pokéball',
      description: 'Standard capture orb',
      type: 'Pokeball',
      tier: 1,
      catchModifier: 1.0,
      price: 200,
    } as any);

    this.registerItem({
      id: 'great-ball',
      name: 'Great Ball',
      description: 'Enhanced capture orb',
      type: 'Pokeball',
      tier: 2,
      catchModifier: 1.5,
      price: 600,
    } as any);

    this.registerItem({
      id: 'ultra-ball',
      name: 'Ultra Ball',
      description: 'High-power capture orb',
      type: 'Pokeball',
      tier: 3,
      catchModifier: 2.0,
      price: 1200,
    } as any);

    this.registerItem({
      id: 'master-ball',
      name: 'Master Ball',
      description: 'Guaranteed capture',
      type: 'Pokeball',
      tier: 4,
      catchModifier: 100.0,
      price: 10000,
    } as any);

    // Healing Items - Potions
    this.registerItem({
      id: 'potion',
      name: 'Potion',
      description: 'Restores 20 HP',
      type: 'Potion',
      effect: { type: 'heal', value: 20 },
      price: 300,
    } as any);

    this.registerItem({
      id: 'super-potion',
      name: 'Super Potion',
      description: 'Restores 50 HP',
      type: 'Potion',
      effect: { type: 'heal', value: 50 },
      price: 700,
    } as any);

    this.registerItem({
      id: 'hyper-potion',
      name: 'Hyper Potion',
      description: 'Restores 100 HP',
      type: 'Potion',
      effect: { type: 'heal', value: 100 },
      price: 1500,
    } as any);

    this.registerItem({
      id: 'revive',
      name: 'Revive',
      description: 'Revives fainted critter with 50% HP',
      type: 'Potion',
      effect: { type: 'revive', value: 50 },
      price: 2000,
    } as any);

    // Status-curing items
    this.registerItem({
      id: 'antidote',
      name: 'Antidote',
      description: 'Cures poison',
      type: 'Potion',
      effect: { type: 'cure-status', value: 'Poison' },
      price: 100,
    } as any);

    this.registerItem({
      id: 'full-heal',
      name: 'Full Heal',
      description: 'Fully heals HP and cures status',
      type: 'Potion',
      effect: { type: 'full-heal' },
      price: 600,
    } as any);

    // Key Items (not consumable in battle typically)
    this.registerItem({
      id: 'pokédex',
      name: 'Pokédex',
      description: 'Device for recording critter data',
      type: 'Key Item',
    } as any);

    this.initialized = true;
  }

  /**
   * Register an item
   */
  private static registerItem(item: IItem): void {
    this.items.set(item.id, item);
  }

  /**
   * Get item by ID
   */
  static getItem(itemId: string): IItem | null {
    this.initialize();
    return this.items.get(itemId) || null;
  }

  /**
   * Get all items
   */
  static getAllItems(): IItem[] {
    this.initialize();
    return Array.from(this.items.values());
  }

  /**
   * Get capture orbs only
   */
  static getCaptureOrbs(): IItem[] {
    this.initialize();
    return Array.from(this.items.values()).filter(item => item.type === 'Pokeball');
  }

  /**
   * Get healing items
   */
  static getHealingItems(): IItem[] {
    this.initialize();
    return Array.from(this.items.values()).filter(item => item.type === 'Potion');
  }

  /**
   * Get shop items (all items that can be purchased)
   */
  static getShopItems(): Array<IItem & { price: number }> {
    this.initialize();
    return Array.from(this.items.values()).filter(item => (item as any).price) as any;
  }
}
