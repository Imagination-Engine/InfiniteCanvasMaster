# Implementation Plan: Canvas Runtime Enrichment

## Phase 1: Real-Time Presence (Liveblocks)
- [x] Task: Integrate Liveblocks local stack for cursor and selection sync.
    - [x] Sub-task: Red (Write tests for presence state updates and throttled broadcasting)
    - [x] Sub-task: Green (Implement Liveblocks provider wrapping the React Flow instance)
    - [x] Sub-task: Refactor (Optimize rendering of remote cursors to avoid unnecessary re-renders)
    - [x] Sub-task: Adversarial (Write tests simulating high-latency and rapid connection drops)
- [x] Task: Conductor - User Manual Verification 'Phase 1: Real-Time Presence' (Protocol in workflow.md)

## Phase 2: Streaming-Native DAG Scheduler
- [x] Task: Implement the topological graph sorting and execution engine.
    - [x] xSub-task: Red (Write tests for topological sorting, streaming `AsyncIterable` resolution, and error bubbling)
    - [x] Sub-task: Green (Build the `CanvasScheduler` class)
    - [x] Sub-task: Refactor (Clean up execution loop and state mutation logic)
    - [x] Sub-task: Adversarial (Write tests for cyclic graphs and blocks that hang indefinitely)
- [x] Task: Conductor - User Manual Verification 'Phase 2: Streaming-Native DAG Scheduler' (Protocol in workflow.md)

## Phase 3: Timeline & Artifact Hooks
- [x] Task: Implement dual coordinate schemas and UI toggle for Spatial/Temporal views.
    - [x] Sub-task: Red (Write tests for schema validation and view state toggling)
    - [x] Sub-task: Green (Update Block schemas and implement React Flow custom layout rendering based on mode)
    - [x] Sub-task: Refactor (Clean up view switching logic)
- [x] Task: Implement idempotent canvas snapshot logic for Artifact creation.
    - [x] Sub-task: Red/Green/Refactor for graph snapshotting.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Timeline & Artifact Hooks' (Protocol in workflow.md)