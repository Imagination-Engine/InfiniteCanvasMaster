import { Mastra } from "@mastra/core";
import { PostgresStore } from "@mastra/pg";
import { Observability, ConsoleExporter } from "@mastra/observability";
import { orchestrator } from "./agents/orchestrator.js";
import { pool } from "@iem/db";
export const storage = new PostgresStore({
  id: "iem-storage",
  pool,
});
export const observability = new Observability({
  configs: {
    default: {
      enabled: true,
      serviceName: "imagination-engine-agents",
      exporters: [new ConsoleExporter()],
    },
  },
});
export const config = {
  storage,
  observability,
  agents: {
    orchestrator,
  },
};
export const mastra = new Mastra(config);
