import { CanvasObject, CanvasConnection } from "../contracts";

export type LayoutAlgorithm = "pipeline" | "tree" | "swarm";

/**
 * Applies a layout algorithm to a set of blocks and connections, mutating their x/y coordinates.
 */
export function applyCanvasLayout(
  objects: CanvasObject[],
  connections: CanvasConnection[],
  algorithm: LayoutAlgorithm = "pipeline",
  startX = 100,
  startY = 100,
): CanvasObject[] {
  const nodeSpacingX = 450;
  const nodeSpacingY = 350;

  if (algorithm === "pipeline") {
    // Sort topologically or just linearly if no complex dependencies
    // For simplicity in this implementation, we arrange them linearly left-to-right
    return objects.map((obj, index) => ({
      ...obj,
      x: startX + index * nodeSpacingX,
      y: startY,
    }));
  }

  if (algorithm === "swarm") {
    // Center orchestrator/main block, surround others radially
    const centerX = startX + 500;
    const centerY = startY + 500;
    const radius = 400;

    return objects.map((obj, index) => {
      if (index === 0) {
        return {
          ...obj,
          x: centerX - obj.width / 2,
          y: centerY - obj.height / 2,
        };
      }

      const angle = ((index - 1) / (objects.length - 1)) * Math.PI * 2;
      return {
        ...obj,
        x: centerX + radius * Math.cos(angle) - obj.width / 2,
        y: centerY + radius * Math.sin(angle) - obj.height / 2,
      };
    });
  }

  // Fallback / Tree
  return objects.map((obj, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    return {
      ...obj,
      x: startX + col * nodeSpacingX,
      y: startY + row * nodeSpacingY,
    };
  });
}
