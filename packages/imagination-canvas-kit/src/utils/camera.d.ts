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
export declare function screenToCanvas(
  screenPoint: Point,
  viewport: SimpleViewport,
): Point;
/**
 * Converts canvas coordinates to screen coordinates.
 */
export declare function canvasToScreen(
  canvasPoint: Point,
  viewport: SimpleViewport,
): Point;
/**
 * Calculates the new viewport offset (x, y) required to maintain a fixed
 * canvas point under the pointer after a zoom change.
 */
export declare function getZoomedOffset(
  pointerPoint: Point,
  currentViewport: SimpleViewport,
  targetZoom: number,
): Point;
//# sourceMappingURL=camera.d.ts.map
