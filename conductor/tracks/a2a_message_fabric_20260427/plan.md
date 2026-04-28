# Balnce A2A Message Fabric Implementation Plan

## Objective

Implement the Balnce A2A Message Fabric based on the specifications in `/docs/a2a-message-fabric/`. This replaces the simple `EventEmitter` bridge with a strongly-typed, policy-aware, and transport-agnostic messaging layer for the entire Imagination Engine ecosystem.

## Key Constraints & Standards

- **TDD Protocol:** Red, Green, Refactor, Adversarial for all new core components.
- **No Stubs:** Real implementations only.
- **Typed Envelopes:** All internal communication must use `BalnceEnvelope`.

## Phase 0: Deliverable Generation

- **Task:** Create the five required pre-implementation markdown files in `/docs/a2a-message-fabric/`.
  - `IMPLEMENTATION_READING_SUMMARY.md`
  - `A2A_TASK_LIST.md`
  - `REPO_INTEGRATION_MAP.md`
  - `ARCHITECTURE_DECISIONS.md`
  - `GAP_LIST.md`
- **Task:** Conductor - User Manual Verification 'Phase 0' (Protocol in workflow.md)

## Phase 1: Protocol & Typings Core (`@iem/core`)

- **Task:** Define the `BalnceEnvelope` type and associated sub-types (Actor, Instruction, Policy, Delivery, Debug) in `@iem/core/src/bus/protocol.ts`.
- **Task:** Implement robust Topic Grammar helpers in `@iem/core/src/bus/topics.ts`.
- **Task:** Define interfaces for `A2AMessageTransport`, `A2AMessageFabric`, `A2APolicyEngine`, `A2AEventLog`, and `NodeInputAdapter`.
- **Task:** Ensure test coverage (TDD) for topic generation and envelope validation.
- **Task:** Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Transport & Fabric Infrastructure

- **Task:** Implement `LocalEventEmitterTransport` implementing `A2AMessageTransport`.
- **Task:** Implement `CoreMessageFabric` wrapping the transport and defining standard `publish`/`subscribe` logic handling `BalnceEnvelope` directly (no internal JSON parsing).
- **Task:** Refactor `@iem/core/src/bus/MessageBus.ts` to expose the new fabric architecture instead of the legacy bus.
- **Task:** TDD coverage for publish/subscribe semantics, including delivery simulation and unsubscribe mechanisms.
- **Task:** Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Governance & Observability Layers

- **Task:** Implement `BasicPolicyEngine` in `@iem/core` to enforce trust evaluations on `evaluatePublish` and `evaluateDelivery`.
- **Task:** Implement an in-memory `A2AEventLog` to store durable and replayable events based on envelope delivery class.
- **Task:** Add a `NodeInputAdapterRegistry` and implement `DefaultStrictInputAdapter` and the transitional `LegacyAdditionalInstructionsAdapter`.
- **Task:** TDD coverage for policy blocking, adapter transformation, and event log querying.
- **Task:** Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4: DAG Compiler Integration (`@iem/core/src/chain`)

- **Task:** Refactor `ChainExecutor` (or the local Mastra wrapper) to inject `A2AMessageFabric`, `A2APolicyEngine`, and `NodeInputAdapterRegistry` via options.
- **Task:** Modify the execution loop to emit strictly typed envelopes for `run.started`, `node.started`, `node.output`, etc., removing NDJSON serialization from the core loop.
- **Task:** Replace the universal input mutation logic with explicit calls to the injected `NodeInputAdapterRegistry`.
- **Task:** TDD coverage to ensure DAGs execute correctly end-to-end with the new fabric.
- **Task:** Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)

## Phase 5: Wire & Audit

- **Task:** Wire the implementation into the Desktop/Server boot sequences, providing the fabric to the agent runtime.
- **Task:** Audit codebase for any remaining uses of the legacy string-based message bus and remove them.
- **Task:** Execute final test suite, verify coverage (>85%), and ensure no stubs/mocks remain in the production execution path.
- **Task:** Conductor - User Manual Verification 'Phase 5' (Protocol in workflow.md)
