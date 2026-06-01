# Implementation Plan: Canvas Node Rendering and Performance Optimization

## Phase 1: Connection Handles UI Implementation

- [x] Task: Scaffold test suite for connection handles.
  - [x] Write failing tests (Red) verifying the presence of left/right handles on nodes.
- [x] Task: Implement connection handles in the `Imagination Canvas Kit` block registry.
  - [x] Update `BlockDefinition` or base node component to include left and right connection handles.
  - [x] Style handles as small, discoverable circles matching the design system.
  - [x] Make tests pass (Green).
- [x] Task: Refactor and harden handle implementation.
  - [x] Refactor component structure for clarity.
  - [x] Write adversarial test (e.g., testing handle interaction bounds or rapid clicks).
- [x] Task: Conductor - User Manual Verification 'Phase 1: Connection Handles UI Implementation' (Protocol in workflow.md)

## Phase 2: Custom Flowing SVG Connections & Routing

- [x] Task: Scaffold test suite for connection routing.
  - [x] Write failing tests (Red) verifying that a connection can be established between two handles.
- [x] Task: Implement drag-and-drop connection logic.
  - [x] Enable dragging from a connection handle to create a new edge.
  - [x] Implement logic to snap/connect the dragged edge to a target node's handle.
  - [x] Make tests pass (Green).
- [x] Task: Style the resulting edge.
  - [x] Apply the "Custom Flowing SVG" design to the newly created React Flow edge (directional flow markers, real-time pulse animations).
- [x] Task: Refactor and harden routing logic.
  - [x] Refactor edge creation state handling.
  - [x] Write adversarial test (e.g., trying to connect a node to itself, or connecting to invalid targets).
- [x] Task: Conductor - User Manual Verification 'Phase 2: Custom Flowing SVG Connections & Routing' (Protocol in workflow.md)

## Phase 3: Drag Performance & State Optimization

- [x] Task: Scaffold test suite for drag performance (where applicable/mockable).
  - [x] Write failing tests/benchmarks (Red) to measure state update frequency during node drag.
- [x] Task: Optimize Zustand/React Flow state updates during drag events.
  - [x] Analyze the current drag handler.
  - [x] Implement memoization or batched updates to prevent full canvas re-renders when a single node is dragged.
  - [x] Ensure only the dragged node and its connected edges update their position state frequently.
  - [x] Make tests pass / confirm performance improvement (Green).
- [x] Task: Refactor and harden performance improvements.
  - [x] Refactor state selectors to be more granular.
  - [x] Write adversarial test (e.g., dragging a node with 50+ connections rapidly).
- [x] Task: Conductor - User Manual Verification 'Phase 3: Drag Performance & State Optimization' (Protocol in workflow.md)
