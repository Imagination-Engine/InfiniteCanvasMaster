import { describe, it, expect } from "vitest";
import {
  ExpansionDescriptorSchema,
  ProvenanceDescriptorSchema,
} from "../index";

describe("Schema Descriptors", () => {
  describe("ExpansionDescriptor", () => {
    it("should validate a valid expansion descriptor", () => {
      const valid = {
        mode: "fullscreen",
        surfaceId: "doc-editor",
        config: { theme: "dark" },
      };
      const result = ExpansionDescriptorSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should fail on invalid mode", () => {
      const invalid = { mode: "teleport" };
      const result = ExpansionDescriptorSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("ProvenanceDescriptor", () => {
    it("should validate a valid provenance descriptor", () => {
      const valid = {
        source: "agent",
        agentId: "researcher-1",
        model: "gemini-2.5-pro",
        prompt: "Research the history of infinite canvases",
        timestamp: new Date().toISOString(),
        confidence: 0.95,
      };
      const result = ProvenanceDescriptorSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("adversarial: should fail on missing required fields for agent source", () => {
      const invalid = { source: "agent" };
      const result = ProvenanceDescriptorSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});
