import { pgTable, uuid, text, timestamp, jsonb, boolean, integer, varchar, vector } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  hasCompletedOnboarding: boolean('has_completed_onboarding').default(false),
  preferredModel: text('preferred_model').default('ollama:llama3'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title'),
  isCreation: boolean('is_creation').default(false),
  creationSurface: text('creation_surface'),
  thumbnailUrl: text('thumbnail_url'),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const canvases = pgTable('canvases', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  viewport: jsonb('viewport').default({ x: 0, y: 0, zoom: 1 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const blocks = pgTable('blocks', {
  id: varchar('id', { length: 255 }).primaryKey(), // Using varchar since it might be prefixed like 'code-abc'
  canvasId: uuid('canvas_id').references(() => canvases.id, { onDelete: 'cascade' }).notNull(),
  type: text('type').notNull(),
  pos_x: integer('pos_x').default(0).notNull(),
  pos_y: integer('pos_y').default(0).notNull(),
  z_index: integer('z_index').default(0).notNull(),
  parentId: varchar('parent_id', { length: 255 }).references((): any => blocks.id),
  data: jsonb('data').notNull(),
  version: integer('version').default(1).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const blockEdges = pgTable('block_edges', {
  id: varchar('id', { length: 255 }).primaryKey(),
  canvasId: uuid('canvas_id').references(() => canvases.id, { onDelete: 'cascade' }).notNull(),
  sourceBlockId: varchar('source_block_id', { length: 255 }).references(() => blocks.id, { onDelete: 'cascade' }).notNull(),
  targetBlockId: varchar('target_block_id', { length: 255 }).references(() => blocks.id, { onDelete: 'cascade' }).notNull(),
  sourceHandle: text('source_handle'),
  targetHandle: text('target_handle'),
  connectionType: text('connection_type').default('dataflow').notNull(),
  label: text('label'),
  color: text('color'),
  directionality: text('directionality').default('arrow').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'cascade' }).notNull(),
  role: text('role').notNull(),
  content: text('content').notNull(),
  toolCalls: jsonb('tool_calls'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const customAgents = pgTable('custom_agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  tagline: text('tagline'),
  avatarUrl: text('avatar_url'),
  story: text('story'),
  persona: jsonb('persona').notNull(),
  skills: text('skills').array().notNull(),
  contextSources: jsonb('context_sources'),
  capabilities: jsonb('capabilities').notNull(),
  purpose: text('purpose').notNull(),
  blockDefinition: jsonb('block_definition').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const customAgentContext = pgTable('custom_agent_context', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').references(() => customAgents.id, { onDelete: 'cascade' }).notNull(),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 768 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  customAgents: many(customAgents),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  owner: one(users, { fields: [sessions.ownerId], references: [users.id] }),
  messages: many(messages),
  canvases: many(canvases),
}));

export const canvasesRelations = relations(canvases, ({ one, many }) => ({
  session: one(sessions, { fields: [canvases.sessionId], references: [sessions.id] }),
  blocks: many(blocks),
  edges: many(blockEdges),
}));

export const blocksRelations = relations(blocks, ({ one, many }) => ({
  canvas: one(canvases, { fields: [blocks.canvasId], references: [canvases.id] }),
  parent: one(blocks, { fields: [blocks.parentId], references: [blocks.id], relationName: 'parent' }),
  children: many(blocks, { relationName: 'parent' }),
  outgoingEdges: many(blockEdges, { relationName: 'source' }),
  incomingEdges: many(blockEdges, { relationName: 'target' }),
}));

export const blockEdgesRelations = relations(blockEdges, ({ one }) => ({
  canvas: one(canvases, { fields: [blockEdges.canvasId], references: [canvases.id] }),
  source: one(blocks, { fields: [blockEdges.sourceBlockId], references: [blocks.id], relationName: 'source' }),
  target: one(blocks, { fields: [blockEdges.targetBlockId], references: [blocks.id], relationName: 'target' }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  session: one(sessions, { fields: [messages.sessionId], references: [sessions.id] }),
}));

export const customAgentsRelations = relations(customAgents, ({ one, many }) => ({
  owner: one(users, { fields: [customAgents.ownerId], references: [users.id] }),
  contexts: many(customAgentContext),
}));

export const customAgentContextRelations = relations(customAgentContext, ({ one }) => ({
  agent: one(customAgents, { fields: [customAgentContext.agentId], references: [customAgents.id] }),
}));
