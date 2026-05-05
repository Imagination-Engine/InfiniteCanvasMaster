# 19 — Master Implementation Prompt

# Balnce A2A Message Fabric Hardening and Implementation

You are working inside the Balnce codebase.

Your mission is to evolve the current internal A2A message bus from a local in-process event bridge into the Balnce A2A Message Fabric.

This is a production architecture task. You are not building a generic EventEmitter, replacing Mastra, duplicating the DAG engine, creating fake durable messaging, or creating a shallow string-passing bus.

You are building the semantic message fabric for Mastra DAG execution, generative chaining, Imagination Canvas observation, Balnce-native blocks, OpenClaw runtime events, agent group orchestration, replayable traces, approval-gated actions, policy-aware instruction passing, future Edge Twin/device mesh routing, and provenance-ready outputs.

## Required Reading

Before modifying code, read `/docs/a2a-message-fabric/`. Do not implement from this prompt alone. The specification folder is the source of truth.

## Required Pre-Implementation Deliverables

Create:

```txt
/docs/a2a-message-fabric/IMPLEMENTATION_READING_SUMMARY.md
/docs/a2a-message-fabric/A2A_TASK_LIST.md
/docs/a2a-message-fabric/REPO_INTEGRATION_MAP.md
/docs/a2a-message-fabric/ARCHITECTURE_DECISIONS.md
/docs/a2a-message-fabric/GAP_LIST.md
```

## Current Implementation Boundary

The current implementation is accepted as `Phase 1 — Local A2A Event Bridge for Mastra DAG Execution`. It is not yet the full message fabric.

## Required Direction

Typed internal envelopes -> topic helpers -> transport abstraction -> event log/replay -> policy/trust checks -> Node Input Adapters -> Canvas/OpenClaw/orchestrator subscriptions -> future durable/distributed transports.

## Non-Negotiable Rules

1. Do not publish only raw NDJSON internally.
2. Internally publish typed BalnceEnvelope objects.
3. Use NDJSON only at streaming/transport boundaries.
4. Implement and use topic helpers.
5. Do not couple the DAG compiler to a global singleton EventEmitter as final architecture.
6. Inject `messageFabric`, `envelopeFactory`, `eventLog`, `policyEngine`, and `nodeInputAdapters` where possible.
7. Replace universal input mutation with Node Input Adapters.
8. Do not allow untrusted tool/retrieved content to become trusted instructions.
9. Add delivery semantics.
10. Approval-required events must not be ephemeral.
11. Replayable/durable events must be logged.
12. Sensitive payloads must be redacted for compact UI/canvas views.
13. Missing integrations must be documented, not faked.
14. No mocks, stubs, fake durable logs, or placeholder policy code may be presented as final.

## Required Slices

Repo scan, protocol deepening, transport abstraction, NDJSON boundary encoding, topic grammar, event log/replay, compiler injection, Node Input Adapters, trust/policy layer, canvas subscription API, replay/debug tools, OpenClaw/future runtime compatibility, hardening/no-stub audit.

## Definition of Done

Typed envelope protocol exists; EventEmitter is only one transport; internal bus uses typed envelopes; NDJSON is boundary-only; topic helpers are used; compiler can use injected fabric; Node Input Adapters exist; legacy universal input mutation is removed or isolated; event log/replay exists; trust metadata exists; policy can block unsafe instruction flow; approval-required events are durable; compact redaction exists; tests pass or failures are documented; gap list is current; no fake production behavior remains.
