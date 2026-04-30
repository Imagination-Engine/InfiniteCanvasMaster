# Technical & Gap Analysis Report: Imagination Engine

## 1. Executive Summary

The Imagination Engine has established a solid foundation with a multi-package monorepo, a well-defined Drizzle-based data model, and a basic integration of the Mastra agentic framework. However, there are significant architectural and implementation gaps between the current state and the vision outlined in the IEM-MASTER-00-04 specifications. Key pivots (e.g., from React Flow to Tldraw) are underway but incomplete, and the "Brain" orchestration layer is currently underutilized.

## 2. Technical Audit

### 2.1 Backend & Data Model

- **Mastra Integration:** The `mastra.config.ts` is initialized with `PostgresStore` but operates in a silo from the main `@iem/db` package. Thread persistence is handled by Mastra, but it's not yet aligned with our legacy `messages` table.
- **Agentic Logic:** The `ImaginationOrchestrator` uses `gemini-2.5-pro` and can generate blueprints. However, the system relies on manual tool-call parsing in the chat route rather than leveraging Mastra's full streaming ecosystem.
- **Missing Core Logic:**
  - **Workflow Compiler:** No mechanism exists to convert a Tldraw/React Flow DAG into a Mastra Workflow JSON.
  - **Execution Runner:** The backend cannot currently "execute" a canvas; it only generates the blueprint.

### 2.2 Frontend & UI/UX

- **Canvas Pivot:** The project has pivoted from React Flow to **Tldraw** for the spatial canvas. While this is a superior architectural choice for "Infinite Canvases," the integration of IEM blocks as custom shapes (`IemBlockShapeUtil`) is in early development.
- **Chat Shell:**
  - Currently uses an **iframe** for LibreChat (`ChatShell.tsx`). This provides a great UX but limits deep integration and violates the "extract and port" mandate.
  - `HomeStudio.tsx` provides a secondary, simpler chat that handles the primary intent-to-blueprint flow.
- **Surface Implementation:**
  - **Scribe:** Initial TipTap integration exists in `proseBlock.tsx`.
  - **Others:** Playable, Reel, Forge, and Atlas are largely represented by stubs or basic nodes.

## 3. Gap Analysis

| Feature Area      | MASTER Specification Requirement      | Current Implementation State          | Gap Status |
| :---------------- | :------------------------------------ | :------------------------------------ | :--------- |
| **Orchestration** | Full Mastra Workflows (Server-side)   | Simple Agent tool calls (Incomplete)  | **High**   |
| **Canvas Engine** | Infinite, Multi-surface (Tldraw Path) | Tldraw partial integration            | **Medium** |
| **Chat UX**       | LibreChat-level quality (Native)      | Iframe-based (Cheat)                  | **Medium** |
| **Persistence**   | Synchronized State (Postgres/Mastra)  | Mastra-internal / Drizzle split       | **Low**    |
| **Surface A-E**   | 51+ Production-grade Blocks           | ~10 Stubbed/Basic Blocks              | **High**   |
| **Automation**    | 95% Scaffolding CLI                   | `new-block` scripts exist but limited | **Medium** |

## 4. "Exceed Original Specification" Action Plan

### Phase 1: Unified Brain & Execution (The Mastra Pivot)

1. **Unify Database:** Align `mastra.config.ts` with `@iem/db` to use shared connection pools and ensure messages/threads are unified.
2. **Implement Workflow Compiler:** Build the logic to transform a Tldraw DAG into a executable Mastra Workflow.
3. **Launch Execution Endpoint:** Create `POST /api/projects/:id/execute` to run these DAGs server-side.

### Phase 2: Native UI Convergence (The LibreChat Extraction)

1. **Kill the Iframe:** Extract the streaming, markdown, and code-block components from LibreChat and implement them natively in `apps/web`.
2. **Thinking State:** Implement rich, granular "Agent is thinking..." visualizers that show tool calls in real-time.

### Phase 3: Spatial Realization (The Tldraw Hardening)

1. **Block Parity:** Implement high-fidelity Tldraw shapes for all 5 surfaces.
2. **Interplay:** Ensure the IntentcastingBar can push updates directly into the Tldraw store.

### Phase 4: Production Automation

1. **IEM CLI:** Expand the CLI to handle full surface scaffolding and PR preparation.
