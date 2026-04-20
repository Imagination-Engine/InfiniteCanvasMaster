# Implementation Plan: Canvas Runtime Enrichment

## Phase 1: Real-Time Presence (Liveblocks)
- [ ] Task: Integrate Liveblocks local stack for cursor and selection sync.
    - [ ] Sub-task: Red (Write tests for presence state updates and throttled broadcasting)
    - [ ] Sub-task: Green (Implement Liveblocks provider wrapping the React Flow instance)
    - [ ] Sub-task: Refactor (Optimize rendering of remote cursors to avoid unnecessary re-renders)
    - [ ] Sub-task: Adversarial (Write tests simulating high-latency and rapid connection drops)
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Real-Time Presence' (Protocol in workflow.md)

## Phase 2: Streaming-Native DAG Scheduler
- [ ] Task: Implement the topological graph sorting and execution engine.
    - [ ] Sub-task: Red (Write tests for topological sorting, streaming `AsyncIterable` resolution, and error bubbling)
    - [ ] Sub-task: Green (Build the `CanvasScheduler` class)
    - [ ] Sub-task: Refactor (Clean up execution loop and state mutation logic)
    - [ ] Sub-task: Adversarial (Write tests for cyclic graphs and blocks that hang indefinitely)
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Streaming-Native DAG Scheduler' (Protocol in workflow.md)

## Phase 3: Timeline & Artifact Hooks
- [ ] Task: Implement dual coordinate schemas and UI toggle for Spatial/Temporal views.
    - [ ] Sub-task: Red (Write tests for schema validation and view state toggling)
    - [ ] Sub-task: Green (Update Block schemas and implement React Flow custom layout rendering based on mode)
    - [ ] Sub-task: Refactor (Clean up view switching logic)
- [ ] Task: Implement idempotent canvas snapshot logic for Artifact creation.
    - [ ] Sub-task: Red/Green/Refactor for graph snapshotting.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Timeline & Artifact Hooks' (Protocol in workflow.md)