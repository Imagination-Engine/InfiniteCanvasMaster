export class NodeInputAdapterRegistry {
  adapters = new Map();
  defaultAdapter;
  register(adapter) {
    adapter.supports.forEach((key) => {
      this.adapters.set(key, adapter);
    });
  }
  registerDefault(adapter) {
    this.defaultAdapter = adapter;
  }
  async adapt(args) {
    const { nodeSpec } = args;
    const adapter =
      this.adapters.get(`tool:${nodeSpec.toolName}`) ||
      this.adapters.get(`type:${nodeSpec.type}`) ||
      this.defaultAdapter;
    if (!adapter) return args.baseInput;
    return adapter.adapt(args);
  }
}
export class DefaultStrictInputAdapter {
  id = "default-strict";
  supports = [];
  adapt(args) {
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
export class LegacyAdditionalInstructionsAdapter {
  id = "legacy-instructions";
  supports = [];
  adapt(args) {
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
