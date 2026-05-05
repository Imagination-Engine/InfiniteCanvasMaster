# Imagination Canvas 12: Collaboration & Presence Implementation Plan

## Phase 1: Presence Schema & Engine

- [x] Task: Implement `CanvasPresence` schema and store.
  - [x] Sub-task: Red (Tests for storing and updating multiple actor states).
  - [x] Sub-task: Green (Implement `presenceStore`).
- [x] Task: Conductor - User Manual Verification 'Phase 1: Presence Engine' (Protocol in workflow.md)

## Phase 2: Remote Rendering

- [x] Task: Implement rendering layers for remote activity.
  - [x] Sub-task: Red (Tests for calculating remote cursor offsets).
  - [x] Sub-task: Green (Implement `RemoteCursor` and `AgentHalo` components).
- [x] Task: Conductor - User Manual Verification 'Phase 2: Remote Rendering' (Protocol in workflow.md)

## Phase 3: Spatial Comments

- [x] Task: Implement the commenting system.
  - [x] Sub-task: Red (Tests verifying comment bindings update coordinates when parent object moves).
  - [x] Sub-task: Green (Implement `CommentOverlay` and integration with `canvasStore`).
- [x] Task: Conductor - User Manual Verification 'Phase 3: Spatial Comments' (Protocol in workflow.md)

## Phase 4: Follow Mode

- [x] Task: Implement viewport synchronization.
  - [x] Sub-task: Red (Tests for `viewportStore` locking to a remote presence coordinate).
  - [x] Sub-task: Green (Implement `FollowModeManager`).
- [x] Task: Conductor - User Manual Verification 'Phase 4: Follow Mode' (Protocol in workflow.md)
