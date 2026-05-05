# Balnce A2A Message Fabric Implementation Plan

## Objective

Implement the Balnce A2A Message Fabric based on the specifications in `/docs/a2a-message-fabric/`. This replaces the simple `EventEmitter` bridge with a strongly-typed, policy-aware, and transport-agnostic messaging layer for the entire Imagination Engine ecosystem.

## Key Constraints & Standards

- **TDD Protocol:** Red, Green, Refactor, Adversarial for all new core components.
- **No Stubs:** Real implementations only.
- **Typed Envelopes:** All internal communication must use `BalnceEnvelope`.

## Phase 0: Deliverable Generation

- [x] **Task:** Create the five required pre-implementation markdown files in `/docs/a2a-message-fabric/`.
  - `IMPLEMENTATION_READING_SUMMARY.md`
  - `A2A_TASK_LIST.md`
  - `REPO_INTEGRATION_MAP.md`
  - `ARCHITECTURE_DECISIONS.md`
  - `GAP_LIST.md`
- [x] **Task:** Conductor - User Manual Verification 'Phase 0' (Protocol in workflow.md)

## Phase 1: Protocol & Typings Core (`@iem/core`)

- [x] **Task:** Define the `BalnceEnvelope` type and associated sub-types (Actor, Instruction, Policy, Delivery, Debug) in `@iem/core/src/bus/protocol.ts`.
- [x] **Task:** Implement robust Topic Grammar helpers in `@iem/core/src/bus/topics.ts`.
- [x] **Task:** Define interfaces for `A2AMessageTransport`, `A2AMessageFabric`, `A2APolicyEngine`, `A2AEventLog`, and `NodeInputAdapter`.
- [x] **Task:** Ensure test coverage (TDD) for topic generation and envelope validation.
- [x] **Task:** Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Transport & Fabric Infrastructure

- [x] **Task:** Implement `LocalEventEmitterTransport` implementing `A2AMessageTransport`.
- [x] **Task:** Implement `CoreMessageFabric` wrapping the transport and defining standard `publish`/`subscribe` logic handling `BalnceEnvelope` directly (no internal JSON parsing).
- [x] **Task:** Refactor `@iem/core/src/bus/MessageBus.ts` to expose the new fabric architecture instead of the legacy bus.
- [x] **Task:** TDD coverage for publish/subscribe semantics, including delivery simulation and unsubscribe mechanisms.
- [x] **Task:** Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Governance & Observability Layers

- [x] **Task:** Implement `BasicPolicyEngine` in `@iem/core` to enforce trust evaluations on `evaluatePublish` and `evaluateDelivery`.
- [x] **Task:** Implement an in-memory `A2AEventLog` to store durable and replayable events based on envelope delivery class.
- [x] **Task:** Add a `NodeInputAdapterRegistry` and implement `DefaultStrictInputAdapter` and the transitional `LegacyAdditionalInstructionsAdapter`.
- [x] **Task:** TDD coverage for policy blocking, adapter transformation, and event log querying.
- [x] **Task:** Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4: DAG Compiler Integration (`@iem/core/src/chain`)

- [x] **Task:** Refactor `ChainExecutor` (or the local Mastra wrapper) to inject `A2AMessageFabric`, `A2APolicyEngine`, and `NodeInputAdapterRegistry` via options.
- [x] **Task:** Modify the execution loop to emit strictly typed envelopes for `run.started`, `node.started`, `node.output`, etc., removing NDJSON serialization from the core loop.
- [x] **Task:** Replace the universal input mutation logic with explicit calls to the injected `NodeInputAdapterRegistry`.
- [x] **Task:** TDD coverage to ensure DAGs execute correctly end-to-end with the new fabric.
- [x] **Task:** Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)

## Phase 5: Wire & Audit

- [x] **Task:** Wire the implementation into the Desktop/Server boot sequences, providing the fabric to the agent runtime.
- [x] **Task:** Audit codebase for any remaining uses of the legacy string-based message bus and remove them.
- [x] **Task:** Execute final test suite, verify coverage (>85%), and ensure no stubs/mocks remain in the production execution path.
- [x] **Task:** Conductor - User Manual Verification 'Phase 5' (Protocol in workflow.md)
