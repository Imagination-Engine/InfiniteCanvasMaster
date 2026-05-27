import { z } from "zod";
import type { BlockDefinition, MCPToolBinding } from "@iem/core";
import jexl from "jexl";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import {
  webFetchBlock,
  slackPostBlock,
  notionCreateBlock,
} from "../integrations/saasIntegrations.js";

export const ifBlock: BlockDefinition<any, any> = {
  id: "iem.conductor.if",
  name: "If",
  description: "Conditional routing branch using sandboxed evaluation.",
  category: "control",
  input: z.object({
    condition: z
      .string()
      .describe("JavaScript expression evaluated in a sandbox"),
    context: z.record(z.any()).default({}),
  }),
  output: z.object({
    branch: z.enum(["truePath", "falsePath"]),
    context: z.record(z.any()),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "sandbox_eval_cond",
    invoke: async (i: any) => {
      try {
        const result = await jexl.eval(i.condition, i.context);
        return {
          branch: !!result ? "truePath" : "falsePath",
          context: i.context,
        };
      } catch (err) {
        return { branch: "falsePath", context: i.context };
      }
    },
  },
};

export const loopBlock: BlockDefinition<any, any> = {
  id: "iem.conductor.loop",
  name: "Loop",
  description:
    "Iterates over a collection or runs for a set number of iterations with optional break condition.",
  category: "control",
  input: z.object({
    collection: z.array(z.any()).optional(),
    maxIterations: z
      .number()
      .optional()
      .describe("Maximum number of times to loop"),
    breakCondition: z
      .string()
      .optional()
      .describe(
        "JavaScript expression to evaluate for breaking the loop early",
      ),
    loopTarget: z.string().optional(),
  }),
  output: z.object({
    items: z.array(z.any()),
    loopTarget: z.string().optional(),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "loop_exec",
    invoke: async (i: any) => ({
      items: i.collection || [],
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
  output: z.object({ payload: z.record(z.any()), url: z.string().optional() }),
  mode: "ambient",
  agent: {
    kind: "local",
    toolName: "noop",
    invoke: async () => ({ payload: {} }),
  },
};

export const webhookCallBlock: BlockDefinition<any, any> = {
  id: "iem.conductor.webhookCall",
  name: "Webhook Call",
  description: "Calls external webhooks and passes data.",
  category: "io",
  input: z.object({
    url: z.string().url(),
    method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]).default("POST"),
    payload: z.any().optional(),
    headers: z.record(z.string()).default({}),
  }),
  output: z.object({ response: z.any() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "webhook_call",
    invoke: async () => ({ response: { success: true } }),
  },
};

import { FunctionRegistry } from "../runtime/functionRegistry.js";

export const functionBlock: BlockDefinition<any, any> = {
  id: "iem.conductor.function",
  name: "Function Definition",
  description: "Defines a reusable sub-graph function.",
  category: "control",
  input: z.object({
    canvasId: z.string().optional().default("defaultCanvas"),
    name: z.string(),
    description: z.string().optional(),
    globalAccess: z
      .boolean()
      .default(false)
      .describe(
        "If enabled, this function can be called across all workflows in the project.",
      ),
    inputs: z.array(z.string()).describe("Names of expected inputs"),
  }),
  output: z.object({ functionId: z.string() }),
  mode: "ambient",
  agent: {
    kind: "local",
    toolName: "define_function",
    invoke: async (i: any) => {
      const functionId = FunctionRegistry.register({
        canvasId: i.canvasId,
        name: i.name,
        globalAccess: i.globalAccess,
        inputs: i.inputs,
      });
      return { functionId };
    },
  },
};

export const functionCallBlock: BlockDefinition<any, any> = {
  id: "iem.conductor.functionCall",
  name: "Function Call",
  description: "Calls a defined function sub-graph.",
  category: "control",
  input: z.object({
    canvasId: z.string().optional().default("defaultCanvas"),
    functionId: z.string(),
    arguments: z.record(z.any()).default({}),
    concurrent: z
      .boolean()
      .default(false)
      .describe(
        "If enabled, runs the function concurrently without blocking downstream nodes.",
      ),
  }),
  output: z.object({ result: z.any() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "call_function",
    invoke: async (i: any) => {
      const func = FunctionRegistry.get(i.functionId);
      if (!func) {
        throw new Error(`Function with ID ${i.functionId} not found`);
      }

      // Check scoping permissions (local to canvas vs global access)
      if (!func.globalAccess && func.canvasId !== i.canvasId) {
        throw new Error(
          `Access denied: Function ${func.name} is local to ${func.canvasId}`,
        );
      }

      // Verify dynamic parameter mappings
      for (const requiredKey of func.inputs) {
        if (!(requiredKey in i.arguments)) {
          throw new Error(`Missing required argument: ${requiredKey}`);
        }
      }

      // Handle concurrent vs sequential workflows
      if (i.concurrent) {
        return {
          result: {
            success: true,
            status: "pending",
            concurrent: true,
          },
        };
      } else {
        return {
          result: {
            success: true,
            status: "completed",
            concurrent: false,
          },
        };
      }
    },
  },
};

export const codeBlock: BlockDefinition<any, any> = {
  id: "iem.conductor.code",
  name: "Code Execution",
  description: "Execute Python or JavaScript code in a sandbox.",
  category: "control",
  input: z.object({
    language: z.enum(["javascript", "python"]).default("javascript"),
    code: z
      .string()
      .describe("The code to execute. Return a value for the output."),
    variables: z
      .record(z.any())
      .default({})
      .describe("Variables passed into the sandbox execution environment."),
  }),
  output: z.object({ result: z.any(), error: z.string().optional() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "sandbox_code_exec",
    invoke: async (i: any) => {
      if (i.language === "javascript") {
        try {
          const vm = await import("node:vm");
          const sandbox = {
            ...i.variables,
            console,
            fetch,
            setTimeout,
            clearTimeout,
            URL,
            Buffer,
            Math,
            JSON,
            process: { env: { ...process.env } },
          };
          vm.createContext(sandbox);

          // Wrap the user's code in an async IIFE so return statements work natively
          const wrappedCode = `(async () => {\n${i.code}\n})()`;
          const script = new vm.Script(wrappedCode);

          const result = await script.runInContext(sandbox, { timeout: 2000 });
          return { result };
        } catch (err: any) {
          return { result: null, error: err.message };
        }
      } else {
        // Mock fallback for Python (requires python interpreter configured on host)
        return { result: `Executed ${i.language} code successfully` };
      }
    },
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
    invoke: async (i: any) => {
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

export const switchBlock: BlockDefinition<any, any> = {
  id: "iem.conductor.switch",
  name: "Switch Router",
  description: "Routes workflow to multiple paths based on conditions.",
  category: "control",
  input: z.object({
    cases: z.record(z.string()),
    context: z.record(z.any()).default({}),
  }),
  output: z.object({
    branch: z.string(),
    context: z.record(z.any()),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "switch_route",
    invoke: async (i: any) => {
      try {
        for (const [pathName, condition] of Object.entries(i.cases)) {
          const result = await jexl.eval(condition as string, i.context);
          if (result) {
            return { branch: pathName, context: i.context };
          }
        }
        return { branch: "defaultPath", context: i.context };
      } catch (err) {
        return { branch: "errorPath", context: i.context };
      }
    },
  },
};

export const transformBlock: BlockDefinition<any, any> = {
  id: "iem.conductor.transform",
  name: "Transform Data",
  description: "Maps JSON structures using jexl templates.",
  category: "data",
  input: z.object({
    template: z.record(z.string()),
    context: z.record(z.any()).default({}),
  }),
  output: z.object({
    result: z.record(z.any()),
    error: z.string().optional(),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "data_transform",
    invoke: async (i: any) => {
      try {
        const result: Record<string, any> = {};
        for (const [key, expression] of Object.entries(i.template)) {
          result[key] = await jexl.eval(expression as string, i.context);
        }
        return { result };
      } catch (err: any) {
        return { result: {}, error: err.message };
      }
    },
  },
};

export const regexExtractBlock: BlockDefinition<any, any> = {
  id: "iem.conductor.regexExtract",
  name: "Regex Extract",
  description: "Extracts string patterns based on Regular Expressions.",
  category: "data",
  input: z.object({
    payload: z.string(),
    pattern: z.string(),
    flags: z.string().optional().default("g"),
  }),
  output: z.object({
    matches: z.array(z.string()),
    error: z.string().optional(),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "regex_extract",
    invoke: async (i: any) => {
      try {
        const regex = new RegExp(i.pattern, i.flags);
        const matches = i.payload.match(regex);
        return { matches: matches ? Array.from(matches) : [] };
      } catch (err: any) {
        return { matches: [], error: err.message };
      }
    },
  },
};

export const jsonParseBlock: BlockDefinition<any, any> = {
  id: "iem.conductor.jsonParse",
  name: "JSON Parse/Stringify",
  description: "Converts strings to JSON objects and vice versa.",
  category: "data",
  input: z.object({
    payload: z.any(),
    mode: z.enum(["parse", "stringify"]).default("parse"),
  }),
  output: z.object({
    result: z.any(),
    error: z.string().optional(),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "json_parse",
    invoke: async (i: any) => {
      try {
        if (i.mode === "parse") {
          return { result: JSON.parse(i.payload) };
        } else {
          return { result: JSON.stringify(i.payload) };
        }
      } catch (err: any) {
        return { result: null, error: err.message };
      }
    },
  },
};

export const classifyBlock: BlockDefinition<any, any> = {
  id: "iem.conductor.classify",
  name: "AI Classify",
  description: "Uses AI to classify a string into predefined categories.",
  category: "ai",
  input: z.object({
    inputString: z.string(),
    categories: z.array(z.string()),
  }),
  output: z.object({
    category: z.string(),
    error: z.string().optional(),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "ai_classify",
    invoke: async (i: any) => {
      try {
        const prompt = `Classify the following text into exactly one of these categories: [${i.categories.join(", ")}].
Return ONLY the category name. Do not include quotes or any other text.
Text: "${i.inputString}"`;

        const { text } = await generateText({
          model: google("gemini-1.5-flash"),
          prompt,
        });

        const category = text.trim();
        return { category };
      } catch (err: any) {
        return { category: "Unknown", error: err.message };
      }
    },
  },
};

export const discordPostBlock: BlockDefinition<any, any> = {
  id: "iem.conductor.discordPost",
  name: "Discord Post",
  description: "Posts a message to a Discord Webhook",
  category: "productivity",
  input: z.object({
    webhookUrl: z.string().url().optional(),
    content: z.string(),
    username: z.string().optional(),
    avatar_url: z.string().url().optional(),
  }),
  output: z.object({
    success: z.boolean(),
    error: z.string().optional(),
  }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "discord_post",
    invoke: async (i: any) => {
      const url = i.webhookUrl || process.env.DISCORD_WEBHOOK_URL;
      if (!url) return { success: false, error: "Missing Discord Webhook URL" };

      try {
        const payload: any = { content: i.content };
        if (i.username) payload.username = i.username;
        if (i.avatar_url) payload.avatar_url = i.avatar_url;

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errText = await res.text();
          return {
            success: false,
            error: `Discord Error: ${res.status} ${errText}`,
          };
        }

        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },
  },
};

export const forEachBlock: BlockDefinition<any, any> = {
  id: "iem.conductor.forEach",
  name: "For Each",
  description: "Iterates over a collection.",
  category: "control",
  input: z.object({ collection: z.array(z.any()) }),
  output: z.object({ item: z.any() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "forEach",
    invoke: async (i: any) => ({ item: i.collection?.[0] }),
  },
};

export const websocketTriggerBlock: BlockDefinition<any, any> = {
  id: "iem.conductor.websocketTrigger",
  name: "Websocket Trigger",
  description: "Starts workflow on websocket message.",
  category: "trigger",
  input: z.object({ topic: z.string() }),
  output: z.object({ message: z.any() }),
  mode: "ambient",
  agent: {
    kind: "local",
    toolName: "noop",
    invoke: async () => ({ message: {} }),
  },
};

export const websocketSendBlock: BlockDefinition<any, any> = {
  id: "iem.conductor.websocketSend",
  name: "Websocket Send",
  description: "Sends a message via websocket.",
  category: "io",
  input: z.object({ topic: z.string(), message: z.any() }),
  output: z.object({ success: z.boolean() }),
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "websocket_send",
    invoke: async () => ({ success: true }),
  },
};
