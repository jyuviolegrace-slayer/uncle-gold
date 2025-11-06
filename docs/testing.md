# Testing Documentation

## Overview

This project uses Jest with ts-jest for unit and integration testing. Tests are written in TypeScript and cover core game flows and functionality.

## Running Tests

### Run All Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Structure

Tests are located in `__tests__` directories alongside the source code they test. Each test file ends with `.test.ts`.

Example structure:
```
src/game/
├── scenes/
│   ├── Boot.ts
│   ├── Preloader.ts
│   └── __tests__/
│       ├── SceneBoot.test.ts
│       ├── OverworldEncounter.test.ts
│       └── BattleFlow.test.ts
```

## Test Categories

### 1. Smoke Tests
Verify that core modules load without errors and have expected structure.

**Example:** `SceneBoot.test.ts`
- Verifies Boot and Preloader scenes exist
- Checks scene structure and lifecycle methods
- Validates TypeScript type annotations

### 2. Unit Tests
Test individual functions and classes in isolation.

**Examples:**
- `DataLoader.test.ts` - Data parsing and validation
- `SaveService.test.ts` - Save/load functionality
- `InputManager.test.ts` - Input handling
- `Menu.test.ts` - Menu navigation and rendering

### 3. Integration Tests
Test interactions between multiple components.

**Examples:**
- `OverworldEncounter.test.ts` - Encounter probability and battle start events
- `BattleFlow.test.ts` - Battle state transitions and victory conditions
- `WorldMenu.test.ts` - Menu integration with game systems

## Test Configuration

### Jest Configuration (`jest.config.js`)
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
};
```

### Global Setup (`jest.setup.ts`)
Provides mocks for Phaser and browser APIs:
- `navigator` - Browser detection
- `document` - DOM operations
- `window` - Window object
- `HTMLCanvasElement` - Canvas rendering
- `Image` - Image loading
- `Phaser` - Phaser namespace and types

## Writing Tests

### Basic Test Structure
```typescript
describe('Component Name', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
    jest.clearAllMocks();
  });

  test('should do something', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = functionToTest(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Mocking Phaser Components
```typescript
// Mock EventBus
jest.mock('../../EventBus', () => ({
  EventBus: {
    on: jest.fn(),
    once: jest.fn(),
    emit: jest.fn(),
    off: jest.fn(),
  }
}));

// Use in tests
const { EventBus } = require('../../EventBus');
EventBus.emit('battle:start', { enemyMonsterId: 1, areaId: 'route-1' });
expect(EventBus.emit).toHaveBeenCalledWith('battle:start', expect.anything());
```

### Testing with RNG
```typescript
// Mock Math.random for deterministic tests
const originalRandom = Math.random;
Math.random = jest.fn(() => 0.15); // 15% = trigger 20% chance encounter

const wildMonsterEncountered = Math.random() < 0.2;
expect(wildMonsterEncountered).toBe(true);

Math.random = originalRandom; // Restore
```

## Test Coverage Goals

- **Core Systems:** >80% coverage
  - Data management
  - Save/load system
  - Input handling
  - Menu system

- **Game Logic:** >70% coverage
  - Battle mechanics
  - Encounter system
  - Inventory management
  - NPC interactions

- **Scenes:** Smoke tests for all scenes
  - Boot and initialization
  - Scene transitions
  - Lifecycle methods

## Continuous Integration

Tests run automatically on:
- Pre-commit hooks (if configured)
- Pull request creation
- Merge to main branch

### CI Commands
```bash
# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Testing
npm test

# Build
npm run build-nolog
```

## Common Issues and Solutions

### Issue: Phaser Import Errors
**Solution:** Mock Phaser components in jest.setup.ts or use jest.mock() at the top of test files.

### Issue: EventBus Not Defined
**Solution:** Mock EventBus before importing components that use it:
```typescript
jest.mock('../../EventBus', () => ({
  EventBus: { on: jest.fn(), emit: jest.fn(), ... }
}));
```

### Issue: Canvas/Document Errors
**Solution:** Ensure jest.setup.ts has proper browser API mocks.

### Issue: Async Test Timeouts
**Solution:** Increase timeout or use proper async/await handling:
```typescript
test('async operation', async () => {
  await someAsyncOperation();
  expect(result).toBeDefined();
}, 10000); // 10 second timeout
```

## Best Practices

1. **Test Naming:** Use descriptive names that explain what is being tested
   - ✅ `should emit battle:victory event when enemy HP reaches zero`
   - ❌ `test1`

2. **Arrange-Act-Assert:** Structure tests clearly
   ```typescript
   // Arrange
   const input = setupTestData();
   
   // Act
   const result = performAction(input);
   
   // Assert
   expect(result).toBe(expected);
   ```

3. **Test Independence:** Each test should be independent and not rely on others
   - Use `beforeEach` and `afterEach` for setup/cleanup
   - Clear mocks between tests: `jest.clearAllMocks()`

4. **Mock External Dependencies:** Don't let tests depend on external systems
   - Mock Phaser APIs
   - Mock file system operations
   - Mock network calls (not applicable currently)

5. **Test Edge Cases:** Cover boundary conditions
   - Empty inputs
   - Null/undefined values
   - Maximum/minimum values
   - Error conditions

## Resources

- [Jest Documentation](https://jestjs.io/)
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Phaser 3 Testing Guide](https://phaser.io/tutorials/getting-started-phaser3)

## Troubleshooting

If tests fail unexpectedly:

1. Check console output for specific error messages
2. Verify mocks are properly configured in jest.setup.ts
3. Ensure all async operations use await
4. Clear jest cache: `npx jest --clearCache`
5. Run single test file for debugging: `npm test -- path/to/test.test.ts`
6. Enable verbose output: `npm test -- --verbose`
