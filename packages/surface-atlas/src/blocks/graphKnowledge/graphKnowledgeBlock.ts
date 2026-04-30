import { z } from "zod";
import type { BlockDefinition } from "@iem/core";

export const graphKnowledgeInput = z.object({
  payload: z.string().optional(),
});

export const graphKnowledgeOutput = z.object({
  success: z.boolean(),
});

export const graphKnowledgeBlock: BlockDefinition<
  typeof graphKnowledgeInput,
  typeof graphKnowledgeOutput
> = {
  id: "iem.atlas.graphKnowledge",
  name: "GraphKnowledge",
  description: "Auto-generated GraphKnowledge block",
  category: "uncategorized",
  input: graphKnowledgeInput,
  output: graphKnowledgeOutput,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "execute_graphKnowledge",
    invoke: async (input: any) => {
      const parsed = graphKnowledgeInput.parse(input);
      return { success: true };
    },
  },
};
