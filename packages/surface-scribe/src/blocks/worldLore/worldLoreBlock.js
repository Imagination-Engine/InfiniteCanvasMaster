"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.worldLoreBlock =
  exports.worldLoreOutput =
  exports.worldLoreInput =
    void 0;
const zod_1 = require("zod");
exports.worldLoreInput = zod_1.z.object({
  payload: zod_1.z.string().optional(),
});
exports.worldLoreOutput = zod_1.z.object({
  success: zod_1.z.boolean(),
  lore: zod_1.z.string(),
});
exports.worldLoreBlock = {
  id: "iem.scribe.worldLore",
  name: "World Lore",
  description: "Auto-generated World Lore block",
  category: "creative",
  input: exports.worldLoreInput,
  output: exports.worldLoreOutput,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "execute_world_lore",
    invoke: async (input) => {
      const { agentRuntime } = await import("@iem/core");
      const response = await agentRuntime.chat({
        model: "gemini-2.5-pro",
        messages: [
          {
            role: "user",
            content: `Build immersive world history and rules based on: ${input.payload || "A fantasy world."}`,
          },
        ],
      });
      return { success: true, lore: response.content };
    },
  },
};
