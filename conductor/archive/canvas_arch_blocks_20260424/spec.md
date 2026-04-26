# Specification: Canvas Architecture and Block Generation

## Overview

This track focuses on fulfilling two main objectives outlined in the `IEM-MASTER-00-Capstone-Master-Plan.md`:

1. Generate and encode all outlined and intended blocks across the substrate and surfaces.
2. Examine, plan, and implement the intended canvas architecture, migrating from React Flow to TLDraw/Affine.

## Functional Requirements

### 1. Canvas Architecture Migration

- **Engine Replacement:** Migrate the foundational canvas engine from React Flow to TLDraw/Affine to provide a world-class, 60+ FPS environment.
- **Enriched Capabilities:**
  - **Real-Time Presence:** Implement Yjs/y-websocket for CRDT-backed multiplayer canvas sessions (cursors, selections, edit locks).
  - **DAG Execution:** Implement the scheduler for running the graph in topological order, handling async and streaming block outputs.
  - **Timeline Overlay:** Implement a `temporal` view mode overlaying the spatial canvas for arranging blocks sequentially.
  - **Artifact Registry Hooks:** Implement bindings allowing the canvas to commit its state and blocks as a relaunchable "Creation".

### 2. Block Generation and Encoding

- **Scope:** Implement all intended blocks across the master plan, including:
  - Base substrate blocks and Custom Agent Flow components.
  - Surface-specific blocks (Playable, Conductor, Reel, Forge).
- **Legacy Migration:** Ensure the migration of the 9 legacy nodes (Refiner, Summarizer, etc.) to the new Block Protocol is fully completed.
- **Protocol Adherence:** Every block must strictly implement the universal `BlockDefinition` interface and bind to the `Agent Runtime` via MCP.

## Non-Functional Requirements

- **Performance:** The canvas must be highly optimized for fluid drag-and-drop interactions and real-time syncing.
- **Testing:** Strict adherence to TDD (Red, Green, Refactor, Adversarial) with >85% test coverage. Every block must pass schema, happy-path, and error-path tests.

## Out of Scope

- Full implementation of the Chat Shell or Creations Drawer, except where necessary for canvas integration.
