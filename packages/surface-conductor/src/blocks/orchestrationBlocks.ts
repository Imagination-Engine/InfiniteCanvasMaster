import { z } from "zod";
import { BlockDefinition, MCPToolBinding } from "@iem/core";

const MockView = () => null;

export const ifBlock: BlockDefinition<any, any> = {
  id: "iem.conductor.if",
  name: "If",
  description: "Conditional routing branch",
  category: "control",
  input: z.object({
    condition: z.string(),
    context: z.record(z.any()).default({}),
  }),
  output: z.object({
    branch: z.enum(["truePath", "falsePath"]),
    context: z.record(z.any()),
  }),
  view: MockView,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "evaluate_condition",
    invoke: async (input) => {
      try {
        // Use the common AI provider setup if available, or fallback to environment variables
        const { generateText } = await import("ai");
        const { google } = await import("@ai-sdk/google");

        const systemPrompt =
          "You are a precise evaluation engine. Evaluate the given condition based on the provided context. You MUST output ONLY the word 'true' or 'false'. Provide no explanations, markdown formatting, or any other text.";
        const userPrompt = `Context:\n${JSON.stringify(input.context, null, 2)}\n\nCondition: ${input.condition}`;

        const { text } = await generateText({
          model: google("gemini-2.5-pro"),
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0,
          maxTokens: 5,
        });

        const content = text.trim().toLowerCase();

        let result = false;
        // Robust parsing of truthiness
        if (content === "true" || content.includes("true")) {
          result = true;
        } else if (content === "false" || content.includes("false")) {
          result = false;
        } else {
          console.warn(
            `Unexpected LLM output during evaluation: ${content}. Defaulting to false.`,
          );
          result = false;
        }

        return {
          branch: result ? "truePath" : "falsePath",
          context: input.context,
        };
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : "Unknown evaluation error",
        );
      }
    },
  },
};

export const forEachBlock: BlockDefinition<any, any> = {
  id: "iem.conductor.foreach",
  name: "For Each",
  description: "Iterates over a collection",
  category: "control",
  input: z.object({
    collection: z.array(z.any()),
    loopTarget: z.string().optional(),
  }),
  output: z.object({
    items: z.array(z.any()),
    loopTarget: z.string().optional(),
  }),
  view: MockView,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "pass_through_collection",
    invoke: async (input) => {
      return { items: input.collection, loopTarget: input.loopTarget };
    },
  },
};

export const webhookTriggerBlock: BlockDefinition<any, any> = {
  id: "iem.conductor.webhook",
  name: "Webhook Trigger",
  description: "Starts workflow on webhook",
  category: "trigger",
  input: z.object({
    path: z.string(),
  }),
  output: z.object({
    payload: z.record(z.any()),
  }),
  view: MockView,
  mode: "ambient",
  agent: {
    kind: "local",
    toolName: "noop",
    invoke: async () => ({ payload: {} }),
  },
};

export const scheduleTriggerBlock: BlockDefinition<any, any> = {
  id: "iem.conductor.schedule",
  name: "Schedule Trigger",
  description: "Starts workflow on schedule",
  category: "trigger",
  input: z.object({
    cron: z.string(),
  }),
  output: z.object({
    time: z.string(),
  }),
  view: MockView,
  mode: "ambient",
  agent: {
    kind: "local",
    toolName: "noop",
    invoke: async () => ({ time: new Date().toISOString() }),
  },
};
