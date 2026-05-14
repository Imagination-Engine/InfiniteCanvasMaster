import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
} from "drizzle-orm/pg-core";
import { canvases } from "./index.js";

export const conductorGraphs = pgTable("conductor_graphs", {
  id: uuid("id").primaryKey().defaultRandom(),
  canvasId: uuid("canvas_id")
    .notNull()
    .references(() => canvases.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  version: integer("version").default(1).notNull(),
  status: text("status").default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const conductorNodes = pgTable("conductor_nodes", {
  id: uuid("id").primaryKey().defaultRandom(),
  graphId: uuid("graph_id")
    .notNull()
    .references(() => conductorGraphs.id, { onDelete: "cascade" }),
  canvasBlockId: uuid("canvas_block_id").notNull(),
  kind: text("kind").notNull(),
  label: text("label").notNull(),
  config: jsonb("config").default({}).notNull(),
  inputPorts: jsonb("input_ports").default([]).notNull(),
  outputPorts: jsonb("output_ports").default([]).notNull(),
  runtime: jsonb("runtime").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const conductorEdges = pgTable("conductor_edges", {
  id: uuid("id").primaryKey().defaultRandom(),
  graphId: uuid("graph_id")
    .notNull()
    .references(() => conductorGraphs.id, { onDelete: "cascade" }),
  sourceNodeId: uuid("source_node_id")
    .notNull()
    .references(() => conductorNodes.id, { onDelete: "cascade" }),
  sourcePortId: text("source_port_id").notNull(),
  targetNodeId: uuid("target_node_id")
    .notNull()
    .references(() => conductorNodes.id, { onDelete: "cascade" }),
  targetPortId: text("target_port_id").notNull(),
  condition: jsonb("condition"),
  transform: jsonb("transform"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conductorRuns = pgTable("conductor_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  graphId: uuid("graph_id")
    .notNull()
    .references(() => conductorGraphs.id, { onDelete: "cascade" }),
  status: text("status").default("pending").notNull(),
  input: jsonb("input").default({}).notNull(),
  state: jsonb("state").default({}).notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  failedAt: timestamp("failed_at"),
  error: jsonb("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conductorEvents = pgTable("conductor_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  runId: uuid("run_id")
    .notNull()
    .references(() => conductorRuns.id, { onDelete: "cascade" }),
  nodeId: uuid("node_id").references(() => conductorNodes.id, {
    onDelete: "set null",
  }),
  eventType: text("event_type").notNull(),
  envelope: jsonb("envelope").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conductorNodeResults = pgTable("conductor_node_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  runId: uuid("run_id")
    .notNull()
    .references(() => conductorRuns.id, { onDelete: "cascade" }),
  nodeId: uuid("node_id")
    .notNull()
    .references(() => conductorNodes.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  inputEnvelopes: jsonb("input_envelopes").default([]).notNull(),
  outputEnvelopes: jsonb("output_envelopes").default([]).notNull(),
  artifacts: jsonb("artifacts").default([]).notNull(),
  logs: jsonb("logs").default([]).notNull(),
  error: jsonb("error"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});
