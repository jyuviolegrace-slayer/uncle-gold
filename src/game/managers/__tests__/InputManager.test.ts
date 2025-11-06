import { InputManager } from '../InputManager';
import { Direction } from '../../models/common';
import { Scene } from 'phaser';

// Mock Phaser Scene for testing
class MockScene {
  public input = {
    keyboard: {
      createCursorKeys: jest.fn(),
      addKey: jest.fn(),
    },
  };
  public events = {
    on: jest.fn(),
    off: jest.fn(),
  };
  public time = {
    now: Date.now(),
  };

  constructor() {
    // Mock cursor keys
    const mockCursorKeys = {
      left: { isDown: false },
      right: { isDown: false },
      up: { isDown: false },
      down: { isDown: false },
      space: { isDown: false },
      shift: { isDown: false },
    };

    // Mock JustDown function
    Object.keys(mockCursorKeys).forEach(key => {
      mockCursorKeys[key].isDown = false;
    });

    // Mock Phaser.Input.Keyboard.JustDown
    jest.mock('phaser', () => ({
      Input: {
        Keyboard: {
          JustDown: jest.fn((key) => {
            return (key as any).mockJustDown || false;
          }),
        },
        KeyCodes: {
          ENTER: 'ENTER',
          ESC: 'ESC',
          SPACE: 'SPACE',
          F: 'F',
        },
      },
    }));

    this.input.keyboard.createCursorKeys.mockReturnValue(mockCursorKeys);
    this.input.keyboard.addKey.mockReturnValue({ mockJustDown: false });
  }
}

describe('InputManager', () => {
  let inputManager: InputManager;
  let mockScene: any;

  beforeEach(() => {
    mockScene = new MockScene() as unknown as Scene;
    inputManager = new InputManager(mockScene);
  });

  afterEach(() => {
    inputManager.destroy();
  });

  describe('Input Locking', () => {
    test('should start with input unlocked', () => {
      expect(inputManager.isInputLocked).toBe(false);
    });

    test('should lock input', () => {
      inputManager.lockInput();
      expect(inputManager.isInputLocked).toBe(true);
    });

    test('should unlock input', () => {
      inputManager.lockInput();
      inputManager.unlockInput();
      expect(inputManager.isInputLocked).toBe(false);
    });

    test('should set input lock via property', () => {
      inputManager.lockInput = true;
      expect(inputManager.isInputLocked).toBe(true);
      
      inputManager.lockInput = false;
      expect(inputManager.isInputLocked).toBe(false);
    });
  });

  describe('Input State', () => {
    test('should return default input state when unlocked', () => {
      const state = inputManager.getInputState();
      
      expect(state).toEqual({
        directionPressed: Direction.NONE,
        directionDown: Direction.NONE,
        confirmPressed: false,
        cancelPressed: false,
        menuPressed: false,
        shiftDown: false,
      });
    });

    test('should return neutral input state when locked', () => {
      inputManager.lockInput();
      const state = inputManager.getInputState();
      
      expect(state).toEqual({
        directionPressed: Direction.NONE,
        directionDown: Direction.NONE,
        confirmPressed: false,
        cancelPressed: false,
        menuPressed: false,
        shiftDown: false,
      });
    });
  });

  describe('Synthetic Input', () => {
    test('should enable synthetic input', () => {
      inputManager.enableSyntheticInput();
      inputManager.simulateDirectionPress(Direction.UP);
      
      const state = inputManager.getInputState();
      expect(state.directionPressed).toBe(Direction.UP);
    });

    test('should disable synthetic input', () => {
      inputManager.enableSyntheticInput();
      inputManager.disableSyntheticInput();
      inputManager.simulateDirectionPress(Direction.UP);
      
      const state = inputManager.getInputState();
      expect(state.directionPressed).toBe(Direction.NONE);
    });

    test('should simulate confirm press', () => {
      inputManager.enableSyntheticInput();
      const result = inputManager.simulateConfirmPress();
      
      expect(result).toBe(true);
    });

    test('should simulate cancel press', () => {
      inputManager.enableSyntheticInput();
      const result = inputManager.simulateCancelPress();
      
      expect(result).toBe(true);
    });

    test('should not simulate confirm when locked', () => {
      inputManager.lockInput();
      inputManager.enableSyntheticInput();
      const result = inputManager.simulateConfirmPress();
      
      expect(result).toBe(false);
    });
  });

  describe('Direction Input', () => {
    test('should return no direction when no keys pressed', () => {
      const justPressed = inputManager.getDirectionKeyJustPressed();
      const heldDown = inputManager.getDirectionKeyPressedDown();
      
      expect(justPressed).toBe(Direction.NONE);
      expect(heldDown).toBe(Direction.NONE);
    });
  });

  describe('Event Cleanup', () => {
    test('should clean up event listeners on destroy', () => {
      const offSpy = jest.spyOn(mockScene.events, 'off');
      
      inputManager.destroy();
      
      expect(offSpy).toHaveBeenCalledWith('mobile:direction');
      expect(offSpy).toHaveBeenCalledWith('mobile:confirm');
      expect(offSpy).toHaveBeenCalledWith('mobile:cancel');
    });
  });
});

describe('InputManager Integration', () => {
  test('should handle missing keyboard gracefully', () => {
    const sceneWithoutKeyboard = {
      input: {},
      events: {
        on: jest.fn(),
        off: jest.fn(),
      },
    } as unknown as Scene;

    expect(() => {
      const manager = new InputManager(sceneWithoutKeyboard);
      manager.destroy();
    }).not.toThrow();
  });
});