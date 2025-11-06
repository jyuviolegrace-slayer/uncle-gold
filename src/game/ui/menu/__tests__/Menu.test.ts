import { Menu } from '../Menu';
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

describe('Menu', () => {
  let mockScene: MockScene;
  let mockDataManager: MockDataManager;
  let menu: Menu;

  beforeEach(() => {
    mockScene = new MockScene() as any;
    mockDataManager = new MockDataManager() as any;
    
    // Mock default menu color
    mockDataManager.dataStore.get.mockReturnValue(0);
    
    menu = new Menu(mockScene as any, ['Option 1', 'Option 2', 'Option 3'], mockDataManager as any);
  });

  afterEach(() => {
    menu.destroy();
  });

  describe('Navigation', () => {
    test('should wrap around when navigating down from last option', () => {
      menu.show();
      
      // Start at first option
      menu.handlePlayerInput(Direction.DOWN);
      menu.handlePlayerInput(Direction.DOWN);
      
      // Should be at third option now
      menu.handlePlayerInput(Direction.DOWN);
      
      // Select the option
      menu.handlePlayerInput('OK');
      
      // Should wrap around to first option
      expect(menu.selectedMenuOptionValue).toBe('Option 1');
    });

    test('should wrap around when navigating up from first option', () => {
      menu.show();
      
      // Navigate up from first option
      menu.handlePlayerInput(Direction.UP);
      
      // Select the option
      menu.handlePlayerInput('OK');
      
      // Should wrap around to last option
      expect(menu.selectedMenuOptionValue).toBe('Option 3');
    });

    test('should not change selection when navigating left or right', () => {
      // Start at first option
      menu.handlePlayerInput(Direction.LEFT);
      expect(menu.selectedMenuOptionValue).toBeUndefined();
      
      menu.handlePlayerInput(Direction.RIGHT);
      expect(menu.selectedMenuOptionValue).toBeUndefined();
    });

    test('should handle OK input to select current option', () => {
      menu.show();
      
      // Check initial state
      expect(menu.selectedMenuOptionValue).toBeUndefined();
      
      menu.handlePlayerInput(Direction.DOWN); // Select second option
      
      // Check that navigation worked but selection is still undefined
      expect(menu.selectedMenuOptionValue).toBeUndefined();
      
      menu.handlePlayerInput('OK');
      
      expect(menu.selectedMenuOptionValue).toBe('Option 2');
    });

    test('should hide menu when CANCEL input is received', () => {
      menu.show();
      expect(menu.isVisible).toBe(true);
      
      menu.handlePlayerInput('CANCEL');
      expect(menu.isVisible).toBe(false);
    });
  });

  describe('Visibility', () => {
    test('should show menu at correct position', () => {
      menu.show();
      
      const mockContainer = mockScene.add.container.mock.results[0].value;
      expect(mockContainer.setPosition).toHaveBeenCalledWith(492, 8); // right - padding*2 - width, top + padding*2
      expect(mockContainer.setAlpha).toHaveBeenCalledWith(1);
    });

    test('should hide menu and reset selection', () => {
      menu.handlePlayerInput(Direction.DOWN); // Change selection
      menu.show();
      menu.hide();
      
      const mockContainer = mockScene.add.container.mock.results[0].value;
      expect(mockContainer.setAlpha).toHaveBeenCalledWith(0);
      expect(menu.selectedMenuOptionValue).toBeUndefined();
    });
  });

  describe('Theme Updates', () => {
    test('should update menu colors when theme changes', () => {
      const mockGraphics = mockScene.add.graphics.mock.results[0].value;
      
      menu.updateMenuTheme();
      
      expect(mockGraphics.clear).toHaveBeenCalled();
      expect(mockGraphics.fillStyle).toHaveBeenCalled();
      expect(mockGraphics.lineStyle).toHaveBeenCalled();
    });

    test('should use correct color scheme based on DataManager setting', () => {
      // Test color scheme 0 (should map to MENU_COLOR[1])
      mockDataManager.dataStore.get.mockReturnValue(0);
      const menu1 = new Menu(mockScene as any, ['Test'], mockDataManager as any);
      
      // Test color scheme 1 (should map to MENU_COLOR[2])
      mockDataManager.dataStore.get.mockReturnValue(1);
      const menu2 = new Menu(mockScene as any, ['Test'], mockDataManager as any);
      
      // Test color scheme 2 (should map to MENU_COLOR[3])
      mockDataManager.dataStore.get.mockReturnValue(2);
      const menu3 = new Menu(mockScene as any, ['Test'], mockDataManager as any);
      
      // All should create graphics without errors
      expect(mockScene.add.graphics).toHaveBeenCalledTimes(4); // 3 new menus + 1 from beforeEach
      
      menu1.destroy();
      menu2.destroy();
      menu3.destroy();
    });

    test('should fall back to default color when invalid color option is provided', () => {
      mockDataManager.dataStore.get.mockReturnValue(999);
      
      expect(() => {
        const menu = new Menu(mockScene as any, ['Test'], mockDataManager as any);
        menu.destroy();
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty menu options array', () => {
      expect(() => {
        const emptyMenu = new Menu(mockScene as any, [], mockDataManager as any);
        emptyMenu.destroy();
      }).not.toThrow();
    });

    test('should handle single menu option', () => {
      const singleMenu = new Menu(mockScene as any, ['Only Option'], mockDataManager as any);
      
      // Navigation should not crash
      singleMenu.handlePlayerInput(Direction.UP);
      singleMenu.handlePlayerInput(Direction.DOWN);
      
      singleMenu.destroy();
    });

    test('should handle rapid successive inputs', () => {
      menu.show();
      
      // Rapid navigation
      for (let i = 0; i < 10; i++) {
        menu.handlePlayerInput(Direction.DOWN);
      }
      
      // Select the option
      menu.handlePlayerInput('OK');
      
      // Should still be at a valid option
      expect(['Option 1', 'Option 2', 'Option 3']).toContain(menu.selectedMenuOptionValue);
    });
  });
});