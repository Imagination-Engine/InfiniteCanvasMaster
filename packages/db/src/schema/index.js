"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.edgesRelations = exports.nodesRelations = exports.canvasesRelations = exports.workspacesRelations = exports.usersRelations = exports.customAgents = exports.messages = exports.authSessions = exports.edges = exports.nodes = exports.canvases = exports.workspaces = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    email: (0, pg_core_1.text)('email').notNull().unique(),
    passwordHash: (0, pg_core_1.text)('password_hash').notNull(),
    name: (0, pg_core_1.text)('name'),
    hasCompletedOnboarding: (0, pg_core_1.boolean)('has_completed_onboarding').default(false),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.workspaces = (0, pg_core_1.pgTable)('workspaces', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    name: (0, pg_core_1.text)('name').notNull(),
    ownerId: (0, pg_core_1.uuid)('owner_id').notNull().references(() => exports.users.id, { onDelete: 'cascade' }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.canvases = (0, pg_core_1.pgTable)('canvases', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    workspaceId: (0, pg_core_1.uuid)('workspace_id').notNull().references(() => exports.workspaces.id, { onDelete: 'cascade' }),
    name: (0, pg_core_1.text)('name').notNull(),
    description: (0, pg_core_1.text)('description'),
    surfaceType: (0, pg_core_1.text)('surface_type').default('conductor').notNull(), // playable, conductor, reel, forge, scribe
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.nodes = (0, pg_core_1.pgTable)('nodes', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    canvasId: (0, pg_core_1.uuid)('canvas_id').notNull().references(() => exports.canvases.id, { onDelete: 'cascade' }),
    type: (0, pg_core_1.text)('type').notNull(),
    positionX: (0, pg_core_1.doublePrecision)('position_x').notNull(),
    positionY: (0, pg_core_1.doublePrecision)('position_y').notNull(),
    data: (0, pg_core_1.jsonb)('data').default({}).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.edges = (0, pg_core_1.pgTable)('edges', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    canvasId: (0, pg_core_1.uuid)('canvas_id').notNull().references(() => exports.canvases.id, { onDelete: 'cascade' }),
    sourceId: (0, pg_core_1.uuid)('source_id').notNull().references(() => exports.nodes.id, { onDelete: 'cascade' }),
    targetId: (0, pg_core_1.uuid)('target_id').notNull().references(() => exports.nodes.id, { onDelete: 'cascade' }),
    sourceHandle: (0, pg_core_1.text)('source_handle'),
    targetHandle: (0, pg_core_1.text)('target_handle'),
    data: (0, pg_core_1.jsonb)('data').default({}),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.authSessions = (0, pg_core_1.pgTable)('auth_sessions', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').notNull().references(() => exports.users.id, { onDelete: 'cascade' }),
    refreshToken: (0, pg_core_1.text)('refresh_token').notNull().unique(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.messages = (0, pg_core_1.pgTable)('messages', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    workspaceId: (0, pg_core_1.uuid)('workspace_id').notNull().references(() => exports.workspaces.id, { onDelete: 'cascade' }),
    role: (0, pg_core_1.text)('role').notNull(),
    content: (0, pg_core_1.text)('content').notNull(),
    toolCalls: (0, pg_core_1.jsonb)('tool_calls'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.customAgents = (0, pg_core_1.pgTable)('custom_agents', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    ownerId: (0, pg_core_1.uuid)('owner_id').notNull().references(() => exports.users.id, { onDelete: 'cascade' }),
    name: (0, pg_core_1.text)('name').notNull(),
    tagline: (0, pg_core_1.text)('tagline'),
    avatarUrl: (0, pg_core_1.text)('avatar_url'),
    story: (0, pg_core_1.text)('story'),
    persona: (0, pg_core_1.jsonb)('persona'),
    skills: (0, pg_core_1.jsonb)('skills').notNull(), // array of strings
    contextSources: (0, pg_core_1.jsonb)('context_sources'),
    capabilities: (0, pg_core_1.jsonb)('capabilities'),
    purpose: (0, pg_core_1.text)('purpose').notNull(),
    blockDefinition: (0, pg_core_1.jsonb)('block_definition'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// Relations
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many }) => ({
    workspaces: many(exports.workspaces),
}));
exports.workspacesRelations = (0, drizzle_orm_1.relations)(exports.workspaces, ({ one, many }) => ({
    owner: one(exports.users, { fields: [exports.workspaces.ownerId], references: [exports.users.id] }),
    canvases: many(exports.canvases),
}));
exports.canvasesRelations = (0, drizzle_orm_1.relations)(exports.canvases, ({ one, many }) => ({
    workspace: one(exports.workspaces, { fields: [exports.canvases.workspaceId], references: [exports.workspaces.id] }),
    nodes: many(exports.nodes),
    edges: many(exports.edges),
}));
exports.nodesRelations = (0, drizzle_orm_1.relations)(exports.nodes, ({ one, many }) => ({
    canvas: one(exports.canvases, { fields: [exports.nodes.canvasId], references: [exports.canvases.id] }),
    outgoingEdges: many(exports.edges, { relationName: 'sourceEdges' }),
    incomingEdges: many(exports.edges, { relationName: 'targetEdges' }),
}));
exports.edgesRelations = (0, drizzle_orm_1.relations)(exports.edges, ({ one }) => ({
    canvas: one(exports.canvases, { fields: [exports.edges.canvasId], references: [exports.canvases.id] }),
    source: one(exports.nodes, { fields: [exports.edges.sourceId], references: [exports.nodes.id], relationName: 'sourceEdges' }),
    target: one(exports.nodes, { fields: [exports.edges.targetId], references: [exports.nodes.id], relationName: 'targetEdges' }),
}));
