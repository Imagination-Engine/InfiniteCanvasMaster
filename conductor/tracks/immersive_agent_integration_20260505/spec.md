# Immersive Agentic Block Integration Specification

## 🌌 Overview

This document serves as the technical blueprint for wiring the **Immersive Block Modal** to the **Mastra Multi-Agent Backend**. The goal is to provide every block on the Imagination Canvas with its own sovereign, intelligent persona and a universal surface for collaborative artifact creation.

---

## 1. UI/UX Architecture: The "Command Center" Layout

The `ImmersiveBlockModal` will be refactored into a dual-column interface.

### A. Left Panel: The Multi-Utility Sidebar (30% Width)

- **Structure**: A dual-mode container with a premium tab-switcher at the top.
- **Mode 1: Agent Chat**:
  - **Component**: We will adapt the existing `ChatShell.tsx` (from `apps/web/src/Components/Chat`) to work elegantly in this nested context to maintain code cleanliness.
  - **Functionality**: Conversational interface with the block's sovereign agent.
- **Mode 2: Block Configuration**:
  - **Component**: `BlockInspector.tsx` (to be created/reused).
  - **Functionality**: Direct control over block parameters, capability tags, and metadata.
  - **Presentation**: Accessed via a slide-over/drawer to maximize vertical space for the primary chat interface.
- **State Management**:
  - `threadId`: `projectId:blockId` for persistent memory.
  - `api`: `/api/chat/block`.
- **Secondary Controls**: A high-z-index overlay "Settings Drawer" (triggered from the header) for advanced runtime configurations, ensuring the right panel remains artifact-dominant.
- **Visuals**: `backdrop-blur-3xl`, semi-transparent `bg-brand-bg-surface`, and high-fidelity typography.

### B. Right Panel: The Universal Surface (70% Width)

- **Component**: `AgnosticRenderShell.tsx` (to be created in `imagination-canvas-kit`).
- **Functionality**: A high-performance render slot that handles studio-specific artifacts.
- **Studio-Specific Integrations**:
  - **Writers Studio (Scribe)**: Extensible **Tiptap** rich-text editor with real-time EPUB/PDF export previews (`epub-gen`, `Paged.js`).
  - **Agent Studio**: Specialized **Mastra Agent Dashboard** for persona configuration, tool-binding visualizers, and memory-state inspection.
  - **Apps Studio (Forge)**: **Monaco Editor** for code generation and a high-performance **WebContainers** sandbox for live Node.js execution.
  - **Gaming Studio (Playable)**: **Phaser 4** WebGL 2 viewport with **Enable3D** support and Matter.js physics debug layers.
  - **Research & Knowledge (Atlas)**: Interactive **React Flow** or D3-based Force Graphs for Personal World Model visualization and RAG source inspection.
  - **Video & Movies (Reel)**: **FFmpeg.wasm** powered timeline editor and Nanobanana/ElevenLabs media preview player.
  - **Commerce Studio**: Product-intent visualizers, high-fidelity catalog cards, and secure checkout flow simulations.
- **Integration**: Dynamically renders the `expandedVariant` of the current block definition by matching the `StudioID` and `ArtifactContract`.

---

## 2. Backend Architecture: Mastra Agent Factory

The backend will dynamically generate agent personas based on the block's identity.

### A. Dynamic Persona Construction

The server will look up the block's `BlockDefinition` in the registry and construct a system prompt:

- **Identity**: `[Name] Agent` (e.g., "Dynamic Camera Agent").
- **Objective**: Derived from the block's `description`.
- **Knowledge**: Injected from the block's `capabilities` array.
- **Context**: The current block `params` and `input` data.

### B. Tool Binding & A2A (Agent-to-Agent)

Each block agent will have access to a set of native tools:

1.  **Self-Mutation Tool**: Bind the block's `agent.invoke` function so the agent can modify its own internal parameters.
2.  **Canvas Awareness**: Access to read (but not necessarily modify) neighboring blocks in the DAG.
3.  **MCP Extension**: Ability to call external Model Context Protocol tools to fetch data or execute logic.
4.  **Memory Sharing via A2A**: While memory is scoped to the block (`projectId:blockId`), shared context with the main orchestrator or other blocks is permitted but managed carefully via A2A communication and the message fabric to preserve agent intelligence and user experience.

---

## 3. Implementation Workflow

### Phase 1: Store & Protocol Alignment

- Update `ExpansionStore` to ensure `blockId` and `projectId` are accessible to the modal layer.
- Extend the block protocol in `@iem/core` to support `AgenticPersona` overrides.

### Phase 2: Frontend Layout Refactor

- Modify `ImmersiveBlockModal.tsx` to implement the `70/30` split.
- Adapt and mount `ChatShell.tsx` in the left panel with appropriate thread-scoping.
- Stabilize the `AgnosticRenderShell` to ensure smooth transitions between block types.
- Implement the slide-over `BlockInspector`.

### Phase 3: Backend Chat Expansion

- Implement `/api/chat/block` in `apps/server/src/routes/chat.ts`.
- Create an `AgentFactory` in `@iem/agents` that instantiates Mastra agents on-the-fly.
- Wire A2A communication logic for context sharing while preserving scoped memory (`projectId:blockId`).

---

## 4. Final Goal

The user maximizes a block and is greeted by a specialized agent that understands the block's role, the project's goal, and has the "hands" (tools) to manipulate the block's output live on the universal surface.
