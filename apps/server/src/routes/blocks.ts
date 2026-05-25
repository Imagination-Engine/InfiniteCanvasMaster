import { Hono } from "hono";
// @ts-ignore
import { blockRegistry, normalizeCanvasBlockId } from "@iem/core";
import jwt from "jsonwebtoken";

const blocksRouter = new Hono();

import { authMiddleware } from "../middleware/auth.js";

/**
 * List all available blocks (Registry + Database)
 * GET /api/blocks/library
 */
blocksRouter.get("/library", async (c) => {
  // 1. Get core registry blocks
  const registryBlocks = blockRegistry.list().map((b) => ({
    id: b.id,
    name: b.name,
    category: b.category,
    description: b.description,
    icon: b.icon,
    agentic: b.agentic,
    runtime: b.runtime,
    studio: b.studio,
  }));

  // 2. Fetch custom blocks from DB (placeholder for now)
  const dbBlocks: any[] = [];

  return c.json({
    blocks: [...registryBlocks, ...dbBlocks],
  });
});

/**
 * Save a custom block to the library
 * POST /api/blocks/library
 */
blocksRouter.post("/library", async (c) => {
  const payload = await c.req.json();

  // In production, we would persist this to the DB.
  console.log(`[LIBRARY] Saving custom block: ${payload.name}`);

  return c.json({
    success: true,
    block: {
      ...payload,
      id: payload.id || `custom-${Date.now()}`,
    },
  });
});

// Protect only the execution endpoint for now
blocksRouter.use("/execute", authMiddleware);

/**
 * Single Block Execution Endpoint
 * POST /api/blocks/execute
 * Body: { blockId: string, inputs: Record<string, unknown> }
 */
blocksRouter.post("/execute", async (c) => {
  const { blockId: rawBlockId, inputs } = await c.req.json();

  if (!rawBlockId) {
    return c.json({ error: "blockId is required" }, 400);
  }

  const blockId = normalizeCanvasBlockId(rawBlockId);
  const blockDef = blockRegistry.get(blockId);
  if (!blockDef) {
    return c.json({ error: `Block not found: ${blockId}` }, 404);
  }

  try {
    console.log(`[BLOCK EXECUTION] Running ${blockId}...`);

    // 1. Validate inputs against the Zod schema
    const validatedInput = blockDef.input.parse(inputs || {});

    // 2. Invoke the agent logic
    const result = await blockDef.agent.invoke(validatedInput);

    // 3. Validate output
    const validatedOutput = blockDef.output.parse(result);

    return c.json({
      success: true,
      blockId,
      output: validatedOutput,
    });
  } catch (error: any) {
    console.error(`[BLOCK EXECUTION ERROR] ${blockId}:`, error);
    return c.json(
      {
        success: false,
        blockId,
        error: error.message || "Internal execution error",
      },
      500,
    );
  }
});

export { blocksRouter };
