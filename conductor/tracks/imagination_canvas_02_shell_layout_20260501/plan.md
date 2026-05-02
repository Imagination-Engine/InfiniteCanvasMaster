# Imagination Canvas 02: Shell and Layout Implementation Plan

## Phase 1: Core Shell & Layering

- [x] Task: Implement the `CanvasShell` container.
  - [x] Sub-task: Red (Tests for layout mode toggling and class generation).
  - [x] Sub-task: Green (Implement `CanvasShell` component with Z-index constraints).
  - [x] Sub-task: Refactor (Extract mode state into a local or Zustand store).
- [x] Task: Conductor - User Manual Verification 'Phase 1: Core Shell & Layering' (Protocol in workflow.md)

## Phase 2: Top Bar & Command Zone

- [x] Task: Implement `TopWorkspaceBar` and `BottomCommandZone`.
  - [x] Sub-task: Red (Tests for rendering required elements and responsiveness).
  - [x] Sub-task: Green (Build the components and pin them to `CanvasShell`).
- [x] Task: Conductor - User Manual Verification 'Phase 2: Top Bar & Command Zone' (Protocol in workflow.md)

## Phase 3: Tool Dock & Inspector

- [x] Task: Implement `LeftToolDock` and `RightInspector`.
  - [x] Sub-task: Red (Tests for open/close states and mobile bottom-sheet fallback).
  - [x] Sub-task: Green (Implement the panels with dynamic sizing).
- [x] Task: Conductor - User Manual Verification 'Phase 3: Tool Dock & Inspector' (Protocol in workflow.md)
