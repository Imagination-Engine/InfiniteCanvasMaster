# Imagination Canvas 03: Viewport and Camera Behavior Implementation Plan

## Phase 1: Coordinate Math & Transform Utils

- [x] Task: Implement coordinate transformation functions.
  - [x] Sub-task: Screen-to-Canvas and Canvas-to-Screen transforms.
  - [x] Sub-task: Point-anchored zoom math.
  - [x] Sub-task: Red (Tests for transform accuracy).
  - [x] Sub-task: Green (Implementation in `packages/imagination-canvas-kit/src/utils/camera.ts`).
- [x] Task: Conductor - User Manual Verification 'Phase 1: Coordinate Math' (Protocol in workflow.md)

## Phase 2: Camera State & Animation

- [x] Task: Enhance `viewportStore` with mode and history support.
  - [x] Sub-task: Implement `mode` (free, focus, locked, etc.) and `previous` state.
  - [x] Sub-task: Add animation/transition support using `framer-motion` or standard interpolation.
  - [x] Sub-task: Red (Tests for state transitions and history stack).
  - [x] Sub-task: Green (Update `viewportStore.ts`).
- [x] Task: Conductor - User Manual Verification 'Phase 2: Camera State' (Protocol in workflow.md)

## Phase 3: Viewport Gestures & Keybindings

- [x] Task: Implement pan and zoom handlers.
  - [x] Sub-task: Mouse wheel (zoom), Middle-mouse/Space+Drag (pan).
  - [x] Sub-task: Trackpad pinch and two-finger pan.
  - [x] Sub-task: Touch gestures (one-finger pan, two-finger pinch).
  - [x] Sub-task: Red (Tests for gesture detection and application).
  - [x] Sub-task: Green (Implement `useViewportGestures` hook).
- [x] Task: Conductor - User Manual Verification 'Phase 3: Viewport Gestures' (Protocol in workflow.md)

## Phase 4: Fit & Focus Commands

- [ ] Task: Implement fitting and focusing logic.
  - [ ] Sub-task: `fitToContent` logic (bounding box calculation).
  - [ ] Sub-task: `zoomToSelection` logic.
  - [ ] Sub-task: `focusRegion` logic with return path.
  - [ ] Sub-task: Red (Tests for bounding box accuracy and zoom levels).
  - [ ] Sub-task: Green (Implementation in `viewportStore` or specialized hook).
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Fit & Focus' (Protocol in workflow.md)
