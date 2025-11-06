import { Data } from "phaser";
import { EventBus } from "../EventBus";
import { Direction, GameFlag } from "../models/common";
import { InventoryItem, LegacyInventoryItem } from "../models/item";
import { CritterInstance } from "../models/critter";
import { dataLoader } from "../data/DataLoader";

export enum DataManagerStoreKeys {
    PLAYER_POSITION = "PLAYER_POSITION",
    PLAYER_DIRECTION = "PLAYER_DIRECTION",
    PLAYER_LOCATION = "PLAYER_LOCATION",
    OPTIONS_TEXT_SPEED = "OPTIONS_TEXT_SPEED",
    OPTIONS_BATTLE_SCENE_ANIMATIONS = "OPTIONS_BATTLE_SCENE_ANIMATIONS",
    OPTIONS_BATTLE_STYLE = "OPTIONS_BATTLE_STYLE",
    OPTIONS_SOUND = "OPTIONS_SOUND",
    OPTIONS_VOLUME = "OPTIONS_VOLUME",
    OPTIONS_MENU_COLOR = "OPTIONS_MENU_COLOR",
    GAME_STARTED = "GAME_STARTED",
    CRITTERS_IN_PARTY = "CRITTERS_IN_PARTY",
    INVENTORY = "INVENTORY",
    ITEMS_PICKED_UP = "ITEMS_PICKED_UP",
    VIEWED_EVENTS = "VIEWED_EVENTS",
    FLAGS = "FLAGS",
    MONEY = "MONEY",
}

export enum TextSpeedOptions {
    FAST = "FAST",
    MID = "MID",
    SLOW = "SLOW",
}

export enum BattleSceneOptions {
    ON = "ON",
    OFF = "OFF",
}

export enum BattleStyleOptions {
    SHIFT = "SHIFT",
    SET = "SET",
}

export enum SoundOptions {
    ON = "ON",
    OFF = "OFF",
}

export interface PlayerPosition {
    x: number;
    y: number;
}

export interface PlayerLocation {
    area: string;
    isInterior: boolean;
}

export interface GameOptions {
    textSpeed: TextSpeedOptions;
    battleSceneAnimations: BattleSceneOptions;
    battleStyle: BattleStyleOptions;
    sound: SoundOptions;
    volume: number;
    menuColor: number;
}

export interface PlayerData {
    position: PlayerPosition;
    direction: Direction;
    location: PlayerLocation;
}

export interface MonstersData {
    inParty: CritterInstance[];
}

export interface GlobalState {
    player: PlayerData;
    options: GameOptions;
    gameStarted: boolean;
    monsters: MonstersData;
    inventory: LegacyInventoryItem[];
    itemsPickedUp: number[];
    viewedEvents: number[];
    flags: GameFlag[];
    money: number;
}

const LOCAL_STORAGE_KEY = "CRITTER_QUEST_DATA";

