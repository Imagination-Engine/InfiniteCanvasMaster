export type AnchorPosition = "center" | "top" | "right" | "bottom" | "left";
export type PathStyle = "straight" | "bezier";

interface Point {
  x: number;
  y: number;
}
interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const getAnchorPoint = (
  rect: Rect,
  position: AnchorPosition = "center",
): Point => {
  const { x, y, width, height } = rect;
  switch (position) {
    case "top":
      return { x: x + width / 2, y };
    case "bottom":
      return { x: x + width / 2, y: y + height };
    case "left":
      return { x, y: y + height / 2 };
    case "right":
      return { x: x + width, y: y + height / 2 };
    case "center":
    default:
      return { x: x + width / 2, y: y + height / 2 };
  }
};

export const generateConnectorPath = (
  source: Point,
  target: Point,
  style: PathStyle = "bezier",
): string => {
  if (style === "straight") {
    return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
  }

  // Simple cubic bezier curve logic
  const dx = target.x - source.x;
  const dy = target.y - source.y;

  // Create control points that extend outward from the source/target horizontally
  // This assumes connections typically flow left-to-right or right-to-left.
  // In a robust implementation, this would adapt based on the anchor positions.
  const curvature = 0.5;
  const controlPointX = Math.max(Math.abs(dx) * curvature, 50);

  // For basic vertical separation, apply a similar curve
  const cx1 = source.x + controlPointX;
  const cy1 = source.y;

  const cx2 = target.x - controlPointX;
  const cy2 = target.y;

  return `M ${source.x} ${source.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${target.x} ${target.y}`;
};
