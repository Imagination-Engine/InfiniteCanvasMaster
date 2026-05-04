"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dialogueTreeBlock =
  exports.dialogueTreeOutput =
  exports.dialogueTreeInput =
    void 0;
const zod_1 = require("zod");
exports.dialogueTreeInput = zod_1.z.object({
  payload: zod_1.z.string().optional(),
});
exports.dialogueTreeOutput = zod_1.z.object({
  success: zod_1.z.boolean(),
  tree: zod_1.z.record(zod_1.z.any()),
});
exports.dialogueTreeBlock = {
  id: "iem.scribe.dialogueTree",
  name: "Dialogue Tree",
  description: "Auto-generated Dialogue Tree block",
  category: "creative",
  input: exports.dialogueTreeInput,
  output: exports.dialogueTreeOutput,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "execute_dialogue_tree",
    invoke: async (input) => {
      const { agentRuntime } = await import("@iem/core");
      const response = await agentRuntime.chat({
        model: "gemini-2.5-pro",
        messages: [
          {
            role: "user",
            content: `Generate a branching dialogue tree based on: ${input.payload || "A greeting."}. Return ONLY a JSON object.`,
          },
        ],
      });
      try {
        return { success: true, tree: JSON.parse(response.content) };
      } catch {
        return { success: true, tree: { raw: response.content } };
      }
    },
  },
};
