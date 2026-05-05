# Implementation Plan: Vertical Slice (Writer's Studio)

## Phase 1: Block UI Refactoring

- [ ] Task: Upgrade Writer Blocks for Dual-Mode.
  - [ ] Sub-task: Red (Write tests verifying compact vs fullscreen rendering differences).
  - [ ] Sub-task: Green (Implement `mode` support in the block component).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Block UI Refactoring' (Protocol in workflow.md)

## Phase 2: Artifact & Export Wiring

- [ ] Task: Implement Artifact Generation.
  - [ ] Sub-task: Red (Write tests asserting the block payload matches the `ManuscriptArtifact` contract).
  - [ ] Sub-task: Green (Wire the block state to correctly export the artifact payload on save/update).
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Artifact & Export Wiring' (Protocol in workflow.md)
