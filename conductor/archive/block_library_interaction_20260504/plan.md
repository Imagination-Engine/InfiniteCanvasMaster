# Implementation Plan: Block Library & Interaction

## Phase 1: Block Library UI Redesign

- [ ] Task: Refactor Library Card Component.
  - [ ] Sub-task: Red (Write tests asserting the presence of descriptions, chips, and runtime states).
  - [ ] Sub-task: Green (Update the card UI to be highly scannable, integrating hover-only drag affordances and the new Icon System).
- [ ] Task: Refactor Search and Filter UI.
  - [ ] Sub-task: Red (Write tests for search input focus states and filter selection).
  - [ ] Sub-task: Green (Fix icon overlap, padding, and carousel styling issues).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Block Library UI Redesign' (Protocol in workflow.md)

## Phase 2: Drag & Drop Architecture

- [ ] Task: Implement HTML5 Drag/Drop in Library.
  - [ ] Sub-task: Red (Write tests verifying cards emit the correct `dragStart` data payloads including block definition data).
  - [ ] Sub-task: Green (Wire standard `draggable` props and `onDragStart` handlers to library cards).
- [ ] Task: Implement Canvas Drop Zone & Coordinate Math.
  - [ ] Sub-task: Red (Write tests for the `screenToCanvas` coordinate conversion function).
  - [ ] Sub-task: Green (Implement `onDrop` and `onDragOver` on the `CanvasShell` or `InfiniteViewport` to intercept drops and compute exact placement).
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Drag & Drop Architecture' (Protocol in workflow.md)

## Phase 3: Instantiation & Orchestrator Integration

- [ ] Task: Wire Drop Event to Stores.
  - [ ] Sub-task: Red (Write tests ensuring a drop triggers `useCanvasStore.addObject` and sets the new block as selected).
  - [ ] Sub-task: Green (Complete the drop handler to instantiate the block, focus it, and optionally emit a `canvas.block.added` synthetic event for the Orchestrator).
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Instantiation & Orchestrator Integration' (Protocol in workflow.md)
