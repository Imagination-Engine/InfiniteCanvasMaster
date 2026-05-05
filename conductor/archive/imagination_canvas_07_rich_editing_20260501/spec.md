# Imagination Canvas Extraction: 07 - Rich Editing and Embedded Content

## Overview

This track implements the rich editing capabilities and embedded content handling for the Imagination Canvas based on `docs/imagination-canvas-extraction/07-rich-editing-and-embedded-content.md`. It resolves the tension between spatial navigation (panning/zooming) and deep content interaction (text selection, scrolling within blocks) by formalizing strict editing states and event propagation rules.

## Functional Requirements

1. **Editing Modality & Event Propagation:**
   - Define strict states separating `selected` from `editing`.
   - When an object enters `editing` state, it must capture relevant pointer and keyboard events to prevent accidental canvas panning or shortcut triggering.
   - Implement entry triggers (Double-click, Enter key) and exit triggers (ESC, clicking outside).

2. **Rich Text Integration:**
   - Integrate a rich text editor (e.g., Tiptap) for complex text blocks.
   - Support floating selection toolbars and markdown shortcuts.
   - Ensure the editor respects the `CanvasBlockCapabilities.canEditInline`.

3. **Embedded Content Types:**
   - Implement base components for rendering specific media types (Images, Files, Links/Embeds, Code with syntax highlighting).
   - Ensure embedded content handles scroll events properly without zooming the canvas unless a modifier is held.

4. **Data Binding & Autosave Interfaces:**
   - Expose hooks for blocks to debounce and persist their internal state to the `canvasStore`.
   - Handle agentic conflicts: If an agent attempts to mutate a block currently in `editing` state by the user, the mutation must be queued or rejected gracefully.

## Non-Functional Requirements

- **Input Isolation:** The canvas viewport must not steal focus or intercept text input while a block is active.
- **Mobile Grace:** On mobile, entering `editing` mode on a complex block should temporarily lock viewport pan/zoom to prevent jumping.

## Acceptance Criteria

- Double-clicking a text block enables text editing; panning the canvas is disabled during this state.
- ESC exits editing mode and restores canvas navigation shortcuts.
- Rich text editors render correctly and capture their own scroll/selection events.
- Agent mutations do not overwrite active user edits.
