# 00 — Master Kickoff

You are evolving `EventEmitter + BalnceEnvelope + NDJSON strings inside Mastra DAG execution` into the Balnce A2A Message Fabric.

Before code, read `/docs/a2a-message-fabric/` and create:

```txt
IMPLEMENTATION_READING_SUMMARY.md
A2A_TASK_LIST.md
REPO_INTEGRATION_MAP.md
ARCHITECTURE_DECISIONS.md
GAP_LIST.md
```

Non-negotiables: publish typed envelopes internally; use NDJSON only at boundaries; generate topics via helpers; inject transport/fabric into DAG compiler; use Node Input Adapters instead of universal input mutation; label instruction trust/origin; make approval-required events durable; add replay/logging; redact sensitive compact UI payloads; document gaps instead of faking integrations.