const initialState: GlobalState = {
    player: {
        position: {
            x: 0,
            y: 0,
        },
        direction: Direction.DOWN,
        location: {
            area: "main_1",
            isInterior: false,
        },
    },
    options: {
        textSpeed: TextSpeedOptions.MID,
        battleSceneAnimations: BattleSceneOptions.ON,
        battleStyle: BattleStyleOptions.SHIFT,
        sound: SoundOptions.ON,
        volume: 4,
        menuColor: 0,
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
    money: 1000,
};

export class DataManager extends Phaser.Events.EventEmitter {
    private store: Data.DataManager;
    private eventBus: typeof EventBus;

    constructor() {
        super();
        this.eventBus = EventBus;
        this.store = new Data.DataManager(this);
        this.initializeState(initialState);
    }

    get dataStore(): Data.DataManager {
        return this.store;
    }

    loadData(): void {
        if (typeof Storage === "undefined") {
            console.warn(
                "[DataManager:loadData] localStorage is not supported, will not be able to save and load data."
            );
            return;
        }

        const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedData === null) {
            return;
        }

        try {
            const parsedData: GlobalState = JSON.parse(savedData);
            this.updateDataManager(parsedData);
        } catch (error) {
            console.warn(
                "[DataManager:loadData] encountered an error while attempting to load and parse saved data.",
                error
            );
        }
    }

    saveData(): void {
        if (typeof Storage === "undefined") {
            console.warn(
                "[DataManager:saveData] localStorage is not supported, will not be able to save and load data."
            );
            return;
        }
        const dataToSave = this.dataManagerDataToGlobalStateObject();
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
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
        existingData.money = initialState.money;

        this.store.reset();
        this.updateDataManager(existingData);
        this.saveData();

        // Emit events for HUD update
        this.eventBus.emit("money:updated", existingData.money);
        this.eventBus.emit("party:updated", existingData.monsters.inParty);
        this.eventBus.emit("inventory:updated", existingData.inventory);
    }

    getAnimatedTextSpeed(): number {
        const TEXT_SPEEDS = {
            [TextSpeedOptions.FAST]: 20,
            [TextSpeedOptions.MID]: 40,
            [TextSpeedOptions.SLOW]: 60,
        };

        const chosenTextSpeed = this.store.get(
            DataManagerStoreKeys.OPTIONS_TEXT_SPEED
        ) as TextSpeedOptions;
        return (
            TEXT_SPEEDS[chosenTextSpeed] || TEXT_SPEEDS[TextSpeedOptions.MID]
        );
    }

    getInventory(): InventoryItem[] {
        const items: InventoryItem[] = [];
        const inventory = this.store.get(
            DataManagerStoreKeys.INVENTORY
        ) as LegacyInventoryItem[];

        inventory.forEach((baseItem) => {
            const item = dataLoader.getItemById(baseItem.item.id.toString());
            if (item) {
                items.push({
                    item: item,
                    quantity: baseItem.quantity,
                });
            }
        });
        return items;
    }

    updateInventory(items: InventoryItem[]): void {
        const inventory: LegacyInventoryItem[] = items.map((item) => {
            return {
                item: {
                    id: parseInt(item.item.id, 10),
                },
                quantity: item.quantity,
            };
        });
        this.store.set(DataManagerStoreKeys.INVENTORY, inventory);
        this.eventBus.emit("inventory:updated", inventory);
    }

    addItem(item: { id: string }, quantity: number): void {
        const inventory = this.store.get(
            DataManagerStoreKeys.INVENTORY
        ) as LegacyInventoryItem[];
        const existingItem = inventory.find((inventoryItem) => {
            return inventoryItem.item.id.toString() === item.id;
        });

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            inventory.push({
                item: {
                    id: parseInt(item.id, 10),
                },
                quantity,
            });
        }
        this.store.set(DataManagerStoreKeys.INVENTORY, inventory);
        this.eventBus.emit("inventory:updated", inventory);
    }

    addItemPickedUp(itemId: number): void {
        const itemsPickedUp =
            (this.store.get(
                DataManagerStoreKeys.ITEMS_PICKED_UP
            ) as number[]) || [];
        itemsPickedUp.push(itemId);
        this.store.set(DataManagerStoreKeys.ITEMS_PICKED_UP, itemsPickedUp);
    }

    isPartyFull(): boolean {
        const partySize =
            (this.store.get(
                DataManagerStoreKeys.CRITTERS_IN_PARTY
            ) as CritterInstance[]) || [];
        return partySize.length >= 6;
    }

    getParty(): CritterInstance[] {
        return (
            (this.store.get(
                DataManagerStoreKeys.CRITTERS_IN_PARTY
            ) as CritterInstance[]) || []
        );
    }

    addToParty(critter: CritterInstance): void {
        const party = this.getParty();
        if (party.length < 6) {
            party.push(critter);
            this.store.set(DataManagerStoreKeys.CRITTERS_IN_PARTY, party);
            this.eventBus.emit("party:updated", party);
        }
    }

    removeFromParty(critterId: string): void {
        const party = this.getParty();
        const updatedParty = party.filter((c) => c.id !== critterId);
        this.store.set(DataManagerStoreKeys.CRITTERS_IN_PARTY, updatedParty);
        this.eventBus.emit("party:updated", updatedParty);
    }

    getMoney(): number {
        return (this.store.get(DataManagerStoreKeys.MONEY) as number) || 0;
    }

    addMoney(amount: number): void {
        const currentMoney = this.getMoney();
        const newMoney = currentMoney + amount;
        this.store.set(DataManagerStoreKeys.MONEY, newMoney);
        this.eventBus.emit("money:updated", newMoney);
    }

    subtractMoney(amount: number): boolean {
        const currentMoney = this.getMoney();
        if (currentMoney >= amount) {
            const newMoney = currentMoney - amount;
            this.store.set(DataManagerStoreKeys.MONEY, newMoney);
            this.eventBus.emit("money:updated", newMoney);
            return true;
        }
        return false;
    }

    viewedEvent(eventId: number): void {
        const viewedEvents = new Set(
            (this.store.get(DataManagerStoreKeys.VIEWED_EVENTS) as number[]) ||
                []
        );
        viewedEvents.add(eventId);
        this.store.set(
            DataManagerStoreKeys.VIEWED_EVENTS,
            Array.from(viewedEvents)
        );
    }

    getFlags(): Set<GameFlag> {
        return new Set(
            (this.store.get(DataManagerStoreKeys.FLAGS) as GameFlag[]) || []
        );
    }

    addFlag(flag: GameFlag): void {
        const existingFlags = new Set(
            (this.store.get(DataManagerStoreKeys.FLAGS) as GameFlag[]) || []
        );
        existingFlags.add(flag);
        this.store.set(DataManagerStoreKeys.FLAGS, Array.from(existingFlags));
    }

    removeFlag(flag: GameFlag): void {
        const existingFlags = new Set(
            (this.store.get(DataManagerStoreKeys.FLAGS) as GameFlag[]) || []
        );
        existingFlags.delete(flag);
        this.store.set(DataManagerStoreKeys.FLAGS, Array.from(existingFlags));
    }

    hasFlag(flag: GameFlag): boolean {
        const flags = this.getFlags();
        return flags.has(flag);
    }

    private initializeState(data: GlobalState): void {
        this.updateDataManager(data);
    }

    private updateDataManager(data: GlobalState): void {
        this.store.set({
            [DataManagerStoreKeys.PLAYER_POSITION]: data.player.position,
            [DataManagerStoreKeys.PLAYER_DIRECTION]: data.player.direction,
            [DataManagerStoreKeys.PLAYER_LOCATION]: data.player.location || {
                ...initialState.player.location,
            },
            [DataManagerStoreKeys.OPTIONS_TEXT_SPEED]: data.options.textSpeed,
            [DataManagerStoreKeys.OPTIONS_BATTLE_SCENE_ANIMATIONS]:
                data.options.battleSceneAnimations,
            [DataManagerStoreKeys.OPTIONS_BATTLE_STYLE]:
                data.options.battleStyle,
            [DataManagerStoreKeys.OPTIONS_SOUND]: data.options.sound,
            [DataManagerStoreKeys.OPTIONS_VOLUME]: data.options.volume,
            [DataManagerStoreKeys.OPTIONS_MENU_COLOR]: data.options.menuColor,
            [DataManagerStoreKeys.GAME_STARTED]: data.gameStarted,
            [DataManagerStoreKeys.CRITTERS_IN_PARTY]: data.monsters.inParty,
            [DataManagerStoreKeys.INVENTORY]: data.inventory,
            [DataManagerStoreKeys.ITEMS_PICKED_UP]: data.itemsPickedUp || [
                ...initialState.itemsPickedUp,
            ],
            [DataManagerStoreKeys.VIEWED_EVENTS]: data.viewedEvents || [
                ...initialState.viewedEvents,
            ],
            [DataManagerStoreKeys.FLAGS]: data.flags || [...initialState.flags],
            [DataManagerStoreKeys.MONEY]: data.money || initialState.money,
        });
    }

    private dataManagerDataToGlobalStateObject(): GlobalState {
        return {
            player: {
                position: {
                    x:
                        (
                            this.store.get(
                                DataManagerStoreKeys.PLAYER_POSITION
                            ) as PlayerPosition
                        )?.x || 0,
                    y:
                        (
                            this.store.get(
                                DataManagerStoreKeys.PLAYER_POSITION
                            ) as PlayerPosition
                        )?.y || 0,
                },
                direction:
                    (this.store.get(
                        DataManagerStoreKeys.PLAYER_DIRECTION
                    ) as Direction) || Direction.DOWN,
                location: {
                    ...(this.store.get(
                        DataManagerStoreKeys.PLAYER_LOCATION
                    ) as PlayerLocation),
                },
            },
            options: {
                textSpeed:
                    (this.store.get(
                        DataManagerStoreKeys.OPTIONS_TEXT_SPEED
                    ) as TextSpeedOptions) || TextSpeedOptions.MID,
                battleSceneAnimations:
                    (this.store.get(
                        DataManagerStoreKeys.OPTIONS_BATTLE_SCENE_ANIMATIONS
                    ) as BattleSceneOptions) || BattleSceneOptions.ON,
                battleStyle:
                    (this.store.get(
                        DataManagerStoreKeys.OPTIONS_BATTLE_STYLE
                    ) as BattleStyleOptions) || BattleStyleOptions.SHIFT,
                sound:
                    (this.store.get(
                        DataManagerStoreKeys.OPTIONS_SOUND
                    ) as SoundOptions) || SoundOptions.ON,
                volume:
                    (this.store.get(
                        DataManagerStoreKeys.OPTIONS_VOLUME
                    ) as number) || 4,
                menuColor:
                    (this.store.get(
                        DataManagerStoreKeys.OPTIONS_MENU_COLOR
                    ) as number) || 0,
            },
            gameStarted:
                (this.store.get(
                    DataManagerStoreKeys.GAME_STARTED
                ) as boolean) || false,
            monsters: {
                inParty: [
                    ...((this.store.get(
                        DataManagerStoreKeys.CRITTERS_IN_PARTY
                    ) as CritterInstance[]) || []),
                ],
            },
            inventory:
                (this.store.get(
                    DataManagerStoreKeys.INVENTORY
                ) as LegacyInventoryItem[]) || [],
            itemsPickedUp: [
                ...((this.store.get(
                    DataManagerStoreKeys.ITEMS_PICKED_UP
                ) as number[]) || []),
            ],
            viewedEvents: [
                ...((this.store.get(
                    DataManagerStoreKeys.VIEWED_EVENTS
                ) as number[]) || []),
            ],
            flags: [
                ...((this.store.get(
                    DataManagerStoreKeys.FLAGS
                ) as GameFlag[]) || []),
            ],
            money: (this.store.get(DataManagerStoreKeys.MONEY) as number) || 0,
        };
    }
}

export const dataManager = new DataManager();

