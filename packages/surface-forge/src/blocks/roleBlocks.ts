import { z } from "zod";
import { BlockDefinition, MCPToolBinding } from "@iem/core";

export const architectBlock: BlockDefinition<any, any> = {
  id: "iem.forge.architect",
  name: "Architect",
  description: "Produces the structured spec",
  category: "forge",
  input: z.object({
    prompt: z.string(),
  }),
  output: z.object({
    success: z.boolean(),
    spec: z.string(),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "forge_architect",
    invoke: async (input) => {
      const { agentRuntime } = await import("@iem/core");
      const response = await agentRuntime.chat({
        messages: [
          {
            role: "user",
            content: `Design a technical specification for: ${input.prompt}`,
          },
        ],
      });
      return { success: true, spec: response.content };
    },
  },
};

export const designerBlock: BlockDefinition<any, any> = {
  id: "iem.forge.designer",
  name: "Designer",
  description: "Produces the layout and styling guidelines",
  category: "forge",
  input: z.object({
    spec: z.string(),
  }),
  output: z.object({
    success: z.boolean(),
    design: z.string(),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "forge_designer",
    invoke: async (input) => {
      const { agentRuntime } = await import("@iem/core");
      const response = await agentRuntime.chat({
        messages: [
          {
            role: "user",
            content: `Create a design and styling guide for this spec: ${input.spec}`,
          },
        ],
      });
      return { success: true, design: response.content };
    },
  },
};

export const builderBlock: BlockDefinition<any, any> = {
  id: "iem.forge.builder",
  name: "Builder",
  description: "Generates the actual code using Gemini",
  category: "forge",
  input: z.object({
    spec: z.string(),
    design: z.string().optional(),
  }),
  output: z.object({
    success: z.boolean(),
    code: z.string(),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "forge_builder",
    invoke: async (input) => {
      const { agentRuntime } = await import("@iem/core");
      const response = await agentRuntime.chat({
        messages: [
          {
            role: "user",
            content: `Generate production-grade code for this spec: ${input.spec}. Design guidelines: ${input.design || "None"}`,
          },
        ],
      });
      return { success: true, code: response.content };
    },
  },
};

export const testerBlock: BlockDefinition<any, any> = {
  id: "iem.forge.tester",
  name: "Tester",
  description: "Evaluates the generated code against the initial spec",
  category: "forge",
  input: z.object({
    code: z.string(),
    spec: z.string(),
  }),
  output: z.object({
    success: z.boolean(),
    results: z.string(),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "forge_tester",
    invoke: async (input) => {
      const { agentRuntime } = await import("@iem/core");
      const response = await agentRuntime.chat({
        messages: [
          {
            role: "user",
            content: `Test this code: ${input.code} against this spec: ${input.spec}. Return a summary of results.`,
          },
        ],
      });
      return { success: true, results: response.content };
    },
  },
};
