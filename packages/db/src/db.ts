import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema/index.js";

// Create a singleton pool that can be used across packages
export const getConnectionString = () => {
  return (
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5433/imagination_canvas"
  );
};

export const pool = new Pool({
  connectionString: getConnectionString(),
});

export const db = drizzle(pool, { schema });
