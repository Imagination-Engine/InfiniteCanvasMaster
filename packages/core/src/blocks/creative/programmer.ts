// @ts-nocheck
import { z } from "zod";
import type { BlockDefinition } from "../../block/protocol";

export const ProgrammerInput = z.object({
  prompt: z.string(),
  code: z.string().optional(),
});

export const ProgrammerOutput = z.object({
  generatedCode: z.string(),
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
    invoke: async (input: unknown) => {
      const parsed = ProgrammerInput.parse(input);
      try {
        const fullPrompt = parsed.code
          ? `Source code:\n${parsed.code}\n\nTask: ${parsed.prompt}\n\nPlease generate the updated code. Return ONLY the code.`
          : `Task: ${parsed.prompt}\n\nPlease generate the code. Return ONLY the code.`;

        const { agentRuntime } = await import("../../agent/runtime");
        const response = await agentRuntime.chat({
          model: "gemini-2.5-pro",
          messages: [{ role: "user", content: fullPrompt }],
        });

        return { generatedCode: response.content };
      } catch (err) {
        throw new Error(
          `Programmer failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      }
    },
  },
};
