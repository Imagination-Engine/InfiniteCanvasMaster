"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proofreaderBlock =
  exports.proofreaderOutput =
  exports.proofreaderInput =
    void 0;
const zod_1 = require("zod");
exports.proofreaderInput = zod_1.z.object({
  payload: zod_1.z.string().optional(),
});
exports.proofreaderOutput = zod_1.z.object({
  success: zod_1.z.boolean(),
  text: zod_1.z.string(),
});
exports.proofreaderBlock = {
  id: "iem.scribe.proofreader",
  name: "Proofreader",
  description: "Auto-generated Proofreader block",
  category: "creative",
  input: exports.proofreaderInput,
  output: exports.proofreaderOutput,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "execute_proofreader",
    invoke: async (input) => {
      const { agentRuntime } = await import("@iem/core");
      const response = await agentRuntime.chat({
        model: "gemini-2.5-pro",
        messages: [
          {
            role: "user",
            content: `Proofread and correct the following text for grammar, spelling, and punctuation: ${input.payload || ""}`,
          },
        ],
      });
      return { success: true, text: response.content };
    },
  },
};
