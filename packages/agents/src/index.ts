import { Mastra } from '@mastra/core';
import { PostgresStore } from '@mastra/pg';
import { Observability, ConsoleExporter } from '@mastra/observability';
import { orchestrator } from './agents/orchestrator.js';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5433/imagination_canvas';

export const storage = new PostgresStore({
  id: 'iem-storage',
  connectionString,
});

export const observability = new Observability({
  configs: {
    default: {
      enabled: true,
      serviceName: "imagination-engine-agents",
      exporters: [new ConsoleExporter()]
    }
  }
} as any);

export const mastra = new Mastra({
  storage,
  observability,
  agents: {
    orchestrator,
  },
});

export * from './workflows/compiler.js';
