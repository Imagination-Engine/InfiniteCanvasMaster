interface BoundingBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const calculateStackLayout = <T extends BoundingBox>(
  objects: T[],
  startX: number,
  startY: number,
  padding: number = 20,
): T[] => {
  let currentY = startY;

  return objects.map((obj) => {
    const updated = { ...obj, x: startX, y: currentY };
    currentY += obj.height + padding;
    return updated;
  });
};

export const calculateGridLayout = <T extends BoundingBox>(
  objects: T[],
  startX: number,
  startY: number,
  columns: number = 3,
  padding: number = 20,
): T[] => {
  const safeColumns = Math.max(1, columns);
  return objects.map((obj, index) => {
    const col = index % safeColumns;
    const row = Math.floor(index / safeColumns);

    // This simplistic grid assumes all objects have the same width/height for placement
    // A robust engine would track row heights and column widths.
    const x = startX + col * (obj.width + padding);
    const y = startY + row * (obj.height + padding);

    return { ...obj, x, y };
  });
};
