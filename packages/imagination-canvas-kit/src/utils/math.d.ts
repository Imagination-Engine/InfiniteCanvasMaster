export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface BoundingBoxed {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}
/**
 * Returns true if two rectangles intersect.
 * Touching edges is considered intersection.
 */
export declare const rectsIntersect: (rectA: Rect, rectB: Rect) => boolean;
/**
 * Returns IDs of objects whose bounding boxes intersect with the given rect.
 */
export declare const getIdsInRect: (
  rect: Rect,
  objects: BoundingBoxed[],
) => string[];
//# sourceMappingURL=math.d.ts.map
