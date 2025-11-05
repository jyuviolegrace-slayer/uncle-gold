import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { Overworld } from './scenes/Overworld';
import { Battle } from './scenes/Battle';
import { Party } from './scenes/Party';
import { Shop } from './scenes/Shop';
import { Menu } from './scenes/Menu';
import { HUD } from './scenes/HUD';
import { Champion } from './scenes/Champion';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        GameOver,
        Overworld,
        Battle,
        Party,
        Shop,
        Menu,
        HUD,
        Champion
    ]
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
