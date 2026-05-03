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
export const rectsIntersect = (rectA: Rect, rectB: Rect): boolean => {
  return (
    rectA.x <= rectB.x + rectB.width &&
    rectA.x + rectA.width >= rectB.x &&
    rectA.y <= rectB.y + rectB.height &&
    rectA.y + rectA.height >= rectB.y
  );
};

/**
 * Returns IDs of objects whose bounding boxes intersect with the given rect.
 */
export const getIdsInRect = (
  rect: Rect,
  objects: BoundingBoxed[],
): string[] => {
  return objects
    .filter((obj) => rectsIntersect(rect, obj))
    .map((obj) => obj.id);
};
