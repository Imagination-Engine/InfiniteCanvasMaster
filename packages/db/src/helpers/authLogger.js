"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authEvents = void 0;
exports.logAuthEvent = logAuthEvent;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.authEvents = (0, pg_core_1.pgTable)("auth_events", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    status: (0, pg_core_1.text)("status").notNull(), // 'login_success' | 'login_failure'
    userId: (0, pg_core_1.text)("user_id"),
    ipAddress: (0, pg_core_1.text)("ip_address").notNull(),
    userAgent: (0, pg_core_1.text)("user_agent"),
    metadata: (0, pg_core_1.text)("metadata"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
const MAX_METADATA_SIZE = 1000; // 1kb
async function logAuthEvent(db, payload) {
    if (payload.metadata && payload.metadata.length > MAX_METADATA_SIZE) {
        throw new Error("Metadata payload exceeds maximum allowed size");
    }
    return db.insert(exports.authEvents).values({
        id: crypto.randomUUID(),
        status: payload.status,
        userId: payload.userId || null,
        ipAddress: payload.ipAddress,
        userAgent: payload.userAgent || null,
        metadata: payload.metadata || null,
    });
}
