import React, { useRef, useState } from 'react';
import { IRefPhaserGame, PhaserGame } from './PhaserGame';
import HUD from './components/HUD';
import MobileControls from './components/MobileControls';

function App() {
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [currentScene, setCurrentScene] = useState<string>('MainMenu');
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

    const showUI = ['Overworld', 'Battle', 'Party', 'Shop', 'Menu', 'HUD', 'Inventory', 'MonsterParty', 'MonsterDetails'].includes(currentScene);

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} currentActiveScene={handleSceneChange} />
            {showUI && <HUD />}
            {showUI && <MobileControls isMobile={isMobile} />}
        </div>
    );
}

export default App;
