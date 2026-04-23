import { z } from "zod";
import { EditorView } from "./EditorView";
import type { BlockDefinition } from "@iem/core";

export const editorInput = z.object({
  payload: z.string().optional(),
});

export const editorOutput = z.object({
  success: z.boolean(),
});

export const editorBlock: BlockDefinition<
  typeof editorInput,
  typeof editorOutput
> = {
  id: "iem.scribe.editor",
  name: "Editor",
  description: "Auto-generated Editor block",
  category: "uncategorized",
  input: editorInput,
  output: editorOutput,
  view: EditorView,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "execute_editor",
    invoke: async (input) => {
      const { generateText } = await import("ai");
      const { google } = await import("@ai-sdk/google");
      const { text } = await generateText({
        model: google("gemini-2.5-pro"),
        prompt: `Act as a senior editor. Review and refine the following text: ${input.payload || ""}`,
      });
      return { success: true, text };
    },
  },
};
