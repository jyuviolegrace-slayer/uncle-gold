import { MapManager, MapConfiguration } from '../MapManager';

// Mock Phaser scene for testing
const mockScene = {
  make: jest.fn(),
  add: jest.fn(),
} as any;

describe('MapManager', () => {
  let mapManager: MapManager;

  beforeEach(() => {
    mapManager = new MapManager(mockScene);
  });

  describe('getMapConfiguration', () => {
    it('should return configuration for main_1 area', () => {
      const config = mapManager.getMapConfiguration('main_1');
      expect(config).toBeDefined();
      expect(config?.areaId).toBe('main_1');
      expect(config?.isInterior).toBe(false);
    });

    it('should return configuration for building_1 area', () => {
      const config = mapManager.getMapConfiguration('building_1');
      expect(config).toBeDefined();
      expect(config?.areaId).toBe('building_1');
      expect(config?.isInterior).toBe(true);
    });

    it('should return undefined for unknown area', () => {
      const config = mapManager.getMapConfiguration('unknown_area');
      expect(config).toBeUndefined();
    });
  });
});