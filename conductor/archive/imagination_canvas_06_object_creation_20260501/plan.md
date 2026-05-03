# Imagination Canvas 06: Object Creation Implementation Plan

## Phase 1: Interactive Tool Modes

- [ ] Task: Implement canvas tool state management.
  - [ ] Sub-task: Red (Tests for switching between Select, Hand, and Creation modes).
  - [ ] Sub-task: Green (Implement `creationStore` or update `shellStore` to handle active tools).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Tool Modes' (Protocol in workflow.md)

## Phase 2: Placement & Collision Math

- [ ] Task: Implement spatial placement utilities.
  - [ ] Sub-task: Red (Tests for `findEmptySpace`, `getCenterOfViewport`, and grid snapping).
  - [ ] Sub-task: Green (Implement algorithms to ensure objects don't stack perfectly on top of each other).
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Placement Math' (Protocol in workflow.md)

## Phase 3: Native Interactions

- [ ] Task: Implement Paste, Drop, and Typing handlers.
  - [ ] Sub-task: Red (Tests for parsing clipboard data and generating generic blocks).
  - [ ] Sub-task: Green (Implement global event listeners on the `CanvasShell`).
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Native Interactions' (Protocol in workflow.md)

## Phase 4: Agentic Insertion Hooks

- [ ] Task: Implement API/Hooks for external (Agent) block insertion.
  - [ ] Sub-task: Red (Tests for batch inserting multiple blocks with provenance metadata).
  - [ ] Sub-task: Green (Implement `useCanvasInsertion` hook exposed to the Fabric).
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Agent Insertion' (Protocol in workflow.md)
