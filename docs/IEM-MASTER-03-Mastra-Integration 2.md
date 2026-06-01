# IEM-MASTER-03 — Exhaustive Mastra & LibreChat Integration Plan

> **Objective:** Transition the Imagination Engine from a manual Vercel AI SDK implementation to a comprehensive, production-grade Mastra orchestration layer. Concurrently, extract and implement LibreChat's proven UI/UX paradigms to upgrade the Chat Shell into a world-class interface.

This document serves as the canonical map for the Mastra architectural pivot to prevent context drift.

---

## Architecture Paradigm Shift

| Feature            | Current IEM State                        | Mastra / LibreChat Target State         |
| :----------------- | :--------------------------------------- | :-------------------------------------- |
| **Agent Memory**   | Manual Drizzle `insert/select` in routes | Mastra native Postgres Memory Module    |
| **Workflows**      | Custom `CanvasScheduler` (Client-side)   | Mastra Workflows (Server-side DAGs)     |
| **Tools / Blocks** | Duplicated schemas, raw `fetch` calls    | Mastra Tools & Integrations Ecosystem   |
| **Telemetry**      | `console.log`                            | Mastra OpenTelemetry (OTEL)             |
| **Testing**        | Red/Green Vitest (Static Mocks)          | Mastra Evals (LLM-as-a-Judge)           |
| **Chat UI/UX**     | Custom `ChatShell.tsx` (Basic)           | LibreChat UI/UX Extraction (Production) |

---

## Exhaustive Execution Matrix

### Phase 1: Structural Initialization & Brain (`packages/agents`)

Mastra requires a centralized configuration directory. `packages/agents` will be repurposed from its current stubbed state into the Imagination Engine's "Brain."

- [ ] **1.1: Dependency Installation:** Add `@mastra/core`, `@mastra/engine`, and `@mastra/memory` to `packages/agents`, `@iem/core`, and `apps/server`.
- [ ] **1.2: Mastra Config Setup:** Create `packages/agents/src/mastra.config.ts`.
- [ ] **1.3: Postgres Memory Module:** Configure `mastra.config.ts` to use our existing PostgreSQL connection string (via Drizzle) for seamless thread persistence.
- [ ] **1.4: Telemetry Initialization:** Enable OpenTelemetry within Mastra to log trace data for all agent executions and tool calls.
- [ ] **1.5: Define the Orchestrator:** Create the `ImaginationOrchestrator` Agent inside `packages/agents/src/agents/orchestrator.ts` using the `gemini-2.5-pro` model.

### Phase 2: The LibreChat UI/UX Extraction (`apps/web`)

To achieve a production-grade feel, we will analyze LibreChat's open-source frontend and transplant its best UX/UI logic into our `DualViewContainer` and `ChatShell`.

- [ ] **2.1: Shake-out Script:** Write a temporary utility script to shallow-clone the `danny-avila/LibreChat` repository into a `temp/` folder.
- [ ] **2.2: Component Analysis:** Extract LibreChat's logic for streaming message bubbles, markdown parsing (math, code blocks, syntax highlighting), and auto-scroll behaviors.
- [ ] **2.3: Rebuild ChatShell:** Refactor `ChatShell.tsx` using the extracted LibreChat UX paradigms, ensuring it supports our Dual-View fullscreen/sidebar transitions perfectly.
- [ ] **2.4: Render Tool Invocations:** Port LibreChat's elegant "Agent is thinking..." and Tool Call visualizers to render our `create_canvas_block` suggestions.

### Phase 3: The Tool-Block Bridge & Integrations (`@iem/core`)

Blocks on the canvas must be 1:1 mapped to Tools the Agent can use.

- [ ] **3.1: The Adapter:** Create `createMastraToolFromBlock()` in `@iem/core`. This utility takes our Zod-backed `BlockDefinition` and returns a native Mastra `Tool`.
- [ ] **3.2: System Tools:** Port the `create_canvas_block` prompt tool into a formal Mastra Tool registered to the `ImaginationOrchestrator`.
- [ ] **3.3: Integrations Swap:** Replace stubbed canvas nodes (e.g., Slack, GitHub) with Mastra's official Integrations. Register these as blocks on the Canvas and tools in the Brain.

### Phase 4: Backend Refactor (`apps/server`)

Strip out all the boilerplate we wrote to handle manual memory and LLM calls.

- [ ] **4.1: Endpoint Rewrite:** Refactor `apps/server/src/routes/chat.ts`.
- [ ] **4.2: Memory Handoff:** Remove all manual `db.insert(messages)` logic. Pass the `sessionId` directly as the Mastra `threadId`.
- [ ] **4.3: Streaming Transport:** Hook the Mastra `agent.stream()` output directly into the HTTP response stream to feed the Vercel AI SDK / LibreChat frontend.

### Phase 5: Canvas to Mastra Workflow Compiler (`apps/web` & `apps/server`)

Move the execution of the visual Canvas from the browser to the backend using Mastra Workflows.

- [ ] **5.1: The Compiler:** Write a function in `apps/web/src/agent/agentParser.ts` that converts React Flow `nodes` and `edges` into a Mastra `Workflow` JSON definition.
- [ ] **5.2: Backend Runner:** Create a new endpoint `POST /api/projects/:id/execute` in `apps/server`.
- [ ] **5.3: Server-side Execution:** When the endpoint is hit, dynamically construct a `Workflow` in Mastra from the compiled JSON, execute it using the server's compute, and stream the results back to the canvas via Liveblocks/WebSocket.
- [ ] **5.4: Deprecate Legacy Scheduler:** Delete `CanvasScheduler` from `@iem/core`.

### Phase 6: Evals & Hardening (`scripts/` & CI)

Ensure the Agent doesn't regress.

- [ ] **6.1: Benchmark Suite:** Write a set of 5 user stories (intents) in a new `evals/` directory.
- [ ] **6.2: Mastra Evals:** Use Mastra's Eval framework to score the `ImaginationOrchestrator` on how accurately it extracts blocks from those stories.
- [ ] **6.3: PR-Prep Integration:** Add `pnpm run eval` to the `iem:pr-prep` script.

---

> **End of Spec.** Proceed linearly through phases. Ensure exhaustive validation at each checkpoint.
