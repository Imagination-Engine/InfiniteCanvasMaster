# Implementation Plan: Immersive Agentic Block Integration

## Phase 1: Store & Protocol Alignment

- [x] Task: Extend the block protocol in `@iem/core` to support `AgenticPersona` overrides.
  - [x] Update types in `packages/core/src/types/protocol.ts` or equivalent.
  - [x] Ensure backward compatibility with existing blocks.
- [x] Task: Update `ExpansionStore` in `imagination-canvas-kit`.
  - [x] Ensure `blockId` and `projectId` are robustly accessible to the modal layer.
  - [x] Write unit tests to verify store state updates correctly on expansion.
- [x] Task: Conductor - User Manual Verification 'Store & Protocol Alignment' (Protocol in workflow.md)

## Phase 2: Backend Chat Expansion & Agent Factory

- [x] Task: Create `AgentFactory` in `@iem/agents`.
  - [x] Implement logic to instantiate Mastra agents dynamically based on `BlockDefinition`.
  - [x] Construct dynamic system prompts injecting block description, capabilities, and context.
  - [x] Add unit tests for factory generation logic.
- [x] Task: Implement Tool Binding & A2A Communication.
  - [x] Implement Self-Mutation Tool referencing `agent.invoke`.
  - [x] Implement Canvas Awareness (read-only DAG access).
  - [x] Wire A2A communication logic for context sharing using the message fabric.
- [x] Task: Implement `/api/chat/block` route in `apps/server/src/routes/chat.ts`.
  - [x] Handle incoming chat requests, scoping memory to `projectId:blockId`.
  - [x] Wire route to the new `AgentFactory`.
  - [x] Add integration tests for the endpoint.
- [x] Task: Conductor - User Manual Verification 'Backend Chat Expansion & Agent Factory' (Protocol in workflow.md)

## Phase 3: Frontend Layout Refactor (Command Center)

- [x] Task: Refactor `ImmersiveBlockModal.tsx` (`imagination-canvas-kit`).
  - [x] Implement the dual-column `70/30` width layout using Tailwind CSS.
  - [x] Apply premium visuals (`backdrop-blur-3xl`, `bg-brand-bg-surface`).
- [x] Task: Implement Left Panel UI (Multi-Utility Sidebar).
  - [x] Adapt and mount `ChatShell.tsx` within the left panel, ensuring correct `threadId` scoping (`projectId:blockId`) and API targeting (`/api/chat/block`).
  - [x] Implement the slide-over `BlockInspector` for Mode 2 (Configuration).
  - [x] Implement tab-switcher logic between Chat and Inspector.
- [x] Task: Implement Right Panel UI (Universal Surface).
  - [x] Create and stabilize `AgnosticRenderShell.tsx` as a universal content wrapper.
  - [x] Implement **Tiptap** integration for Writers Studio with export previews.
  - [x] Implement **Mastra Dashboard** UI for Agent Studio (persona/tools/memory).
  - [x] Integrate **Monaco Editor** and **WebContainers** for Apps Studio (Forge).
  - [x] Integrate **Phaser 4** & **Enable3D** canvas for Gaming Studio (Playable).
  - [x] Implement **React Flow** / Force Graph visualizations for Research & Knowledge (Atlas).
  - [x] Implement **FFmpeg.wasm** timeline and media player for Video & Movies (Reel).
  - [x] Implement catalog and intent visualizers for Commerce Studio.
  - [x] Wire the shell to dynamically render the `expandedVariant` based on `StudioID` and `ArtifactContract`.

- [x] Task: Add Adversarial Tests for UI interactions.
  - [x] Test rapid switching between blocks.
  - [x] Test layout rendering at extreme resolutions or window sizes.
- [x] Task: Conductor - User Manual Verification 'Frontend Layout Refactor (Command Center)' (Protocol in workflow.md)

## Phase: Review Fixes

- [x] Task: Apply review suggestions 240ebfd
