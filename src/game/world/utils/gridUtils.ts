import { Direction, Coordinate } from '../../models/common';
import { TILE_SIZE } from '../constants';

/**
 * Get target position from current position and direction
 * Used for grid-based movement calculations
 */
export function getTargetPositionFromGameObjectPositionAndDirection(
  currentPosition: Coordinate,
  direction: Direction
): Coordinate {
  const targetPosition: Coordinate = { ...currentPosition };
  
  switch (direction) {
    case Direction.DOWN:
      targetPosition.y += TILE_SIZE;
      break;
    case Direction.UP:
      targetPosition.y -= TILE_SIZE;
      break;
    case Direction.LEFT:
      targetPosition.x -= TILE_SIZE;
      break;
    case Direction.RIGHT:
      targetPosition.x += TILE_SIZE;
      break;
    case Direction.NONE:
      break;
    default:
      throw new Error(`Invalid direction: ${direction}`);
  }
  
  return targetPosition;
}

/**
 * Get direction from current position to target position
 * Returns primary direction (no diagonal movement)
 */
export function getTargetDirectionFromGameObjectPosition(
  currentPosition: Coordinate,
  targetPosition: Coordinate
): Direction {
  const dx = targetPosition.x - currentPosition.x;
  const dy = targetPosition.y - currentPosition.y;
  
  // Prioritize horizontal movement over vertical
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? Direction.RIGHT : Direction.LEFT;
  } else if (dy !== 0) {
    return dy > 0 ? Direction.DOWN : Direction.UP;
  }
  
  return Direction.NONE;
}

/**
 * Check if position aligns with grid based on tile size
 */
export function isPositionAlignedWithGrid(position: Coordinate): boolean {
  return position.x % TILE_SIZE === 0 && position.y % TILE_SIZE === 0;
}

/**
 * Snap position to nearest grid tile
 */
export function snapPositionToGrid(position: Coordinate): Coordinate {
  return {
    x: Math.round(position.x / TILE_SIZE) * TILE_SIZE,
    y: Math.round(position.y / TILE_SIZE) * TILE_SIZE,
  };
}