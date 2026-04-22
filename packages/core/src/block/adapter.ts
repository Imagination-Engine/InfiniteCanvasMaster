import { createTool } from '@mastra/core/tools';
import type { BlockDefinition } from './protocol';

/**
 * Adapter to convert an IEM BlockDefinition into a native Mastra Tool.
 */
export function createMastraToolFromBlock(block: BlockDefinition<any, any>) {
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
