import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  ifBlock,
  loopBlock,
  webhookTriggerBlock,
  webhookCallBlock,
  functionBlock,
  functionCallBlock,
  codeBlock,
  agentBlock,
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

    it("successfully evaluates condition to true path", async () => {
      const output = await ifBlock.agent.invoke({
        condition: "5 > 3",
        context: { value: 10 },
      });
      expect(output).toHaveProperty("branch", "truePath");
      expect(output.context).toEqual({ value: 10 });
    });

    it("successfully evaluates condition to false path", async () => {
      const output = await ifBlock.agent.invoke({
        condition: "value > 5",
        context: { value: 3 },
      });
      expect(output).toHaveProperty("branch", "falsePath");
      expect(output.context).toEqual({ value: 3 });
    });
  });

  describe("Loop Block", () => {
    it("has valid metadata and schema", () => {
      expect(loopBlock.id).toBe("iem.conductor.loop");
      const validIn = {
        collection: [1, 2, 3],
        loopTarget: "processItem",
        maxIterations: 5,
        breakCondition: "i > 3",
      };
      expect(loopBlock.input.parse(validIn)).toEqual(validIn);
    });

    it("passes through the collection", async () => {
      const output = await loopBlock.agent.invoke({
        collection: ["a", "b"],
        loopTarget: "node2",
      });
      expect(output).toHaveProperty("items");
      expect(output.items).toEqual(["a", "b"]);
      expect(output.loopTarget).toBe("node2");
    });
  });

  describe("Webhook Blocks", () => {
    it("Webhook Trigger has valid metadata and schema", () => {
      expect(webhookTriggerBlock.id).toBe("iem.conductor.webhook");
      const validIn = { path: "/api/trigger" };
      expect(webhookTriggerBlock.input.parse(validIn)).toEqual(validIn);
    });

    it("Webhook Call has valid metadata and schema", () => {
      expect(webhookCallBlock.id).toBe("iem.conductor.webhookCall");
      const validIn = {
        url: "https://example.com/api",
        method: "POST" as const,
        headers: { Authorization: "Bearer token" },
      };
      expect(webhookCallBlock.input.parse(validIn)).toEqual(validIn);
    });
  });

  describe("Function Blocks", () => {
    it("Function Definition has valid metadata and schema", () => {
      expect(functionBlock.id).toBe("iem.conductor.function");
      const validIn = {
        name: "MyFunc",
        inputs: ["arg1", "arg2"],
        globalAccess: true,
      };
      expect(functionBlock.input.parse(validIn)).toEqual(validIn);
    });

    it("Function Call has valid metadata and schema", () => {
      expect(functionCallBlock.id).toBe("iem.conductor.functionCall");
      const validIn = {
        functionId: "fn_123",
        arguments: { arg1: "val" },
        concurrent: true,
      };
      expect(functionCallBlock.input.parse(validIn)).toEqual(validIn);
    });
  });

  describe("Code Block", () => {
    it("has valid metadata and schema", () => {
      expect(codeBlock.id).toBe("iem.conductor.code");
      const validIn = {
        language: "python" as const,
        code: "print('hello')",
        variables: { input1: "test" },
      };
      expect(codeBlock.input.parse(validIn)).toEqual(validIn);
    });

    it("executes mock sandbox logic", async () => {
      const output = await codeBlock.agent.invoke({
        language: "python",
        code: "print('hello')",
      });
      expect(output.result).toContain("Executed python code");
    });
  });

  describe("Sub-Agent Block", () => {
    let originalEnv: typeof process.env;

    beforeEach(() => {
      originalEnv = { ...process.env };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it("has valid metadata and schema", () => {
      expect(agentBlock.id).toBe("iem.conductor.agent");
      const validIn = { instructions: "Translate", input: { text: "hello" } };
      expect(agentBlock.input.parse(validIn)).toEqual(validIn);
    });

    it("executes simulated/fallback when API key is missing", async () => {
      delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      const res = await agentBlock.agent.invoke({
        instructions: "Translate",
        input: "hello",
      });
      expect(res.output).toContain(
        "Simulated response from agent based on: Translate",
      );
      expect(res.output).toContain("hello");
    });

    it("executes real LLM call when API key is present", async () => {
      process.env.GOOGLE_GENERATIVE_AI_API_KEY = "dummy-key";
      const { generateText } = await import("ai");
      const { google } = await import("@ai-sdk/google");

      vi.mocked(generateText).mockResolvedValue({
        text: "Real response from sub-agent block",
      } as any);

      vi.mocked(google).mockReturnValue({} as any);

      const res = await agentBlock.agent.invoke({
        instructions: "Translate",
        input: "hello",
      });

      expect(res.output).toBe("Real response from sub-agent block");
    });
  });
});
