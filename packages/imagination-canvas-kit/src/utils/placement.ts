import { rectsIntersect, Rect, BoundingBoxed } from "./math";
import { CanvasViewport } from "../contracts";

/**
 * Calculates the center of the visible viewport in world coordinates.
 */
export const getCenterOfViewport = (
  viewport: CanvasViewport,
): { x: number; y: number } => {
  const { x, y, width, height, zoom } = viewport;
  return {
    x: x + width / 2 / zoom,
    y: y + height / 2 / zoom,
  };
};

/**
 * Finds an empty space near the target coordinates to avoid exact stacking.
 * Uses a simple spiral/diagonal offset search.
 */
export const findEmptySpace = (
  targetX: number,
  targetY: number,
  width: number,
  height: number,
  existingObjects: BoundingBoxed[],
  offsetStep: number = 20,
  maxAttempts: number = 20,
): { x: number; y: number } => {
  let currentX = targetX;
  let currentY = targetY;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidateRect: Rect = { x: currentX, y: currentY, width, height };

    const hasCollision = existingObjects.some((obj) =>
      rectsIntersect(candidateRect, obj),
    );

    if (!hasCollision) {
      return { x: currentX, y: currentY };
    }

    // Move diagonally down-right
    currentX += offsetStep;
    currentY += offsetStep;
  }

  // Fallback if space is too crowded
  return { x: currentX, y: currentY };
};
