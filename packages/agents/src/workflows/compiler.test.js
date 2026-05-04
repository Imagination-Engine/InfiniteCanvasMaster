import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  blockRegistry,
  messageBus,
  NodeInputAdapterRegistry,
  DefaultStrictInputAdapter,
  createEnvelope,
} from "@iem/core";
import { z } from "zod";
import { compileGraphToWorkflow } from "./compiler";
// Mock mastra workflows so we can capture the step configuration
let capturedSteps = [];
vi.mock("@mastra/core/workflows", () => ({
  Workflow: class {
    id;
    constructor(opts) {
      this.id = opts.id;
    }
    step(s) {
      return this;
    }
    then(s) {
      return this;
    }
    commit() {
      return this;
    }
  },
  createStep: (opts) => {
    capturedSteps.push(opts);
    return opts;
  },
}));
describe("DAG Workflow Compiler with Fabric v2", () => {
  beforeEach(() => {
    capturedSteps = [];
    vi.clearAllMocks();
    blockRegistry.clear();
    blockRegistry.register({
      id: "mock.block",
      name: "Mock",
      category: "text",
      mode: "triggered",
      description: "Mock",
      input: z.object({ val: z.number().optional() }),
      output: z.object({ val: z.number() }),
      agent: {
        invoke: async (input) => ({ val: (input.val || 0) * 2 }),
      },
    });
    blockRegistry.register({
      id: "mock.block.strict",
      name: "Strict Mock",
      category: "text",
      mode: "triggered",
      description: "Strict Mock",
      input: z.object({ strictVal: z.number() }),
      output: z.object({ result: z.number() }),
      agent: {
        invoke: async (input) => ({ result: input.strictVal * 2 }),
      },
    });
  });
  it("should execute a linear DAG and propagate v2 envelopes", async () => {
    const publishSpy = vi.spyOn(messageBus, "publish");
    const graph = {
      nodes: [
        { id: "node1", type: "mock.block", data: { inputs: { val: 5 } } },
        { id: "node2", type: "mock.block", data: { inputs: {} } },
      ],
      edges: [{ source: "node1", target: "node2" }],
    };
    compileGraphToWorkflow(graph);
    const step1 = capturedSteps.find((s) => s.id === "node1");
    const step2 = capturedSteps.find((s) => s.id === "node2");
    const env1 = await step1.execute({
      getStepResult: () => null,
      getInitData: () => null,
    });
    expect(env1.payload.val).toBe(10);
    expect(env1.lane).toBe("agent_stream");
    const env2 = await step2.execute({
      getStepResult: (id) => (id === "node1" ? env1 : null),
      getInitData: () => null,
    });
    expect(env2.payload.val).toBe(20);
    expect(publishSpy).toHaveBeenCalledTimes(2);
  });
  it("adversarial: should safely strip instructions for strict blocks", async () => {
    const registry = new NodeInputAdapterRegistry();
    registry.registerDefault(new DefaultStrictInputAdapter());
    const graph = {
      nodes: [
        {
          id: "strict_node",
          type: "mock.block.strict",
          data: { inputs: {}, isStrict: true },
        },
      ],
      edges: [],
    };
    compileGraphToWorkflow(graph, { adapterRegistry: registry });
    const strictStep = capturedSteps.find((s) => s.id === "strict_node");
    const triggerData = createEnvelope({
      lane: "agent_stream",
      source: { type: "system", id: "trigger" },
      event: { type: "start" },
      delivery: { class: "ephemeral" },
      payload: { strictVal: 50 },
      instruction: { text: "Be strict", trust: "trusted" },
    });
    const env = await strictStep.execute({
      getStepResult: () => null,
      getInitData: () => triggerData,
    });
    expect(env.payload.result).toBe(100);
    expect(env.lane).toBe("agent_stream");
  });
});
