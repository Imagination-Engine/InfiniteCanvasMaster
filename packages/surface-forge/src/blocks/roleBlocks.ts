import { z } from 'zod';
import { BlockDefinition, MCPToolBinding } from '@iem/core';



export const architectBlock: BlockDefinition<any, any> = {
  id: 'iem.forge.architect',
  name: 'Architect',
  description: 'Produces the structured spec',
  category: 'forge',
  input: z.object({
    prompt: z.string()
  }),
  output: z.object({
    success: z.boolean()
  }),
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'forge_architect',
    invoke: async () => ({ success: true })
  }
};

export const designerBlock: BlockDefinition<any, any> = {
  id: 'iem.forge.designer',
  name: 'Designer',
  description: 'Produces the layout and styling guidelines',
  category: 'forge',
  input: z.object({
    prompt: z.string().optional()
  }),
  output: z.object({
    success: z.boolean()
  }),
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'forge_designer',
    invoke: async () => ({ success: true })
  }
};

export const builderBlock: BlockDefinition<any, any> = {
  id: 'iem.forge.builder',
  name: 'Builder',
  description: 'Generates the actual code using Gemini',
  category: 'forge',
  input: z.object({
    context: z.string().optional()
  }),
  output: z.object({
    success: z.boolean()
  }),
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'forge_builder',
    invoke: async () => ({ success: true })
  }
};

export const testerBlock: BlockDefinition<any, any> = {
  id: 'iem.forge.tester',
  name: 'Tester',
  description: 'Evaluates the generated code against the initial spec',
  category: 'forge',
  input: z.object({
    strict: z.boolean().default(true)
  }),
  output: z.object({
    success: z.boolean(),
    errors: z.array(z.string()).optional()
  }),
  mode: 'triggered',
  agent: {
    kind: 'local',
    toolName: 'forge_tester',
    invoke: async () => ({ success: true })
  }
};