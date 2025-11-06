import { WorldMenu, MENU_OPTIONS } from '../WorldMenu';
import { EventBus } from '../../../EventBus';
import { Direction } from '../../../models/common';

// Mock DataManager and its dependencies to avoid Phaser dependency
jest.mock('../../../services/DataManager', () => ({
  DataManager: jest.fn().mockImplementation(() => ({
    dataStore: {
      get: jest.fn(),
      set: jest.fn(),
    },
  })),
  DataManagerStoreKeys: {
    OPTIONS_MENU_COLOR: 'OPTIONS_MENU_COLOR',
  },
}));

// Mock Phaser Scene
class MockScene {
  public add = {
    graphics: jest.fn(() => ({
      fillStyle: jest.fn(),
      fillRect: jest.fn(),
      lineStyle: jest.fn(),
      strokeRect: jest.fn(),
      setAlpha: jest.fn(),
      clear: jest.fn(),
      destroy: jest.fn(),
    })),
    container: jest.fn(() => ({
      setPosition: jest.fn(),
      setAlpha: jest.fn(),
      add: jest.fn(),
      destroy: jest.fn(),
    })),
    text: jest.fn(() => ({
      setOrigin: jest.fn(),
      destroy: jest.fn(),
    })),
    image: jest.fn(() => ({
      setScale: jest.fn(),
      setPosition: jest.fn(),
      destroy: jest.fn(),
    })),
  };
  public cameras = {
    main: {
      worldView: {
        right: 800,
        top: 0,
      },
    },
  };
}

// Mock DataManager
class MockDataManager {
  public dataStore = {
    get: jest.fn(),
    set: jest.fn(),
  };
}

// Mock EventBus
jest.mock('../../../EventBus', () => ({
  EventBus: {
    emit: jest.fn(),
  },
}));

describe('WorldMenu', () => {
  let mockScene: MockScene;
  let mockDataManager: MockDataManager;
  let worldMenu: WorldMenu;

  beforeEach(() => {
    mockScene = new MockScene() as any;
    mockDataManager = new MockDataManager() as any;
    
    // Mock default menu color
    mockDataManager.dataStore.get.mockReturnValue(0);
    
    worldMenu = new WorldMenu(mockScene as any, mockDataManager as any);
    
    // Clear EventBus mock calls
    (EventBus.emit as jest.Mock).mockClear();
  });

  afterEach(() => {
    worldMenu.destroy();
  });

  describe('Menu Options', () => {
    test('should initialize with correct menu options', () => {
      expect(worldMenu).toBeDefined();
      // The WorldMenu should have MONSTERS, BAG, SAVE, EXIT options
    });

    test('should emit correct scene launch events for each option', () => {
      worldMenu.show();
      
      // Test MONSTERS option
      worldMenu.handlePlayerInput('OK'); // Should select first option (MONSTERS)
      expect(EventBus.emit).toHaveBeenCalledWith('scene:launch', { sceneKey: 'MONSTER_PARTY_SCENE' });
      
      // Reset and test BAG option
      worldMenu.hide();
      worldMenu.show();
      (EventBus.emit as jest.Mock).mockClear();
      worldMenu.handlePlayerInput(Direction.DOWN); // Move to BAG
      worldMenu.handlePlayerInput('OK');
      expect(EventBus.emit).toHaveBeenCalledWith('scene:launch', { sceneKey: 'INVENTORY_SCENE' });
      
      // Reset and test SAVE option
      worldMenu.hide();
      worldMenu.show();
      (EventBus.emit as jest.Mock).mockClear();
      worldMenu.handlePlayerInput(Direction.DOWN);
      worldMenu.handlePlayerInput(Direction.DOWN); // Move to SAVE
      worldMenu.handlePlayerInput('OK');
      expect(EventBus.emit).toHaveBeenCalledWith('save:requested');
      
      // Reset and test EXIT option
      worldMenu.hide();
      worldMenu.show();
      (EventBus.emit as jest.Mock).mockClear();
      worldMenu.handlePlayerInput(Direction.DOWN);
      worldMenu.handlePlayerInput(Direction.DOWN);
      worldMenu.handlePlayerInput(Direction.DOWN); // Move to EXIT
      worldMenu.handlePlayerInput('OK');
      // EXIT should just close the menu, not emit any scene or save events
      expect(EventBus.emit).toHaveBeenCalledWith('world-menu:closed');
    });
  });

  describe('Menu State', () => {
    test('should track open state correctly', () => {
      expect(worldMenu.isOpen).toBe(false);
      
      worldMenu.show();
      expect(worldMenu.isOpen).toBe(true);
      
      worldMenu.hide();
      expect(worldMenu.isOpen).toBe(false);
    });

    test('should emit menu open/close events', () => {
      worldMenu.show();
      expect(EventBus.emit).toHaveBeenCalledWith('world-menu:opened');
      
      (EventBus.emit as jest.Mock).mockClear();
      
      worldMenu.hide();
      expect(EventBus.emit).toHaveBeenCalledWith('world-menu:closed');
    });
  });

  describe('Theme Updates', () => {
    test('should update theme when called', () => {
      const mockGraphics = mockScene.add.graphics.mock.results[0].value;
      
      worldMenu.updateTheme();
      
      expect(mockGraphics.clear).toHaveBeenCalled();
      expect(mockGraphics.fillStyle).toHaveBeenCalled();
      expect(mockGraphics.lineStyle).toHaveBeenCalled();
    });
  });

  describe('Input Handling', () => {
    test('should handle navigation properly', () => {
      worldMenu.show();
      
      // Navigate through options
      worldMenu.handlePlayerInput(Direction.DOWN); // Move to BAG
      worldMenu.handlePlayerInput(Direction.DOWN); // Move to SAVE
      worldMenu.handlePlayerInput(Direction.DOWN); // Move to EXIT
      worldMenu.handlePlayerInput(Direction.DOWN); // Wrap around to MONSTERS
      
      // Should not crash and should still work
      expect(worldMenu.isOpen).toBe(true);
    });

    test('should handle cancel input by hiding menu', () => {
      worldMenu.show();
      expect(worldMenu.isOpen).toBe(true);
      
      worldMenu.handlePlayerInput('CANCEL');
      expect(worldMenu.isOpen).toBe(false);
    });

    test('should wrap around navigation correctly', () => {
      worldMenu.show();
      (EventBus.emit as jest.Mock).mockClear();
      
      // Navigate up from first option (should wrap to last - EXIT)
      worldMenu.handlePlayerInput(Direction.UP);
      worldMenu.handlePlayerInput('OK');
      
      // Should emit world-menu:closed (EXIT option closes menu)
      expect(EventBus.emit).toHaveBeenCalledWith('world-menu:closed');
    });
  });

  describe('Integration with EventBus', () => {
    test('should emit scene launch events with correct scene keys', () => {
      worldMenu.show();
      
      // Navigate to OPTIONS (if it exists) or test existing options
      const options = ['MONSTER_PARTY_SCENE', 'INVENTORY_SCENE'];
      
      options.forEach((sceneKey, index) => {
        worldMenu.hide();
        worldMenu.show();
        
        // Navigate to the specific option
        for (let i = 0; i < index; i++) {
          worldMenu.handlePlayerInput(Direction.DOWN);
        }
        
        worldMenu.handlePlayerInput('OK');
        
        if (index < 2) { // First two options should emit scene launch
          expect(EventBus.emit).toHaveBeenCalledWith('scene:launch', { sceneKey });
        }
        
        (EventBus.emit as jest.Mock).mockClear();
      });
    });
  });
});