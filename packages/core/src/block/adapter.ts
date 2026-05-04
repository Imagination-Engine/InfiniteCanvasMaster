// @ts-nocheck
import type { BlockDefinition } from "./protocol";

/**
 * Adapter to convert an IEM BlockDefinition into a native Mastra Tool.
 */
export async function createMastraToolFromBlock(
  block: BlockDefinition<any, any>,
) {
  const { createTool } = await import("@mastra/core/tools");
  return createTool({
    id: block.id,
    description: block.description,
    inputSchema: block.input,
    outputSchema: block.output,
    execute: async (inputData) => {
      return await block.agent.invoke(inputData);
    },
  });
}
