import { ConfirmationMenu, CONFIRMATION_MENU_OPTIONS } from '../ConfirmationMenu';
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

describe('ConfirmationMenu', () => {
  let mockScene: MockScene;
  let mockDataManager: MockDataManager;
  let confirmationMenu: ConfirmationMenu;

  beforeEach(() => {
    mockScene = new MockScene() as any;
    mockDataManager = new MockDataManager() as any;
    
    // Mock default menu color
    mockDataManager.dataStore.get.mockReturnValue(0);
    
    confirmationMenu = new ConfirmationMenu(mockScene as any, mockDataManager as any);
  });

  afterEach(() => {
    confirmationMenu.destroy();
  });

  describe('Initialization', () => {
    test('should initialize with YES and NO options', () => {
      expect(confirmationMenu).toBeDefined();
      expect(confirmationMenu.selectedMenuOptionValue).toBeUndefined();
    });

    test('should have correct menu options', () => {
      confirmationMenu.show();
      confirmationMenu.handlePlayerInput(Direction.DOWN); // Select NO
      confirmationMenu.handlePlayerInput('OK');
      
      expect(confirmationMenu.getSelectedOption()).toBe(CONFIRMATION_MENU_OPTIONS.NO);
    });
  });

  describe('Selection Methods', () => {
    test('should return undefined when no option is selected', () => {
      expect(confirmationMenu.getSelectedOption()).toBeUndefined();
      expect(confirmationMenu.isConfirmed()).toBe(false);
      expect(confirmationMenu.isCancelled()).toBe(false);
    });

    test('should return YES when YES option is selected', () => {
      confirmationMenu.show();
      confirmationMenu.handlePlayerInput('OK'); // Select YES (first option)
      
      expect(confirmationMenu.getSelectedOption()).toBe(CONFIRMATION_MENU_OPTIONS.YES);
      expect(confirmationMenu.isConfirmed()).toBe(true);
      expect(confirmationMenu.isCancelled()).toBe(false);
    });

    test('should return NO when NO option is selected', () => {
      confirmationMenu.show();
      confirmationMenu.handlePlayerInput(Direction.DOWN); // Move to NO
      confirmationMenu.handlePlayerInput('OK');
      
      expect(confirmationMenu.getSelectedOption()).toBe(CONFIRMATION_MENU_OPTIONS.NO);
      expect(confirmationMenu.isConfirmed()).toBe(false);
      expect(confirmationMenu.isCancelled()).toBe(true);
    });

    test('should reset selection when menu is hidden', () => {
      confirmationMenu.show();
      confirmationMenu.handlePlayerInput(Direction.DOWN); // Select NO
      confirmationMenu.handlePlayerInput('OK');
      
      expect(confirmationMenu.getSelectedOption()).toBe(CONFIRMATION_MENU_OPTIONS.NO);
      
      confirmationMenu.hide();
      
      // Selection should be reset after hiding
      expect(confirmationMenu.getSelectedOption()).toBeUndefined();
    });
  });

  describe('Navigation', () => {
    test('should wrap around from NO to YES', () => {
      confirmationMenu.show();
      
      confirmationMenu.handlePlayerInput(Direction.DOWN); // Move to NO
      confirmationMenu.handlePlayerInput(Direction.DOWN); // Wrap to YES
      confirmationMenu.handlePlayerInput('OK');
      
      expect(confirmationMenu.isConfirmed()).toBe(true);
    });

    test('should wrap around from YES to NO', () => {
      confirmationMenu.show();
      
      confirmationMenu.handlePlayerInput(Direction.UP); // Wrap to NO
      confirmationMenu.handlePlayerInput('OK');
      
      expect(confirmationMenu.isCancelled()).toBe(true);
    });

    test('should not change selection with left/right navigation', () => {
      confirmationMenu.show();
      
      confirmationMenu.handlePlayerInput(Direction.LEFT);
      expect(confirmationMenu.getSelectedOption()).toBeUndefined();
      
      confirmationMenu.handlePlayerInput(Direction.RIGHT);
      expect(confirmationMenu.getSelectedOption()).toBeUndefined();
    });
  });

  describe('Cancel Behavior', () => {
    test('should hide menu when CANCEL is pressed', () => {
      confirmationMenu.show();
      expect(confirmationMenu.isVisible).toBe(true);
      
      confirmationMenu.handlePlayerInput('CANCEL');
      expect(confirmationMenu.isVisible).toBe(false);
    });

    test('should reset selection when CANCEL is pressed', () => {
      confirmationMenu.show();
      confirmationMenu.handlePlayerInput(Direction.DOWN); // Select NO
      confirmationMenu.handlePlayerInput('CANCEL');
      
      expect(confirmationMenu.getSelectedOption()).toBeUndefined();
    });
  });

  describe('Type Safety', () => {
    test('should only return valid confirmation options', () => {
      confirmationMenu.show();
      
      // Select YES
      confirmationMenu.handlePlayerInput('OK');
      const selectedOption = confirmationMenu.getSelectedOption();
      
      // Should be either 'YES' or 'NO'
      expect(selectedOption === 'YES' || selectedOption === 'NO').toBe(true);
    });

    test('should handle type assertions correctly', () => {
      confirmationMenu.show();
      confirmationMenu.handlePlayerInput('OK');
      
      // These should not throw TypeScript errors
      const isConfirmed = confirmationMenu.isConfirmed();
      const isCancelled = confirmationMenu.isCancelled();
      
      expect(typeof isConfirmed).toBe('boolean');
      expect(typeof isCancelled).toBe('boolean');
    });
  });

  describe('Edge Cases', () => {
    test('should handle rapid successive inputs', () => {
      confirmationMenu.show();
      
      // Rapid navigation
      for (let i = 0; i < 10; i++) {
        confirmationMenu.handlePlayerInput(Direction.DOWN);
      }
      
      // Should still be at a valid option when selected
      confirmationMenu.handlePlayerInput('OK');
      expect(['YES', 'NO']).toContain(confirmationMenu.getSelectedOption());
    });

    test('should handle show/hide cycles correctly', () => {
      for (let i = 0; i < 5; i++) {
        confirmationMenu.show();
        confirmationMenu.handlePlayerInput(Direction.DOWN);
        confirmationMenu.handlePlayerInput('OK');
        
        expect(confirmationMenu.isCancelled()).toBe(true);
        
        confirmationMenu.hide();
        expect(confirmationMenu.getSelectedOption()).toBeUndefined();
      }
    });
  });
});