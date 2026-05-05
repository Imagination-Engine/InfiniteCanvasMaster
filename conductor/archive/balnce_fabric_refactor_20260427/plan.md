# Balnce Message Fabric Refactor Implementation Plan

## Executive Summary

This plan structures the 18-slice implementation cadence to safely upgrade the `EventEmitter`-backed internal bus into a lane-aware Message Fabric. It explicitly prioritizes the mitigation of the four highest-risk areas identified during the discovery mission: Mastra Compiler Complexity, Unsafe Instruction Promotion, Canvas State Conflation, and SSE Lane Pollution.

---

## Part 1: High-Risk Mitigation Strategies

### Risk 1: Mastra Compiler Complexity (W02, R01, R08)

- **The Risk:** `packages/agents/src/workflows/compiler.ts` is the heart of DAG execution. A flawed refactor here will break the entire workflow engine.
- **Mitigation Strategy:**
  1.  **Slice 0/1:** Assert 100% test coverage on `compiler.test.ts` before any changes.
  2.  **Slice 7:** Inject a `MastraDagFabricAdapter` interface that initially delegates to the legacy `messageBus`.
  3.  **Migration:** Switch the adapter's internal engine to the `FabricRouter` only after `v2` envelopes and topic helpers are proven stable.

### Risk 2: Unsafe Instruction Promotion (W12, R03)

- **The Risk:** Arbitrary tool output is currently merged into downstream inputs.
- **Mitigation Strategy:**
  1.  **Slice 8:** Remove the `(mergedInput as any)._instructions` pattern entirely.
  2.  **Migration:** Force all upstream data through the `NodeInputAdapterRegistry`.

### Risk 3: Canvas State Conflation (W06, W07, R04)

- **The Risk:** High-frequency agent streaming (token deltas) overwhelms the Yjs collaborative document store.
- **Mitigation Strategy:**
  1.  **Slice 11:** Introduce the `DocumentStateAdapter`.
  2.  **Enforcement:** The `FabricRouter` will enforce that envelopes marked as `agent_stream` cannot be processed by the `DocumentStateAdapter`.

### Risk 4: SSE Lane Pollution (W01, R02)

- **The Risk:** UI components attempt to issue commands via the open SSE connection.
- **Mitigation Strategy:**
  1.  **Slice 9:** Implement `SSEProjectionTransport`. Its `publish()` method must throw a hard error.

---

## Part 2: Phased Implementation Execution

### Phase 1: Foundation & Stability (Slices 0 - 3)

- [x] **Task:** Slice 0 & 1: Validate `compiler.test.ts` and `MessageBus.test.ts`. Create the initial `packages/core/src/fabric/` structure.
- [x] **Task:** Slice 2: Define `BalnceFabricLane`, `FabricDeliveryClass`, and the `BalnceEnvelope` v0.2.0 schema in `envelope.ts`.
- [x] **Task:** Slice 3: Wrap the existing `EventEmitter` inside `transports/InProcessTransport.ts`.
- [x] **Task:** Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

### Phase 2: The Routing Core (Slices 4 - 6)

- **Task:** Slice 4: Build `FabricRouter` v1.
- **Task:** Slice 5: Implement `createEnvelope` and `upgradeLegacyEnvelope`.
- **Task:** Slice 6: Centralize topic strings in `FabricTopics`.
- **Task:** Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

### Phase 3: The Heart Transplant (Slices 7 - 8)

- **Task:** Slice 7: Implement `adapters/MastraDagFabricAdapter.ts`. Refactor `compiler.ts`.
- **Task:** Slice 8: Implement the `NodeInputAdapterRegistry`. Eliminate universal schema mutation.
- **Task:** Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

### Phase 4: Boundaries & UI Integration (Slices 9 - 14)

- **Task:** Slice 9: Implement `SSEProjectionTransport.ts`.
- **Task:** Slice 10: Refactor `/api/a2a/stream` in the Hono server. Update `useA2A` hooks in `apps/web`.
- **Task:** Slice 11: Implement `DocumentStateAdapter` interface for Yjs boundaries.
- **Task:** Slice 12-14: Formalize the `command_control`, `durable_event`, and `runtime_simulation` contracts.
- **Task:** Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)

### Phase 5: Verification & Hardening (Slices 15 - 18)

- **Task:** Slice 15: Add tests proving semantic lane separation.
- **Task:** Slice 16: Purge remaining legacy universal mutation.
- **Task:** Slice 17: Conduct the No-Stub audit across `packages/core/src/fabric`.
- **Task:** Slice 18: Generate the final review package.
- **Task:** Conductor - User Manual Verification 'Phase 5' (Protocol in workflow.md)
