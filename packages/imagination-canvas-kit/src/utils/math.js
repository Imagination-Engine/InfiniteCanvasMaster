/**
 * Returns true if two rectangles intersect.
 * Touching edges is considered intersection.
 */
export const rectsIntersect = (rectA, rectB) => {
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
export const getIdsInRect = (rect, objects) => {
  return objects
    .filter((obj) => rectsIntersect(rect, obj))
    .map((obj) => obj.id);
};
