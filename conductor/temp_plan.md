# Implementation Plan: Canvas Architecture and Block Generation

## Phase 1: Foundation and Engine Migration

- [ ] Task: Scaffold TLDraw/Affine Canvas Component
  - [ ] Write failing tests for basic canvas rendering and initialization.
  - [ ] Implement base TLDraw/Affine component to replace React Flow.
  - [ ] Refactor existing canvas container to use the new engine.
  - [ ] Write adversarial test ensuring canvas handles rapid unmounting/remounting gracefully.
- [ ] Task: Integrate Real-Time Presence (Yjs)
  - [ ] Write failing tests for websocket connection and cursor broadcasting.
  - [ ] Implement Yjs/y-websocket integration with the canvas state.
  - [ ] Refactor to optimize rendering of remote cursors and selections.
  - [ ] Write adversarial test simulating high-latency/dropped websocket frames.
- [ ] Task: Conductor - User Manual Verification 'Foundation and Engine Migration' (Protocol in workflow.md)

## Phase 2: Canvas Runtime Enriched Capabilities (Mastra Integration)

- [ ] Task: Implement Canvas to Mastra Workflow Compiler
  - [ ] Write failing tests for serializing TLDraw/Affine blocks and edges into Mastra `Workflow` JSON definitions.
  - [ ] Implement the `agentParser.ts` compiler function in `apps/web`.
  - [ ] Refactor serialization for robust type-safety.
  - [ ] Write adversarial test parsing an infinitely looping visual graph.
- [ ] Task: Implement Server-Side DAG Execution
  - [ ] Write failing tests for backend workflow execution endpoint (`POST /api/projects/:id/execute`).
  - [ ] Implement dynamic Mastra Workflow construction and execution in `apps/server`.
  - [ ] Refactor streaming mechanism to push execution state back to the canvas via Liveblocks/WebSocket.
  - [ ] Write adversarial test verifying execution failure states bubble up correctly.
- [ ] Task: Implement Timeline Overlay Mode & Artifact Hooks
  - [ ] Write failing tests for toggling temporal mode and committing canvas state.
  - [ ] Implement timeline track UI and `commitAsCreation` logic.
  - [ ] Refactor canvas modes state management.
  - [ ] Write adversarial test for malformed artifact data commitments.
- [ ] Task: Conductor - User Manual Verification 'Canvas Runtime Enriched Capabilities' (Protocol in workflow.md)

## Phase 3: Block Generation and Protocol Migration

- [ ] Task: The Tool-Block Bridge
  - [ ] Write failing tests ensuring `BlockDefinition` objects translate perfectly into Mastra Tools.
  - [ ] Implement `createMastraToolFromBlock()` adapter utility in `@iem/core`.
  - [ ] Refactor block schemas to align with Mastra's native tool requirements.
  - [ ] Write adversarial test passing corrupted parameters to the adapter.
- [ ] Task: Finalize Legacy Block & Integration Migration
  - [ ] Write failing tests for legacy nodes (Refiner, Summarizer) wrapped as Mastra Tools.
  - [ ] Implement the wrapper implementations. Swap stubbed tools (e.g., Gmail, GitHub) for official Mastra Integrations.
  - [ ] Refactor to deprecate raw `fetch` calls across all blocks.
  - [ ] Write adversarial tests asserting failed tool invocations are handled gracefully.
- [ ] Task: Generate Surface-Specific Blocks
  - [ ] Write failing tests for Playable, Conductor, Reel, and Forge core blocks.
  - [ ] Implement the blocks mapping to the new Mastra-backed runtime.
  - [ ] Refactor UI components to bind strictly to the Tool's input schema.
  - [ ] Write adversarial tests for edge-case parameters in surface blocks.
- [ ] Task: Conductor - User Manual Verification 'Block Generation and Protocol Migration' (Protocol in workflow.md)
