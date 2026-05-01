# 07 — Delivery Semantics and Durability

Classes: `ephemeral`, `replayable`, `durable`, `approval_required`, `provenance_required`.

Defaults: `run.progress` ephemeral; node/tool started/output/completed replayable; failures durable; approval.required approval_required; artifact.created and memory.written provenance_required; policy.blocked durable.

```ts
interface A2AEventLog {
  append(envelope: BalnceEnvelope): Promise<void>;
  query(query: A2AReplayQuery): Promise<BalnceEnvelope[]>;
}
```

Approval requests must never be ephemeral. Replayable/durable events should be queryable by runId/traceId.
