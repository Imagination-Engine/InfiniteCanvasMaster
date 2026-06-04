import { z } from "zod";
import type { BlockDefinition, MCPToolBinding } from "@iem/core";

const MockView = () => null;

export const webFetchBlock: any = {
  id: "iem.conductor.webFetch",
  name: "Web Fetch",
  description: "Fetches content from a URL",
  category: "web",
  accepts: ["any"],
  produces: ["any"],
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
  accepts: ["any"],
  produces: ["any"],
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
  accepts: ["any"],
  produces: ["any"],
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

export const httpRequestBlock: any = {
  id: "iem.conductor.httpRequest",
  name: "HTTP Request",
  description:
    "Formats and sends custom HTTP requests to external APIs (n8n style)",
  category: "web",
  accepts: ["any"],
  produces: ["any"],
  input: z.object({
    url: z.string().url(),
    method: z
      .enum(["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"])
      .default("GET"),
    sendHeaders: z.boolean().default(false),
    headersJson: z.string().optional(),
    sendQueryParameters: z.boolean().default(false),
    queryParametersJson: z.string().optional(),
    sendBody: z.boolean().default(false),
    bodyContentType: z
      .enum(["json", "form-data", "raw", "urlencoded"])
      .default("json"),
    bodyJson: z.string().optional(),
    bodyRaw: z.string().optional(),
    authentication: z.enum(["none", "basic", "header"]).default("none"),
    authUsername: z.string().optional(),
    authPassword: z.string().optional(),
    authHeaderName: z.string().optional(),
    authHeaderValue: z.string().optional(),
  }),
  output: z.object({
    status: z.number(),
    data: z.any(),
    headers: z.record(z.string()).optional(),
    error: z.string().optional(),
  }),
  view: MockView,
  mode: "triggered",
  agent: {
    kind: "local",
    toolName: "http_request",
    invoke: async (input: any) => {
      try {
        const urlObj = new URL(input.url);

        // 1. Query Parameters
        if (input.sendQueryParameters && input.queryParametersJson) {
          try {
            const queryParams =
              typeof input.queryParametersJson === "string"
                ? JSON.parse(input.queryParametersJson)
                : input.queryParametersJson;
            if (queryParams && typeof queryParams === "object") {
              Object.entries(queryParams).forEach(([k, v]) => {
                urlObj.searchParams.set(k, String(v));
              });
            }
          } catch (e: any) {
            return {
              status: 400,
              data: null,
              error: `Invalid Query Parameters JSON: ${e.message}`,
            };
          }
        }

        // 2. Headers
        const headers: Record<string, string> = {};
        if (input.sendHeaders && input.headersJson) {
          try {
            const customHeaders =
              typeof input.headersJson === "string"
                ? JSON.parse(input.headersJson)
                : input.headersJson;
            if (customHeaders && typeof customHeaders === "object") {
              Object.entries(customHeaders).forEach(([k, v]) => {
                headers[k.toLowerCase()] = String(v);
              });
            }
          } catch (e: any) {
            return {
              status: 400,
              data: null,
              error: `Invalid Headers JSON: ${e.message}`,
            };
          }
        }

        // 3. Authentication
        if (input.authentication === "basic") {
          const credentials = Buffer.from(
            `${input.authUsername || ""}:${input.authPassword || ""}`,
          ).toString("base64");
          headers["authorization"] = `Basic ${credentials}`;
        } else if (input.authentication === "header" && input.authHeaderName) {
          headers[input.authHeaderName.toLowerCase()] =
            input.authHeaderValue || "";
        }

        // 4. Body Content
        let requestBody: any = undefined;
        if (
          input.method !== "GET" &&
          input.method !== "HEAD" &&
          input.sendBody
        ) {
          const contentType = input.bodyContentType || "json";
          if (contentType === "json" && input.bodyJson) {
            try {
              requestBody =
                typeof input.bodyJson === "string"
                  ? input.bodyJson
                  : JSON.stringify(input.bodyJson);
              if (!headers["content-type"]) {
                headers["content-type"] = "application/json";
              }
            } catch (e: any) {
              return {
                status: 400,
                data: null,
                error: `Invalid Body JSON: ${e.message}`,
              };
            }
          } else if (contentType === "urlencoded" && input.bodyJson) {
            try {
              const bodyObj =
                typeof input.bodyJson === "string"
                  ? JSON.parse(input.bodyJson)
                  : input.bodyJson;
              const params = new URLSearchParams();
              Object.entries(bodyObj).forEach(([k, v]) => {
                params.set(k, String(v));
              });
              requestBody = params.toString();
              if (!headers["content-type"]) {
                headers["content-type"] = "application/x-www-form-urlencoded";
              }
            } catch (e: any) {
              return {
                status: 400,
                data: null,
                error: `Invalid urlencoded Body JSON: ${e.message}`,
              };
            }
          } else if (contentType === "raw" && input.bodyRaw) {
            requestBody = input.bodyRaw;
            if (!headers["content-type"]) {
              headers["content-type"] = "text/plain";
            }
          }
        }

        const options: RequestInit = {
          method: input.method,
          headers,
          body: requestBody,
        };

        const res = await fetch(urlObj.toString(), options);

        const responseHeaders: Record<string, string> = {};
        res.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        let data;
        const resContentType = res.headers.get("content-type");
        if (resContentType && resContentType.includes("application/json")) {
          data = await res.json();
        } else {
          data = await res.text();
        }

        return {
          status: res.status,
          data,
          headers: responseHeaders,
        };
      } catch (err: any) {
        return { status: 500, data: null, error: err.message };
      }
    },
  },
};
