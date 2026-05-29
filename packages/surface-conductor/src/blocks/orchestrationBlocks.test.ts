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
  delayBlock,
  subGraphBlock,
  jsonParseBlock,
  classifyBlock,
  forEachBlock,
} from "./orchestrationBlocks";
import { SubGraphRegistry } from "../runtime/subgraphRegistry";
import { FunctionRegistry } from "../runtime/functionRegistry";

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
      expect(res.output).toContain("Simulated Google Gemini response");
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

  describe("Delay Block", () => {
    it("successfully delays for a positive duration", async () => {
      const start = Date.now();
      const output = await delayBlock.agent.invoke({ ms: 5 });
      const duration = Date.now() - start;
      expect(output).toEqual({ resumed: true });
      expect(duration).toBeGreaterThanOrEqual(4);
    });

    it("throws error for negative delay duration", async () => {
      await expect(delayBlock.agent.invoke({ ms: -10 })).rejects.toThrow(
        "Delay duration cannot be negative",
      );

      expect(() => delayBlock.input.parse({ ms: -10 })).toThrow();
    });
  });

  describe("Sub-Graph Block & Scope Scenarios", () => {
    beforeEach(() => {
      SubGraphRegistry.clear();
    });

    it("registers and calls local subgraph on same canvas", async () => {
      const graphId = SubGraphRegistry.register({
        canvasId: "canvas-main",
        name: "MyLocalSubgraph",
        globalAccess: false,
      });

      const output = await subGraphBlock.agent.invoke({
        canvasId: "canvas-main",
        graphId,
      });

      expect(output.result.success).toBe(true);
      expect(output.result.graphId).toBe(graphId);
    });

    it("throws access denied for local subgraph accessed from different canvas", async () => {
      const graphId = SubGraphRegistry.register({
        canvasId: "canvas-main",
        name: "MyLocalSubgraph",
        globalAccess: false,
      });

      await expect(
        subGraphBlock.agent.invoke({
          canvasId: "canvas-other",
          graphId,
        }),
      ).rejects.toThrow(
        "Access denied: Sub-Graph MyLocalSubgraph is local to canvas-main",
      );
    });

    it("allows global subgraph access project-wide across any canvas", async () => {
      const graphId = SubGraphRegistry.register({
        canvasId: "canvas-main",
        name: "MyGlobalSubgraph",
        globalAccess: true,
      });

      const output = await subGraphBlock.agent.invoke({
        canvasId: "canvas-other",
        graphId,
      });

      expect(output.result.success).toBe(true);
    });

    it("throws error when calling non-existent subgraph", async () => {
      await expect(
        subGraphBlock.agent.invoke({
          canvasId: "canvas-main",
          graphId: "sg_nonexistent",
        }),
      ).rejects.toThrow("Sub-Graph with ID sg_nonexistent not found");
    });
  });

  describe("JSON Parse/Stringify Block", () => {
    it("parses valid JSON string", async () => {
      const output = await jsonParseBlock.agent.invoke({
        payload: '{"key": "value"}',
        mode: "parse",
      });
      expect(output.result).toEqual({ key: "value" });
      expect(output.error).toBeUndefined();
    });

    it("handles already parsed JSON objects in parse mode", async () => {
      const inputObj = { already: "parsed" };
      const output = await jsonParseBlock.agent.invoke({
        payload: inputObj,
        mode: "parse",
      });
      expect(output.result).toBe(inputObj);
    });

    it("returns error on invalid JSON in parse mode", async () => {
      const output = await jsonParseBlock.agent.invoke({
        payload: "{invalid json}",
        mode: "parse",
      });
      expect(output.result).toBeNull();
      expect(output.error).toBeDefined();
    });

    it("stringifies object payload", async () => {
      const output = await jsonParseBlock.agent.invoke({
        payload: { key: "value" },
        mode: "stringify",
      });
      expect(output.result).toBe('{"key":"value"}');
    });

    it("returns already stringified JSON in stringify mode without double serialization", async () => {
      const output = await jsonParseBlock.agent.invoke({
        payload: '{"key":"value"}',
        mode: "stringify",
      });
      expect(output.result).toBe('{"key":"value"}');
    });

    it("stringifies plain strings in stringify mode if not valid JSON", async () => {
      const output = await jsonParseBlock.agent.invoke({
        payload: "hello world",
        mode: "stringify",
      });
      expect(output.result).toBe('"hello world"');
    });
  });

  describe("AI Classify Block", () => {
    it("fails Zod schema validation with 0 categories", () => {
      expect(() =>
        classifyBlock.input.parse({
          inputString: "hello",
          categories: [],
        }),
      ).toThrow();
    });

    it("passes Zod schema validation with 1 or more categories", () => {
      const parsed = classifyBlock.input.parse({
        inputString: "hello",
        categories: ["greeting"],
      });
      expect(parsed.categories).toEqual(["greeting"]);
    });
  });

  describe("For Each Block", () => {
    it("returns first item from collection", async () => {
      const output = await forEachBlock.agent.invoke({
        collection: ["first", "second"],
      });
      expect(output.item).toBe("first");
    });

    it("returns null gracefully for empty/missing collection", async () => {
      const output = await forEachBlock.agent.invoke({
        collection: [],
      });
      expect(output.item).toBeNull();
    });
  });

  describe("Webhook Call Block (Real Execution)", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("successfully calls fetch with options and parses JSON response", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: () => "application/json",
        },
        json: async () => ({ success: true, data: "ok" }),
      });
      vi.stubGlobal("fetch", mockFetch);

      const output = await webhookCallBlock.agent.invoke({
        url: "https://api.example.com/webhook",
        method: "POST",
        payload: { test: 123 },
        headers: { "X-Test": "yes" },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/webhook",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "X-Test": "yes",
          }),
          body: JSON.stringify({ test: 123 }),
        }),
      );
      expect(output.response).toEqual({ success: true, data: "ok" });
    });

    it("successfully calls fetch with options and parses Text response", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: () => "text/plain",
        },
        text: async () => "raw response",
      });
      vi.stubGlobal("fetch", mockFetch);

      const output = await webhookCallBlock.agent.invoke({
        url: "https://api.example.com/webhook",
        method: "GET",
      });

      expect(output.response).toBe("raw response");
    });

    it("throws descriptive error when fetch returns non-ok status", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        headers: {
          get: () => "application/json",
        },
        json: async () => ({ message: "Bad Request" }),
      });
      vi.stubGlobal("fetch", mockFetch);

      await expect(
        webhookCallBlock.agent.invoke({
          url: "https://api.example.com/webhook",
          method: "POST",
        }),
      ).rejects.toThrow(
        'Webhook call failed: Webhook HTTP 400: {"message":"Bad Request"}',
      );
    });
  });

  describe("Loop Block Edge Cases", () => {
    it("throws Zod validation error for negative maxIterations", () => {
      expect(() =>
        loopBlock.input.parse({
          collection: [1, 2],
          maxIterations: -5,
        }),
      ).toThrow();
    });

    it("throws direct error if negative iterations are passed", async () => {
      await expect(
        loopBlock.agent.invoke({
          collection: [1, 2],
          maxIterations: -5,
        }),
      ).rejects.toThrow("Maximum iterations cannot be negative");
    });

    it("handles empty or missing collection gracefully", async () => {
      const output = await loopBlock.agent.invoke({
        collection: undefined,
        loopTarget: "targetNode",
      });
      expect(output.items).toEqual([]);
      expect(output.loopTarget).toBe("targetNode");
    });
  });
});
