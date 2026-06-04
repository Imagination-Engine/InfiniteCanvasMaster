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
let capturedSteps: any[] = [];
vi.mock("@mastra/core/workflows", () => ({
  Workflow: class {
    id: string;
    constructor(opts: any) {
      this.id = opts.id;
    }
    step(s: any) {
      return this;
    }
    then(s: any) {
      return this;
    }
    commit() {
      return this;
    }
  },
  createStep: (opts: any) => {
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
        invoke: async (input: any) => ({ val: (input.val || 0) * 2 }),
      } as any,
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
        invoke: async (input: any) => ({ result: input.strictVal * 2 }),
      } as any,
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
      getStepResult: (id: string) => (id === "node1" ? env1 : null),
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
      instruction: { text: "Be strict", trust: "trusted" } as any,
    });

    const env = await strictStep.execute({
      getStepResult: () => null,
      getInitData: () => triggerData,
    });

    expect(env.payload.result).toBe(100);
    expect(env.lane).toBe("agent_stream");
  });

  it("should conditional skip branches based on If block result", async () => {
    blockRegistry.register({
      id: "iem.conductor.if",
      name: "If",
      category: "control",
      mode: "triggered",
      description: "If block",
      input: z.object({ condition: z.boolean() }),
      output: z.object({
        branch: z.enum(["truePath", "falsePath"]),
        context: z.record(z.any()),
      }),
      agent: {
        invoke: async (input: any) => ({
          branch: input.condition ? "truePath" : "falsePath",
          context: {},
        }),
      } as any,
    });

    const graph = {
      nodes: [
        {
          id: "ifNode",
          type: "iem.conductor.if",
          data: { inputs: { condition: true } },
        },
        { id: "trueNode", type: "mock.block", data: { inputs: { val: 10 } } },
        { id: "falseNode", type: "mock.block", data: { inputs: { val: 20 } } },
        { id: "downstreamTrueNode", type: "mock.block", data: { inputs: {} } },
      ],
      edges: [
        { source: "ifNode", target: "trueNode", sourceHandle: "true" },
        { source: "ifNode", target: "falseNode", sourceHandle: "false" },
        { source: "trueNode", target: "downstreamTrueNode" },
      ],
    };

    compileGraphToWorkflow(graph);

    const ifStep = capturedSteps.find((s) => s.id === "ifNode");
    const trueStep = capturedSteps.find((s) => s.id === "trueNode");
    const falseStep = capturedSteps.find((s) => s.id === "falseNode");
    const downstreamTrueStep = capturedSteps.find(
      (s) => s.id === "downstreamTrueNode",
    );

    // Execute IF block (evaluates to truePath)
    const ifEnv = await ifStep.execute({
      getStepResult: () => null,
      getInitData: () => null,
    });
    expect(ifEnv.payload.branch).toBe("truePath");

    // Execute trueNode -> should execute normally
    const trueEnv = await trueStep.execute({
      getStepResult: (id: string) => (id === "ifNode" ? ifEnv : null),
      getInitData: () => null,
    });
    expect(trueEnv.payload.val).toBe(20); // 10 * 2

    // Execute falseNode -> should skip and return skipped envelope
    const falseEnv = await falseStep.execute({
      getStepResult: (id: string) => (id === "ifNode" ? ifEnv : null),
      getInitData: () => null,
    });
    expect(falseEnv.payload.status).toBe("skipped");

    // Execute downstreamTrueNode -> should execute since parent trueNode was not skipped
    const downstreamTrueEnv = await downstreamTrueStep.execute({
      getStepResult: (id: string) => (id === "trueNode" ? trueEnv : null),
      getInitData: () => null,
    });
    expect(downstreamTrueEnv.payload.val).toBe(40); // 20 * 2
  });

  it("should compile subgraphs with virtual call and return edges", async () => {
    blockRegistry.register({
      id: "iem.conductor.subGraphHead",
      name: "Sub-Graph Head",
      category: "control",
      mode: "ambient",
      description: "Subgraph Head",
      input: z.any(),
      output: z.any(),
      agent: {
        invoke: async (input: any) => input,
      } as any,
    });

    blockRegistry.register({
      id: "iem.conductor.subGraph",
      name: "Sub-Graph Call",
      category: "control",
      mode: "triggered",
      description: "Subgraph Call",
      input: z.any(),
      output: z.any(),
      agent: {
        invoke: async (input: any) => input,
      } as any,
    });

    const graph = {
      nodes: [
        {
          id: "callerNode",
          type: "iem.conductor.subGraph",
          data: { inputs: { subGraphId: "subGraphHeadNode" } },
        },
        {
          id: "subGraphHeadNode",
          type: "iem.conductor.subGraphHead",
          data: { inputs: { name: "TestSubGraph" } },
        },
        { id: "innerNode", type: "mock.block", data: { inputs: { val: 10 } } },
        { id: "afterCallerNode", type: "mock.block", data: { inputs: {} } },
      ],
      edges: [
        { source: "subGraphHeadNode", target: "innerNode" },
        { source: "callerNode", target: "afterCallerNode" },
      ],
    };

    compileGraphToWorkflow(graph);

    const callerStep = capturedSteps.find((s) => s.id === "callerNode");
    const headStep = capturedSteps.find((s) => s.id === "subGraphHeadNode");
    const innerStep = capturedSteps.find((s) => s.id === "innerNode");
    const afterStep = capturedSteps.find((s) => s.id === "afterCallerNode");

    expect(callerStep).toBeDefined();
    expect(headStep).toBeDefined();
    expect(innerStep).toBeDefined();
    expect(afterStep).toBeDefined();
  });
});
