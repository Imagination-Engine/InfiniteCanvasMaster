# Imagination Canvas Extraction: 17 - Balnce Native Blocks

## Overview

This track implements the core suite of 16 Balnce-native block types defined in `docs/imagination-canvas-extraction/17-balnce-native-blocks.md`. These blocks (Agent, Goal, Memory Cluster, App, etc.) are the semantic primitives that elevate the Imagination Canvas into a Personal AI OS.

## Functional Requirements

1. **Shared Block Contract & Registry:**
   - Define the `BalnceBlock` schema extending `BaseCanvasObject` with strict typing for `blockKind` and status tracking (`idle`, `thinking`, `waiting-for-user`, etc.).
   - Implement the `BlockRegistry` pattern inside `@iem/imagination-canvas-kit` to dynamically route rendering based on `blockKind`.

2. **Core Block Implementations:**
   - Implement the React components for the top priority blocks: `ChatBlock`, `AgentBlock`, `GoalBlock`, `ArtifactBlock`, `MemoryClusterBlock`, and `AppBlock`.
   - Each implementation MUST support at minimum: a **Compact** state (for the canvas) and an **Expanded** state (for full-screen/modal interaction).

3. **Status & Action Affordances:**
   - Implement standardized UI components for displaying block status (e.g., an animated "Thinking" badge for Agents).
   - Implement context menus or floating action bars specific to each block kind (e.g., "Run" for Agents, "Decompose" for Goals).

## Non-Functional Requirements

- **Extensibility:** The `BlockRegistry` must allow developers to easily inject new block types in the future without modifying core canvas rendering loops.
- **Performance:** Complex blocks (like `AppBlock` or `ChatBlock` with long histories) must memoize heavily and suspend rendering details when zoomed far out (semantic zoom).

## Acceptance Criteria

- A user can create an `AgentBlock`, `GoalBlock`, and `ArtifactBlock` on the canvas.
- The `AgentBlock` visually reflects status changes (e.g., `idle` -> `running`).
- Double-clicking or expanding a block reveals its full, specific UI without losing canvas context.
- The ObjectRenderer seamlessly dispatches to the correct component based on the `balnce.blockKind` property.
