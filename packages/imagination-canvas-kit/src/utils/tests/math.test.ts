import { describe, it, expect } from "vitest";
import { rectsIntersect, getIdsInRect } from "../math";

describe("Math Utils", () => {
  describe("rectsIntersect", () => {
    it("should return true if rectangles overlap", () => {
      const rectA = { x: 0, y: 0, width: 100, height: 100 };
      const rectB = { x: 50, y: 50, width: 100, height: 100 };
      expect(rectsIntersect(rectA, rectB)).toBe(true);
    });

    it("should return true if one rectangle is inside another", () => {
      const rectA = { x: 0, y: 0, width: 200, height: 200 };
      const rectB = { x: 50, y: 50, width: 50, height: 50 };
      expect(rectsIntersect(rectA, rectB)).toBe(true);
    });

    it("should return false if rectangles do not overlap", () => {
      const rectA = { x: 0, y: 0, width: 50, height: 50 };
      const rectB = { x: 100, y: 100, width: 50, height: 50 };
      expect(rectsIntersect(rectA, rectB)).toBe(false);
    });

    it("should return true if rectangles touch edges", () => {
      const rectA = { x: 0, y: 0, width: 100, height: 100 };
      const rectB = { x: 100, y: 0, width: 100, height: 100 };
      expect(rectsIntersect(rectA, rectB)).toBe(true);
    });
  });

  describe("getIdsInRect", () => {
    const objects = [
      { id: "obj-1", x: 0, y: 0, width: 50, height: 50 },
      { id: "obj-2", x: 100, y: 100, width: 50, height: 50 },
      { id: "obj-3", x: 200, y: 200, width: 50, height: 50 },
    ];

    it("should return IDs of objects inside the rect", () => {
      const marquee = { x: -10, y: -10, width: 150, height: 150 };
      const ids = getIdsInRect(marquee, objects);
      expect(ids).toEqual(["obj-1", "obj-2"]);
    });

    it("should return an empty array if no objects are inside the rect", () => {
      const marquee = { x: 300, y: 300, width: 50, height: 50 };
      const ids = getIdsInRect(marquee, objects);
      expect(ids).toEqual([]);
    });
  });

  describe("adversarial cases", () => {
    it("should handle zero-size rectangles", () => {
      const rectA = { x: 0, y: 0, width: 100, height: 100 };
      const rectB = { x: 50, y: 50, width: 0, height: 0 };
      expect(rectsIntersect(rectA, rectB)).toBe(true);
    });

    it("should handle negative coordinates", () => {
      const rectA = { x: -100, y: -100, width: 50, height: 50 };
      const rectB = { x: -75, y: -75, width: 50, height: 50 };
      expect(rectsIntersect(rectA, rectB)).toBe(true);
    });

    it("should handle non-overlapping negative coordinates", () => {
      const rectA = { x: -100, y: -100, width: 10, height: 10 };
      const rectB = { x: -50, y: -50, width: 10, height: 10 };
      expect(rectsIntersect(rectA, rectB)).toBe(false);
    });
  });
});
