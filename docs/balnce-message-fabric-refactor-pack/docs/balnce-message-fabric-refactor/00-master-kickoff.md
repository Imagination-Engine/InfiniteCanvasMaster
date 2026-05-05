# 00 — Master Kickoff

You are refactoring the existing Balnce internal A2A message implementation into the **Balnce Message Fabric**.

## You are not starting over

The current implementation is valuable:

- `BalnceEnvelope` exists.
- A local `MessageBus` exists.
- Mastra DAG compiler output interception exists.
- DAG node outputs can be published and observed.
- Current code compiles at the core integration level.

Do not throw this away.

## You are promoting it

The current implementation should become the first adapter/lane of a richer architecture:

```txt
MessageBus.ts → InProcessTransport
wrapInEnvelope → createEnvelope / validateEnvelope
DAG output publish → MastraDagFabricAdapter
SSE stream → UIProjectionAdapter only
```

## Required first action

Before coding, recursively read:

```txt
docs/balnce-message-fabric-refactor/
docs/a2a-message-fabric/                 if present
docs/imagination-canvas-extraction/       if present
```

Then create:

```txt
docs/balnce-message-fabric-refactor/IMPLEMENTATION_READING_SUMMARY.md
docs/balnce-message-fabric-refactor/REPO_INTEGRATION_MAP.md
docs/balnce-message-fabric-refactor/INTEGRATION_TASK_LIST.md
docs/balnce-message-fabric-refactor/ARCHITECTURE_DECISIONS.md
docs/balnce-message-fabric-refactor/UPDATED_GAP_LIST.md
```

No implementation code may be changed until these files exist.

## Non-negotiable refactor sentence

> We are not replacing the message bus. We are upgrading it into a lane-aware Message Fabric, where each event is routed according to its semantics, not merely its topic.
