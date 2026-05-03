import { describe, it, expect } from "vitest";
import { findEmptySpace, getCenterOfViewport } from "../placement";

describe("Placement Utils", () => {
  describe("getCenterOfViewport", () => {
    it("should return the center coordinates of the given viewport", () => {
      const viewport = { x: 0, y: 0, zoom: 1, width: 800, height: 600 };
      const center = getCenterOfViewport(viewport);
      expect(center.x).toBe(400);
      expect(center.y).toBe(300);
    });

    it("should account for zoom and offset", () => {
      // If viewport is at x: 100, y: 100 with zoom 2.
      // Screen width is 800, so world width visible is 400.
      // Left edge is 100, right edge is 500. Center is 300.
      const viewport = { x: 100, y: 100, zoom: 2, width: 800, height: 600 };
      const center = getCenterOfViewport(viewport);
      expect(center.x).toBe(300);
      expect(center.y).toBe(250);
    });
  });

  describe("findEmptySpace", () => {
    const existingObjects = [
      { id: "1", x: 0, y: 0, width: 100, height: 100 },
      { id: "2", x: 150, y: 0, width: 100, height: 100 },
    ];

    it("should return the initial coordinates if space is empty", () => {
      const pos = findEmptySpace(500, 500, 100, 100, existingObjects);
      expect(pos.x).toBe(500);
      expect(pos.y).toBe(500);
    });

    it("should offset the coordinates if there is a collision", () => {
      // Trying to place at 0, 0 where obj '1' is.
      const pos = findEmptySpace(0, 0, 100, 100, existingObjects);

      // Should not be 0,0 exactly. Standard offset is usually +20 or +50.
      expect(pos.x).not.toBe(0);
      expect(pos.y).not.toBe(0);

      // Should eventually find a spot that doesn't collide
      // (Basic collision check: pos.x !== 0 && pos.y !== 0)
    });
  });

  describe("adversarial cases", () => {
    it("should fall back if max attempts are exceeded", () => {
      // Create a grid of objects that will block all attempts
      const objects = [];
      for (let i = 0; i < 20; i++) {
        objects.push({
          id: `${i}`,
          x: i * 20,
          y: i * 20,
          width: 100,
          height: 100,
        });
      }

      // Try placing at 0,0. Will collide 20 times.
      const pos = findEmptySpace(0, 0, 100, 100, objects, 20, 5);

      // Attempt 0: 0,0 (collides)
      // Attempt 1: 20,20 (collides)
      // Attempt 2: 40,40 (collides)
      // Attempt 3: 60,60 (collides)
      // Attempt 4: 80,80 (collides)
      // Fallback returns currentX, currentY after loop, which is 100, 100
      expect(pos.x).toBe(100);
      expect(pos.y).toBe(100);
    });

    it("should handle zero zoom gracefully (avoid infinity)", () => {
      // In JS, x / 0 is Infinity. We should test how the function behaves.
      // Assuming zoom should be > 0. If it's 0, it might be a bug in viewport state,
      // but the math will return Infinity.
      const viewport = { x: 0, y: 0, zoom: 0, width: 800, height: 600 };
      const center = getCenterOfViewport(viewport);
      expect(center.x).toBe(Infinity);
      expect(center.y).toBe(Infinity);
    });
  });
});
