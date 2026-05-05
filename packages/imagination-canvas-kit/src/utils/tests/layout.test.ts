// @ts-nocheck
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { calculateGridLayout, calculateStackLayout } from "../layout";

describe("Layout Engine", () => {
  const mockObjects = [
    { id: "1", x: 0, y: 0, width: 100, height: 100 },
    { id: "2", x: 50, y: 50, width: 100, height: 100 },
    { id: "3", x: -100, y: 300, width: 100, height: 100 },
    { id: "4", x: 200, y: -200, width: 100, height: 100 },
  ];

  describe("Stack Layout", () => {
    it("should stack objects vertically with padding", () => {
      const startX = 100;
      const startY = 100;
      const padding = 20;

      const newLayout = calculateStackLayout(
        mockObjects,
        startX,
        startY,
        padding,
      );

      expect(newLayout[0].x).toBe(100);
      expect(newLayout[0].y).toBe(100);

      expect(newLayout[1].x).toBe(100);
      // obj 1 height (100) + padding (20) = 120 offset
      expect(newLayout[1].y).toBe(220);

      expect(newLayout[2].y).toBe(340);
      expect(newLayout[3].y).toBe(460);
    });
  });

  describe("Grid Layout", () => {
    it("should arrange objects in a grid with columns and padding", () => {
      const startX = 0;
      const startY = 0;
      const columns = 2;
      const padding = 50;

      const newLayout = calculateGridLayout(
        mockObjects,
        startX,
        startY,
        columns,
        padding,
      );

      // Row 0, Col 0
      expect(newLayout[0].x).toBe(0);
      expect(newLayout[0].y).toBe(0);

      // Row 0, Col 1
      expect(newLayout[1].x).toBe(150); // width 100 + 50
      expect(newLayout[1].y).toBe(0);

      // Row 1, Col 0
      expect(newLayout[2].x).toBe(0);
      expect(newLayout[2].y).toBe(150); // height 100 + 50

      // Row 1, Col 1
      expect(newLayout[3].x).toBe(150);
      expect(newLayout[3].y).toBe(150);
    });
  });

  describe("adversarial cases", () => {
    it("should handle empty arrays gracefully", () => {
      const emptyStack = calculateStackLayout([], 0, 0);
      expect(emptyStack).toEqual([]);

      const emptyGrid = calculateGridLayout([], 0, 0);
      expect(emptyGrid).toEqual([]);
    });

    it("should fallback to 1 column if columns <= 0 in grid layout", () => {
      // We need to ensure grid layout handles divide-by-zero or negative columns
      // Currently, it might produce NaN or Infinity if columns is 0. Let's write the expectation
      // and we will fix the implementation if it fails.

      const newLayout = calculateGridLayout(mockObjects, 0, 0, 0, 0);
      // If it falls back to 1 column, it acts like a stack without padding
      expect(newLayout[0].x).toBe(0);
      expect(newLayout[1].x).toBe(0); // Col 0
      expect(newLayout[1].y).toBe(100); // Row 1
    });
  });
});
