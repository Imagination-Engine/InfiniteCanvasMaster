export class InMemoryEventLog {
  envelopes = [];
  maxLogs = 1000;
  async append(envelope) {
    this.envelopes.push(envelope);
    if (this.envelopes.length > this.maxLogs) {
      this.envelopes.shift();
    }
  }
  async query(query) {
    return this.envelopes.filter((env) => {
      if (query.traceId && env.traceId !== query.traceId) return false;
      if (query.runId && env.runId !== query.runId) return false;
      if (query.sourceId && env.source.id !== query.sourceId) return false;
      if (query.eventTypes && !query.eventTypes.includes(env.event.type)) {
        return false;
      }
      return true;
    });
  }
  async clear() {
    this.envelopes = [];
  }
}
