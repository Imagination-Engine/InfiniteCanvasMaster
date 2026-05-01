import { BalnceEnvelope } from "./envelope";

export interface NodeInputAdapter<TInput = unknown> {
  readonly id: string;
  readonly supports: string[];
  adapt(args: {
    baseInput: TInput;
    envelopes: BalnceEnvelope[];
    nodeSpec: any;
    traceId: string;
  }): Promise<TInput> | TInput;
}

export class NodeInputAdapterRegistry {
  private adapters: Map<string, NodeInputAdapter> = new Map();
  private defaultAdapter?: NodeInputAdapter;

  register(adapter: NodeInputAdapter) {
    adapter.supports.forEach((key) => {
      this.adapters.set(key, adapter);
    });
  }

  registerDefault(adapter: NodeInputAdapter) {
    this.defaultAdapter = adapter;
  }

  async adapt<TInput>(args: {
    baseInput: TInput;
    envelopes: BalnceEnvelope[];
    nodeSpec: any;
    traceId: string;
  }): Promise<TInput> {
    const { nodeSpec } = args;
    const adapter =
      this.adapters.get(`tool:${nodeSpec.toolName}`) ||
      this.adapters.get(`type:${nodeSpec.type}`) ||
      this.defaultAdapter;

    if (!adapter) return args.baseInput;

    return adapter.adapt(args) as Promise<TInput> | TInput;
  }
}

export class DefaultStrictInputAdapter implements NodeInputAdapter {
  readonly id = "default-strict";
  readonly supports = [];

  adapt(args: {
    baseInput: any;
    envelopes: BalnceEnvelope[];
    nodeSpec: any;
  }): any {
    const { baseInput, envelopes, nodeSpec } = args;
    let mergedInput = { ...baseInput };

    for (const env of envelopes) {
      if (env.payload && typeof env.payload === "object") {
        mergedInput = { ...mergedInput, ...env.payload };
      }
    }

    const isStrict = nodeSpec?.data?.isStrict || false;
    if (!isStrict) {
      const instructions = envelopes
        .map((e) => e.instruction?.text)
        .filter(Boolean);

      if (instructions.length > 0) {
        mergedInput._a2a_instructions = instructions;
      }
    }

    return mergedInput;
  }
}

export class LegacyAdditionalInstructionsAdapter implements NodeInputAdapter {
  readonly id = "legacy-instructions";
  readonly supports = [];

  adapt(args: { baseInput: any; envelopes: BalnceEnvelope[] }): any {
    const { baseInput, envelopes } = args;
    let mergedInput = { ...baseInput };

    for (const env of envelopes) {
      if (env.payload && typeof env.payload === "object") {
        mergedInput = { ...mergedInput, ...env.payload };
      }
    }

    const instructions = envelopes
      .map((e) => e.instruction?.text)
      .filter(Boolean);

    if (instructions.length > 0) {
      const combined = instructions.join("\n\n");
      mergedInput.additionalInstructions = combined;
      mergedInput._instructions = combined;
    }

    return mergedInput;
  }
}
