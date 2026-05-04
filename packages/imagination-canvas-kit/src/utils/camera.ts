// @ts-nocheck
export interface Point {
  x: number;
  y: number;
}

export interface SimpleViewport {
  x: number;
  y: number;
  zoom: number;
}

/**
 * Converts screen coordinates to canvas coordinates.
 */
export function screenToCanvas(
  screenPoint: Point,
  viewport: SimpleViewport,
): Point {
  return {
    x: screenPoint.x / viewport.zoom + viewport.x,
    y: screenPoint.y / viewport.zoom + viewport.y,
  };
}

/**
 * Converts canvas coordinates to screen coordinates.
 */
export function canvasToScreen(
  canvasPoint: Point,
  viewport: SimpleViewport,
): Point {
  return {
    x: (canvasPoint.x - viewport.x) * viewport.zoom,
    y: (canvasPoint.y - viewport.y) * viewport.zoom,
  };
}

/**
 * Calculates the new viewport offset (x, y) required to maintain a fixed
 * canvas point under the pointer after a zoom change.
 */
export function getZoomedOffset(
  pointerPoint: Point,
  currentViewport: SimpleViewport,
  targetZoom: number,
): Point {
  // Pin zoom to prevent division by zero or extreme values
  const nextZoom = Math.max(0.01, targetZoom);

  // Find the canvas point that is currently under the pointer
  const canvasPoint = screenToCanvas(pointerPoint, currentViewport);

  // We want: screenX = (canvasX - nextX) * nextZoom
  // nextX = canvasX - (screenX / nextZoom)
  return {
    x: canvasPoint.x - pointerPoint.x / nextZoom,
    y: canvasPoint.y - pointerPoint.y / nextZoom,
  };
}
