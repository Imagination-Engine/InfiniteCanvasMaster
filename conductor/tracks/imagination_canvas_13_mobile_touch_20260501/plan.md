# Imagination Canvas 13: Mobile & Touch Implementation Plan

## Phase 1: Touch Gesture Engine

- [ ] Task: Expand `useViewportGestures` to support touch.
  - [ ] Sub-task: Red (Tests for multi-touch distance calculations and pinch-to-zoom).
  - [ ] Sub-task: Green (Implement `TouchEvent` handlers for pan and zoom).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Touch Gestures' (Protocol in workflow.md)

## Phase 2: Hit Targets & Handle Scaling

- [ ] Task: Implement touch-friendly transform handles.
  - [ ] Sub-task: Red (Tests verifying invisible padding wrapper on `TransformHandle` component).
  - [ ] Sub-task: Green (Update handle CSS/SVG to enforce 44px minimum hit areas on touch devices).
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Hit Targets' (Protocol in workflow.md)

## Phase 3: Mobile Responsive Layouts

- [ ] Task: Implement `MobileInspector` bottom sheet.
  - [ ] Sub-task: Red (Tests for viewport width detection and fallback rendering).
  - [ ] Sub-task: Green (Implement bottom sheet using `framer-motion` drag-to-dismiss).
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Mobile Layouts' (Protocol in workflow.md)

## Phase 4: Capture & AI Affordances

- [ ] Task: Implement mobile-first capture UI.
  - [ ] Sub-task: Red (Tests for FAB triggering capture modes).
  - [ ] Sub-task: Green (Implement Floating Action Button and generic "Organize" AI command shortcut).
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Capture UI' (Protocol in workflow.md)
