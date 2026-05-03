# Imagination Canvas 13: Mobile & Touch Implementation Plan

## Phase 1: Touch Gesture Engine

- [x] Task: Expand `useViewportGestures` to support touch.
  - [x] Sub-task: Red (Tests for multi-touch distance calculations and pinch-to-zoom).
  - [x] Sub-task: Green (Implement `TouchEvent` handlers for pan and zoom).
- [x] Task: Conductor - User Manual Verification 'Phase 1: Touch Gestures' (Protocol in workflow.md)

## Phase 2: Hit Targets & Handle Scaling

- [x] Task: Implement touch-friendly transform handles.
  - [x] Sub-task: Red (Tests verifying invisible padding wrapper on `TransformHandle` component).
  - [x] Sub-task: Green (Update handle CSS/SVG to enforce 44px minimum hit areas on touch devices).
- [x] Task: Conductor - User Manual Verification 'Phase 2: Hit Targets' (Protocol in workflow.md)

## Phase 3: Mobile Responsive Layouts

- [x] Task: Implement `MobileInspector` bottom sheet.
  - [x] Sub-task: Red (Tests for viewport width detection and fallback rendering).
  - [x] Sub-task: Green (Implement bottom sheet using `framer-motion` drag-to-dismiss).
- [x] Task: Conductor - User Manual Verification 'Phase 3: Mobile Layouts' (Protocol in workflow.md)

## Phase 4: Capture & AI Affordances

- [x] Task: Implement mobile-first capture UI.
  - [x] Sub-task: Red (Tests for FAB triggering capture modes).
  - [x] Sub-task: Green (Implement Floating Action Button and generic "Organize" AI command shortcut).
- [x] Task: Conductor - User Manual Verification 'Phase 4: Capture UI' (Protocol in workflow.md)
