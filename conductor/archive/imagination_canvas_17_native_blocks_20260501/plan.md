# Imagination Canvas 17: Balnce Native Blocks Implementation Plan

## Phase 1: Block Registry & Routing

- [x] Task: Implement the dynamic `BlockRegistry`.
  - [x] Sub-task: Red (Tests for registering and resolving block components by kind).
  - [x] Sub-task: Green (Implement `ObjectRenderer` utilizing the registry).
- [x] Task: Conductor - User Manual Verification 'Phase 1: Block Registry' (Protocol in workflow.md)

## Phase 2: Core Task Blocks (Agent & Goal)

- [x] Task: Implement `AgentBlock` and `GoalBlock`.
  - [x] Sub-task: Red (Tests for rendering compact states and resolving status properties).
  - [x] Sub-task: Green (Implement React components and specific action menus).
- [x] Task: Conductor - User Manual Verification 'Phase 2: Task Blocks' (Protocol in workflow.md)

## Phase 3: Content Blocks (Artifact, Chat, Memory)

- [x] Task: Implement content-heavy blocks.
  - [x] Sub-task: Red (Tests for integrating existing rich-text or chat shell components into the block wrappers).
  - [x] Sub-task: Green (Implement components with semantic zoom suppression for performance).
- [x] Task: Conductor - User Manual Verification 'Phase 3: Content Blocks' (Protocol in workflow.md)

## Phase 4: App Block Runtime

- [x] Task: Implement the `AppBlock` shell.
  - [x] Sub-task: Red (Tests verifying `executionScope` restrictions and loading states).
  - [x] Sub-task: Green (Implement the iframe/sandbox wrapper for external app rendering).
- [x] Task: Conductor - User Manual Verification 'Phase 4: App Blocks' (Protocol in workflow.md)
