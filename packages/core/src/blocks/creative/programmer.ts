// @ts-nocheck
import { z } from "zod";
import type { BlockDefinition } from "../../block/protocol";

export const ProgrammerInput = z.object({
  prompt: z.string().optional(),
  code: z.string().optional(),
  _accumulatedContext: z.string().optional(),
});

export const ProgrammerOutput = z.object({
  generatedCode: z.string(),
  artifactName: z.string().optional(),
  explanation: z.string().optional(),
});

export const programmerBlock: BlockDefinition<
  typeof ProgrammerInput,
  typeof ProgrammerOutput
> = {
  id: "iem.core.programmer",
  name: "Programmer",
  description: "Generate code.",
  category: "code",
  input: ProgrammerInput,
  output: ProgrammerOutput,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "generate_code",
    invoke: async (input: any) => {
      const parsed = ProgrammerInput.parse(input);
      try {
        let fullPrompt = "";
        const promptText =
          parsed.prompt || "Generate the next logical part of the codebase.";

        if (parsed._accumulatedContext) {
          fullPrompt = `Accumulated Project Context:\n${parsed._accumulatedContext}\n\nTask: ${promptText}\n\nPlease generate the next part of the codebase. Return ONLY the code for the requested file.`;
        } else if (parsed.code) {
          fullPrompt = `Source code:\n${parsed.code}\n\nTask: ${promptText}\n\nPlease generate the updated code. Return ONLY the code.`;
        } else {
          fullPrompt = `Task: ${promptText}\n\nPlease generate the code. Return ONLY the code.`;
        }

        const { agentRuntime } = await import("../../agent/runtime");
        const response = await agentRuntime.chat({
          model: "gemini-2.5-pro",
          messages: [{ role: "user", content: fullPrompt }],
        });

        // Try to extract a filename if the prompt mentions one
        const nameMatch = promptText.match(/([a-z0-9_-]+\.[a-z0-9]+)/i);
        const artifactName = nameMatch ? nameMatch[1] : "generated_file.ts";

        return {
          generatedCode: response.content,
          artifactName,
          explanation: "Generated via AI Architect logic.",
        };
      } catch (err) {
        throw new Error(
          `Programmer failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      }
    },
  },
};
