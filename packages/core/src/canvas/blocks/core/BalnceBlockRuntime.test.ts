import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";
import { createInputPort, createOutputPort } from "./BlockPorts";
import { BalnceBlockSpec } from "./BalnceBlockSpec";
import { BalnceBlockInstance } from "./BalnceBlockInstance";
import { BalnceBlockRuntime } from "./BalnceBlockRuntime";
import { BalnceBlockEventType } from "./BlockEvents";
import { RuntimeEventBus } from "../../runtime/RuntimeEventBus";
import { BlockRuntimeRegistry } from "../../runtime/BlockRuntimeRegistry";

// 1. Concrete Test Spec Definition
const UpperCaseBlockSpec: BalnceBlockSpec = {
  id: "iem.test.upperCase",
  version: "1.0.0",
  kind: "transform",
  title: "Upper Case Block",
  description: "Converts inputs to uppercase",
  schema: z.object({
    suffix: z.string().default("!"),
  }),
  inputPorts: {
    text: createInputPort({
      name: "text",
      description: "Text to capitalize",
      type: "text",
      schema: z.string(),
    }),
  },
  outputPorts: {
    result: createOutputPort({
      name: "result",
      description: "Uppercase output",
      type: "text",
      schema: z.string(),
    }),
  },
};

// 2. Concrete Test Runtime Definition
class UpperCaseBlockRuntime extends BalnceBlockRuntime {
  constructor() {
    super(UpperCaseBlockSpec);
  }

  public async execute(
    context: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const textInput = context.inputs.text as string;
    const suffix = (this.instance?.props.suffix as string) || "";
    return {
      result: textInput.toUpperCase() + suffix,
    };
  }
}

describe("Balnce Universal Block Contract", () => {
  let runtime: UpperCaseBlockRuntime;
  let instance: BalnceBlockInstance;

  beforeEach(() => {
    runtime = new UpperCaseBlockRuntime();
    instance = {
      id: "block-inst-1",
      canvasId: "canvas-1",
      specId: UpperCaseBlockSpec.id,
      position: { x: 100, y: 100, width: 200, height: 150 },
      runtimeStatus: "idle",
      props: { suffix: "!!!" },
      memoryRefs: [],
      artifactRefs: [],
      connectionRefs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    RuntimeEventBus.clear();
    BlockRuntimeRegistry.clear();
  });

  it("should successfully hydrate with an instance and register specs", () => {
    BlockRuntimeRegistry.registerSpec(UpperCaseBlockSpec);
    BlockRuntimeRegistry.registerInstance(instance.id, runtime);

    runtime.hydrate(instance);

    expect(runtime.getInstance()?.id).toBe(instance.id);
    expect(runtime.getInstance()?.runtimeStatus).toBe("idle");
    expect(BlockRuntimeRegistry.getSpec(UpperCaseBlockSpec.id)).toBe(
      UpperCaseBlockSpec,
    );
    expect(BlockRuntimeRegistry.getRuntime(instance.id)).toBe(runtime);
  });

  it("should process and validate dynamic inputs received on ports", async () => {
    runtime.hydrate(instance);

    // Subscribe to received input events
    const eventHandler = vi.fn();
    RuntimeEventBus.subscribe(
      BalnceBlockEventType.INPUT_RECEIVED,
      eventHandler,
    );

    await runtime.receive("text", "hello world");

    expect(eventHandler).toHaveBeenCalled();
    expect(runtime.getInstance()?.props.text).toBe("hello world");
  });

  it("should reject inputs matching incorrect schema validations", async () => {
    runtime.hydrate(instance);

    await expect(runtime.receive("text", 12345)).rejects.toThrow();
    expect(runtime.getInstance()?.runtimeStatus).toBe("error");
  });

  it("should run full context build, planning, execution, and outputs generation cycle", async () => {
    runtime.hydrate(instance);

    const contextBuiltHandler = vi.fn();
    const planCreatedHandler = vi.fn();
    const outputCreatedHandler = vi.fn();

    RuntimeEventBus.subscribe(
      BalnceBlockEventType.CONTEXT_BUILT,
      contextBuiltHandler,
    );
    RuntimeEventBus.subscribe(
      BalnceBlockEventType.PLAN_CREATED,
      planCreatedHandler,
    );
    RuntimeEventBus.subscribe(
      BalnceBlockEventType.OUTPUT_CREATED,
      outputCreatedHandler,
    );

    // Call receive, which will auto-trigger runSequence because all required inputs are present
    await runtime.receive("text", "hello world");

    expect(contextBuiltHandler).toHaveBeenCalled();
    expect(planCreatedHandler).toHaveBeenCalled();
    expect(outputCreatedHandler).toHaveBeenCalled();
    expect(runtime.getInstance()?.runtimeStatus).toBe("complete");
  });

  it("should support wildcard event bus subscriptions", () => {
    runtime.hydrate(instance);

    const blockWildcardHandler = vi.fn();
    RuntimeEventBus.subscribe("block.*", blockWildcardHandler);

    runtime.emit("block.test-custom", { message: "wildcard test" });

    expect(blockWildcardHandler).toHaveBeenCalled();
  });
});
