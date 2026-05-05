# 01 — Why This Refactor Exists

The current implementation correctly introduced an internal event bridge for Mastra DAG output flow. But the system now needs to support broader canvas and agentic behavior:

- collaborative infinite canvas state
- Yjs/tldraw sync
- live agent streaming into multiple blocks
- SSE/WebSocket UI projection
- command/control flows such as start, stop, pause, approve, deny
- games and runtime surfaces on canvas
- multiple OpenClaw/Mastra agent blocks
- durable workflow facts
- provenance and PLOG recording
- policy-aware agent-to-agent messaging

These are not one communication problem. They are multiple semantic planes.

## The old risk

A generic message bus can accidentally become a single pipe for:

- cursor movements
- token deltas
- canvas object mutations
- game ticks
- workflow completions
- memory writes
- approval requests
- wallet/provenance actions

That creates semantic collapse.

## The new target

Balnce needs:

```txt
One Message Fabric
  + typed lanes
  + explicit delivery semantics
  + plane-specific adapters
  + shared envelope
  + shared tracing
  + shared policy
  + shared observability
  + shared provenance hooks
```

## What remains true

The existing MessageBus is not a failure. It is a valid Phase 1 local adapter. It should be preserved, tested, and wrapped inside the new architecture.
