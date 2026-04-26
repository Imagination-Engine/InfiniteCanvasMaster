# Implementation Plan: Canvas Architecture and Block Generation

## Phase 1: Foundation and Engine Migration

- [x] Task: Scaffold TLDraw/Affine Canvas Component
  - [x] Write failing tests for basic canvas rendering and initialization.
  - [x] Implement base TLDraw/Affine component to replace React Flow.
  - [x] Refactor existing canvas container to use the new engine.
  - [x] Write adversarial test ensuring canvas handles rapid unmounting/remounting gracefully.
- [x] Task: Integrate Real-Time Presence (Yjs)
  - [x] Write failing tests for websocket connection and cursor broadcasting.
  - [x] Implement Yjs/y-websocket integration with the canvas state.
  - [x] Refactor to optimize rendering of remote cursors and selections.
  - [x] Write adversarial test simulating high-latency/dropped websocket frames.
- [x] Task: Conductor - User Manual Verification 'Foundation and Engine Migration' (Protocol in workflow.md)

## Phase 2: Canvas Runtime Enriched Capabilities

- [x] Task: Implement DAG Execution Scheduler
  - [x] Write failing tests for topological sorting and cycle detection.
  - [x] Implement the scheduler to run blocks sequentially/parallel based on edges.
  - [x] Refactor scheduler for performance and clarity.
  - [x] Write adversarial test with an infinitely looping graph structure.
- [x] Task: Implement Timeline Overlay Mode
  - [x] Write failing tests for toggling spatial/temporal view modes.
  - [x] Implement the UI track for horizontal time-positioning of blocks.
  - [x] Refactor timeline logic to sync with canvas spatial state.
  - [x] Write adversarial test for blocks overlapping exactly on the timeline.
- [x] Task: Implement Artifact Registry Hooks
  - [x] Write failing tests for capturing and committing canvas state.
  - [x] Implement the `commitAsCreation` hook logic.
  - [x] Refactor state serialization for robustness.
  - [x] Write adversarial test for committing a canvas with malformed/missing block data.
- [x] Task: Conductor - User Manual Verification 'Canvas Runtime Enriched Capabilities' (Protocol in workflow.md)

## Phase 3: Block Generation and Protocol Migration

- [x] Task: Finalize Legacy Block Migration
  - [x] Write failing tests for the remaining unmigrated legacy nodes (schemas, MCP bindings).
  - [x] Implement the `BlockDefinition` wrappers for remaining nodes.
  - [x] Refactor to ensure consistency across all legacy blocks.
  - [x] Write adversarial tests for each block with invalid inputs.
- [ ] Task: Generate Substrate and Custom Agent Blocks
  - [ ] Write failing tests for base I/O blocks and Custom Agent templates.
  - [ ] Implement the blocks per the `IEM-MASTER-00` specification.
  - [ ] Refactor block rendering components for the new TLDraw/Affine canvas.
  - [ ] Write adversarial tests ensuring blocks handle missing MCP endpoints.
- [ ] Task: Generate Surface-Specific Blocks
  - [ ] Write failing tests for Playable, Conductor, Reel, and Forge core blocks.
  - [ ] Implement the blocks (e.g., Scene, Rule, WebhookTrigger, TextToImage).
  - [ ] Refactor to ensure they correctly bind to the Agent Runtime.
  - [ ] Write adversarial tests for edge-case parameters in surface blocks.
- [ ] Task: Conductor - User Manual Verification 'Block Generation and Protocol Migration' (Protocol in workflow.md)
