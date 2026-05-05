# Implementation Plan: Canvas UI & Interaction Polish

## Phase 1: Block Icon System & Top Bar Cleanup

- [ ] Task: Implement the `BlockIconMap` utility.
  - [ ] Sub-task: Red (Write tests asserting correct icon resolution based on block type, category, and studio).
  - [ ] Sub-task: Green (Implement the mapping dictionary using Lucide icons).
- [ ] Task: Refactor Minimized Block Top Bar.
  - [ ] Sub-task: Red (Write tests ensuring gear/minimize icons are absent and maximize icon is present in the minimized state).
  - [ ] Sub-task: Green (Update the Block header component to reflect the simplified layout and integrate the `BlockIconMap`).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Block Icon System & Top Bar Cleanup' (Protocol in workflow.md)

## Phase 2: Minimized Block Body & Visual Polish

- [ ] Task: Refactor Minimized Block Body and Footer.
  - [ ] Sub-task: Red (Write tests verifying the rendering of capability chips and dynamic status lines).
  - [ ] Sub-task: Green (Update styling to fix border-radius mismatches, implement the subtle human-in-the-loop dot indicator, and arrange the footer).
  - [ ] Sub-task: Refactor (Ensure design tokens match the unified palette).
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Minimized Block Body & Visual Polish' (Protocol in workflow.md)

## Phase 3: Drag Fluidity & Connectors

- [ ] Task: Optimize Block Drag Interactions.
  - [ ] Sub-task: Red (Write tests ensuring drag events set an `isDragging` state).
  - [ ] Sub-task: Green (Apply CSS classes for elevated z-index and shadow based on `isDragging`, and verify `user-select: none` during drag).
- [ ] Task: Refactor Connector Lines.
  - [ ] Sub-task: Red (Write tests for directional edge rendering and active state assignment).
  - [ ] Sub-task: Green (Update edge components to use smooth SVG paths with directional markers and CSS animations for the active 'pulse' state).
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Drag Fluidity & Connectors' (Protocol in workflow.md)
