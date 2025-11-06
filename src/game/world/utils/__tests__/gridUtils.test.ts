import { Direction, Coordinate } from '../../../models/common';
import { 
  getTargetPositionFromGameObjectPositionAndDirection,
  isPositionAlignedWithGrid,
  snapPositionToGrid 
} from '../gridUtils';
import { TILE_SIZE } from '../../constants';

describe('Grid Utils', () => {
  describe('getTargetPositionFromGameObjectPositionAndDirection', () => {
    it('should move down correctly', () => {
      const current: Coordinate = { x: 100, y: 100 };
      const result = getTargetPositionFromGameObjectPositionAndDirection(current, Direction.DOWN);
      expect(result).toEqual({ x: 100, y: 100 + TILE_SIZE });
    });

    it('should move up correctly', () => {
      const current: Coordinate = { x: 100, y: 100 };
      const result = getTargetPositionFromGameObjectPositionAndDirection(current, Direction.UP);
      expect(result).toEqual({ x: 100, y: 100 - TILE_SIZE });
    });

    it('should move left correctly', () => {
      const current: Coordinate = { x: 100, y: 100 };
      const result = getTargetPositionFromGameObjectPositionAndDirection(current, Direction.LEFT);
      expect(result).toEqual({ x: 100 - TILE_SIZE, y: 100 });
    });

    it('should move right correctly', () => {
      const current: Coordinate = { x: 100, y: 100 };
      const result = getTargetPositionFromGameObjectPositionAndDirection(current, Direction.RIGHT);
      expect(result).toEqual({ x: 100 + TILE_SIZE, y: 100 });
    });

    it('should not move when direction is NONE', () => {
      const current: Coordinate = { x: 100, y: 100 };
      const result = getTargetPositionFromGameObjectPositionAndDirection(current, Direction.NONE);
      expect(result).toEqual({ x: 100, y: 100 });
    });
  });

  describe('isPositionAlignedWithGrid', () => {
    it('should return true for grid-aligned positions', () => {
      const position: Coordinate = { x: 128, y: 256 }; // Both multiples of TILE_SIZE (64)
      expect(isPositionAlignedWithGrid(position)).toBe(true);
    });

    it('should return false for non-aligned positions', () => {
      const position: Coordinate = { x: 100, y: 150 }; // Not multiples of TILE_SIZE
      expect(isPositionAlignedWithGrid(position)).toBe(false);
    });
  });

  describe('snapPositionToGrid', () => {
    it('should snap position to nearest grid tile', () => {
      const position: Coordinate = { x: 100, y: 150 };
      const result = snapPositionToGrid(position);
      expect(result).toEqual({ x: 128, y: 128 }); // Nearest multiples of 64
    });
  });
});