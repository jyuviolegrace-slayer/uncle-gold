/**
 * Grid utility tests
 */

import {
  getTargetPositionFromDirection,
  calculatePathToTarget,
  getOppositeDirection,
  isPositionOnGrid,
  snapToGrid,
  calculateDistance,
  areAdjacent,
  type Coordinate,
  type Direction,
} from '../GridUtils';

describe('GridUtils', () => {
  describe('getTargetPositionFromDirection', () => {
    it('should calculate next position DOWN', () => {
      const pos: Coordinate = { x: 32, y: 32 };
      const result = getTargetPositionFromDirection(pos, 'DOWN', 32);
      expect(result).toEqual({ x: 32, y: 64 });
    });

    it('should calculate next position UP', () => {
      const pos: Coordinate = { x: 32, y: 64 };
      const result = getTargetPositionFromDirection(pos, 'UP', 32);
      expect(result).toEqual({ x: 32, y: 32 });
    });

    it('should calculate next position LEFT', () => {
      const pos: Coordinate = { x: 64, y: 32 };
      const result = getTargetPositionFromDirection(pos, 'LEFT', 32);
      expect(result).toEqual({ x: 32, y: 32 });
    });

    it('should calculate next position RIGHT', () => {
      const pos: Coordinate = { x: 32, y: 32 };
      const result = getTargetPositionFromDirection(pos, 'RIGHT', 32);
      expect(result).toEqual({ x: 64, y: 32 });
    });

    it('should not move on NONE', () => {
      const pos: Coordinate = { x: 32, y: 32 };
      const result = getTargetPositionFromDirection(pos, 'NONE', 32);
      expect(result).toEqual({ x: 32, y: 32 });
    });
  });

  describe('calculatePathToTarget', () => {
    it('should calculate path horizontally', () => {
      const current: Coordinate = { x: 0, y: 0 };
      const target: Coordinate = { x: 64, y: 0 };
      const result = calculatePathToTarget(current, target, 32);
      expect(result.directions).toEqual(['RIGHT', 'RIGHT']);
      expect(result.path).toHaveLength(2);
    });

    it('should calculate path vertically', () => {
      const current: Coordinate = { x: 0, y: 0 };
      const target: Coordinate = { x: 0, y: 64 };
      const result = calculatePathToTarget(current, target, 32);
      expect(result.directions).toEqual(['DOWN', 'DOWN']);
      expect(result.path).toHaveLength(2);
    });

    it('should calculate path with both directions', () => {
      const current: Coordinate = { x: 0, y: 0 };
      const target: Coordinate = { x: 32, y: 32 };
      const result = calculatePathToTarget(current, target, 32);
      expect(result.directions.length).toBe(2);
    });
  });

  describe('getOppositeDirection', () => {
    it('should get opposite of UP', () => {
      expect(getOppositeDirection('UP')).toBe('DOWN');
    });

    it('should get opposite of DOWN', () => {
      expect(getOppositeDirection('DOWN')).toBe('UP');
    });

    it('should get opposite of LEFT', () => {
      expect(getOppositeDirection('LEFT')).toBe('RIGHT');
    });

    it('should get opposite of RIGHT', () => {
      expect(getOppositeDirection('RIGHT')).toBe('LEFT');
    });

    it('should get opposite of NONE', () => {
      expect(getOppositeDirection('NONE')).toBe('NONE');
    });
  });

  describe('isPositionOnGrid', () => {
    it('should return true for grid positions', () => {
      expect(isPositionOnGrid({ x: 32, y: 32 }, 32)).toBe(true);
      expect(isPositionOnGrid({ x: 0, y: 0 }, 32)).toBe(true);
      expect(isPositionOnGrid({ x: 64, y: 64 }, 32)).toBe(true);
    });

    it('should return false for off-grid positions', () => {
      expect(isPositionOnGrid({ x: 33, y: 32 }, 32)).toBe(false);
      expect(isPositionOnGrid({ x: 32, y: 33 }, 32)).toBe(false);
    });
  });

  describe('snapToGrid', () => {
    it('should snap position to grid', () => {
      expect(snapToGrid({ x: 33, y: 32 }, 32)).toEqual({ x: 32, y: 32 });
      expect(snapToGrid({ x: 50, y: 50 }, 32)).toEqual({ x: 48, y: 48 });
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two points', () => {
      const distance = calculateDistance({ x: 0, y: 0 }, { x: 3, y: 4 });
      expect(distance).toBe(5);
    });

    it('should return 0 for same point', () => {
      const distance = calculateDistance({ x: 32, y: 32 }, { x: 32, y: 32 });
      expect(distance).toBe(0);
    });
  });

  describe('areAdjacent', () => {
    it('should return true for adjacent tiles', () => {
      const pos1: Coordinate = { x: 0, y: 0 };
      const pos2: Coordinate = { x: 32, y: 0 };
      expect(areAdjacent(pos1, pos2, 32)).toBe(true);
    });

    it('should return false for distant tiles', () => {
      const pos1: Coordinate = { x: 0, y: 0 };
      const pos2: Coordinate = { x: 100, y: 100 };
      expect(areAdjacent(pos1, pos2, 32)).toBe(false);
    });
  });
});
