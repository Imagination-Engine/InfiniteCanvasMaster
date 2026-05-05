// @ts-nocheck
import { describe, it, expect } from "vitest";
import {
  BaseCanvasObjectSchema,
  NoteObjectSchema,
  AgentBlockObjectSchema,
} from "../index";

describe("Object Taxonomy", () => {
  describe("BaseCanvasObject", () => {
    it("should validate a valid base object", () => {
      const valid = {
        id: "obj-1",
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        zIndex: 0,
        status: "idle",
        capabilities: { canMove: true, canResize: true },
        metadata: {},
      };
      const result = BaseCanvasObjectSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  describe("Specific Subtypes", () => {
    it("should validate a NoteObject", () => {
      const validNote = {
        id: "note-1",
        type: "block",
        blockKind: "note",
        x: 0,
        y: 0,
        width: 200,
        height: 200,
        zIndex: 1,
        status: "idle",
        capabilities: { canEditInline: true },
        data: { content: "Note content" },
      };
      const result = NoteObjectSchema.safeParse(validNote);
      expect(result.success).toBe(true);
    });

    it("should validate an AgentBlockObject", () => {
      const validAgent = {
        id: "agent-1",
        type: "block",
        blockKind: "agent",
        x: 0,
        y: 0,
        width: 300,
        height: 400,
        zIndex: 1,
        status: "thinking",
        capabilities: { canConfigure: true },
        agentId: "researcher-1",
        role: "Researcher",
      };
      const result = AgentBlockObjectSchema.safeParse(validAgent);
      expect(result.success).toBe(true);
    });
  });
});
