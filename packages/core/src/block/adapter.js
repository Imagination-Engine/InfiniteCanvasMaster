import { createTool } from '@mastra/core/tools';
/**
 * Adapter to convert an IEM BlockDefinition into a native Mastra Tool.
 */
export function createMastraToolFromBlock(block) {
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
