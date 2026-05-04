"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chapterBlock = void 0;
const zod_1 = require("zod");
exports.chapterBlock = {
  id: "iem.scribe.chapter",
  name: "Chapter",
  description: "Auto-generated Chapter block",
  category: "creative",
  input: zod_1.z.object({
    title: zod_1.z.string().optional(),
    outline: zod_1.z.string().optional(),
    payload: zod_1.z.string().optional(),
  }),
  output: zod_1.z.object({
    success: zod_1.z.boolean(),
    text: zod_1.z.string(),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "execute_chapter",
    invoke: async (input) => {
      const { agentRuntime } = await import("@iem/core");
      const response = await agentRuntime.chat({
        model: "gemini-2.5-pro",
        messages: [
          {
            role: "user",
            content: `Draft a chapter for a story titled "${input.title || "Untitled"}". 
            Outline: ${input.outline || "None"}. 
            Additional Context: ${input.payload || "None"}.`,
          },
        ],
      });
      return { success: true, text: response.content };
    },
  },
};
