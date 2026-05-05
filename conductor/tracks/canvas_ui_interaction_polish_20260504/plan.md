# Implementation Plan: Canvas UI & Interaction Polish

## Phase 1: Block Icon System & Top Bar Cleanup

- [x] Task: Implement the `BlockIconMap` utility.
  - [x] Sub-task: Red (Write tests asserting correct icon resolution based on block type, category, and studio).
  - [x] Sub-task: Green (Implement the mapping dictionary using Lucide icons).
- [x] Task: Refactor Minimized Block Top Bar.
  - [x] Sub-task: Red (Write tests ensuring gear/minimize icons are absent and maximize icon is present in the minimized state).
  - [x] Sub-task: Green (Update the Block header component to reflect the simplified layout and integrate the `BlockIconMap`).
- [x] Task: Conductor - User Manual Verification 'Phase 1: Block Icon System & Top Bar Cleanup' (Protocol in workflow.md)

## Phase 2: Minimized Block Body & Visual Polish

- [x] Task: Refactor Minimized Block Body and Footer.
  - [x] Sub-task: Red (Write tests verifying the rendering of capability chips and dynamic status lines).
  - [x] Sub-task: Green (Update styling to fix border-radius mismatches, implement the subtle human-in-the-loop dot indicator, and arrange the footer).
  - [x] Sub-task: Refactor (Ensure design tokens match the unified palette).
- [x] Task: Conductor - User Manual Verification 'Phase 2: Minimized Block Body & Visual Polish' (Protocol in workflow.md)

## Phase 3: Drag Fluidity & Connectors

- [x] Task: Optimize Block Drag Interactions.
  - [x] Sub-task: Red (Write tests ensuring drag events set an `isDragging` state).
  - [x] Sub-task: Green (Apply CSS classes for elevated z-index and shadow based on `isDragging`, and verify `user-select: none` during drag).
- [x] Task: Refactor Connector Lines.
  - [x] Sub-task: Red (Write tests for directional edge rendering and active state assignment).
  - [x] Sub-task: Green (Update edge components to use smooth SVG paths with directional markers and CSS animations for the active 'pulse' state).
- [x] Task: Conductor - User Manual Verification 'Phase 3: Drag Fluidity & Connectors' (Protocol in workflow.md)
