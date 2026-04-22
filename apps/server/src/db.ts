import { Client } from "pg";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Context, Next } from "hono";
import { logger } from "./logging.js";

export interface Env {
  HYPERDRIVE: { connectionString: string };
}

export function setupDatabase(env: Env) {
  const connectionString =
    env?.HYPERDRIVE?.connectionString ||
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5433/imagination_canvas";
  const client = new Client({ connectionString });
  const db = drizzle(client);
  return { db, client };
}

declare module "hono" {
  interface ContextVariableMap {
    db: NodePgDatabase;
    user: any;
  }
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const dbMiddleware = async (
  c: Context<{ Bindings: Env }>,
  next: Next,
) => {
  const { db, client } = setupDatabase(c.env);

  let connected = false;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await client.connect();
      connected = true;
      break;
    } catch (error) {
      logger.error(
        { err: error, attempt },
        "Database connection attempt failed",
      );
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS);
      }
    }
  }

  if (!connected) {
    logger.error("Exhausted database connection retries");
    return c.json(
      { error: "Service Unavailable", details: "Database connection failed" },
      503,
    );
  }

  c.set("db", db);

  try {
    await next();
  } catch (err) {
    logger.error({ err }, "Unhandled error during request processing");
    if (!c.res) {
      return c.json({ error: "Internal Server Error" }, 500);
    }
  } finally {
    // Ensure the connection is closed after the request is processed
    let executionCtx;
    try {
      executionCtx = c.executionCtx;
    } catch {
      // Ignore if executionCtx is not available (e.g. in some test environments)
    }

    if (executionCtx && typeof executionCtx.waitUntil === "function") {
      executionCtx.waitUntil(
        client.end().catch((err) => {
          logger.error({ err }, "Failed to close database connection");
        }),
      );
    } else {
      // Fallback for environments without ExecutionContext
      client.end().catch((err) => {
        logger.error({ err }, "Failed to close database connection");
      });
    }
  }
};
