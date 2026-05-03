# Imagination Canvas Extraction: 06 - Object Creation and Insertion Flows

## Overview

This track implements the logic and UI flows for creating and inserting new objects onto the Imagination Canvas, based on `docs/imagination-canvas-extraction/06-object-creation-and-insertion-flows.md`. It covers multiple creation paradigms including toolbar tools, quick-add menus, slash commands, paste/drop handlers, and AI-driven "chat-to-canvas" insertion.

## Functional Requirements

1. **Toolbar & Quick Add:**
   - Implement tool selection states (`select`, `hand`, `note`, `shape`, etc.).
   - Implement a Quick-Add menu or floating action button for mobile/desktop.

2. **Keyboard & Contextual Creation:**
   - Implement empty-canvas typing (auto-creates a note/text block).
   - Implement the `/` slash command menu on the canvas.

3. **Data Ingestion (Paste & Drop):**
   - Implement clipboard handlers (text -> note, image URL -> media block).
   - Implement drag-and-drop handlers for local files and cross-surface dragging.

4. **Agentic Insertion (Chat-to-Canvas):**
   - Implement endpoints/hooks allowing the Chat Shell (or Mastra agents) to inject blocks (Artifacts, App Blocks) directly into the viewport.
   - Implement collision-aware placement algorithms (avoiding overlapping existing selected objects).

## Non-Functional Requirements

- **Fluidity:** Creating an object must feel instant. Heavy blocks should render a lightweight shell while content loads.
- **Undoability:** Every creation event (even multi-block AI generations) must be recorded as a single, undoable transaction in the persistence layer.

## Acceptance Criteria

- Users can create basic shapes and Balnce blocks via the toolbar and quick-add menu.
- Pasting text or dropping an image creates the corresponding block type at the correct coordinates.
- "Type to create" works immediately on an empty canvas.
- Agent-inserted blocks appear in the visible viewport without covering active work.
