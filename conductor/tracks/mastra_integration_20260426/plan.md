# Implementation Plan: Mastra Integration & LibreChat UI Convergence

## Phase 1: Structural Initialization & Brain (`packages/agents`)

- [x] Task: Install `@mastra/core`, `@mastra/engine`, and `@mastra/memory` in relevant packages.
- [x] Task: Create `packages/agents/src/mastra.config.ts` and configure Postgres memory.
- [x] Task: Setup local OTEL dashboard (e.g., docker-compose for Jaeger) and configure Mastra telemetry.
- [x] Task: Define the `ImaginationOrchestrator` agent using `gemini-2.5-pro`.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Structural Initialization & Brain' (Protocol in workflow.md)

## Phase 2: The Tool-Block Bridge (Common Blocks First)

- [x] Task: Implement `createMastraToolFromBlock()` adapter in `@iem/core`.
- [x] Task: Migrate/Port core Common Blocks (e.g., IO, basic routing) to Mastra Tools using the adapter.
- [x] Task: Write schema and integration tests (TDD) for the newly adapted tools.
- [x] Task: Conductor - User Manual Verification 'Phase 2: The Tool-Block Bridge' (Protocol in workflow.md)

## Phase 3: Backend Refactor (The Mastra Cutover)

- [x] Task: Refactor `apps/server/src/routes/chat.ts` to instantiate and call the `ImaginationOrchestrator`.
- [x] Task: Replace manual Drizzle message inserts with Mastra thread passing.
- [x] Task: Wire Mastra `agent.stream()` to the HTTP response.
- [x] Task: Write adversarial tests ensuring the new streaming endpoints handle errors gracefully.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Backend Refactor' (Protocol in workflow.md)

## Phase 4: Canvas to Mastra Workflow Compiler

- [x] Task: Implement compiler logic in `apps/web/src/agent/agentParser.ts` (React Flow to Mastra JSON).
- [x] Task: Create backend runner endpoint `POST /api/projects/:id/execute`.
- [x] Task: Implement dynamic Workflow construction and execution in the backend endpoint.
- [x] Task: Conductor - User Manual Verification 'Phase 4: Canvas to Mastra Workflow Compiler' (Protocol in workflow.md)

## Phase 5: The LibreChat UI/UX Extraction

- [x] Task: Script shallow clone of `danny-avila/LibreChat` to `temp/` for analysis.
- [x] Task: Extract and port LibreChat message streaming and advanced markdown parsing.
- [x] Task: Extract and port LibreChat "Agent is thinking..." and tool invocation visualizers.
- [x] Task: Refactor `ChatShell.tsx` integrating these transplants while maintaining Dual-View stability.
- [x] Task: Conductor - User Manual Verification 'Phase 5: The LibreChat UI/UX Extraction' (Protocol in workflow.md)

## Phase 6: Evals, Cleanup & Legacy Deprecation

- [ ] Task: Establish benchmark suite (`evals/`) with 5 user intent stories.
- [ ] Task: Implement Mastra Evals to score orchestration accuracy against the benchmarks.
- [ ] Task: Safely deprecate and remove legacy `CanvasScheduler`.
- [ ] Task: Conductor - User Manual Verification 'Phase 6: Evals, Cleanup & Legacy Deprecation' (Protocol in workflow.md)
