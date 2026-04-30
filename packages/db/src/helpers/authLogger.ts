import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const authEvents = pgTable("auth_events", {
  id: text("id").primaryKey(),
  status: text("status").notNull(), // 'login_success' | 'login_failure'
  userId: text("user_id"),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export interface AuthEventPayload {
  status: "login_success" | "login_failure";
  userId?: string;
  ipAddress: string;
  userAgent?: string;
  metadata?: string;
}

const MAX_METADATA_SIZE = 1000; // 1kb

export async function logAuthEvent(db: any, payload: AuthEventPayload) {
  if (payload.metadata && payload.metadata.length > MAX_METADATA_SIZE) {
    throw new Error("Metadata payload exceeds maximum allowed size");
  }

  return db.insert(authEvents).values({
    id: crypto.randomUUID(),
    status: payload.status,
    userId: payload.userId || null,
    ipAddress: payload.ipAddress,
    userAgent: payload.userAgent || null,
    metadata: payload.metadata || null,
  });
}
