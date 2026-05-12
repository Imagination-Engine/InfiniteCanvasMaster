/**
 * Converts screen coordinates to canvas coordinates.
 */
export function screenToCanvas(screenPoint, viewport) {
  return {
    x: (screenPoint.x - viewport.x) / viewport.zoom,
    y: (screenPoint.y - viewport.y) / viewport.zoom,
  };
}
/**
 * Converts canvas coordinates to screen coordinates.
 */
export function canvasToScreen(canvasPoint, viewport) {
  return {
    x: canvasPoint.x * viewport.zoom + viewport.x,
    y: canvasPoint.y * viewport.zoom + viewport.y,
  };
}
/**
 * Calculates the new viewport offset (x, y) required to maintain a fixed
 * canvas point under the pointer after a zoom change.
 */
export function getZoomedOffset(pointerPoint, currentViewport, targetZoom) {
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
