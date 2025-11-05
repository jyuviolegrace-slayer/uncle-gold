/**
 * Grid-based utility functions for tile calculations
 * Used for character movement and positioning on grid-based maps
 */

export interface Coordinate {
  x: number;
  y: number;
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'NONE';

const TILE_SIZE = 32;

/**
 * Get the next tile position based on current position and direction
 */
export function getTargetPositionFromDirection(
  currentPosition: Coordinate,
  direction: Direction,
  tileSize: number = TILE_SIZE
): Coordinate {
  const targetPosition = { ...currentPosition };
  
  switch (direction) {
    case 'DOWN':
      targetPosition.y += tileSize;
      break;
    case 'UP':
      targetPosition.y -= tileSize;
      break;
    case 'LEFT':
      targetPosition.x -= tileSize;
      break;
    case 'RIGHT':
      targetPosition.x += tileSize;
      break;
    case 'NONE':
      break;
  }
  
  return targetPosition;
}

/**
 * Calculate path from current position to target position
 * Returns array of directions to follow to reach target
 */
export function calculatePathToTarget(
  currentPosition: Coordinate,
  targetPosition: Coordinate,
  tileSize: number = TILE_SIZE
): { directions: Direction[]; path: Coordinate[] } {
  const directions: Direction[] = [];
  const path: Coordinate[] = [];
  let position = { ...currentPosition };

  // Normalize positions to grid
  const normalizedCurrent = {
    x: Math.round(currentPosition.x / tileSize) * tileSize,
    y: Math.round(currentPosition.y / tileSize) * tileSize,
  };
  const normalizedTarget = {
    x: Math.round(targetPosition.x / tileSize) * tileSize,
    y: Math.round(targetPosition.y / tileSize) * tileSize,
  };

  position = { ...normalizedCurrent };

  // Move horizontally first
  while (position.x !== normalizedTarget.x) {
    if (position.x < normalizedTarget.x) {
      directions.push('RIGHT');
      position.x += tileSize;
    } else {
      directions.push('LEFT');
      position.x -= tileSize;
    }
    path.push({ ...position });
  }

  // Then move vertically
  while (position.y !== normalizedTarget.y) {
    if (position.y < normalizedTarget.y) {
      directions.push('DOWN');
      position.y += tileSize;
    } else {
      directions.push('UP');
      position.y -= tileSize;
    }
    path.push({ ...position });
  }

  return { directions, path };
}

/**
 * Get opposite direction
 */
export function getOppositeDirection(direction: Direction): Direction {
  switch (direction) {
    case 'UP':
      return 'DOWN';
    case 'DOWN':
      return 'UP';
    case 'LEFT':
      return 'RIGHT';
    case 'RIGHT':
      return 'LEFT';
    case 'NONE':
      return 'NONE';
  }
}

/**
 * Get animation frame config for direction
 */
export function getFrameForDirection(direction: Direction): number {
  const frameMap: Record<Direction, number> = {
    DOWN: 7,
    UP: 1,
    LEFT: 10,
    RIGHT: 4,
    NONE: 7,
  };
  return frameMap[direction];
}

/**
 * Check if position is on grid
 */
export function isPositionOnGrid(position: Coordinate, tileSize: number = TILE_SIZE): boolean {
  return position.x % tileSize === 0 && position.y % tileSize === 0;
}

/**
 * Snap position to grid
 */
export function snapToGrid(position: Coordinate, tileSize: number = TILE_SIZE): Coordinate {
  return {
    x: Math.round(position.x / tileSize) * tileSize,
    y: Math.round(position.y / tileSize) * tileSize,
  };
}

/**
 * Calculate distance between two positions
 */
export function calculateDistance(pos1: Coordinate, pos2: Coordinate): number {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if two objects are adjacent (one tile apart)
 */
export function areAdjacent(pos1: Coordinate, pos2: Coordinate, tileSize: number = TILE_SIZE): boolean {
  const distance = calculateDistance(pos1, pos2);
  return distance <= tileSize * 1.5;
}
