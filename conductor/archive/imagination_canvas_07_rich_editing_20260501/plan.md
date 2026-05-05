# Imagination Canvas 07: Rich Editing Implementation Plan

## Phase 1: Editing State Isolation

- [ ] Task: Implement editing state locks in `selectionStore` and `viewportStore`.
  - [ ] Sub-task: Red (Tests ensuring viewport ignores pan/zoom when editing lock is active).
  - [ ] Sub-task: Green (Update hooks to respect `isEditing` state).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: State Isolation' (Protocol in workflow.md)

## Phase 2: Rich Text & Event Propagation

- [ ] Task: Implement the `RichTextCanvasBlock`.
  - [ ] Sub-task: Red (Tests for double-click entry, ESC exit, and stopping event propagation).
  - [ ] Sub-task: Green (Implement Tiptap wrapper component with floating toolbar).
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Rich Text' (Protocol in workflow.md)

## Phase 3: Media & Embedded Shells

- [ ] Task: Implement non-text embedded content shells.
  - [ ] Sub-task: Red (Tests for rendering Image/File/Code block shells).
  - [ ] Sub-task: Green (Implement base components focusing on scroll isolation).
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Media Shells' (Protocol in workflow.md)

## Phase 4: Autosave & Conflict Resolution

- [ ] Task: Implement the debounced mutation hook.
  - [ ] Sub-task: Red (Tests for debouncing updates to `canvasStore` and rejecting agent mutations while locked).
  - [ ] Sub-task: Green (Implement `useBlockAutosave` hook).
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Autosave' (Protocol in workflow.md)
