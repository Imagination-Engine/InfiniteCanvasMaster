# Block Library UI Plan

## Objective

Build a visually premium, framer-motion powered left-side drawer for dragging blocks onto the canvas.

## Components

1. **BlockLibraryDrawer**: The main container, collapsable to the left edge of the screen.
2. **BlockLibraryCategoryTabs**: High-level filters (Intent, Agents, Chat, etc.).
3. **BlockLibraryStudioFilter**: Secondary pill-style filters for specific studios (Game Studio, Video Studio).
4. **BlockLibrarySearch**: A snappy search bar to find blocks by name or description.
5. **DraggableBlockCard**: A beautiful, satin/glassmorphism card representing a block. Supports HTML5 drag-and-drop.
6. **BlockLibraryCardPreview**: A miniature, stylized preview of what the block will look like on the canvas.

## Interaction Flow

- User hovers/clicks the left edge to open the drawer.
- User filters/searches for a block.
- User drags the card.
- `onDragStart` sets the `application/reactflow` or `application/iem-block` payload with the block definition ID.
- `InfiniteViewport` receives the drop, instantiates the typed object, and renders it.
