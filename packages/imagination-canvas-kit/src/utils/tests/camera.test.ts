import { describe, it, expect } from "vitest";
import { screenToCanvas, canvasToScreen, getZoomedOffset } from "../camera";

describe("Camera Math Utilities", () => {
  const viewport = {
    x: 100,
    y: 100,
    zoom: 2,
    width: 1000,
    height: 1000,
  };

  it("should convert screen coordinates to canvas coordinates", () => {
    // Screen (0,0) with viewport (100,100) and zoom 2
    // formula: canvasX = (screenX / zoom) + viewportX
    const result = screenToCanvas({ x: 0, y: 0 }, viewport);
    expect(result.x).toBe(100);
    expect(result.y).toBe(100);

    const result2 = screenToCanvas({ x: 200, y: 400 }, viewport);
    expect(result2.x).toBe(200); // (200 / 2) + 100
    expect(result2.y).toBe(300); // (400 / 2) + 100
  });

  it("should convert canvas coordinates to screen coordinates", () => {
    // formula: screenX = (canvasX - viewportX) * zoom
    const result = canvasToScreen({ x: 100, y: 100 }, viewport);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);

    const result2 = canvasToScreen({ x: 200, y: 300 }, viewport);
    expect(result2.x).toBe(200); // (200 - 100) * 2
    expect(result2.y).toBe(400); // (300 - 100) * 2
  });

  it("should calculate correct offset for point-anchored zoom", () => {
    const currentViewport = { x: 0, y: 0, zoom: 1, width: 1000, height: 1000 };
    const pointer = { x: 500, y: 500 }; // Center of screen
    const nextZoom = 2;

    // Zooming at center (500,500) from 1x to 2x.
    // Canvas point at center is (500,500).
    // In next viewport (zoom 2), we want screen (500,500) to still be canvas (500,500).
    // screenX = (canvasX - nextViewportX) * nextZoom
    // 500 = (500 - nextViewportX) * 2
    // 250 = 500 - nextViewportX
    // nextViewportX = 250
    const nextOffset = getZoomedOffset(pointer, currentViewport, nextZoom);
    expect(nextOffset.x).toBe(250);
    expect(nextOffset.y).toBe(250);
  });

  it("adversarial: should handle zero zoom gracefully (by pinning to min zoom)", () => {
    const currentViewport = { x: 0, y: 0, zoom: 1, width: 1000, height: 1000 };
    const nextOffset = getZoomedOffset({ x: 100, y: 100 }, currentViewport, 0);
    // Should probably treat 0 as min zoom or at least not NaN
    expect(nextOffset.x).not.toBeNaN();
    expect(nextOffset.y).not.toBeNaN();
  });
});
