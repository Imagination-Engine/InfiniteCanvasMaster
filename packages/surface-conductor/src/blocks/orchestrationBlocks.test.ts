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
        canvasId: "canvas-123",
      };
      expect(functionBlock.input.parse(validIn)).toEqual(validIn);
    });

    it("Function Call has valid metadata and schema", () => {
      expect(functionCallBlock.id).toBe("iem.conductor.functionCall");
      const validIn = {
        functionId: "fn_123",
        arguments: { arg1: "val" },
        concurrent: true,
        canvasId: "canvas-123",
      };
      expect(functionCallBlock.input.parse(validIn)).toEqual(validIn);
    });

    it("restricts local function access to the same canvas only", async () => {
      // Define local function on canvasA
      const defResult = await functionBlock.agent.invoke({
        canvasId: "canvasA",
        name: "localMath",
        globalAccess: false,
        inputs: ["x", "y"],
      });
      const funcId = defResult.functionId;
      expect(funcId).toBeDefined();

      // Invoke successfully from canvasA
      const callSuccess = await functionCallBlock.agent.invoke({
        canvasId: "canvasA",
        functionId: funcId,
        arguments: { x: 10, y: 20 },
      });
      expect(callSuccess.result.success).toBe(true);

      // Fail invocation from canvasB (access violation)
      await expect(
        functionCallBlock.agent.invoke({
          canvasId: "canvasB",
          functionId: funcId,
          arguments: { x: 10, y: 20 },
        }),
      ).rejects.toThrow(
        "Access denied: Function localMath is local to canvasA",
      );
    });

    it("allows global function access project-wide across any canvas", async () => {
      // Define global function on canvasA
      const defResult = await functionBlock.agent.invoke({
        canvasId: "canvasA",
        name: "globalLogger",
        globalAccess: true,
        inputs: ["message"],
      });
      const funcId = defResult.functionId;

      // Invoke successfully from canvasB
      const callSuccess = await functionCallBlock.agent.invoke({
        canvasId: "canvasB",
        functionId: funcId,
        arguments: { message: "Hello world!" },
      });
      expect(callSuccess.result.success).toBe(true);
    });

    it("throws error for missing or incorrect function call parameters", async () => {
      const defResult = await functionBlock.agent.invoke({
        canvasId: "canvasA",
        name: "strictFunc",
        globalAccess: true,
        inputs: ["requiredArg"],
      });
      const funcId = defResult.functionId;

      // Call without required argument
      await expect(
        functionCallBlock.agent.invoke({
          canvasId: "canvasA",
          functionId: funcId,
          arguments: {},
        }),
      ).rejects.toThrow("Missing required argument: requiredArg");
    });

    it("handles concurrent option correctly", async () => {
      const defResult = await functionBlock.agent.invoke({
        canvasId: "canvasA",
        name: "asyncTask",
        globalAccess: true,
        inputs: ["taskName"],
      });
      const funcId = defResult.functionId;

      // Call with concurrent: true
      const concurrentResult = await functionCallBlock.agent.invoke({
        canvasId: "canvasA",
        functionId: funcId,
        arguments: { taskName: "CleanUp" },
        concurrent: true,
      });
      expect(concurrentResult.result.concurrent).toBe(true);
      expect(concurrentResult.result.status).toBe("pending");

      // Call with concurrent: false
      const sequentialResult = await functionCallBlock.agent.invoke({
        canvasId: "canvasA",
        functionId: funcId,
        arguments: { taskName: "CleanUp" },
        concurrent: false,
      });
      expect(sequentialResult.result.concurrent).toBe(false);
      expect(sequentialResult.result.status).toBe("completed");
    });

    it("Adversarial: throws error when calling non-existent function ID", async () => {
      await expect(
        functionCallBlock.agent.invoke({
          canvasId: "canvasA",
          functionId: "fn_nonexistent",
          arguments: {},
        }),
      ).rejects.toThrow("Function with ID fn_nonexistent not found");
    });
  });

  describe("Code Block", () => {
    it("has valid metadata and schema", () => {
      expect(codeBlock.id).toBe("iem.conductor.code");
      const validIn = {
        language: "javascript" as const,
        code: "return 1 + 2;",
        variables: { input1: "test" },
      };
      expect(codeBlock.input.parse(validIn)).toEqual(validIn);
    });

    it("executes standard JavaScript and resolves returned value", async () => {
      const output = await codeBlock.agent.invoke({
        language: "javascript",
        code: "return 100 * 2;",
      });
      expect(output.result).toBe(200);
    });

    it("successfully accesses variables inside sandbox context", async () => {
      const output = await codeBlock.agent.invoke({
        language: "javascript",
        code: "return x + y;",
        variables: { x: 5, y: 15 },
      });
      expect(output.result).toBe(20);
    });

    it("resolves asynchronous promises and native awaits inside sandbox", async () => {
      const output = await codeBlock.agent.invoke({
        language: "javascript",
        code: `
          const val = await Promise.resolve("async success");
          return val.toUpperCase();
        `,
      });
      expect(output.result).toBe("ASYNC SUCCESS");
    });

    it("gracefully catches syntax errors in user script", async () => {
      const output = await codeBlock.agent.invoke({
        language: "javascript",
        code: "return * 2;",
      });
      expect(output.result).toBeNull();
      expect(output.error).toBeDefined();
    });

    it("safely exits infinite loop blocks through VM execution timeout", async () => {
      const output = await codeBlock.agent.invoke({
        language: "javascript",
        code: "while(true) {}",
      });
      expect(output.result).toBeNull();
      expect(output.error).toContain("Script execution timed out");
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
