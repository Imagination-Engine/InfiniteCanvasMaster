# Imagination Canvas 05: Selection and Transformation Implementation Plan

## Phase 1: Selection Store & Logic

- [ ] Task: Implement `selectionStore` and base interaction hooks.
  - [ ] Sub-task: Red (Tests for single, multi, and additive selection logic).
  - [ ] Sub-task: Green (Implement `useSelectionStore` in `packages/imagination-canvas-kit/src/state`).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Selection Store' (Protocol in workflow.md)

## Phase 2: Marquee & Intersection Math

- [ ] Task: Implement marquee box drawing and collision detection.
  - [ ] Sub-task: Red (Tests for bounding box intersection math).
  - [ ] Sub-task: Green (Implement intersection utils and integrate with selection store during drag).
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Marquee Math' (Protocol in workflow.md)

## Phase 3: Transformation Engine

- [ ] Task: Implement move, resize, rotate, and Z-order logic.
  - [ ] Sub-task: Red (Tests for transform mutations, respecting object capabilities and locks).
  - [ ] Sub-task: Green (Implement transform actions in `canvasStore` or dedicated engine).
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Transformation Engine' (Protocol in workflow.md)
