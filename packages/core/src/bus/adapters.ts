import { BalnceEnvelope, NodeInputAdapter } from "./protocol";

export class NodeInputAdapterRegistry {
  private adapters: Map<string, NodeInputAdapter> = new Map();
  private defaultAdapter?: NodeInputAdapter;

  register(adapter: NodeInputAdapter) {
    if (adapter.nodeType) {
      this.adapters.set(`type:${adapter.nodeType}`, adapter);
    }
    if (adapter.toolName) {
      this.adapters.set(`tool:${adapter.toolName}`, adapter);
    }
  }

  registerDefault(adapter: NodeInputAdapter) {
    this.defaultAdapter = adapter;
  }

  async adapt<TInput>(args: {
    envelopes: BalnceEnvelope[];
    baseInput: TInput;
    nodeSpec: any;
    runContext: any;
  }): Promise<TInput> {
    const { nodeSpec } = args;
    const adapter =
      this.adapters.get(`tool:${nodeSpec.toolName}`) ||
      this.adapters.get(`type:${nodeSpec.type}`) ||
      this.defaultAdapter;

    if (!adapter) {
      return args.baseInput;
    }

    return adapter.fromEnvelopeBatch(args) as Promise<TInput> | TInput;
  }
}

/**
 * Default adapter that merges payloads and instructions safely.
 */
export class DefaultStrictInputAdapter implements NodeInputAdapter {
  fromEnvelopeBatch(args: {
    envelopes: BalnceEnvelope[];
    baseInput: any;
    nodeSpec: any;
  }): any {
    const { envelopes, baseInput, nodeSpec } = args;
    let mergedInput = { ...baseInput };

    for (const env of envelopes) {
      if (env.payload && typeof env.payload === "object") {
        mergedInput = { ...mergedInput, ...env.payload };
      }
    }

    // Group instructions ONLY if the node is not marked as strict OR if it explicitly allows A2A instructions
    const isStrict = nodeSpec?.data?.isStrict || false;
    const allowsA2A = nodeSpec?.data?.allowsA2AInstructions || false;

    if (!isStrict || allowsA2A) {
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

/**
 * Transitional adapter for legacy blocks expecting string inputs.
 */
export class LegacyAdditionalInstructionsAdapter implements NodeInputAdapter {
  fromEnvelopeBatch(args: {
    envelopes: BalnceEnvelope[];
    baseInput: any;
  }): any {
    const { envelopes, baseInput } = args;
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

/**
 * Adapter for OpenClaw task schemas.
 */
export class OpenClawTaskAdapter implements NodeInputAdapter {
  toolName = "openclaw_task";

  fromEnvelopeBatch(args: {
    envelopes: BalnceEnvelope[];
    baseInput: any;
  }): any {
    const { envelopes, baseInput } = args;
    const mergedInput = { ...baseInput };

    // OpenClaw expects a specific "taskDescription" or "context" field
    const context = envelopes
      .map((e) => e.payload?.result || e.payload?.summary)
      .filter(Boolean)
      .join("\n\n");

    if (context) {
      mergedInput.taskContext = context;
    }

    return mergedInput;
  }
}
