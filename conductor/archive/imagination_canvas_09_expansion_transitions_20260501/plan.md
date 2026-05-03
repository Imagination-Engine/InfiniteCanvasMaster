# Imagination Canvas 09: Expansion Transitions Implementation Plan

## Phase 1: Expansion State & Schema

- [ ] Task: Implement expansion state management.
  - [ ] Sub-task: Red (Tests for `AppBlockObject` schema and `ExpansionDescriptor`).
  - [ ] Sub-task: Green (Update schemas and `canvasStore` to support active expansion states).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Expansion State' (Protocol in workflow.md)

## Phase 2: Transition Choreography

- [ ] Task: Implement the `SharedLayout` wrapper using `framer-motion`.
  - [ ] Sub-task: Red (Tests ensuring `AnimatePresence` and layout IDs are correctly assigned based on block ID).
  - [ ] Sub-task: Green (Implement `ExpandableBlockWrapper` component).
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Choreography' (Protocol in workflow.md)

## Phase 3: Context Preservation

- [ ] Task: Integrate expansion with the camera stack.
  - [ ] Sub-task: Red (Tests verifying `focusOn` is called before expansion and `returnToPrevious` is called on close).
  - [ ] Sub-task: Green (Implement the close handler and breadcrumb UI).
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Context Preservation' (Protocol in workflow.md)
