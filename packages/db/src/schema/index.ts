import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  boolean,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  hasCompletedOnboarding: boolean("has_completed_onboarding").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const canvases = pgTable("canvases", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  surfaceType: text("surface_type").default("conductor").notNull(), // playable, conductor, reel, forge, scribe
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const nodes = pgTable("nodes", {
  id: uuid("id").primaryKey().defaultRandom(),
  canvasId: uuid("canvas_id")
    .notNull()
    .references(() => canvases.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  positionX: doublePrecision("position_x").notNull(),
  positionY: doublePrecision("position_y").notNull(),
  data: jsonb("data").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const edges = pgTable("edges", {
  id: uuid("id").primaryKey().defaultRandom(),
  canvasId: uuid("canvas_id")
    .notNull()
    .references(() => canvases.id, { onDelete: "cascade" }),
  sourceId: uuid("source_id")
    .notNull()
    .references(() => nodes.id, { onDelete: "cascade" }),
  targetId: uuid("target_id")
    .notNull()
    .references(() => nodes.id, { onDelete: "cascade" }),
  sourceHandle: text("source_handle"),
  targetHandle: text("target_handle"),
  data: jsonb("data").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const authSessions = pgTable("auth_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  refreshToken: text("refresh_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  toolCalls: jsonb("tool_calls"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customAgents = pgTable("custom_agents", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  tagline: text("tagline"),
  avatarUrl: text("avatar_url"),
  story: text("story"),
  persona: jsonb("persona"),
  skills: jsonb("skills").notNull(), // array of strings
  contextSources: jsonb("context_sources"),
  capabilities: jsonb("capabilities"),
  purpose: text("purpose").notNull(),
  blockDefinition: jsonb("block_definition"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  workspaces: many(workspaces),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, { fields: [workspaces.ownerId], references: [users.id] }),
  canvases: many(canvases),
}));

export const canvasesRelations = relations(canvases, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [canvases.workspaceId],
    references: [workspaces.id],
  }),
  nodes: many(nodes),
  edges: many(edges),
}));

export const nodesRelations = relations(nodes, ({ one, many }) => ({
  canvas: one(canvases, {
    fields: [nodes.canvasId],
    references: [canvases.id],
  }),
  outgoingEdges: many(edges, { relationName: "sourceEdges" }),
  incomingEdges: many(edges, { relationName: "targetEdges" }),
}));

export const edgesRelations = relations(edges, ({ one }) => ({
  canvas: one(canvases, {
    fields: [edges.canvasId],
    references: [canvases.id],
  }),
  source: one(nodes, {
    fields: [edges.sourceId],
    references: [nodes.id],
    relationName: "sourceEdges",
  }),
  target: one(nodes, {
    fields: [edges.targetId],
    references: [nodes.id],
    relationName: "targetEdges",
  }),
}));

export const a2aEventLogs = pgTable("a2a_event_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  envelopeId: text("envelope_id").notNull().unique(),
  traceId: text("trace_id").notNull(),
  runId: text("run_id").notNull(),
  topic: text("topic").notNull(),
  eventType: text("event_type").notNull(),
  sourceId: text("source_id").notNull(),
  payload: jsonb("payload").notNull(),
  envelope: jsonb("envelope").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const a2aApprovals = pgTable("a2a_approvals", {
  id: uuid("id").primaryKey().defaultRandom(),
  envelopeId: text("envelope_id").notNull().unique(),
  runId: text("run_id").notNull(),
  status: text("status").default("pending").notNull(), // pending, granted, denied
  requestedAt: timestamp("requested_at").notNull(),
  decidedAt: timestamp("decided_at"),
  approverId: text("approver_id"),
  envelope: jsonb("envelope").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export * from "./conductor.js";
