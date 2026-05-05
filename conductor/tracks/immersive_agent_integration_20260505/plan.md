# Implementation Plan: Immersive Agentic Block Integration

## Phase 1: Store & Protocol Alignment

- [ ] Task: Extend the block protocol in `@iem/core` to support `AgenticPersona` overrides.
  - [ ] Update types in `packages/core/src/types/protocol.ts` or equivalent.
  - [ ] Ensure backward compatibility with existing blocks.
- [ ] Task: Update `ExpansionStore` in `imagination-canvas-kit`.
  - [ ] Ensure `blockId` and `projectId` are robustly accessible to the modal layer.
  - [ ] Write unit tests to verify store state updates correctly on expansion.
- [ ] Task: Conductor - User Manual Verification 'Store & Protocol Alignment' (Protocol in workflow.md)

## Phase 2: Backend Chat Expansion & Agent Factory

- [ ] Task: Create `AgentFactory` in `@iem/agents`.
  - [ ] Implement logic to instantiate Mastra agents dynamically based on `BlockDefinition`.
  - [ ] Construct dynamic system prompts injecting block description, capabilities, and context.
  - [ ] Add unit tests for factory generation logic.
- [ ] Task: Implement Tool Binding & A2A Communication.
  - [ ] Implement Self-Mutation Tool referencing `agent.invoke`.
  - [ ] Implement Canvas Awareness (read-only DAG access).
  - [ ] Wire A2A communication logic for context sharing using the message fabric.
- [ ] Task: Implement `/api/chat/block` route in `apps/server/src/routes/chat.ts`.
  - [ ] Handle incoming chat requests, scoping memory to `projectId:blockId`.
  - [ ] Wire route to the new `AgentFactory`.
  - [ ] Add integration tests for the endpoint.
- [ ] Task: Conductor - User Manual Verification 'Backend Chat Expansion & Agent Factory' (Protocol in workflow.md)

## Phase 3: Frontend Layout Refactor (Command Center)

- [ ] Task: Refactor `ImmersiveBlockModal.tsx` (`imagination-canvas-kit`).
  - [ ] Implement the dual-column `70/30` width layout using Tailwind CSS.
  - [ ] Apply premium visuals (`backdrop-blur-3xl`, `bg-brand-bg-surface`).
- [ ] Task: Implement Left Panel UI (Multi-Utility Sidebar).
  - [ ] Adapt and mount `ChatShell.tsx` within the left panel, ensuring correct `threadId` scoping (`projectId:blockId`) and API targeting (`/api/chat/block`).
  - [ ] Implement the slide-over `BlockInspector` for Mode 2 (Configuration).
  - [ ] Implement tab-switcher logic between Chat and Inspector.
- [ ] Task: Implement Right Panel UI (Universal Surface).
  - [ ] Create and stabilize `AgnosticRenderShell.tsx`.
  - [ ] Wire it to dynamically render the `expandedVariant` of the current block.
- [ ] Task: Add Adversarial Tests for UI interactions.
  - [ ] Test rapid switching between blocks.
  - [ ] Test layout rendering at extreme resolutions or window sizes.
- [ ] Task: Conductor - User Manual Verification 'Frontend Layout Refactor (Command Center)' (Protocol in workflow.md)
