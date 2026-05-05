# Balnce Message Fabric Refactor

This folder is the source-of-truth refactor specification for upgrading the current in-process A2A message bus into a lane-aware Balnce Message Fabric.

## Use this package to prevent three failure modes

1. Treating SSE as the internal agent bus.
2. Treating Yjs/tldraw sync, agent streams, game ticks, approvals, and provenance as the same class of event.
3. Letting the current EventEmitter bridge harden into a hidden architecture before lanes, delivery semantics, and policy are defined.

## Refactor principle

Preserve the working implementation, but reframe it as:

```txt
Current EventEmitter MessageBus
  ↓
InProcessTransport
  ↓
BalnceFabricRouter
  ↓
Lane-specific adapters
  ↓
Canvas, Mastra, Yjs/tldraw sync, UI streams, command/control, runtime, durable logs, provenance
```

## Required created files during implementation

Agents must create and maintain:

- `IMPLEMENTATION_READING_SUMMARY.md`
- `REPO_INTEGRATION_MAP.md`
- `INTEGRATION_TASK_LIST.md`
- `ARCHITECTURE_DECISIONS.md`
- `UPDATED_GAP_LIST.md`
- `PERFORMANCE_AND_RELIABILITY_NOTES.md`
- `SECURITY_AND_POLICY_NOTES.md`
