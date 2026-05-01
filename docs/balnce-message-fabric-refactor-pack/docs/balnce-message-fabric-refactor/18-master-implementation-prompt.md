# 18 — Master Implementation Prompt

You are implementing the Balnce Message Fabric Refactor.

This is a surgical architecture promotion, not a rewrite.

The current implementation introduced a local EventEmitter-backed message bus, BalnceEnvelope wrapping, and Mastra DAG compiler interception. Preserve that value. Your mission is to upgrade it into a lane-aware Balnce Message Fabric that can support the Imagination Canvas, collaborative document state, agent streams, command/control, runtime surfaces, durable events, and provenance without semantic collapse.

## Source of truth

Before coding, read:

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

Do not change implementation code until those files exist.

## Core thesis

Balnce does not need one generic bus.
Balnce needs one Message Fabric with typed lanes.

The fabric must unify:

- shared envelope
- shared topic grammar
- shared trace IDs
- shared policy model
- shared provenance hooks
- shared observability
- shared routing API

But it must separate the semantic lanes:

- document_state
- presence
- agent_stream
- command_control
- workflow_trace
- runtime_simulation
- durable_event
- provenance
- ui_projection

## Required implementation posture

Do not implement a shallow bus.
Do not force every event through SSE.
Do not use Yjs for token streaming.
Do not use EventEmitter for durable facts.
Do not commit game ticks into document state.
Do not let retrieved/tool content become privileged instructions.
Do not leave fake no-op production paths.
Do not break the current working path without tests.

## Slice cadence

You must follow `16-implementation-slices-cadence.md` exactly.

No skipping.
No parallel jumping.
No implementation phase is complete without tests or a documented gap.

## Required target structure

Create or refactor toward:

```txt
packages/core/src/fabric/
  index.ts
  lanes.ts
  envelope.ts
  delivery.ts
  endpoint.ts
  policy.ts
  provenance.ts
  topics.ts
  transport.ts
  router.ts
  serialization.ts
  nodeInputAdapters.ts
  transports/
    InProcessTransport.ts
    SSEProjectionTransport.ts
  adapters/
    MastraDagFabricAdapter.ts
    CanvasProjectionAdapter.ts
    DocumentStateAdapter.ts
    CommandControlAdapter.ts
    DurableEventAdapter.ts
    ProvenanceAdapter.ts
    RuntimeSimulationAdapter.ts
  tests/
```

Keep compatibility with existing exports unless intentionally migrated and documented.

## Refactor instructions

### 1. Baseline tests first

Protect current behavior before refactoring.

### 2. Promote MessageBus to InProcessTransport

Current EventEmitter logic is valid as a local transport. It is not the whole fabric.

### 3. Add BalnceFabricLane

Every new envelope must include a lane.

### 4. Add delivery class

Every new envelope must specify delivery semantics.

### 5. Add FabricRouter

Route by lane and delivery class, not only topic.

### 6. Add topic helpers

No hand-built topic strings in new fabric code.

### 7. Add node input adapters

Replace universal `_instructions` / `additionalInstructions` injection with explicit adapters.

### 8. Make SSE projection-only

SSE may project `agent_stream`, `workflow_trace`, and `ui_projection` events to UI.

SSE must not own:

- document_state
- command_control
- runtime_simulation
- durable_event
- provenance

### 9. Define document-state boundary

Yjs/tldraw sync adapters own collaborative document state.

Agent deltas do not directly become document state.

### 10. Define command/control boundary

Start/stop/pause/approve/deny must have acknowledgement paths.

### 11. Define durable/provenance boundaries

Approval, artifact, memory, workflow completion, and provenance events must not be ephemeral-only.

### 12. Prove lane separation with tests

Tests must show that events route according to lane semantics.

## No-stub policy

No final production path may contain hidden:

- mock
- stub
- placeholder
- fake
- dummy
- simplified
- demo-only
- TODO real implementation

If a backend adapter is not implemented, provide an explicit interface, dev-only guard, and gap-list entry.

## Definition of done

This refactor is done only when:

- existing behavior is preserved or intentionally migrated
- current MessageBus is wrapped/promoted as InProcessTransport
- envelopes contain lane and delivery semantics
- fabric router exists
- topic helpers exist
- Mastra DAG integration emits lane-aware events
- node input adapters replace universal mutation
- SSE projection is read-only and UI-only
- document_state is separated from agent_stream
- command_control has ack semantics
- durable/provenance boundaries exist
- tests prove lane separation
- gap list is honest
- build/typecheck/test status is reported

Proceed slice by slice. Do not rush. Build the fabric that can become the nervous system of the Balnce personal AI OS.
