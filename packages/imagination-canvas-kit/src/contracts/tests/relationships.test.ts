import { describe, it, expect } from "vitest";
import { CanvasConnectionSchema, CanvasBindingSchema } from "../index";

describe("Semantic Relationships", () => {
  describe("CanvasConnection", () => {
    it("should validate a valid semantic connection", () => {
      const valid = {
        id: "conn-1",
        sourceId: "obj-1",
        targetId: "obj-2",
        type: "semantic",
        label: "depends on",
        metadata: { weight: 0.8 },
      };
      const result = CanvasConnectionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should fail on invalid connection type", () => {
      const invalid = {
        id: "conn-2",
        sourceId: "a",
        targetId: "b",
        type: "imaginary",
      };
      const result = CanvasConnectionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("CanvasBinding", () => {
    it("should validate a valid canvas binding", () => {
      const valid = {
        id: "bind-1",
        actorId: "agent-1",
        targetId: "block-1",
        type: "follow",
        config: { offset: { x: 10, y: 10 } },
      };
      const result = CanvasBindingSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("adversarial: should fail on missing targetId for binding", () => {
      const invalid = { id: "b1", type: "stick" };
      const result = CanvasBindingSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});
