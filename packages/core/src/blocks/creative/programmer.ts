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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      try {
        const fullPrompt = parsed.code
          ? `Source code:\n${parsed.code}\n\nTask: ${parsed.prompt}\n\nPlease generate the updated code.`
          : `Task: ${parsed.prompt}\n\nPlease generate the code.`;
        const res = await fetch("http://localhost:11434/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama3",
            prompt: fullPrompt,
            stream: false,
          }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        const apiResponseSchema = z.object({ response: z.string() });
        const validated = apiResponseSchema.parse(data);
        return { generatedCode: validated.response };
      } catch (err) {
        throw new Error(
          `Programmer failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      } finally {
        clearTimeout(timeoutId);
      }
    },
  },
};
