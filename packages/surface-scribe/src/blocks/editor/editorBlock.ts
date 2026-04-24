import { z } from "zod";
import { EditorView } from "./EditorView";
import type { BlockDefinition } from "@iem/core";

export const editorInput = z.object({
  payload: z.string().optional(),
});

export const editorOutput = z.object({
  success: z.boolean(),
  text: z.string(),
});

export const editorBlock: BlockDefinition<
  typeof editorInput,
  typeof editorOutput
> = {
  id: "iem.scribe.editor",
  name: "Editor",
  description: "Auto-generated Editor block",
  category: "creative",
  input: editorInput,
  output: editorOutput,
  view: EditorView,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "execute_editor",
    invoke: async (input) => {
      const { agentRuntime } = await import("@iem/core");
      const response = await agentRuntime.chat({
        messages: [
          {
            role: "user",
            content: `Act as a senior editor. Review and refine the following text: ${input.payload || ""}`,
          },
        ],
      });
      return { success: true, text: response.content };
    },
  },
};
