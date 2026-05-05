// @ts-nocheck
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { generateConnectorPath, getAnchorPoint } from "../connectors";

describe("Connector Utils", () => {
  describe("getAnchorPoint", () => {
    it("should calculate the center of a bounding box as default anchor", () => {
      const rect = { x: 10, y: 10, width: 100, height: 100 };
      const anchor = getAnchorPoint(rect, "center");
      expect(anchor.x).toBe(60);
      expect(anchor.y).toBe(60);
    });

    it("should calculate top anchor correctly", () => {
      const rect = { x: 10, y: 10, width: 100, height: 100 };
      const anchor = getAnchorPoint(rect, "top");
      expect(anchor.x).toBe(60);
      expect(anchor.y).toBe(10);
    });
  });

  describe("generateConnectorPath", () => {
    it("should generate a straight SVG line path between two points", () => {
      const source = { x: 0, y: 0 };
      const target = { x: 100, y: 100 };
      const path = generateConnectorPath(source, target, "straight");

      // Basic SVG path command for a line: M 0,0 L 100,100
      expect(path).toBe("M 0 0 L 100 100");
    });

    it("should generate a bezier curve path between two points", () => {
      const source = { x: 0, y: 0 };
      const target = { x: 100, y: 100 };
      const path = generateConnectorPath(source, target, "bezier");

      // Bezier should start with M 0 0 and contain a C (cubic bezier)
      expect(path.startsWith("M 0 0 C")).toBe(true);
      expect(path.endsWith("100 100")).toBe(true);
    });
  });

  describe("adversarial cases", () => {
    it("should handle identical source and target coordinates gracefully", () => {
      const source = { x: 50, y: 50 };
      const target = { x: 50, y: 50 };
      const path = generateConnectorPath(source, target, "straight");

      // Should still generate valid SVG syntax even if it draws nothing
      expect(path).toBe("M 50 50 L 50 50");
    });

    it("should generate a valid bezier path even when overlapping", () => {
      const source = { x: 50, y: 50 };
      const target = { x: 50, y: 50 };
      const path = generateConnectorPath(source, target, "bezier");

      expect(path.startsWith("M 50 50 C")).toBe(true);
      expect(path.endsWith("50 50")).toBe(true);
    });
  });
});
