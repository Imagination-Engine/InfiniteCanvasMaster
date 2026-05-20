import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AgentNodeExecutor } from "./AgentNode.js";
import {
  ConductorNode,
  ConductorRuntimeState,
  ConductorEnvelope,
} from "../types/runtime.js";

// Mock the Vercel AI SDK and Google provider
const mockGenerateText = vi.fn();
vi.mock("ai", () => ({
  generateText: (...args: any[]) => mockGenerateText(...args),
}));

vi.mock("@ai-sdk/google", () => ({
  google: vi.fn().mockImplementation((modelName: string) => ({
    modelName,
  })),
}));

describe("AgentNodeExecutor Unit & Adversarial Tests", () => {
  let originalEnv: typeof process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  const baseState: ConductorRuntimeState = {
    runId: "run_123",
    graphId: "graph_123",
    items: [],
    memory: {},
    variables: {
      globalUser: "Alice",
    },
    messages: [],
    artifacts: [],
    errors: [],
  };

  const baseNode: ConductorNode = {
    id: "node_agent_1",
    canvasBlockId: "block_agent_1",
    kind: "agent",
    label: "Agent Persona",
    inputPorts: [],
    outputPorts: [],
    config: {},
    runtime: {
      allowedTools: ["tool_web_search"],
    },
  };

  describe("Robust Prompt & Instruction Retrieval", () => {
    it("should retrieve instructions from config.instructions", async () => {
      const node = {
        ...baseNode,
        config: {
          instructions: "Analyze this: {{$globalUser}}",
        },
      };

      const executor = new AgentNodeExecutor();
      const result = await executor.execute({
        node,
        state: baseState,
        incoming: [],
      });

      expect(result.outputs[0].payload).toHaveProperty(
        "text",
        "Simulated response from agent based on: Analyze this: Alice",
      );
    });

    it("should retrieve instructions from config.userPromptTemplate", async () => {
      const node = {
        ...baseNode,
        config: {
          userPromptTemplate: "Draft a reply to {{$globalUser}}",
        },
      };

      const executor = new AgentNodeExecutor();
      const result = await executor.execute({
        node,
        state: baseState,
        incoming: [],
      });

      expect(result.outputs[0].payload).toHaveProperty(
        "text",
        "Simulated response from agent based on: Draft a reply to Alice",
      );
    });

    it("should retrieve instructions from config.inputs.instructions", async () => {
      const node = {
        ...baseNode,
        config: {
          inputs: {
            instructions: "Summarize for {{$globalUser}}",
          },
        },
      };

      const executor = new AgentNodeExecutor();
      const result = await executor.execute({
        node,
        state: baseState,
        incoming: [],
      });

      expect(result.outputs[0].payload).toHaveProperty(
        "text",
        "Simulated response from agent based on: Summarize for Alice",
      );
    });

    it("should retrieve instructions from node.inputs.instructions (as fallback)", async () => {
      const node = {
        ...baseNode,
        inputs: {
          instructions: "Say hello to {{$globalUser}}",
        } as any,
      };

      const executor = new AgentNodeExecutor();
      const result = await executor.execute({
        node,
        state: baseState,
        incoming: [],
      });

      expect(result.outputs[0].payload).toHaveProperty(
        "text",
        "Simulated response from agent based on: Say hello to Alice",
      );
    });
  });

  describe("Upstream Context Aggregation", () => {
    it("should aggregate text and json payloads from upstream envelopes", async () => {
      const node = {
        ...baseNode,
        config: {
          instructions: "Use this context: {{$globalUser}}",
        },
      };

      const incomingEnvelopes: ConductorEnvelope[] = [
        {
          id: "env_1",
          runId: "run_123",
          graphId: "graph_123",
          sourceNodeId: "node_scraper",
          type: "data",
          payload: "Extracted article title: BALNCE AI launch",
          trace: { previousEnvelopeIds: [], attempt: 1, spanId: "span_1" },
          createdAt: new Date().toISOString(),
        },
        {
          id: "env_2",
          runId: "run_123",
          graphId: "graph_123",
          sourceNodeId: "node_summary",
          type: "agent_message",
          payload: {
            text: "This is the summary of the premium Balnce AI features.",
          },
          trace: { previousEnvelopeIds: [], attempt: 1, spanId: "span_2" },
          createdAt: new Date().toISOString(),
        },
      ];

      const executor = new AgentNodeExecutor();
      const result = await executor.execute({
        node,
        state: baseState,
        incoming: incomingEnvelopes,
      });

      const responseText = (result.outputs[0].payload as any).text;
      expect(responseText).toContain(
        "Simulated response from agent based on: Use this context: Alice",
      );
      expect(responseText).toContain(
        "[Upstream Context from Node node_scraper (Type: data)]",
      );
      expect(responseText).toContain(
        "Extracted article title: BALNCE AI launch",
      );
      expect(responseText).toContain(
        "[Upstream Context from Node node_summary (Type: agent_message)]",
      );
      expect(responseText).toContain(
        "This is the summary of the premium Balnce AI features.",
      );
    });
  });

  describe("Real LLM Call & Vitest Mocks", () => {
    it("should invoke generateText when GOOGLE_GENERATIVE_AI_API_KEY is defined", async () => {
      process.env.GOOGLE_GENERATIVE_AI_API_KEY = "dummy-api-key";
      mockGenerateText.mockResolvedValue({
        text: "Real LLM reply: sovereign digital identity created successfully.",
      });

      const node = {
        ...baseNode,
        config: {
          instructions: "Initialize agent for {{$globalUser}}",
        },
      };

      const executor = new AgentNodeExecutor();
      const result = await executor.execute({
        node,
        state: baseState,
        incoming: [],
      });

      expect(mockGenerateText).toHaveBeenCalledTimes(1);
      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: "Initialize agent for Alice",
        }),
      );

      expect(result.outputs[0].payload).toEqual({
        text: "Real LLM reply: sovereign digital identity created successfully.",
      });
      expect(result.logs[0].message).toBe(
        "Agent execution completed (real LLM)",
      );
    });
  });

  describe("Adversarial Conditions", () => {
    it("should throw safety error if requiresTools is enabled but allowedTools is empty", async () => {
      const node = {
        ...baseNode,
        config: {
          instructions: "Run search",
          requiresTools: true,
        },
        runtime: {
          allowedTools: [],
        },
      };

      const executor = new AgentNodeExecutor();
      await expect(
        executor.execute({
          node,
          state: baseState,
          incoming: [],
        }),
      ).rejects.toThrow(
        /Agent node requires tools but allowedTools list is empty/,
      );
    });

    it("should fall back gracefully to simulation if the LLM call fails with an exception", async () => {
      process.env.GOOGLE_GENERATIVE_AI_API_KEY = "dummy-api-key";
      mockGenerateText.mockRejectedValue(new Error("API rate limit exceeded"));

      const node = {
        ...baseNode,
        config: {
          instructions: "Handle request",
        },
      };

      const executor = new AgentNodeExecutor();
      const result = await executor.execute({
        node,
        state: baseState,
        incoming: [],
      });

      // Assert it falls back gracefully
      expect(result.outputs[0].payload).toHaveProperty(
        "text",
        "Simulated response from agent based on: Handle request",
      );
      expect(result.logs[0].message).toBe(
        "Agent execution completed (simulation fallback)",
      );
      expect(result.logs[0].fallbackReason).toBe("API rate limit exceeded");
    });
  });
});
