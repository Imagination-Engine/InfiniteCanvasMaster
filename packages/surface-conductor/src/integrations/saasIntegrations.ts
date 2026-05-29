import { z } from "zod";
import type { BlockDefinition, MCPToolBinding } from "@iem/core";

const MockView = () => null;

export const webFetchBlock: any = {
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
    error: z.string().optional(),
  }),
  view: MockView,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "web_fetch",
    invoke: async (input: any) => {
      try {
        const options: RequestInit = {
          method: input.method,
          headers: { "Content-Type": "application/json" },
        };
        if (input.method === "POST" && input.body) {
          options.body = JSON.stringify(input.body);
        }

        const res = await fetch(input.url, options);
        let data;
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
        } else {
          data = await res.text();
        }

        return { status: res.status, data };
      } catch (err: any) {
        return { status: 500, data: null, error: err.message };
      }
    },
  },
};

export const slackPostBlock: any = {
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
    error: z.string().optional(),
  }),
  view: MockView,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "slack_post",
    invoke: async (input: any) => {
      const token = process.env.SLACK_BOT_TOKEN;
      if (!token) {
        return {
          success: false,
          error: "Missing SLACK_BOT_TOKEN env variable",
        };
      }

      try {
        const res = await fetch("https://slack.com/api/chat.postMessage", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            channel: input.channel,
            text: input.message,
          }),
        });

        const data: any = await res.json();
        if (!data.ok) {
          return {
            success: false,
            error: data.error || "Failed to post to Slack",
          };
        }
        return { success: true, messageId: data.ts };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },
  },
};

export const notionCreateBlock: any = {
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
    error: z.string().optional(),
  }),
  view: MockView,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "notion_create",
    invoke: async (input: any) => {
      const token = process.env.NOTION_INTEGRATION_TOKEN;
      if (!token) {
        return {
          success: false,
          error: "Missing NOTION_INTEGRATION_TOKEN env variable",
        };
      }

      try {
        const res = await fetch("https://api.notion.com/v1/pages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "Notion-Version": "2022-06-28",
          },
          body: JSON.stringify({
            parent: { database_id: input.databaseId },
            properties: input.properties,
          }),
        });

        const data: any = await res.json();
        if (res.status !== 200) {
          return {
            success: false,
            error: data.message || "Failed to create card in Notion",
          };
        }
        return { success: true, pageId: data.id };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },
  },
};
