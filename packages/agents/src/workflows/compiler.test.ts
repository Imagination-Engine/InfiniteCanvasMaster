import { describe, it, expect, vi, beforeEach } from "vitest";
import { blockRegistry, messageBus } from "@iem/core";
import { z } from "zod";

// Mock mastra workflows so we can capture the step configuration
let capturedSteps: any[] = [];
vi.mock("@mastra/core/workflows", () => ({
  Workflow: class {
    step() {
      return this;
    }
    then() {
      return this;
    }
    commit() {}
  },
  createStep: (config: any) => {
    capturedSteps.push(config);
    return config;
  },
}));

import { compileGraphToWorkflow } from "./compiler";

describe("DAG Workflow Compiler with A2A Envelopes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedSteps = [];

    if (!blockRegistry.get("mock.block.a")) {
      blockRegistry.register({
        id: "mock.block.a",
        name: "Mock Block A",
        description: "A test block",
        category: "test",
        mode: "triggered",
        input: z.object({
          val: z.number().optional(),
          result: z.number().optional(),
          _instructions: z.string().optional(),
          additionalInstructions: z.string().optional(),
          context: z.string().optional(),
        }),
        output: z.object({
          result: z.number(),
        }),
        agent: {
          kind: "local",
          toolName: "mock_a",
          invoke: async (input: any) => {
            return { result: (input.result || input.val || 0) + 1 };
          },
        },
      } as any);
    }

    if (!blockRegistry.get("mock.block.strict")) {
      blockRegistry.register({
        id: "mock.block.strict",
        name: "Strict Block",
        description: "A block with strict validation",
        category: "test",
        mode: "triggered",
        input: z
          .object({
            strictVal: z.number(),
          })
          .strict(),
        output: z.object({
          result: z.number(),
        }),
        agent: {
          kind: "local",
          toolName: "mock_strict",
          invoke: async (input: any) => {
            return { result: input.strictVal * 2 };
          },
        },
      } as any);
    }
  });

  it("should execute a linear DAG and propagate envelopes", async () => {
    const publishSpy = vi.spyOn(messageBus, "publish");

    const graph = {
      nodes: [
        { id: "node1", type: "mock.block.a", data: { inputs: { val: 10 } } },
        { id: "node2", type: "mock.block.a" },
      ],
      edges: [{ source: "node1", target: "node2" }],
    };

    compileGraphToWorkflow(graph);

    const node1Step = capturedSteps.find((s) => s.id === "node1");
    const node2Step = capturedSteps.find((s) => s.id === "node2");

    // Execute node 1
    const env1 = await node1Step.execute({
      getStepResult: () => null,
      getInitData: () => null,
    });

    expect(publishSpy).toHaveBeenCalledTimes(1);
    expect(env1.payload.result).toBe(11);

    // Execute node 2, providing node1's envelope as the upstream dependency
    const env2 = await node2Step.execute({
      getStepResult: (id: string) => (id === "node1" ? env1 : null),
      getInitData: () => null,
    });

    expect(publishSpy).toHaveBeenCalledTimes(2);
    // Node 2 should have received val = 11 from env1, and added 1
    expect(env2.payload.result).toBe(12);
  });

  it("adversarial: should safely strip instructions for strict blocks while preserving them in the envelope downstream", async () => {
    const publishSpy = vi.spyOn(messageBus, "publish");

    const graph = {
      nodes: [
        { id: "strict_node", type: "mock.block.strict", data: { inputs: {} } },
      ],
      edges: [],
    };

    compileGraphToWorkflow(graph);
    const strictStep = capturedSteps.find((s) => s.id === "strict_node");

    const triggerData = {
      payload: { strictVal: 50 },
      context: { secret: "do not crash" },
      instruction: "Be strict",
    };

    // If the compiler improperly injects fields into a strict block, Zod will throw here.
    // By wrapping in envelope, compiler intercepts it, injects softly.
    const env = await strictStep.execute({
      getStepResult: () => null,
      getInitData: () => triggerData,
    });

    expect(publishSpy).toHaveBeenCalledTimes(1);
    expect(env.payload.result).toBe(100);

    // The envelope context should perfectly preserve the trigger's context
    expect(env.context.secret).toBe("do not crash");
  });
});
