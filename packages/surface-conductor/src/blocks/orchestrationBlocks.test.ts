import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ifBlock,
  forEachBlock,
  webhookTriggerBlock,
} from "./orchestrationBlocks";

// Mock the AI SDK
vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

vi.mock("@ai-sdk/google", () => ({
  google: vi.fn(),
}));

describe("Orchestration Blocks (Red/Green Phase)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("If Block", () => {
    it("has valid metadata and schema", () => {
      expect(ifBlock.id).toBe("iem.conductor.if");
      const validIn = { condition: "value > 5", context: { value: 10 } };
      expect(ifBlock.input.parse(validIn)).toEqual(validIn);
    });

    it("successfully evaluates condition to true using LLM", async () => {
      const { generateText } = await import("ai");
      (generateText as any).mockResolvedValueOnce({
        text: "true",
        usage: { promptTokens: 10, completionTokens: 5 },
      });

      const output = await ifBlock.agent.invoke({
        condition: "value > 5",
        context: { value: 10 },
      });
      expect(output).toHaveProperty("branch", "truePath");
      expect(output.context).toEqual({ value: 10 });
    });

    it("successfully evaluates condition to false using LLM", async () => {
      const { generateText } = await import("ai");
      (generateText as any).mockResolvedValueOnce({
        text: "false",
        usage: { promptTokens: 10, completionTokens: 5 },
      });

      const output = await ifBlock.agent.invoke({
        condition: "value > 5",
        context: { value: 3 },
      });
      expect(output).toHaveProperty("branch", "falsePath");
      expect(output.context).toEqual({ value: 3 });
    });

    it("handles unexpected LLM output gracefully", async () => {
      const { generateText } = await import("ai");
      (generateText as any).mockResolvedValueOnce({
        text: "I am not sure",
        usage: { promptTokens: 10, completionTokens: 5 },
      });

      const output = await ifBlock.agent.invoke({
        condition: "value > 5",
        context: { value: 3 },
      });
      expect(output).toHaveProperty("branch", "falsePath"); // Defaults to false
    });
  });

  describe("ForEach Block", () => {
    it("has valid metadata and schema", () => {
      expect(forEachBlock.id).toBe("iem.conductor.foreach");
      const validIn = { collection: [1, 2, 3], loopTarget: "processItem" };
      expect(forEachBlock.input.parse(validIn)).toEqual(validIn);
    });

    it("passes through the collection", async () => {
      const output = await forEachBlock.agent.invoke({
        collection: ["a", "b"],
        loopTarget: "node2",
      });
      expect(output).toHaveProperty("items");
      expect(output.items).toEqual(["a", "b"]);
      expect(output.loopTarget).toBe("node2");
    });
  });

  describe("Webhook Trigger Block", () => {
    it("has valid metadata and schema", () => {
      expect(webhookTriggerBlock.id).toBe("iem.conductor.webhook");
      const validIn = { path: "/api/trigger" };
      expect(webhookTriggerBlock.input.parse(validIn)).toEqual(validIn);
    });
  });
});
