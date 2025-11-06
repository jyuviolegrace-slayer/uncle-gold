import Phaser from 'phaser';
import {
  CrittersSchema,
  MovesSchema,
  ItemsSchema,
  EncounterDataSchema,
  LegacyAttacksSchema,
  LegacyItemsSchema,
  LegacyMonstersSchema,
  TypeMatrixSchema,
} from './schemas';
import type {
  Critter,
  Move,
  Item,
  EncounterData,
  LegacyAttack,
  LegacyItem,
  LegacyMonster,
  CritterType,
  EncounterEntry,
  EncounterTable,
} from '../models';
import { MoveCategory, ItemCategory, ItemEffect } from '../models';
import { EventDetails, SignDetails, NpcDetails } from '../models';
import { Shop } from '../models/shop';

export class DataLoader {
  private critters: Map<string, Critter> = new Map();
  private moves: Map<string, Move> = new Map();
  private items: Map<string, Item> = new Map();
  private types: Map<string, CritterType> = new Map();
  private encounters: EncounterData = {};
  private legacyAttacks: Map<number, LegacyAttack> = new Map();
  private legacyItems: Map<number, LegacyItem> = new Map();
  private legacyMonsters: Map<number, LegacyMonster> = new Map();
  private events: Record<string, EventDetails> = {};
  private signs: Record<string, SignDetails> = {};
  private npcs: Record<string, NpcDetails> = {};
  private shops: Map<string, Shop> = new Map();

  private isInitialized = false;
  private initPromise?: Promise<void>;

