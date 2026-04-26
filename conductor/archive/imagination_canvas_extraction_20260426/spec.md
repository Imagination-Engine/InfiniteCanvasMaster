# Specification: Balnce Imagination Canvas Extraction

## 1. Overview

Implement the Balnce Imagination Canvas: a production-grade, infinite, agentic, spatial creation environment inspired by tldraw and AFFiNE. It transcends a generic whiteboard by supporting typed spatial, knowledge, semantic, agentic, and commerce objects within a cohesive personal AI operating system.

## 2. Scope

This track covers the full, 17-phase execution roadmap mandated by the Master Implementation Prompt, ranging from the foundational spatial engine to mobile/accessibility readiness and final integration.

A completely new package will be created at `/packages/imagination-canvas-kit/` to ensure clean boundaries, eventually replacing the existing, partially implemented Tldraw canvas in `apps/web`.

## 3. Objectives

- Strictly adhere to the canonical documentation in `/docs/imagination-canvas-extraction/`.
- Produce the mandated planning documents before code implementation (`IMPLEMENTATION_READING_SUMMARY.md`, `CANVAS_TASK_LIST.md`, `ARCHITECTURE_DECISIONS.md`, `15-gap-list.md`).
- Implement the 17 execution phases sequentially, maintaining a strict zero-tolerance policy for mocks, stubs, and "demo-only" code paths.
- Enforce strict typing, state modeling, and event-driven architecture across all Canvas objects (e.g., Agent Blocks, Memory Clusters, PLOGs).

## 4. Deliverables

1. **Canonical Planning Docs:** Reading summary, execution task list, and architecture decisions.
2. **`@iem/imagination-canvas-kit`:** A new, reusable monorepo package containing components, hooks, state, contracts, and design tokens.
3. **Core Engine:** Camera, Viewport, Object Renderer, Selection, Hit Testing, and History mechanisms.
4. **Balnce Blocks:** 16+ heavily typed Balnce-native block renderers and interaction states.
5. **App Integration:** Deep integration of the new canvas kit into `apps/web`, replacing the legacy canvas and supporting agentic streaming, presence, and collaboration.

## 5. Constraints & Mandates

- **Zero Mocks:** Faking production behavior is strictly forbidden. Missing integrations must be addressed by defining a typed interface boundary, implementing a real local version, or explicitly documenting the gap.
- **Continuous Tracking:** The `CANVAS_TASK_LIST.md` and gap list must be updated concurrently with the implementation.
