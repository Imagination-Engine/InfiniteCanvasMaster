import { Hono } from "hono";
import { blockRegistry } from "@iem/core";
import jwt from "jsonwebtoken";

const blocksRouter = new Hono();

const getSecrets = (c: any) => {
  return {
    JWT_SECRET:
      c.env?.JWT_SECRET ||
      process.env.JWT_SECRET ||
      "super-secret-fallback-key",
  };
};

// Auth Middleware (Optional but recommended for execution)
blocksRouter.use("*", async (c, next) => {
  const { JWT_SECRET } = getSecrets(c);
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // We might allow public execution for some blocks, but for now, strict.
    return c.json({ error: "Unauthorized" }, 401);
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    c.set("user", payload);
    await next();
  } catch (err) {
    return c.json({ error: "Invalid token" }, 401);
  }
});

/**
 * Single Block Execution Endpoint
 * POST /api/blocks/execute
 * Body: { blockId: string, inputs: Record<string, unknown> }
 */
blocksRouter.post("/execute", async (c) => {
  const { blockId, inputs } = await c.req.json();

  if (!blockId) {
    return c.json({ error: "blockId is required" }, 400);
  }

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
