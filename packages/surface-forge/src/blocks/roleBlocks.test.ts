import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  architectBlock,
  designerBlock,
  builderBlock,
  testerBlock,
} from "./roleBlocks";

vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

vi.mock("@ai-sdk/google", () => ({
  google: vi.fn(),
}));

describe("Role Blocks (Red/Green Phase)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Architect", () => {
    it("has valid schema", () => {
      const validIn = { prompt: "A weather app" };
      expect(architectBlock.input.parse(validIn)).toEqual(validIn);
    });

    it("executes successfully", async () => {
      const { generateText } = await import("ai");
      (generateText as any).mockResolvedValueOnce({
        text: "Spec content",
        usage: { promptTokens: 10, completionTokens: 5 },
      });
      const result = await architectBlock.agent.invoke({ prompt: "test" });
      expect(result.success).toBe(true);
      expect(result.spec).toBe("Spec content");
    });
  });

  describe("Designer", () => {
    it("has valid schema", () => {
      const validIn = { spec: "Spec content" };
      expect(designerBlock.input.parse(validIn)).toEqual(validIn);
    });

    it("executes successfully", async () => {
      const { generateText } = await import("ai");
      (generateText as any).mockResolvedValueOnce({
        text: "Design content",
        usage: { promptTokens: 10, completionTokens: 5 },
      });
      const result = await designerBlock.agent.invoke({ spec: "spec" });
      expect(result.success).toBe(true);
      expect(result.design).toBe("Design content");
    });
  });

  describe("Builder", () => {
    it("has valid schema", () => {
      const validIn = { spec: "Spec", design: "Design" };
      expect(builderBlock.input.parse(validIn)).toEqual(validIn);
    });

    it("executes successfully", async () => {
      const { generateText } = await import("ai");
      (generateText as any).mockResolvedValueOnce({
        text: "Code content",
        usage: { promptTokens: 10, completionTokens: 5 },
      });
      const result = await builderBlock.agent.invoke({
        spec: "spec",
        design: "design",
      });
      expect(result.success).toBe(true);
      expect(result.code).toBe("Code content");
    });
  });

  describe("Tester", () => {
    it("has valid schema", () => {
      const validIn = { code: "code", spec: "spec" };
      expect(testerBlock.input.parse(validIn)).toEqual(validIn);
    });

    it("executes successfully", async () => {
      const { generateText } = await import("ai");
      (generateText as any).mockResolvedValueOnce({
        text: "Results content",
        usage: { promptTokens: 10, completionTokens: 5 },
      });
      const result = await testerBlock.agent.invoke({
        code: "code",
        spec: "spec",
      });
      expect(result.success).toBe(true);
      expect(result.results).toBe("Results content");
    });
  });
});
