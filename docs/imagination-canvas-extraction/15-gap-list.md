# 15 — Gap List: Imagination Canvas Extraction

## Overview

This document tracks the delta between the current prototype-grade canvas implementation and the target state.

## Architectural Gaps

### GAP-001: Package Isolation

- **Surface:** Core
- **Severity:** High
- **Status:** Open
- **Owner:** Unassigned
- **Required Fix:** Extract core canvas logic from apps/web into @iem/imagination-canvas-kit.
- **Acceptance Criteria:** apps/web consumes canvas via npm package import.

### GAP-002: Store Unified Implementation

- **Surface:** Core
- **Severity:** High
- **Status:** Open
- **Owner:** Unassigned
- **Required Fix:** Implement a formal store suite (viewportStore, canvasStore, etc.) replacing basic hooks.
- **Acceptance Criteria:** Zustand stores are correctly instantiated and tested.

### GAP-003: Typed Mutation Model

- **Surface:** Core
- **Severity:** High
- **Status:** Open
- **Owner:** Unassigned
- **Required Fix:** Ensure mutations are transactional and undoable.
- **Acceptance Criteria:** Undo/Redo functions work for core mutations.

## Shell & Layout Gaps

### GAP-004: Multi-Density Shell

- **Surface:** Shell
- **Severity:** Medium
- **Status:** Open
- **Owner:** Unassigned
- **Required Fix:** Implement Creation and Review modes.
- **Acceptance Criteria:** Shell density modes change UI padding and visibility.

### GAP-005: Contextual Inspector

- **Surface:** Shell
- **Severity:** Medium
- **Status:** Open
- **Owner:** Unassigned
- **Required Fix:** Implement the right inspector panel.
- **Acceptance Criteria:** Inspector opens and displays selected object metadata.

### GAP-006: Floating Tool Dock

- **Surface:** Shell
- **Severity:** Medium
- **Status:** Open
- **Owner:** Unassigned
- **Required Fix:** Implement custom Balnce-native floating dock.
- **Acceptance Criteria:** Dock renders tools and dispatches actions.

## Interaction & Viewport Gaps

### GAP-007: Semantic Zoom

- **Surface:** Viewport
- **Severity:** Medium
- **Status:** Open
- **Owner:** Unassigned
- **Required Fix:** Viewport must support detail scaling.
- **Acceptance Criteria:** Zooming changes semantic rendering of objects.

### GAP-008: Focus Mode

- **Surface:** Viewport
- **Severity:** Medium
- **Status:** Open
- **Owner:** Unassigned
- **Required Fix:** Add ability to zoom into regions while maintaining return context.
- **Acceptance Criteria:** focusOn function correctly preserves previous state.

## Block & Content Gaps

### GAP-009: Balnce-Native Blocks

- **Surface:** Content
- **Severity:** High
- **Status:** Open
- **Owner:** Unassigned
- **Required Fix:** Formalize implementations of NoteCard, AgentBlock, GoalBlock, etc.
- **Acceptance Criteria:** Each block type renders according to specific schema.

### GAP-010: Expansion System

- **Surface:** Content
- **Severity:** High
- **Status:** Open
- **Owner:** Unassigned
- **Required Fix:** Support Peek or Fullscreen transitions.
- **Acceptance Criteria:** Double clicking block triggers Framer Motion expansion.

## Agentic & AI Gaps

### GAP-011: Selection-Scoped Actions

- **Surface:** AI
- **Severity:** High
- **Status:** Open
- **Owner:** Unassigned
- **Required Fix:** AI actions must be scopable to marquee selection.
- **Acceptance Criteria:** Task metadata tracks selection IDs.

### GAP-012: Mutation Previews

- **Surface:** AI
- **Severity:** High
- **Status:** Open
- **Owner:** Unassigned
- **Required Fix:** Stage changes before applying.
- **Acceptance Criteria:** useMutationPreview hook works as intended.

### GAP-013: Provenance Metadata

- **Surface:** AI
- **Severity:** Medium
- **Status:** Open
- **Owner:** Unassigned
- **Required Fix:** Link AI-created objects back to their tasks.
- **Acceptance Criteria:** CanvasObject schema includes provenance IDs.

## Persistence & History Gaps

### GAP-014: Robust Undo/Redo

- **Surface:** Persistence
- **Severity:** High
- **Status:** Open
- **Owner:** Unassigned
- **Required Fix:** Integrated undo with agentic mutations.
- **Acceptance Criteria:** useHistoryStore correctly undoes actions.

### GAP-015: Snapshots & Forking

- **Surface:** Persistence
- **Severity:** High
- **Status:** Open
- **Owner:** Unassigned
- **Required Fix:** Add ability to branch canvas state.
- **Acceptance Criteria:** createSnapshot serializes state safely.
