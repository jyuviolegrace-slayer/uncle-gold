import { Data } from 'phaser';

export const DATA_MANAGER_STORE_KEYS = Object.freeze({
  PLAYER_POSITION: 'PLAYER_POSITION',
  PLAYER_DIRECTION: 'PLAYER_DIRECTION',
  PLAYER_LOCATION: 'PLAYER_LOCATION',
  GAME_STARTED: 'GAME_STARTED',
  MONSTERS_IN_PARTY: 'MONSTERS_IN_PARTY',
  INVENTORY: 'INVENTORY',
  ITEMS_PICKED_UP: 'ITEMS_PICKED_UP',
  VIEWED_EVENTS: 'VIEWED_EVENTS',
  FLAGS: 'FLAGS',
});

interface PlayerLocation {
  area: string;
  isInterior: boolean;
}

interface Position {
  x: number;
  y: number;
}

interface GlobalState {
  player: {
    position: Position;
    direction: string;
    location: PlayerLocation;
  };
  gameStarted: boolean;
  monsters: {
    inParty: any[];
  };
  inventory: any[];
  itemsPickedUp: number[];
  viewedEvents: number[];
  flags: string[];
}

const initialState: GlobalState = {
  player: {
    position: {
      x: 400,
      y: 300,
    },
    direction: 'DOWN',
    location: {
      area: 'main_1',
      isInterior: false,
    },
  },
  gameStarted: false,
  monsters: {
    inParty: [],
  },
  inventory: [
    {
      item: {
        id: 1,
      },
      quantity: 10,
    },
    {
      item: {
        id: 2,
      },
      quantity: 5,
    },
  ],
  itemsPickedUp: [],
  viewedEvents: [],
  flags: [],
};

class DataManager {
  public store: Data.DataManager;
  private localStorageKey = 'MONSTER_TAMER_DATA';

  constructor() {
    this.store = new Data.DataManager(new Phaser.Events.EventEmitter());
    this.updateDataManager(initialState);
  }

  getStore(): Data.DataManager {
    return this.store;
  }

  loadData(): void {
    if (typeof Storage === 'undefined') {
      console.warn('localStorage is not supported, will not be able to save and load data.');
      return;
    }

    const savedData = localStorage.getItem(this.localStorageKey);
    if (savedData === null) {
      return;
    }
    
    try {
      const parsedData = JSON.parse(savedData);
      this.updateDataManager(parsedData);
    } catch (error) {
      console.warn('Encountered an error while attempting to load and parse saved data.');
    }
  }

  saveData(): void {
    if (typeof Storage === 'undefined') {
      console.warn('localStorage is not supported, will not be able to save and load data.');
      return;
    }
    
    const dataToSave = this.dataManagerDataToGlobalStateObject();
    localStorage.setItem(this.localStorageKey, JSON.stringify(dataToSave));
  }

  startNewGame(): void {
    const existingData = { ...this.dataManagerDataToGlobalStateObject() };
    existingData.player.position = { ...initialState.player.position };
    existingData.player.location = { ...initialState.player.location };
    existingData.player.direction = initialState.player.direction;
    existingData.gameStarted = initialState.gameStarted;
    existingData.monsters = {
      inParty: [...initialState.monsters.inParty],
    };
    existingData.inventory = initialState.inventory;
    existingData.itemsPickedUp = [...initialState.itemsPickedUp];
    existingData.viewedEvents = [...initialState.viewedEvents];
    existingData.flags = [...initialState.flags];

    this.store.reset();
    this.updateDataManager(existingData);
    this.saveData();
  }

  addItem(item: any, quantity: number): void {
    const inventory = this.store.get(DATA_MANAGER_STORE_KEYS.INVENTORY);
    const existingItem = inventory.find((inventoryItem: any) => {
      return inventoryItem.item.id === item.id;
    });
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      inventory.push({
        item,
        quantity,
      });
    }
    this.store.set(DATA_MANAGER_STORE_KEYS.INVENTORY, inventory);
  }

  addItemPickedUp(itemId: number): void {
    const itemsPickedUp = this.store.get(DATA_MANAGER_STORE_KEYS.ITEMS_PICKED_UP) || [];
    itemsPickedUp.push(itemId);
    this.store.set(DATA_MANAGER_STORE_KEYS.ITEMS_PICKED_UP, itemsPickedUp);
  }

  viewedEvent(eventId: number): void {
    const viewedEvents = new Set(this.store.get(DATA_MANAGER_STORE_KEYS.VIEWED_EVENTS) || []);
    viewedEvents.add(eventId);
    this.store.set(DATA_MANAGER_STORE_KEYS.VIEWED_EVENTS, Array.from(viewedEvents));
  }

  addFlag(flag: string): void {
    const existingFlags = new Set(this.store.get(DATA_MANAGER_STORE_KEYS.FLAGS) || []);
    existingFlags.add(flag);
    this.store.set(DATA_MANAGER_STORE_KEYS.FLAGS, Array.from(existingFlags));
  }

  removeFlag(flag: string): void {
    const existingFlags = new Set(this.store.get(DATA_MANAGER_STORE_KEYS.FLAGS) || []);
    existingFlags.delete(flag);
    this.store.set(DATA_MANAGER_STORE_KEYS.FLAGS, Array.from(existingFlags));
  }

  private updateDataManager(data: GlobalState): void {
    this.store.set({
      [DATA_MANAGER_STORE_KEYS.PLAYER_POSITION]: data.player.position,
      [DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION]: data.player.direction,
      [DATA_MANAGER_STORE_KEYS.PLAYER_LOCATION]: data.player.location || { ...initialState.player.location },
      [DATA_MANAGER_STORE_KEYS.GAME_STARTED]: data.gameStarted,
      [DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY]: data.monsters.inParty,
      [DATA_MANAGER_STORE_KEYS.INVENTORY]: data.inventory,
      [DATA_MANAGER_STORE_KEYS.ITEMS_PICKED_UP]: data.itemsPickedUp || [...initialState.itemsPickedUp],
      [DATA_MANAGER_STORE_KEYS.VIEWED_EVENTS]: data.viewedEvents || [...initialState.viewedEvents],
      [DATA_MANAGER_STORE_KEYS.FLAGS]: data.flags || [...initialState.flags],
    });
  }

  private dataManagerDataToGlobalStateObject(): GlobalState {
    return {
      player: {
        position: {
          x: this.store.get(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION).x,
          y: this.store.get(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION).y,
        },
        direction: this.store.get(DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION),
        location: { ...this.store.get(DATA_MANAGER_STORE_KEYS.PLAYER_LOCATION) },
      },
      gameStarted: this.store.get(DATA_MANAGER_STORE_KEYS.GAME_STARTED),
      monsters: {
        inParty: [...this.store.get(DATA_MANAGER_STORE_KEYS.MONSTERS_IN_PARTY)],
      },
      inventory: this.store.get(DATA_MANAGER_STORE_KEYS.INVENTORY),
      itemsPickedUp: [...(this.store.get(DATA_MANAGER_STORE_KEYS.ITEMS_PICKED_UP) || [])],
      viewedEvents: [...(this.store.get(DATA_MANAGER_STORE_KEYS.VIEWED_EVENTS) || [])],
      flags: [...(this.store.get(DATA_MANAGER_STORE_KEYS.FLAGS) || [])],
    };
  }
}

export const dataManager = new DataManager();