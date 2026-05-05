# Implementation Plan: Cross-Studio Interoperability

## Phase 1: Resolvers & Registries

- [ ] Task: Implement `ArtifactRegistry` and `CapabilityRegistry`.
  - [ ] Sub-task: Red (Write tests for registering and retrieving global artifacts).
  - [ ] Sub-task: Green (Implement registry singletons).
- [ ] Task: Implement `StudioInteropResolver`.
  - [ ] Sub-task: Red (Write tests for `canConnectBlocks` comparing mismatched vs matched artifact shapes).
  - [ ] Sub-task: Green (Implement resolver logic referencing the BlockRegistry).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Resolvers & Registries' (Protocol in workflow.md)

## Phase 2: Canvas Enforcement

- [ ] Task: Enforce connections in `ObjectRenderer`.
  - [ ] Sub-task: Red (Write tests simulating invalid edge drops failing).
  - [ ] Sub-task: Green (Wire `canConnectBlocks` into the `onDrop` handler in the connector layer).
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Canvas Enforcement' (Protocol in workflow.md)
