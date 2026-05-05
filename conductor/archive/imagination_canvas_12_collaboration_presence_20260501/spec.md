# Imagination Canvas Extraction: 12 - Collaboration, Presence, and Comments

## Overview

This track implements the foundational multi-actor presence and commenting system for the Imagination Canvas based on `docs/imagination-canvas-extraction/12-collaboration-presence-and-comments.md`. Even for a single-user MVP, the architecture must handle "Agents" as collaborators, requiring cursor tracking, selection awareness, and robust commenting logic.

## Functional Requirements

1. **Presence Engine:**
   - Implement the `CanvasPresence` schema to track actor IDs (human or agent), cursor coordinates, and selection states.
   - Implement the visual rendering of remote cursors and selection outlines (with color coding).
2. **Follow Mode (Viewport Sync):**
   - Implement logic allowing the local viewport to bind to a remote `CanvasPresence.viewport` state for guided tours or presentations.

3. **Spatial Commenting:**
   - Implement commenting logic where comments are semantic `CanvasBinding` records attached to objects or spatial regions.
   - Comments must follow the object they are bound to during drag operations.

4. **Agent Collaboration Distinction:**
   - Differentiate agent presence from human presence visually (e.g., glowing halos vs. generic cursors).
   - Ensure agent operations trigger presence updates.

## Non-Functional Requirements

- **Performance:** Cursor updates should be throttled or interpolated to prevent React re-render flooding.
- **Conflict Handling:** The commenting system must correctly handle edge cases (e.g., commenting on an object that is simultaneously deleted).

## Acceptance Criteria

- Remote cursors (mocked or real) render and update smoothly.
- A user can drop a comment on a block, and the comment moves when the block moves.
- A user can enter "Follow Mode" to lock their camera to another actor's viewport state.
