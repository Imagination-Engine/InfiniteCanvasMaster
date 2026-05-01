import * as dbModule from "@iem/db";
import { and, eq, inArray } from "drizzle-orm";
const { db, a2aEventLogs } = dbModule;
export class PostgresEventLog {
  async append(envelope) {
    // Only log replayable, durable, approval_required, or provenance_required classes
    const deliveryClass = envelope.delivery?.class || "ephemeral";
    if (deliveryClass === "ephemeral") {
      return;
    }
    try {
      await db.insert(a2aEventLogs).values({
        envelopeId: envelope.id,
        traceId: envelope.traceId,
        runId: envelope.runId,
        topic: "unknown", // Envelope doesn't store the topic it was published on
        eventType: envelope.event.type,
        sourceId: envelope.source.id,
        payload: envelope.payload,
        envelope: envelope,
        timestamp: new Date(envelope.event.timestamp),
      });
    } catch (error) {
      console.error("[PostgresEventLog] Failed to append envelope:", error);
    }
  }
  async query(query) {
    try {
      const conditions = [];
      if (query.traceId)
        conditions.push(eq(a2aEventLogs.traceId, query.traceId));
      if (query.runId) conditions.push(eq(a2aEventLogs.runId, query.runId));
      if (query.sourceId)
        conditions.push(eq(a2aEventLogs.sourceId, query.sourceId));
      if (query.eventTypes && query.eventTypes.length > 0) {
        conditions.push(inArray(a2aEventLogs.eventType, query.eventTypes));
      }
      const results = await db
        .select()
        .from(a2aEventLogs)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(a2aEventLogs.timestamp);
      return results.map((r) => r.envelope);
    } catch (error) {
      console.error("[PostgresEventLog] Query failed:", error);
      return [];
    }
  }
  async clear(query) {
    // Implementation for clearing specific logs if needed
    if (!query) {
      await db.delete(a2aEventLogs);
    }
  }
}
