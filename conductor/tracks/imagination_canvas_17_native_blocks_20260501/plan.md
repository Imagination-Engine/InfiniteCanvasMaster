# Imagination Canvas 17: Balnce Native Blocks Implementation Plan

## Phase 1: Block Registry & Routing

- [ ] Task: Implement the dynamic `BlockRegistry`.
  - [ ] Sub-task: Red (Tests for registering and resolving block components by kind).
  - [ ] Sub-task: Green (Implement `ObjectRenderer` utilizing the registry).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Block Registry' (Protocol in workflow.md)

## Phase 2: Core Task Blocks (Agent & Goal)

- [ ] Task: Implement `AgentBlock` and `GoalBlock`.
  - [ ] Sub-task: Red (Tests for rendering compact states and resolving status properties).
  - [ ] Sub-task: Green (Implement React components and specific action menus).
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Task Blocks' (Protocol in workflow.md)

## Phase 3: Content Blocks (Artifact, Chat, Memory)

- [ ] Task: Implement content-heavy blocks.
  - [ ] Sub-task: Red (Tests for integrating existing rich-text or chat shell components into the block wrappers).
  - [ ] Sub-task: Green (Implement components with semantic zoom suppression for performance).
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Content Blocks' (Protocol in workflow.md)

## Phase 4: App Block Runtime

- [ ] Task: Implement the `AppBlock` shell.
  - [ ] Sub-task: Red (Tests verifying `executionScope` restrictions and loading states).
  - [ ] Sub-task: Green (Implement the iframe/sandbox wrapper for external app rendering).
- [ ] Task: Conductor - User Manual Verification 'Phase 4: App Blocks' (Protocol in workflow.md)
