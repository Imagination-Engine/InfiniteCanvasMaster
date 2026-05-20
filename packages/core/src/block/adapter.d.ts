import type { BlockDefinition } from "./protocol";
/**
 * Adapter to convert an IEM BlockDefinition into a native Mastra Tool.
 */
export declare function createMastraToolFromBlock(
  block: BlockDefinition<any, any>,
): Promise<
  import("@mastra/core/tools").Tool<
    unknown,
    unknown,
    unknown,
    unknown,
    import("@mastra/core/tools").ToolExecutionContext<
      unknown,
      unknown,
      unknown
    >,
    string,
    unknown
  >
>;
//# sourceMappingURL=adapter.d.ts.map
