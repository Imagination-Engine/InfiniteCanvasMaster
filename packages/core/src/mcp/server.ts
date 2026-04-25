import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { blockRegistry } from "../block/registry";
import { zodToJsonSchema } from "zod-to-json-schema";
import { generateCoreCapabilities } from "../block/factory";
import express from "express";

export class EngineMCPServer {
  private server: Server;
  private sseTransport: SSEServerTransport | null = null;

  constructor() {
    generateCoreCapabilities(); // Bootstrap all dynamic blocks into the registry

    this.server = new Server(
      {
        name: "imagination-engine-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = blockRegistry.list().map((block) => {
        const schema = zodToJsonSchema(block.input) as any;
        return {
          name: block.agent.toolName || block.id.replace(/\./g, "_"),
          description: block.description || `Tool for ${block.name}`,
          inputSchema: schema || {
            type: "object",
            properties: {},
          },
        };
      });

      return {
        tools,
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const toolName = request.params.name;
      const block = blockRegistry
        .list()
        .find(
          (b) => (b.agent.toolName || b.id.replace(/\./g, "_")) === toolName,
        );

      if (!block) {
        throw new Error(`Tool not found: ${toolName}`);
      }

      try {
        const result = await block.agent.invoke(request.params.arguments || {});
        return {
          content: [
            {
              type: "text",
              text:
                typeof result === "object"
                  ? JSON.stringify(result, null, 2)
                  : String(result),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error executing tool: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async start() {
    const isSSE = process.env.MCP_TRANSPORT === "sse";

    if (isSSE) {
      const app = express();

      app.get("/sse", async (req, res) => {
        console.log("[MCP] New SSE connection");
        this.sseTransport = new SSEServerTransport("/message", res as any);
        await this.server.connect(this.sseTransport);
      });

      app.post("/message", async (req, res) => {
        if (!this.sseTransport) {
          res.status(400).send("No active SSE connection");
          return;
        }
        await this.sseTransport.handlePostMessage(req as any, res as any);
      });

      const port = process.env.PORT || 3002;
      app.listen(port, () => {
        console.error(
          `Imagination Engine MCP Server running on SSE at http://0.0.0.0:${port}`,
        );
      });
    } else {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      console.error("Imagination Engine MCP Server running on stdio");
    }
  }
}
