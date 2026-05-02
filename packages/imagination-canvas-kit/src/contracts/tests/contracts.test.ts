import { describe, it, expect } from "vitest";
import {
  CanvasObjectSchema,
  CanvasBlockSchema,
  CanvasConnectionSchema,
  CanvasViewportSchema,
} from "../index";

describe("Canvas Core Contracts", () => {
  it("should validate a valid CanvasObject", () => {
    const validObject = {
      id: "obj-1",
      type: "block",
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      zIndex: 1,
      metadata: {},
    };
    const result = CanvasObjectSchema.safeParse(validObject);
    expect(result.success).toBe(true);
  });

  it("should validate a valid CanvasBlock", () => {
    const validBlock = {
      id: "block-1",
      type: "block",
      x: 0,
      y: 0,
      width: 320,
      height: 240,
      zIndex: 1,
      blockType: "note",
      data: { content: "hello" },
      status: "idle",
      metadata: {},
    };
    const result = CanvasBlockSchema.safeParse(validBlock);
    expect(result.success).toBe(true);
  });

  it("should validate a valid CanvasConnection", () => {
    const validConnection = {
      id: "conn-1",
      sourceId: "obj-1",
      targetId: "obj-2",
      type: "semantic",
      metadata: {},
    };
    const result = CanvasConnectionSchema.safeParse(validConnection);
    expect(result.success).toBe(true);
  });

  it("should validate a valid CanvasViewport", () => {
    const validViewport = {
      x: 0,
      y: 0,
      zoom: 1,
      width: 1920,
      height: 1080,
    };
    const result = CanvasViewportSchema.safeParse(validViewport);
    expect(result.success).toBe(true);
  });

  it("adversarial: should fail validation for malformed data", () => {
    const invalidObject = {
      id: 123, // Should be string
      type: "block",
    };
    const result = CanvasObjectSchema.safeParse(invalidObject);
    expect(result.success).toBe(false);
  });
});
