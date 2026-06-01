# Implementation Plan: Canvas Node Rendering and Performance Optimization

## Phase 1: Connection Handles UI Implementation

- [ ] Task: Scaffold test suite for connection handles.
  - [ ] Write failing tests (Red) verifying the presence of left/right handles on nodes.
- [ ] Task: Implement connection handles in the `Imagination Canvas Kit` block registry.
  - [ ] Update `BlockDefinition` or base node component to include left and right connection handles.
  - [ ] Style handles as small, discoverable circles matching the design system.
  - [ ] Make tests pass (Green).
- [ ] Task: Refactor and harden handle implementation.
  - [ ] Refactor component structure for clarity.
  - [ ] Write adversarial test (e.g., testing handle interaction bounds or rapid clicks).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Connection Handles UI Implementation' (Protocol in workflow.md)

## Phase 2: Custom Flowing SVG Connections & Routing

- [ ] Task: Scaffold test suite for connection routing.
  - [ ] Write failing tests (Red) verifying that a connection can be established between two handles.
- [ ] Task: Implement drag-and-drop connection logic.
  - [ ] Enable dragging from a connection handle to create a new edge.
  - [ ] Implement logic to snap/connect the dragged edge to a target node's handle.
  - [ ] Make tests pass (Green).
- [ ] Task: Style the resulting edge.
  - [ ] Apply the "Custom Flowing SVG" design to the newly created React Flow edge (directional flow markers, real-time pulse animations).
- [ ] Task: Refactor and harden routing logic.
  - [ ] Refactor edge creation state handling.
  - [ ] Write adversarial test (e.g., trying to connect a node to itself, or connecting to invalid targets).
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Custom Flowing SVG Connections & Routing' (Protocol in workflow.md)

## Phase 3: Drag Performance & State Optimization

- [ ] Task: Scaffold test suite for drag performance (where applicable/mockable).
  - [ ] Write failing tests/benchmarks (Red) to measure state update frequency during node drag.
- [ ] Task: Optimize Zustand/React Flow state updates during drag events.
  - [ ] Analyze the current drag handler.
  - [ ] Implement memoization or batched updates to prevent full canvas re-renders when a single node is dragged.
  - [ ] Ensure only the dragged node and its connected edges update their position state frequently.
  - [ ] Make tests pass / confirm performance improvement (Green).
- [ ] Task: Refactor and harden performance improvements.
  - [ ] Refactor state selectors to be more granular.
  - [ ] Write adversarial test (e.g., dragging a node with 50+ connections rapidly).
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Drag Performance & State Optimization' (Protocol in workflow.md)
