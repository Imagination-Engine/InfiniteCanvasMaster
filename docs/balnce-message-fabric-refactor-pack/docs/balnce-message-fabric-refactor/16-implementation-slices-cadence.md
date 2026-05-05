# 16 — Implementation Slices and Cadence

Agents must follow this cadence exactly.

No slice may begin until the previous slice has:

- implementation completed
- tests added or explicitly documented
- task list updated
- gap list updated
- ADR updated if needed
- typecheck/lint/build attempted where applicable
- no-stub audit performed for files touched

## Slice 0 — Discovery and repo map

Create:

- `IMPLEMENTATION_READING_SUMMARY.md`
- `REPO_INTEGRATION_MAP.md`
- `INTEGRATION_TASK_LIST.md`
- `ARCHITECTURE_DECISIONS.md`
- `UPDATED_GAP_LIST.md`

No code changes.

## Slice 1 — Baseline tests around current behavior

Goal: protect existing implementation before refactor.

Implement tests for:

- current BalnceEnvelope schema/wrap utility
- current MessageBus publish/subscribe
- topic publishing
- Mastra DAG output wrapping
- downstream merge behavior

## Slice 2 — Fabric namespace and type contracts

Create:

```txt
packages/core/src/fabric/
  lanes.ts
  envelope.ts
  delivery.ts
  endpoint.ts
  policy.ts
  provenance.ts
  topics.ts
  transport.ts
```

No behavior migration yet.

## Slice 3 — InProcessTransport wrapper

Move/wrap EventEmitter implementation as:

```txt
transports/InProcessTransport.ts
```

Keep `messageBus` compatibility export.

## Slice 4 — FabricRouter v1

Create router that:

- validates envelope
- routes by lane
- defaults current lanes to InProcessTransport
- supports subscription filters
- rejects invalid lane/delivery combinations

## Slice 5 — Envelope v2 upgrade path

Implement:

- `createEnvelope`
- `validateEnvelope`
- `upgradeLegacyEnvelope`
- `encodeEnvelopeNDJSON`
- `decodeEnvelopeNDJSON`

Do not use NDJSON internally.

## Slice 6 — Topic grammar helpers

Implement `FabricTopics` and replace hand-built topic strings in touched fabric code.

## Slice 7 — Mastra DAG adapter refactor

Create:

```txt
adapters/MastraDagFabricAdapter.ts
```

The compiler should receive/inject fabric dependency where feasible.

Emit lane-aware events:

- workflow_trace for lifecycle
- agent_stream for partial outputs
- durable_event mirror for final critical events where available

## Slice 8 — Node input adapter system

Create adapter registry and migrate current `_instructions`/`additionalInstructions` behavior into explicit adapters.

Universal arbitrary mutation must leave the core path.

## Slice 9 — SSE projection adapter

Create:

```txt
transports/SSEProjectionTransport.ts
```

Rules:

- read-only projection
- multiplex events by canvas/workflow/run
- no command/control
- no canonical document-state authority

## Slice 10 — UI/canvas projection model

Define APIs for canvas subscription:

```txt
/fabric/stream?canvasId=...&lanes=agent_stream,workflow_trace,ui_projection
```

Can be interface/stubbed only if actual server integration is absent, but must not be misrepresented as complete.

## Slice 11 — Document-state adapter boundary

Create Yjs/tldraw sync adapter interfaces.

Do not implement full Yjs unless currently in scope. The important result is semantic separation:

- agent_stream deltas do not commit document state
- final accepted outputs may commit to document_state

## Slice 12 — Command/control and approval skeleton

Create typed command API and approval event contracts.

Approval-required events must be marked durable even if durable backend is not complete.

## Slice 13 — Durable/provenance boundaries

Create adapter interfaces for durable_event and provenance.

Do not fake persistence. If absent, document gap and implement no-op only in test/dev with explicit warnings.

## Slice 14 — Runtime simulation lane boundary

Create contracts for runtime_simulation lane.

Define game/runtime rules and tests proving runtime ticks do not enter document_state by default.

## Slice 15 — Lane-specific tests

Add tests proving:

- agent_stream is projection-safe
- document_state is canonical-state-only
- command_control requires ack path
- approval_required cannot be ephemeral only
- runtime_simulation is low-latency/non-durable by default
- durable_event is not routed only to InProcessTransport in production config

## Slice 16 — Migration cleanup

Remove or quarantine:

- direct global singleton bus usage where avoidable
- hand-built topics
- universal input mutation
- internal NDJSON string passing
- hidden mock/no-op production behavior

## Slice 17 — Production hardening

Run no-stub audit:

Search for:

```txt
mock
stub
placeholder
TODO
FIXME
dummy
fake
simplified
demo
for now
in real implementation
not implemented
```

Every occurrence must be removed or documented in gap list with closure criteria.

## Slice 18 — Final review package

Generate:

- summary of completed slices
- unresolved gaps
- ADR list
- test status
- build/typecheck/lint status
- next implementation plan
