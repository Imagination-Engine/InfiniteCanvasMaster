"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.characterProfileBlock =
  exports.characterProfileOutput =
  exports.characterProfileInput =
    void 0;
const zod_1 = require("zod");
exports.characterProfileInput = zod_1.z.object({
  payload: zod_1.z.string().optional(),
});
exports.characterProfileOutput = zod_1.z.object({
  success: zod_1.z.boolean(),
  profile: zod_1.z.record(zod_1.z.any()),
});
exports.characterProfileBlock = {
  id: "iem.scribe.characterProfile",
  name: "Character Profile",
  description: "Auto-generated Character Profile block",
  category: "creative",
  input: exports.characterProfileInput,
  output: exports.characterProfileOutput,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "execute_character_profile",
    invoke: async (input) => {
      const { agentRuntime } = await import("@iem/core");
      const response = await agentRuntime.chat({
        model: "gemini-2.5-pro",
        messages: [
          {
            role: "user",
            content: `Generate a detailed character profile based on the following: ${input.payload || "A generic hero."}. Return ONLY a JSON object.`,
          },
        ],
      });
      try {
        return { success: true, profile: JSON.parse(response.content) };
      } catch {
        return { success: true, profile: { raw: response.content } };
      }
    },
  },
};
