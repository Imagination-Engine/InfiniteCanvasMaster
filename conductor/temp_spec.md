# Specification: Canvas Architecture and Block Generation

## Overview

This track focuses on fulfilling two main objectives outlined in the `IEM-MASTER-00-Capstone-Master-Plan.md` and `IEM-MASTER-03-Mastra-Integration.md`:

1. Generate and encode all outlined and intended blocks across the substrate and surfaces, aligning them as native Mastra Tools.
2. Examine, plan, and implement the intended canvas architecture, migrating from React Flow to TLDraw/Affine, and delegating DAG execution to Mastra Workflows.

## Functional Requirements

### 1. Canvas Architecture Migration

- **Engine Replacement:** Migrate the foundational canvas engine from React Flow to TLDraw/Affine to provide a world-class, 60+ FPS environment.
- **Enriched Capabilities:**
  - **Real-Time Presence:** Implement Yjs/y-websocket for CRDT-backed multiplayer canvas sessions (cursors, selections, edit locks).
  - **DAG Execution (Mastra Workflows):** Deprecate the client-side scheduler. Compile the TLDraw/Affine graph state into a Mastra `Workflow` JSON definition and execute it on the server-side, streaming results back via websocket.
  - **Timeline Overlay:** Implement a `temporal` view mode overlaying the spatial canvas for arranging blocks sequentially.
  - **Artifact Registry Hooks:** Implement bindings allowing the canvas to commit its state and blocks as a relaunchable "Creation".

### 2. Block Generation and Encoding

- **Scope:** Implement all intended blocks across the master plan, including:
  - Base substrate blocks and Custom Agent Flow components.
  - Surface-specific blocks (Playable, Conductor, Reel, Forge).
- **Legacy Migration:** Ensure the migration of the 9 legacy nodes (Refiner, Summarizer, etc.) to the new Block Protocol, ensuring each provides a `createMastraToolFromBlock()` adapter compatible with the `ImaginationOrchestrator` agent.
- **Protocol Adherence:** Every block must strictly implement the universal `BlockDefinition` interface, mapping precisely to native Mastra Tools and leveraging Mastra Integrations where applicable.

## Non-Functional Requirements

- **Performance:** The canvas must be highly optimized for fluid drag-and-drop interactions and real-time syncing.
- **Testing:** Strict adherence to TDD (Red, Green, Refactor, Adversarial) with >85% test coverage. Every block must pass schema, happy-path, and error-path tests, additionally leveraging Mastra Evals for the Orchestrator.

## Out of Scope

- Full implementation of the Chat Shell or Creations Drawer, except where necessary for canvas integration.
