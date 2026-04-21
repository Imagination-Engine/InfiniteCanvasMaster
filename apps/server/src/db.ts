import { Client } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Context, Next } from 'hono';

export interface Env {
  HYPERDRIVE: { connectionString: string };
}

export function setupDatabase(env: Env, executionCtx: { waitUntil: (promise: Promise<any>) => void }) {
  const client = new Client({ connectionString: env.HYPERDRIVE.connectionString });
  const db = drizzle(client);
  return { db, client };
}

declare module 'hono' {
  interface ContextVariableMap {
    db: NodePgDatabase;
  }
}

export const dbMiddleware = async (c: Context<{ Bindings: Env }>, next: Next) => {
  const { db, client } = setupDatabase(c.env, c.executionCtx);
  
  await client.connect();
  c.set('db', db);

  await next();

  c.executionCtx.waitUntil(client.end());
};