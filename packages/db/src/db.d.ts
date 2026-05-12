import { Pool } from "pg";
import * as schema from "./schema/index.js";
export declare const getConnectionString: () => string;
export declare const pool: Pool;
export declare const db: import("drizzle-orm/node-postgres").NodePgDatabase<
  typeof schema
> & {
  $client: Pool;
};
//# sourceMappingURL=db.d.ts.map
