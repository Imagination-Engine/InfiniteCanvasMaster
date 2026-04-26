# Implementation Plan: Balnce Imagination Canvas Extraction

## Phase 0: Repo Scan, Integration Map, and Reality Check

- [ ] Task: Recursively read `/docs/imagination-canvas-extraction/` and existing codebase architecture.
- [ ] Task: Create `/docs/imagination-canvas-extraction/IMPLEMENTATION_READING_SUMMARY.md`.
- [ ] Task: Create `/docs/imagination-canvas-extraction/CANVAS_TASK_LIST.md` for granular tracking.
- [ ] Task: Create `/docs/imagination-canvas-extraction/ARCHITECTURE_DECISIONS.md`.
- [ ] Task: Create/Update `/docs/imagination-canvas-extraction/REPO_INTEGRATION_MAP.md`.
- [ ] Task: Conductor - User Manual Verification 'Phase 0: Planning & Reality Check' (Protocol in workflow.md)

## Phase 1: Canvas Foundation Slice

- [ ] Task: Scaffold `/packages/imagination-canvas-kit/` and configure TypeScript/build settings.
- [ ] Task: Define core contracts (CanvasObject, CanvasBlock, CanvasViewport).
- [ ] Task: Implement core state stores (canvasStore, viewportStore).
- [ ] Task: Implement foundational components (CanvasShell, InfiniteViewport, ObjectRenderer).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Canvas Foundation' (Protocol in workflow.md)

## Phase 2: Camera, Viewport, Pan, Zoom

- [ ] Task: Implement TDD hooks for panning and zooming (`useViewportCamera`, `useWheelZoom`, `usePointerPan`).
- [ ] Task: Implement fit-to-content and reduced-motion mode logic.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Camera & Viewport' (Protocol in workflow.md)

## Phase 3: Object Model, Renderer, Layering

- [ ] Task: Implement comprehensive typed object registry and hit testing utilities.
- [ ] Task: Implement z-index sorting and parent/child relationship structures.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Object Model & Layering' (Protocol in workflow.md)

## Phase 4: Selection, Manipulation, Dragging

- [ ] Task: Implement single/multi-selection, marquee, and keyboard nudge logic.
- [ ] Task: Implement transform handles and locking logic.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Selection & Manipulation' (Protocol in workflow.md)

## Phase 5: Creation, Insertion, Drag/Drop

- [ ] Task: Implement CanvasToolbar, QuickAddMenu, and SlashCommandMenu.
- [ ] Task: Implement clipboard paste and drop-to-canvas object generation.
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Creation & Insertion' (Protocol in workflow.md)

## Phase 6: History, Persistence, and Recovery

- [ ] Task: Implement undo/redo stacks and history store.
- [ ] Task: Implement serialization, deserialization, and schema versioning logic.
- [ ] Task: Conductor - User Manual Verification 'Phase 6: History & Persistence' (Protocol in workflow.md)

## Phase 7: Core Rich Blocks

- [ ] Task: Implement renderers for NoteBlock, RichTextBlock, ImageBlock, and FileBlock.
- [ ] Task: Implement inline editing transitions and block frame controls.
- [ ] Task: Conductor - User Manual Verification 'Phase 7: Core Rich Blocks' (Protocol in workflow.md)

## Phase 8: Balnce-Native Blocks

- [ ] Task: Implement specialized contracts and renderers for Chat, Agent, Goal, Artifact, and Memory Clusters.
- [ ] Task: Implement specialized contracts for PLOG, Edge Twin, Workflow, and AURA Blocks.
- [ ] Task: Conductor - User Manual Verification 'Phase 8: Balnce-Native Blocks' (Protocol in workflow.md)

## Phase 9: Expansion, Inspection, App-Surfaces

- [ ] Task: Implement SideInspector and FullscreenBlockSurface.
- [ ] Task: Implement smooth transitions (compact -> expanded -> full app) preserving spatial context.
- [ ] Task: Conductor - User Manual Verification 'Phase 9: Expansion & Inspection' (Protocol in workflow.md)

## Phase 10: Connections, Semantic Links, Clusters

- [ ] Task: Implement ConnectorLayer, semantic routing, and group containers.
- [ ] Task: Conductor - User Manual Verification 'Phase 10: Connections & Graph Behavior' (Protocol in workflow.md)

## Phase 11: AI and Agent Behaviors

- [ ] Task: Implement AgentActivityLayer, HumanCheckpointCard, and StreamingBlock.
- [ ] Task: Wire real streaming events to block generation and region summarization.
- [ ] Task: Conductor - User Manual Verification 'Phase 11: AI and Agent Behaviors' (Protocol in workflow.md)

## Phase 12: Collaboration, Presence, Permissions

- [ ] Task: Implement PresenceLayer (Yjs cursors) and CommentThread architecture.
- [ ] Task: Implement permission-aware block rendering barriers.
- [ ] Task: Conductor - User Manual Verification 'Phase 12: Collaboration & Presence' (Protocol in workflow.md)

## Phase 13: Mobile, Touch, Stylus

- [ ] Task: Implement touch selection handles, gesture disambiguation, and mobile Quick Add.
- [ ] Task: Conductor - User Manual Verification 'Phase 13: Mobile & Touch' (Protocol in workflow.md)

## Phase 14: Accessibility, Keyboard, Reduced Motion

- [ ] Task: Ensure ARIA labels, complete keyboard navigability, and contrast adherence.
- [ ] Task: Conductor - User Manual Verification 'Phase 14: Accessibility' (Protocol in workflow.md)

## Phase 15: Performance, Scale, Virtualization

- [ ] Task: Implement viewport culling, memoization, and run 1,000+ object stress tests.
- [ ] Task: Conductor - User Manual Verification 'Phase 15: Performance & Scale' (Protocol in workflow.md)

## Phase 16: Integration Into Main Product

- [ ] Task: Fully wire `@iem/imagination-canvas-kit` into `apps/web` replacing the legacy Canvas component.
- [ ] Task: Integrate with real App routing and existing backend event systems.
- [ ] Task: Conductor - User Manual Verification 'Phase 16: Main Product Integration' (Protocol in workflow.md)

## Phase 17: Production Hardening and No-Stub Audit

- [ ] Task: Run automated extraction script to identify and remove ANY remaining mock/stub paths.
- [ ] Task: Verify E2E Playwright tests and full typecheck across the monorepo.
- [ ] Task: Conductor - User Manual Verification 'Phase 17: Production Hardening' (Protocol in workflow.md)
