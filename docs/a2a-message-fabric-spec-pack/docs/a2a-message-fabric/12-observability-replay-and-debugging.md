# 12 — Observability, Replay, and Debugging

Support DAG trace replay, canvas reconstruction, failed run debug, approval audit, and test replay.

```ts
type A2AReplayQuery = {
  traceId?: string;
  runId?: string;
  topicPrefix?: string;
  sourceId?: string;
  targetId?: string;
  eventTypes?: BalnceEnvelopeEventType[];
  fromSequence?: number;
  toSequence?: number;
  fromTimestamp?: string;
  toTimestamp?: string;
};
```

Debug timeline should show timestamp, sequence, source, target, event type, delivery class, payload summary, policy decision, provenance refs, and error details.

Implement safe payload summaries. Do not render raw payloads by default.
