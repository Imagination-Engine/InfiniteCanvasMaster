// @ts-nocheck
import { A2AEventLog, BalnceEnvelope, A2AReplayQuery } from "./protocol";

export class InMemoryEventLog implements A2AEventLog {
  private envelopes: BalnceEnvelope[] = [];
  private maxLogs = 1000;

  async append(envelope: BalnceEnvelope): Promise<void> {
    this.envelopes.push(envelope);
    if (this.envelopes.length > this.maxLogs) {
      this.envelopes.shift();
    }
  }

  async query(query: A2AReplayQuery): Promise<BalnceEnvelope[]> {
    return this.envelopes.filter((env) => {
      if (query.traceId && env.traceId !== query.traceId) return false;
      if (query.runId && env.runId !== query.runId) return false;
      if (query.sourceId && env.source.id !== query.sourceId) return false;
      if (
        query.eventTypes &&
        !query.eventTypes.includes(env.event.type as any)
      ) {
        return false;
      }
      return true;
    });
  }

  async clear(): Promise<void> {
    this.envelopes = [];
  }
}
