import type { BalnceEnvelope } from "./envelope";
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
export declare class NodeInputAdapterRegistry {
  private adapters;
  private defaultAdapter?;
  register(adapter: NodeInputAdapter): void;
  registerDefault(adapter: NodeInputAdapter): void;
  adapt<TInput>(args: {
    baseInput: TInput;
    envelopes: BalnceEnvelope[];
    nodeSpec: any;
    traceId: string;
  }): Promise<TInput>;
}
export declare class DefaultStrictInputAdapter implements NodeInputAdapter {
  readonly id = "default-strict";
  readonly supports: never[];
  adapt(args: {
    baseInput: any;
    envelopes: BalnceEnvelope[];
    nodeSpec: any;
  }): any;
}
export declare class LegacyAdditionalInstructionsAdapter implements NodeInputAdapter {
  readonly id = "legacy-instructions";
  readonly supports: never[];
  adapt(args: { baseInput: any; envelopes: BalnceEnvelope[] }): any;
}
//# sourceMappingURL=nodeInputAdapters.d.ts.map