  loadFromCache(cache: Phaser.Cache.CacheManager): Promise<void> {
    if (this.isInitialized) {
      return Promise.resolve();
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.performLoad(cache);
    return this.initPromise;
  }

  private async performLoad(cache: Phaser.Cache.CacheManager): Promise<void> {
    const jsonCache = cache.json;

    try {
      this.loadCritters(jsonCache);
      this.loadMoves(jsonCache);
      this.loadItems(jsonCache);
      this.loadTypes(jsonCache);
      this.loadEncounters(jsonCache);
      this.loadEvents(jsonCache);
      this.loadSigns(jsonCache);
      this.loadNpcs(jsonCache);
      this.loadShops(jsonCache);
      this.loadLegacyData(jsonCache);

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to load game data:', error);
      throw error;
    }
  }

  private loadCritters(cache: Phaser.Cache.BaseCache): void {
    const rawData = cache.get('CRITTERS');
    if (!rawData) {
      throw new Error('Missing required data: CRITTERS');
    }

    const validatedData = CrittersSchema.parse(rawData);
    validatedData.forEach((critter) => {
      this.critters.set(critter.id, critter);
    });
  }

  private loadMoves(cache: Phaser.Cache.BaseCache): void {
    const rawData = cache.get('MOVES');
    if (!rawData) {
      throw new Error('Missing required data: MOVES');
    }

    const validatedData = MovesSchema.parse(rawData);
    validatedData.forEach((move) => {
      const typedMove: Move = {
        ...move,
        category: move.category as MoveCategory,
      };
      this.moves.set(typedMove.id, typedMove);
      this.moves.set(typedMove.name.toLowerCase(), typedMove);
    });
  }

  private loadItems(cache: Phaser.Cache.BaseCache): void {
    const rawData = cache.get('ITEMS');
    if (!rawData) {
      throw new Error('Missing required data: ITEMS');
    }

    const validatedData = ItemsSchema.parse(rawData);
    validatedData.forEach((item) => {
      this.items.set(item.id, item);
      this.items.set(item.name.toLowerCase(), item);
    });
  }

  private loadTypes(cache: Phaser.Cache.BaseCache): void {
    const rawData = cache.get('TYPES');
    if (!rawData) {
      throw new Error('Missing required data: TYPES');
    }

    const validatedData = TypeMatrixSchema.parse(rawData);
    validatedData.types.forEach((typeName) => {
      const typeData: CritterType = {
        id: typeName.toLowerCase(),
        name: typeName,
        effectiveness: validatedData.matrix[typeName] || {},
      };
      this.types.set(typeData.id, typeData);
      this.types.set(typeData.name.toLowerCase(), typeData);
    });
  }

  private loadEncounters(cache: Phaser.Cache.BaseCache): void {
    const rawData = cache.get('LEGACY_ENCOUNTERS');
    if (!rawData) {
      console.warn('Missing encounter data: LEGACY_ENCOUNTERS');
      return;
    }

    this.encounters = EncounterDataSchema.parse(rawData);
  }

  private loadEvents(cache: Phaser.Cache.BaseCache): void {
    const rawData = cache.get('EVENTS');
    if (!rawData) {
      console.warn('Missing event data: EVENTS');
      return;
    }

    this.events = rawData as Record<string, EventDetails>;
  }

  private loadSigns(cache: Phaser.Cache.BaseCache): void {
    const rawData = cache.get('SIGNS');
    if (!rawData) {
      console.warn('Missing sign data: SIGNS');
      return;
    }

    this.signs = rawData as Record<string, SignDetails>;
  }

  private loadNpcs(cache: Phaser.Cache.BaseCache): void {
    const rawData = cache.get('NPCS');
    if (!rawData) {
      console.warn('Missing NPC data: NPCS');
      return;
    }

    this.npcs = rawData as Record<string, NpcDetails>;
  }

  private loadShops(cache: Phaser.Cache.BaseCache): void {
    const rawData = cache.get('SHOPS');
    if (!rawData) {
      console.warn('Missing shop data: SHOPS');
      return;
    }

    const shopsArray = rawData as Shop[];
    shopsArray.forEach((shop) => {
      this.shops.set(shop.id, shop);
    });
  }

  private loadLegacyData(cache: Phaser.Cache.BaseCache): void {
    const attacksData = cache.get('LEGACY_ATTACKS');
    if (attacksData) {
      const validatedAttacks = LegacyAttacksSchema.parse(attacksData);
      validatedAttacks.forEach((attack) => {
        this.legacyAttacks.set(attack.id, attack);
      });
    }

    const itemsData = cache.get('LEGACY_ITEMS');
    if (itemsData) {
      const validatedItems = LegacyItemsSchema.parse(itemsData);
      validatedItems.forEach((item) => {
        const typedItem: LegacyItem = {
          ...item,
          category: item.category as ItemCategory,
          effect: item.effect as ItemEffect,
        };
        this.legacyItems.set(typedItem.id, typedItem);
      });
    }

    const monstersData = cache.get('LEGACY_MONSTERS');
    if (monstersData) {
      const validatedMonsters = LegacyMonstersSchema.parse(monstersData);
      validatedMonsters.forEach((monster) => {
        this.legacyMonsters.set(monster.monsterId, monster);
      });
    }
  }

  getCritterById(id: string): Critter | undefined {
    return this.critters.get(id);
  }

  getCritterByName(name: string): Critter | undefined {
    return this.critters.get(name.toLowerCase());
  }

  getAllCritters(): Critter[] {
    return Array.from(this.critters.values());
  }

  getMoveById(id: string): Move | undefined {
    return this.moves.get(id);
  }

  getMoveByName(name: string): Move | undefined {
    return this.moves.get(name.toLowerCase());
  }

  getAllMoves(): Move[] {
    const uniqueMoves = new Set<Move>();
    this.moves.forEach((move) => uniqueMoves.add(move));
    return Array.from(uniqueMoves);
  }

  getItemById(id: string): Item | undefined {
    return this.items.get(id);
  }

  getItemByName(name: string): Item | undefined {
    return this.items.get(name.toLowerCase());
  }

  getAllItems(): Item[] {
    const uniqueItems = new Set<Item>();
    this.items.forEach((item) => uniqueItems.add(item));
    return Array.from(uniqueItems);
  }

  getItemsByCategory(category: string): Item[] {
    return this.getAllItems().filter((item) => item.type === category);
  }

  getTypeById(id: string): CritterType | undefined {
    return this.types.get(id);
  }

  getTypeByName(name: string): CritterType | undefined {
    return this.types.get(name.toLowerCase());
  }

  getAllTypes(): CritterType[] {
    const uniqueTypes = new Set<CritterType>();
    this.types.forEach((type) => uniqueTypes.add(type));
    return Array.from(uniqueTypes);
  }

  getEncounterTable(areaId: string): EncounterTable | undefined {
    const encounterData = this.encounters[areaId];
    if (!encounterData) {
      return undefined;
    }

    const encounters: EncounterEntry[] = encounterData.map(([monsterId, weight]) => ({
      monsterId,
      weight,
    }));

    return {
      areaId,
      encounters,
    };
  }

  getRandomEncounter(areaId: string): number | undefined {
    const table = this.getEncounterTable(areaId);
    if (!table) {
      return undefined;
    }

    const totalWeight = table.encounters.reduce((sum, entry) => sum + entry.weight, 0);
    const random = Math.random() * totalWeight;

    let currentWeight = 0;
    for (const entry of table.encounters) {
      currentWeight += entry.weight;
      if (random <= currentWeight) {
        return entry.monsterId;
      }
    }

    return table.encounters[0]?.monsterId;
  }

  getStarterCritters(): Critter[] {
    const starterIds = ['embolt', 'aqualis', 'thornwick'];
    return starterIds
      .map((id) => this.getCritterById(id))
      .filter((critter): critter is Critter => critter !== undefined);
  }

  getLegacyAttackById(id: number): LegacyAttack | undefined {
    return this.legacyAttacks.get(id);
  }

  getLegacyItemById(id: number): LegacyItem | undefined {
    return this.legacyItems.get(id);
  }

  getLegacyMonsterById(id: number): LegacyMonster | undefined {
    return this.legacyMonsters.get(id);
  }

  getTypeEffectiveness(attackingType: string, defendingType: string): number {
    const type = this.getTypeById(attackingType) || this.getTypeByName(attackingType);
    if (!type) {
      return 1.0;
    }

    return type.effectiveness[defendingType] ?? 1.0;
  }

  getEventData(eventId: string): EventDetails | undefined {
    return this.events[eventId];
  }

  getSignData(signId: string): SignDetails | undefined {
    return this.signs[signId.toString()];
  }

  getNpcData(npcId: number): NpcDetails | undefined {
    return this.npcs[npcId.toString()];
  }

  getShopById(shopId: string): Shop | undefined {
    return this.shops.get(shopId);
  }
}

export const dataLoader = new DataLoader();
