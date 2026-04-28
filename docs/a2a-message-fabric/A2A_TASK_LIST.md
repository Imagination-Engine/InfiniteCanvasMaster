# A2A Message Fabric Task List

## Phase 1: Core Protocol and Typing

- [ ] Define full `BalnceEnvelope` and associated types (Actor, Target, Event, Instruction, Context, Policy, Provenance, Delivery, Debug) in `@iem/core/src/bus/protocol.ts`.
- [ ] Implement robust `TopicHelpers` in `@iem/core/src/bus/topics.ts`.
- [ ] Define the `A2AMessageTransport`, `A2AMessageFabric`, `A2APolicyEngine`, and `A2AEventLog` interfaces.

## Phase 2: Transport and Fabric Implementation

- [ ] Implement `LocalEventEmitterTransport` implementing `A2AMessageTransport`.
- [ ] Implement `CoreMessageFabric` wrapping the transport and integrating the policy engine and event log.
- [ ] Refactor `@iem/core/src/bus/MessageBus.ts` to export an instance of `CoreMessageFabric` (or provide an injection mechanism).

## Phase 3: Governance and Security

- [ ] Implement `BasicPolicyEngine` (evaluating trust, blocking unsafe instruction flow).
- [ ] Implement the `NodeInputAdapterRegistry` and core adapters (`DefaultStrictInputAdapter`, `LegacyAdditionalInstructionsAdapter`).

## Phase 4: DAG Compiler Integration

- [ ] Update `ChainExecutor` (or equivalent Mastra adapter) to accept injected `A2AMessageFabric`, `NodeInputAdapterRegistry`, and `A2APolicyEngine`.
- [ ] Refactor output interception to emit typed `BalnceEnvelope` objects instead of NDJSON strings.
- [ ] Replace universal input mutation with calls to the `NodeInputAdapterRegistry`.

## Phase 5: Observability and Redaction

- [ ] Implement an in-memory `A2AEventLog` with basic replay capabilities.
- [ ] Add compact redaction logic for sensitive payloads.

## Phase 6: Testing and Validation

- [ ] Write unit tests for envelope validation, topic helpers, adapters, and policy engine (TDD Red/Green/Refactor/Adversarial).
- [ ] Run integration tests ensuring a Mastra DAG executes successfully using the new fabric.
- [ ] Document final integration map and gaps.
