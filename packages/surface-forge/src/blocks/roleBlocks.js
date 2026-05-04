"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testerBlock =
  exports.builderBlock =
  exports.designerBlock =
  exports.architectBlock =
    void 0;
const zod_1 = require("zod");
exports.architectBlock = {
  id: "iem.forge.architect",
  name: "Architect",
  description: "Produces the structured spec",
  category: "forge",
  input: zod_1.z.object({
    prompt: zod_1.z.string(),
  }),
  output: zod_1.z.object({
    success: zod_1.z.boolean(),
    spec: zod_1.z.string(),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "forge_architect",
    invoke: async (input) => {
      const { agentRuntime } = await import("@iem/core");
      const response = await agentRuntime.chat({
        model: "gemini-2.5-pro",
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
exports.designerBlock = {
  id: "iem.forge.designer",
  name: "Designer",
  description: "Produces the layout and styling guidelines",
  category: "forge",
  input: zod_1.z.object({
    spec: zod_1.z.string(),
  }),
  output: zod_1.z.object({
    success: zod_1.z.boolean(),
    design: zod_1.z.string(),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "forge_designer",
    invoke: async (input) => {
      const { agentRuntime } = await import("@iem/core");
      const response = await agentRuntime.chat({
        model: "gemini-2.5-pro",
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
exports.builderBlock = {
  id: "iem.forge.builder",
  name: "Builder",
  description: "Generates the actual code using Gemini",
  category: "forge",
  input: zod_1.z.object({
    spec: zod_1.z.string(),
    design: zod_1.z.string().optional(),
  }),
  output: zod_1.z.object({
    success: zod_1.z.boolean(),
    code: zod_1.z.string(),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "forge_builder",
    invoke: async (input) => {
      const { agentRuntime } = await import("@iem/core");
      const response = await agentRuntime.chat({
        model: "gemini-2.5-pro",
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
exports.testerBlock = {
  id: "iem.forge.tester",
  name: "Tester",
  description: "Evaluates the generated code against the initial spec",
  category: "forge",
  input: zod_1.z.object({
    code: zod_1.z.string(),
    spec: zod_1.z.string(),
  }),
  output: zod_1.z.object({
    success: zod_1.z.boolean(),
    results: zod_1.z.string(),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "forge_tester",
    invoke: async (input) => {
      const { agentRuntime } = await import("@iem/core");
      const response = await agentRuntime.chat({
        model: "gemini-2.5-pro",
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
