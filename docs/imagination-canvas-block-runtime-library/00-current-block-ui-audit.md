# Current Block UI Audit

## Current Block Components

The current block components are defined in packages/imagination-canvas-kit/src/components/blocks/. They include:

- AgentBlock.tsx
- AppBlock.tsx
- ArtifactBlock.tsx
- ChatBlock.tsx
- CommonBlockView.tsx
- GoalBlock.tsx
- MemoryClusterBlock.tsx
- NoteBlock.tsx
- RichTextBlock.tsx

## What is Ugly or Generic

- **Visuals:** The blocks use simple Lucide icons and basic tailwind classes. They lack the deep glass/satin/premium feel requested.
- **Chrome:** The "Browser Window Chrome" in ObjectRenderer.tsx is uniform across all blocks.
- **Empty States:** The empty states are basic italic text.
- **Interactivity:** Dragging and connecting works, but there are no pulsing intention/dependency edges or agentic activity pulses.

## What Registry Exists

The BlockRegistry exists in packages/imagination-canvas-kit/src/contracts/BlockRegistry.ts and packages/core/src/block/registry.ts.

- The core registry has the scaffolding for 65+ blocks.
- The UI registry currently only maps a handful of hardcoded components.
- Missing the rich metadata in the UI layer.

## What Blocks Exist (Implemented UI)

- Note, RichText, Agent, Artifact, Chat, MemoryCluster, App, Goal.
- The OpenClaw blocks exist, but they are named OpenClaw instead of ImagiClaw.

## What Expansion Wiring Exists

- The useExpansionStore tracks activeExpansionId and activeMode.
- ExpandableBlockWrapper.tsx exists and provides a basic Framer Motion fullscreen overlay.
- It lacks the specialized deep surfaces.

## What Orchestrator Exists

- The chat.ts backend route handles Mastra orchestration.
- The frontend UI for the chat is currently bound to the landing page or a static side panel.
- There is NO FloatingOrchestratorChat on the canvas.

## What Drag/Drop Exists

- You can drag from a generic application/reactflow data transfer type onto the InfiniteViewport.
- There is NO beautiful left-side BlockLibraryDrawer to drag from.

## What Runtime Wiring Exists

- AppBlock uses a basic iframe.
- There is no unified useBlockProjection, useBlockCommand, or agent_stream lane wiring connected to the actual block UIs.

## What is Missing

1.  **BlockLibraryDrawer:** The entire left-side library UI is missing.
2.  **ImmersiveBlockModal:** The deep, edge-to-edge modals with block chat, controls, and timelines are missing.
3.  **FloatingOrchestratorChat:** The copilot floating on the canvas is missing.
4.  **DAG-to-Block Layout:** The canvas cannot spontaneously emerge from a plan.
5.  **ImagiClaw Naming:** OpenClaw needs to be renamed in the UI to ImagiClaw.
6.  **Commerce Demo Flows:** Wallet, checkout, and intentcasting blocks are missing.
7.  **Premium Visuals:** The UI needs a massive visual upgrade.
