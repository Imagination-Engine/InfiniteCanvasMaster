# Architectural Drift Report

## Overview
The project is currently in the middle of a massive architectural migration from legacy React Flow/tldraw components to a sovereign spatial engine (`@iem/imagination-canvas-kit`). This has resulted in several "Ghost" and "Stale" systems existing alongside "Real" ones.

## Audit Results

### 1. Message Fabric / A2A
- **Status:** Real / Emerging
- **Description:** The new `@iem/core/fabric` is the active target. The legacy `MessageBus.ts` has been promoted to a `BalnceFabricRouter`.
- **Wiring:** `useA2ASubscription` in the web app is correctly pointing to the SSE endpoint `/api/a2a/stream`.

### 2. Canvas Block UI
- **Status:** Mixed (Real Kit / Ghost App)
- **Description:** The new components in `packages/imagination-canvas-kit/src/components/blocks` are the active renderers. 
- **Drift:** `apps/web/src/Components/nodes` contains legacy React Flow nodes that are no longer used by the primary spatial canvas but still exist in the codebase.

### 3. Block Registry
- **Status:** Real (Duplicate)
- **Description:** There is a dual registration path. `apps/web/src/registry-init.ts` populates the core registry (70+ blocks), and `packages/imagination-canvas-kit/src/index.ts` populates the kit-specific registry for renderers.
- **Wiring:** The system is wired but the duplication makes it difficult to manage metadata consistency.

### 4. Immersive Modal
- **Status:** Real
- **Description:** The implementation in `packages/imagination-canvas-kit` is active and mounted via `CanvasShell`.
- **Wiring:** Edge-to-edge logic is in place but the content within the deep surfaces is often generic or uses placeholders.

### 5. Floating Orchestrator
- **Status:** Ghost
- **Description:** The UI component (`FloatingOrchestratorChat.tsx`) is mounted and functional in the UI (draggable, responsive).
- **Drift:** The backend lane is currently **simulated** with hardcoded responses and timeouts. It is NOT yet wired to the real Mastra orchestrator agent.

### 6. DAG-to-block & Layout Compilers
- **Status:** Ghost / Partial
- **Description:** Scaffolding exists in `imagination-canvas-kit/src/utils/dagToBlocks.ts`.
- **Wiring:** Not currently integrated into the automated orchestration flow. Blocks are placed manually or via basic layout triggers.

### 7. SSE / WebSocket / Projection Hooks
- **Status:** Real
- **Description:** `useBlockProjection.ts` and `SSEProjectionTransport.ts` are implemented.
- **Wiring:** This provides the backbone for "Alive" blocks, but few blocks currently utilize the lane for real-time updates.

### 8. Yjs / tldraw Sync
- **Status:** Stale
- **Description:** Legacy tldraw-based `Canvas.tsx` components are still present.
- **Wiring:** Confirmed that `SessionPage.tsx` has bypassed these in favor of the new `InfiniteViewport`.

### 9. Durable Pipeline & Mastra
- **Status:** Emerging
- **Description:** Backend infrastructure for workflow durability and Mastra orchestration is present.
- **Wiring:** The connection between the "Floating Orchestrator" UI and the "Durable Pipeline" backend is the primary missing link.

## Summary of State
- **Real:** Spatial Engine (Kit), Viewport, Base Block UI, Fabric Router, SSE Subscriptions.
- **Ghost:** Automated DAG Compilation, Layout Automation, Real Orchestrator Backend Lane.
- **Stale:** React Flow Nodes, tldraw Canvas, Legacy Message Bus (non-fabric version).
