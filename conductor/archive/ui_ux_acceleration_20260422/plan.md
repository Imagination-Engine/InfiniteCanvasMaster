# Implementation Plan: UI/UX Acceleration & Deep Integration (LibreChat & tldraw)

## Background & Motivation

The Imagination Engine's frontend requires a profound evolution from a functional prototype to a seamless, glitch-free, production-grade environment. By integrating battle-tested patterns from LibreChat (chat interfaces) and tldraw (canvas interactions), we can achieve this. Crucially, this upgrade must embody the core "through line" of the system: a conversational journey that elegantly deconstructs an idea into a complex DAG blueprint, culminating in a highly interactive, dual-mode (Chat + Canvas) spatial environment where the AI acts as a continuous co-creator.

## Scope & Impact

This track touches the core user journey from initial login (`HomeStudio.tsx`) to complex spatial arrangement (`SessionPage.tsx`, `Canvas.tsx`, `BaseNode.tsx`). It mandates interactive, non-mocked data elements, glitch-free chat rendering, a 50+ block library toolbar, and strict agentic workflows.

## Core Directives & Rules

1.  **Zero Glitch Chat:** The chat UI must be anchored. Text must flow and emerge smoothly without jumping, stuttering, or shifting the layout.
2.  **No Mocked Interactive Elements:** If a UI element can be edited (titles, descriptions, outputs, artifacts), it _must_ be data-driven, interactive, and connected to the backend state—no stubs.
3.  **Strict TDD:** Every new or modified feature must have corresponding tests (schema, render, integration, adversarial) before merging.
4.  **Atomic Commits:** Implementation will follow strict, atomic commit sequences to allow for targeted rollback strategies if a feature regresses.

## Proposed Solution: Phased Implementation Plan

### Phase 1: The Glitch-Free "HomeStudio" Journey (LibreChat Ingestion)

The user's initial interaction is a 3-5 step conversational interplay to sharpen their intent.

- **Stable Chat Rendering:**
  - Implement a strict "bottom-anchor" scroll strategy in `ChatShell.tsx`.
  - Use `requestAnimationFrame` or sophisticated DOM observation (e.g., ResizeObserver on the message container) to ensure the window remains perfectly locked to the bottom of the stream as tokens arrive.
- **Mastra Memory Compounding:**
  - Ensure the `orchestrator` agent explicitly utilizes Mastra's thread memory to build context over the 3-5 turn interplay.
  - The backend must support a "Deconstruction Matrix" phase before triggering the Canvas generation.
- **The "Emergent Card":**
  - When the DAG blueprint is finalized, the AI outputs a specialized tool call (`generate_canvas_blueprint`).
  - The UI renders a beautiful, interactive "Card" artifact in the chat stream.
  - Clicking this card transitions the user seamlessly from `HomeStudio` into the `SessionPage` (Canvas Mode).

### Phase 2: The Floating "Canvas Mode" UI (tldraw Ingestion)

The canvas becomes the primary working surface, with the AI chat as a continuous, floating companion.

- **Floating Agent Chat:**
  - In `SessionPage.tsx`, the `ChatShell` becomes a floating panel that overlays the React Flow canvas (nodes pass _underneath_ it).
  - Implement a "Collapse to Toolbar" mechanism. When collapsed, the chat becomes a "dynamic radiant orb" integrated into the tldraw-style toolbar. Clicking the orb re-expands the chat.
- **Contextual tldraw Toolbars:**
  - Implement a primary floating toolbar for canvas manipulation (Pan, Select, Multi-select).
  - Implement contextual pop-up toolbars for selected nodes (Delete, Duplicate, Run).
- **The 50+ Block Library Modal:**
  - Create a sharp, beautiful modal (`NodeLibraryPanel.tsx` refactor) that emerges to show the 50+ available blocks across the 5 surfaces.
  - Users can scroll, click-to-drop, or drag-and-drop from this modal directly onto the canvas below.
  - **Emergent Creation:** The library modal must include a "Create New Block" CLI interface, available to both the human and the Canvas Agent, to dynamically encode new concepts on the fly.

### Phase 3: The Interactive Block Ecosystem (No Mocks)

- **Immersive Node Expansion:**
  - Update `BaseNode.tsx`. When a user "expands" or double-clicks a block, it must transition smoothly into an immersive modal overlay (like an OS desktop window) revealing deep configurations, outputs, and artifacts.
  - It must collapse smoothly back to its node representation on the canvas when closed.
- **Data-Driven Editability:**
  - Audit all node inputs, text areas, titles, and config panels. Wire them definitively to the `useReactFlow` state and the backend Drizzle schemas. Remove any residual hardcoded or mocked text.

## Execution Sequences & Rollback (TDD)

1.  **Sequence A:** Chat Stabilization & Mastra Memory Integration. (Commit & Verify)
2.  **Sequence B:** The DAG Emergent Card & Transition Logic. (Commit & Verify)
3.  **Sequence C:** Floating Chat & Radiant Orb Toolbar. (Commit & Verify)
4.  **Sequence D:** The 50+ Block Library Modal & Drag-Drop. (Commit & Verify)
5.  **Sequence E:** Immersive Block Expansion & Data-binding cleanup. (Commit & Verify)

If any sequence fails its TDD suite or introduces regressions, we revert to the previous sequence's commit hash.
