// @ts-nocheck
import { z } from "zod";
import { blockRegistry } from "./registry";
// The Adamantium Factory
// This utility allows rapid generation of standard LLM-backed Magnificent Blocks
export function createMagnificentBlock(config) {
  const block = {
    id: config.id,
    name: config.name,
    description: config.description,
    category: config.category,
    input: config.inputSchema,
    output: config.outputSchema,
    mode: "triggered",
    agent: {
      kind: "local",
      toolName: config.id.replace(/\./g, "_"),
      invoke: async (input) => {
        // Dynamic import to avoid circular dep loops
        const { agentRuntime } = await import("../agent/runtime");
        const response = await agentRuntime.chat({
          model: "gemini-2.5-pro",
          messages: [
            { role: "system", content: config.systemPrompt },
            { role: "user", content: JSON.stringify(input) },
          ],
        });
        try {
          return JSON.parse(response.content);
        } catch {
          return { success: true, result: response.content };
        }
      },
    },
  };
  return block;
}
// Example usage that instantly expands our catalog to LibreChat:
export function generateCoreCapabilities() {
  const brainstormer = createMagnificentBlock({
    id: "iem.core.brainstormer",
    name: "Brainstormer",
    description: "Generates 10 wild ideas based on a seed.",
    category: "creative",
    systemPrompt:
      "You are a divergent thinker. Given a seed concept, output a JSON array of 10 wildly different, creative directions.",
    inputSchema: z.object({ seed: z.string() }),
    outputSchema: z.object({ ideas: z.array(z.string()) }),
  });
  const critic = createMagnificentBlock({
    id: "iem.core.critic",
    name: "Harsh Critic",
    description: "Tears down an idea and finds its weakest points.",
    category: "creative",
    systemPrompt:
      "You are an adversarial mentor. Find the 3 biggest flaws in the provided idea. Return a JSON object with a 'flaws' array.",
    inputSchema: z.object({ idea: z.string() }),
    outputSchema: z.object({ flaws: z.array(z.string()) }),
  });
  blockRegistry.register(brainstormer);
  blockRegistry.register(critic);
  console.log("[Core] Magnificent Block Factory initialized.");
}
