# 04 — Lanes and Plane Semantics

The fabric is unified, but the lanes are semantically distinct.

## Required lanes

```ts
export type BalnceFabricLane =
  | "document_state"
  | "presence"
  | "agent_stream"
  | "command_control"
  | "workflow_trace"
  | "runtime_simulation"
  | "durable_event"
  | "provenance"
  | "ui_projection";
```

## Lane definitions

### document_state

Owns canonical collaborative state.

Examples:

- canvas object created
- canvas object moved
- block resized
- connector added
- final accepted text committed
- final artifact block committed

Rules:

- should be mergeable
- should be persistent
- should be collaborative
- should not receive raw token deltas
- transport candidate: Yjs or tldraw sync

### presence

Owns ephemeral awareness.

Examples:

- user cursor moved
- agent cursor/attention marker moved
- user selected object
- collaborator viewport changed

Rules:

- may be dropped
- should not be durable
- should not be used for canonical state
- transport candidate: Yjs Awareness or tldraw presence

### agent_stream

Owns live agent activity.

Examples:

- token delta
- agent status changed
- tool started
- tool progress
- partial generation
- block generating

Rules:

- often ephemeral
- may be replayable in debug mode
- should be multiplexed by canvas/workflow
- final outputs should commit to `document_state` only when stable/accepted
- transport candidate: InProcess, SSE projection, WebSocket projection

### command_control

Owns execution control.

Examples:

- start task
- stop task
- pause/resume
- retry
- approve/deny
- assign block task
- route to Edge Twin

Rules:

- requires acknowledgement
- often permission-gated
- cannot be one-way SSE
- transport candidate: HTTP command endpoint, WebSocket, gRPC, local command dispatcher

### workflow_trace

Owns DAG and orchestration trace.

Examples:

- workflow started
- node started
- node completed
- edge traversed
- node failed
- branch chosen

Rules:

- replayable in debug mode
- may mirror key events into durable_event
- supports timeline/debugger/canvas execution visualization

### runtime_simulation

Owns game/app/simulation runtime state.

Examples:

- game input
- frame tick
- entity moved
- collision happened
- simulation state delta

Rules:

- low latency
- often not durable
- may use unreliable delivery for superseding updates
- snapshots commit to document_state
- significant milestones commit to durable_event
- transport candidate: local runtime, WebSocket, WebTransport, ZeroMQ behind backend/device layer

### durable_event

Owns facts that must not vanish.

Examples:

- approval required
- approval resolved
- artifact created
- memory written
- workflow completed
- workflow failed
- offer accepted
- wallet action requested

Rules:

- must be replayable
- should support idempotency
- should be auditable
- cannot rely solely on EventEmitter or SSE

### provenance

Owns verifiable action history.

Examples:

- PLOG entry requested
- content hash recorded
- signed output generated
- artifact provenance bound
- identity-bound action recorded

Rules:

- high integrity
- should preserve source/causation
- should support redaction policies
- should not leak secrets

### ui_projection

Owns what is streamed to the visible UI.

Examples:

- canvas event feed
- block live status
- workflow trace stream
- token projection
- approval notification

Rules:

- read-only from server to client when using SSE
- may be multiplexed
- must not become source of truth
- transport candidate: SSE or WebSocket

## Golden rule

If an event changes canonical shared state, it belongs in `document_state`.
If it only shows live activity, it belongs in `agent_stream` or `ui_projection`.
If it controls execution, it belongs in `command_control`.
If it must not vanish, it belongs in `durable_event`.
If it proves what happened, it belongs in `provenance`.
If it runs at frame speed, it belongs in `runtime_simulation`.
