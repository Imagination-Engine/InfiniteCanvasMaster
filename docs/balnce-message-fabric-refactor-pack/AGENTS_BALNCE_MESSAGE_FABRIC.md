# AGENTS — Balnce Message Fabric Refactor

When working on the message fabric, always read first:

```txt
docs/balnce-message-fabric-refactor/00-master-kickoff.md
docs/balnce-message-fabric-refactor/04-lanes-and-plane-semantics.md
docs/balnce-message-fabric-refactor/05-balnce-envelope-v2.md
docs/balnce-message-fabric-refactor/13-mastra-dag-integration-refactor.md
docs/balnce-message-fabric-refactor/16-implementation-slices-cadence.md
docs/balnce-message-fabric-refactor/18-master-implementation-prompt.md
```

Standing rules:

1. Preserve current working behavior before refactoring.
2. Treat the current EventEmitter bus as `InProcessTransport`, not the whole fabric.
3. Every new envelope must have a lane and delivery class.
4. SSE is projection-only.
5. Yjs/tldraw sync owns document_state, not token streaming.
6. Command/control requires acknowledgement.
7. Runtime/game events belong to runtime_simulation.
8. Durable facts must not vanish into ephemeral transports.
9. Provenance-sensitive events need source, causation, and redaction awareness.
10. Do not silently fake production transports.
11. Follow the slice cadence exactly.
12. Update task list, gap list, and ADRs after each slice.
