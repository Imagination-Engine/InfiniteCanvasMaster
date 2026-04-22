import { z } from "zod";

export interface MCPToolBinding {
  kind: "local" | "remote";
  toolName: string;
  invoke: (input: any) => Promise<any>;
}

export interface BlockDefinition<
  TInput extends z.ZodTypeAny,
  TOutput extends z.ZodTypeAny,
> {
  id: string;
  name: string;
  description: string;
  category: string;
  input: TInput;
  output: TOutput;
  view: any;
  agent: MCPToolBinding;
  mode: "triggered" | "streaming" | "ambient";
}

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
        const llmApi =
          process.env.LLM_CHAT_URL ||
          "https://api.openai.com/v1/chat/completions";
        const apiKey = process.env.OPENAI_API_KEY || "";

        const systemPrompt =
          "You are a precise evaluation engine. Evaluate the given condition based on the provided context. You MUST output ONLY the word 'true' or 'false'. Provide no explanations, markdown formatting, or any other text.";
        const userPrompt = `Context:\n${JSON.stringify(input.context, null, 2)}\n\nCondition: ${input.condition}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(llmApi, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0,
            max_tokens: 5,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(
            `Evaluation failed: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();
        const content =
          data.choices?.[0]?.message?.content?.trim().toLowerCase() || "";

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
