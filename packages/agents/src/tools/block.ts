import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import * as dbModule from "@iem/db";
import { eq, or, and, inArray } from "drizzle-orm";

const { db, nodes: nodesTable, edges: edgesTable } = dbModule as any;

/**
 * Tool for a sovereign agent to read its surrounding context on the canvas.
 */
export const read_canvas_context = createTool({
  id: "read_canvas_context",
  description:
    "Read the details of neighboring blocks and the connections linked to this block to understand its role in the larger workflow.",
  inputSchema: z.object({
    block_id: z.string().describe("The unique ID of the current block."),
  }),
  execute: async (input: { block_id: string }) => {
    try {
      // Find current node to get canvasId
      const [currentNode] = await db
        .select()
        .from(nodesTable)
        .where(eq(nodesTable.id, input.block_id));

      if (!currentNode) return { error: "Block not found" };

      // Find all edges connected to this node
      const connectedEdges = await db
        .select()
        .from(edgesTable)
        .where(
          or(
            eq(edgesTable.sourceId, input.block_id),
            eq(edgesTable.targetId, input.block_id),
          ),
        );

      // Find neighboring nodes
      const neighborIds = connectedEdges.map((e: any) =>
        e.sourceId === input.block_id ? e.targetId : e.sourceId,
      );

      let neighbors = [];
      if (neighborIds.length > 0) {
        neighbors = await db
          .select()
          .from(nodesTable)
          .where(
            and(
              eq(nodesTable.canvasId, currentNode.canvasId),
              inArray(nodesTable.id, neighborIds),
            ),
          );
      }

      return {
        self: currentNode,
        edges: connectedEdges,
        neighbors: neighbors.map((n: any) => ({
          id: n.id,
          type: n.type,
          label: n.data?.label,
          description: n.data?.description,
        })),
      };
    } catch (error: any) {
      return { error: error.message };
    }
  },
});

/**
 * Tool for an agent to update the parameters of its own block.
 */
export const mutate_self = createTool({
  id: "mutate_self",
  description:
    "Update the configuration parameters (metadata) of the current block based on the conversation.",
  inputSchema: z.object({
    block_id: z.string().describe("The unique ID of the current block."),
    updates: z
      .record(z.any())
      .describe(
        "The key-value pairs to update in the block's data.inputs field.",
      ),
  }),
  execute: async (input: { block_id: string; updates: any }) => {
    try {
      const [currentNode] = await db
        .select()
        .from(nodesTable)
        .where(eq(nodesTable.id, input.block_id));

      if (!currentNode) return { error: "Block not found" };

      const newData = {
        ...currentNode.data,
        inputs: {
          ...(currentNode.data.inputs || {}),
          ...input.updates,
        },
      };

      await db
        .update(nodesTable)
        .set({ data: newData, updatedAt: new Date() })
        .where(eq(nodesTable.id, input.block_id));

      return { success: true, updatedData: newData };
    } catch (error: any) {
      return { error: error.message };
    }
  },
});

/**
 * Tool for an agent to send a message to the Balnce Message Fabric (A2A).
 */
export const send_fabric_message = createTool({
  id: "send_fabric_message",
  description:
    "Send a message to the internal Balnce Message Fabric to communicate with other agents or system services.",
  inputSchema: z.object({
    topic: z
      .string()
      .describe("The communication topic (e.g., 'agent.status.update')."),
    lane: z
      .string()
      .default("default")
      .describe("The routing lane for the message."),
    payload: z
      .record(z.any())
      .describe("The structured content of the message."),
  }),
  execute: async (input: { topic: string; lane?: string; payload: any }) => {
    try {
      // In a real implementation, we would resolve the FabricRouter instance.
      // For now, we'll simulate the successful publish.
      console.log(
        `[FABRIC-A2A] Publishing to ${input.topic} on lane ${input.lane}:`,
        input.payload,
      );

      return { success: true, topic: input.topic, lane: input.lane };
    } catch (error: any) {
      return { error: error.message };
    }
  },
});
