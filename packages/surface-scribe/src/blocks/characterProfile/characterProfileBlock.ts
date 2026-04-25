import { z } from "zod";
import type { BlockDefinition } from "@iem/core";

export const characterProfileInput = z.object({
  payload: z.string().optional(),
});

export const characterProfileOutput = z.object({
  success: z.boolean(),
  profile: z.record(z.any()),
});

export const characterProfileBlock: BlockDefinition<
  typeof characterProfileInput,
  typeof characterProfileOutput
> = {
  id: "iem.scribe.characterProfile",
  name: "Character Profile",
  description: "Auto-generated Character Profile block",
  category: "creative",
  input: characterProfileInput,
  output: characterProfileOutput,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "execute_character_profile",
    invoke: async (input: any) => {
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
