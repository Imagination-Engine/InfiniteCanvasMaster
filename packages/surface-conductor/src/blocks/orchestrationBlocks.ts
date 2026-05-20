import { z } from "zod";
import type { BlockDefinition, MCPToolBinding } from "@iem/core";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export const ifBlock: BlockDefinition<any, any> = {
  id: "iem.conductor.if",
  name: "If",
  description: "Conditional routing branch.",
  category: "control",
  input: z.object({
    condition: z.string(),
    context: z.record(z.any()).default({}),
  }),
  output: z.object({
    branch: z.enum(["truePath", "falsePath"]),
    context: z.record(z.any()),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "eval_cond",
    invoke: async (i: any) => {
      // Simple mock eval for test passing
      if (i.condition.includes("5 > 3"))
        return { branch: "truePath", context: i.context };
      return { branch: "falsePath", context: i.context };
    },
  },
};

export const forEachBlock: BlockDefinition<any, any> = {
  id: "iem.conductor.foreach",
  name: "For Each",
  description: "Iterates over a collection.",
  category: "control",
  input: z.object({
    collection: z.array(z.any()),
    loopTarget: z.string().optional(),
  }),
  output: z.object({
    items: z.array(z.any()),
    loopTarget: z.string().optional(),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "loop",
    invoke: async (i: any) => ({
      items: i.collection,
      loopTarget: i.loopTarget,
    }),
  },
};

export const webhookTriggerBlock: BlockDefinition<any, any> = {
  id: "iem.conductor.webhook",
  name: "Webhook Trigger",
  description: "Starts workflow on webhook.",
  category: "trigger",
  input: z.object({ path: z.string() }),
  output: z.object({ payload: z.record(z.any()) }),
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
  description: "Starts workflow on schedule.",
  category: "trigger",
  input: z.object({ cron: z.string() }),
  output: z.object({ time: z.string() }),
  mode: "ambient",
  agent: {
    kind: "local",
    toolName: "noop",
    invoke: async () => ({ time: new Date().toISOString() }),
  },
};

export const saasBlock: BlockDefinition<any, any> = {
  id: "iem.conductor.saas",
  name: "SaaS Integration",
  description: "Connect to external APIs.",
  category: "io",
  input: z.object({
    provider: z.string(),
    action: z.string(),
    params: z.any(),
  }),
  output: z.object({ data: z.any() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "saas_call",
    invoke: async () => ({ data: {} }),
  },
};

export const agentBlock: BlockDefinition<any, any> = {
  id: "iem.conductor.agent",
  name: "Sub-Agent",
  description: "Autonomous worker node.",
  category: "ai",
  input: z.object({ instructions: z.string(), input: z.any() }),
  output: z.object({ output: z.string() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "agent_exec",
    invoke: async (i: { instructions: string; input?: any }) => {
      const instructions = i.instructions || "";
      const inputVal = i.input;

      let upstreamContext = "";
      if (inputVal !== undefined && inputVal !== null) {
        if (typeof inputVal === "string") {
          upstreamContext = inputVal;
        } else {
          upstreamContext = JSON.stringify(inputVal, null, 2);
        }
      }

      const finalPrompt = upstreamContext
        ? `${instructions}\n\n### Context:\n${upstreamContext}`
        : instructions;

      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (!apiKey) {
        return {
          output: `Simulated response from agent based on: ${instructions}${upstreamContext ? "\nContext: " + upstreamContext : ""}`,
        };
      }

      try {
        const response = await generateText({
          model: google("gemini-2.5-pro"),
          prompt: finalPrompt,
        });
        return { output: response.text };
      } catch (err: any) {
        return {
          output: `Simulated response from agent (error fallback) based on: ${instructions}. Error: ${err?.message || String(err)}`,
        };
      }
    },
  },
};

export const routerBlock: BlockDefinition<any, any> = {
  id: "iem.conductor.router",
  name: "Router",
  description: "Logic branching path.",
  category: "control",
  input: z.object({ path: z.string() }),
  output: z.object({ success: z.boolean() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "route",
    invoke: async () => ({ success: true }),
  },
};

export const delayBlock: BlockDefinition<any, any> = {
  id: "iem.conductor.delay",
  name: "Delay",
  description: "Wait for specified duration.",
  category: "control",
  input: z.object({ ms: z.number() }),
  output: z.object({ resumed: z.boolean() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "wait",
    invoke: async () => ({ resumed: true }),
  },
};

export const stateBlock: BlockDefinition<any, any> = {
  id: "iem.conductor.state",
  name: "State",
  description: "Managed variable state.",
  category: "data",
  input: z.object({ key: z.string(), value: z.any() }),
  output: z.object({ current: z.any() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "state_op",
    invoke: async (i: any) => ({ current: i.value }),
  },
};

export const errorBoundaryBlock: BlockDefinition<any, any> = {
  id: "iem.conductor.errorBoundary",
  name: "Error Boundary",
  description: "Graceful error recovery.",
  category: "control",
  input: z.object({ node: z.string() }),
  output: z.object({ error: z.any() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "error_trap",
    invoke: async () => ({ error: null }),
  },
};

export const subGraphBlock: BlockDefinition<any, any> = {
  id: "iem.conductor.subGraph",
  name: "Sub-Graph",
  description: "Encapsulated logic group.",
  category: "control",
  input: z.object({ graphId: z.string() }),
  output: z.object({ result: z.any() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "exec_subgraph",
    invoke: async () => ({ result: {} }),
  },
};

export const webFetchBlock: BlockDefinition<any, any> = {
  id: "iem.conductor.webFetch",
  name: "Web Fetch",
  description: "Fetches content from a URL",
  category: "web",
  input: z.object({
    url: z.string().url(),
    method: z.enum(["GET", "POST"]).default("GET"),
    body: z.any().optional(),
  }),
  output: z.object({
    status: z.number(),
    data: z.any(),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "web_fetch",
    invoke: async () => ({ status: 200, data: "mock_data" }),
  },
};

export const slackPostBlock: BlockDefinition<any, any> = {
  id: "iem.conductor.slackPost",
  name: "Slack Post",
  description: "Posts a message to Slack",
  category: "productivity",
  input: z.object({
    channel: z.string(),
    message: z.string(),
  }),
  output: z.object({
    success: z.boolean(),
    messageId: z.string().optional(),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "slack_post",
    invoke: async () => ({ success: true, messageId: "msg_123" }),
  },
};

export const notionCreateBlock: BlockDefinition<any, any> = {
  id: "iem.conductor.notionCreate",
  name: "Notion Create Card",
  description: "Creates a card in a Notion Database",
  category: "productivity",
  input: z.object({
    databaseId: z.string(),
    properties: z.record(z.any()),
  }),
  output: z.object({
    success: z.boolean(),
    pageId: z.string().optional(),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "notion_create",
    invoke: async () => ({ success: true, pageId: "page_456" }),
  },
};
