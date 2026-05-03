# Imagination Canvas Extraction: 05 - Selection, Manipulation, and Transformations

## Overview

This track implements the selection and manipulation behaviors for the Imagination Canvas based on `docs/imagination-canvas-extraction/05-selection-manipulation-and-transformations.md`. Selection is the user's primary "handshake" with the spatial system. This track covers the `selectionStore`, marquee interactions, object transformations (move, resize, rotate), and Z-order management.

## Functional Requirements

1. **Selection State Management (`selectionStore`):**
   - Implement a robust Zustand store to manage the `SelectionState` (none, single, multi, group, region, semantic).
   - Support additive selection (Shift-click) and ESC clearing.

2. **Marquee & Multi-Select:**
   - Implement the visual marquee tool triggered by background drag.
   - Calculate intersections between the marquee bounding box and canvas objects to update multi-selection.

3. **Transformation Engine:**
   - Implement core transformation actions: Move, Resize (corner/edge with aspect ratio preservation options), and Rotate.
   - Implement a snapping system (grid, object edges) that adapts to zoom levels.
   - Ensure all transformations are transactional (suitable for future Undo/Redo integration).

4. **Z-Order Management:**
   - Implement logic for Bring Forward, Send Backward, Bring to Front, and Send to Back.
   - Ensure the rendering layer respects the strict Z-index hierarchy defined in previous tracks.

## Non-Functional Requirements

- **Performance:** Marquee intersection math and drag-move updates must run smoothly at 60fps, ideally outside the main React render cycle for intermediate frames.
- **Accessibility:** Ensure keyboard nudging (arrow keys) works for selected objects.
- **Touch Support:** Transform handles must adapt their hit areas for touch devices.

## Acceptance Criteria

- Single select, multi-select, and marquee drag work predictably.
- Selected objects display appropriate transform handles.
- Objects can be moved, resized, and rotated (where permitted by their capabilities).
- Keyboard nudging correctly updates object positions.
- Z-order commands correctly update object rendering order.
