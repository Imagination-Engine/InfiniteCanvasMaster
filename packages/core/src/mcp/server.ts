import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { blockRegistry } from "../block/registry";
import { zodToJsonSchema } from "zod-to-json-schema";
import { generateCoreCapabilities } from "../block/factory";

export class EngineMCPServer {
  private server: Server;

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
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Imagination Engine MCP Server running on stdio");
  }
}
