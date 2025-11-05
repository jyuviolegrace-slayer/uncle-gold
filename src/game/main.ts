import { Boot } from "./scenes/Boot";
import { GameOver } from "./scenes/GameOver";
import { Title } from "./scenes/Title";
import { Options } from "./scenes/Options";
import { AUTO, Game } from "phaser";
import { Preloader } from "./scenes/Preloader";
import { Overworld } from "./scenes/Overworld";
import { Battle } from "./scenes/Battle";
import { Party } from "./scenes/Party";
import { Shop } from "./scenes/Shop";
import { Menu } from "./scenes/Menu";
import { HUD } from "./scenes/HUD";
import { Champion } from "./scenes/Champion";
import { Dialog } from "./scenes/Dialog";
import { Cutscene } from "./scenes/Cutscene";
import { Inventory } from "./scenes/Inventory";
import { MonsterParty } from "./scenes/MonsterParty";
import { MonsterDetails } from "./scenes/MonsterDetails";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: "game-container",
    backgroundColor: "#028af8",
    physics: {
        default: "arcade",
        arcade: {
            debug: true,
            gravity: { y: 0 },
        },
    },
    scene: [
        Boot,
        Preloader,
        Title,
        Options,
        GameOver,
        Overworld,
        Battle,
        Party,
        Shop,
        Menu,
        HUD,
        Champion,
        Dialog,
        Cutscene,
        Inventory,
        MonsterParty,
        MonsterDetails,
    ],
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartGame;

