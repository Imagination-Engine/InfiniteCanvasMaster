import { describe, it, expect } from "vitest";
import { screenToCanvas, canvasToScreen } from "../camera";

describe("Camera Utils", () => {
  const viewport = {
    x: 100,
    y: 100,
    zoom: 2,
  };

  it("should convert screen coordinates to canvas coordinates", () => {
    // (screenX - viewport.x) / zoom
    const screenPoint = { x: 200, y: 200 };
    const canvasPoint = screenToCanvas(screenPoint, viewport);

    // x = (200 - 100) / 2 = 100 / 2 = 50
    // y = (200 - 100) / 2 = 100 / 2 = 50
    expect(canvasPoint).toEqual({ x: 50, y: 50 });
  });

  it("should handle screen coordinates matching viewport offset", () => {
    const screenPoint = { x: 100, y: 100 };
    const canvasPoint = screenToCanvas(screenPoint, viewport);

    // x = (100 - 100) / 2 = 0
    // y = (100 - 100) / 2 = 0
    expect(canvasPoint).toEqual({ x: 0, y: 0 });
  });

  it("should convert canvas coordinates to screen coordinates", () => {
    // (canvasX * zoom) + viewport.x
    const canvasPoint = { x: 50, y: 50 };
    const screenPoint = canvasToScreen(canvasPoint, viewport);

    // x = (50 * 2) + 100 = 100 + 100 = 200
    // y = (50 * 2) + 100 = 100 + 100 = 200
    expect(screenPoint).toEqual({ x: 200, y: 200 });
  });
});
