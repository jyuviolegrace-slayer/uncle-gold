import React, { useRef, useState } from 'react';
import { IRefPhaserGame, PhaserGame } from './PhaserGame';
import HUD from './components/HUD';
import MobileControls from './components/MobileControls';
import { SceneKeys } from './game/assets';

function App() {
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [currentScene, setCurrentScene] = useState<string>('Title');
    const [isMobile, setIsMobile] = useState(false);

    const handleSceneChange = (scene: Phaser.Scene) => {
        setCurrentScene(scene.scene.key);
    };

    const handleWindowResize = () => {
        const mobile = window.innerWidth <= 768;
        setIsMobile(mobile);
    };

    React.useEffect(() => {
        handleWindowResize();
        window.addEventListener('resize', handleWindowResize);
        return () => window.removeEventListener('resize', handleWindowResize);
    }, []);

    // Show UI for gameplay scenes, hide for boot/preloader/title/options/gameover
    const showUI = [
        SceneKeys.WORLD,
        SceneKeys.BATTLE,
        SceneKeys.MONSTER_PARTY,
        SceneKeys.MONSTER_DETAILS,
        SceneKeys.INVENTORY,
        SceneKeys.SHOP,
        SceneKeys.MENU,
        SceneKeys.CHAMPION,
        SceneKeys.DIALOG,
        SceneKeys.CUTSCENE
    ].includes(currentScene as SceneKeys);

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} currentActiveScene={handleSceneChange} />
            {showUI && <HUD />}
            {showUI && <MobileControls isMobile={isMobile} />}
        </div>
    );
}

export default App;
