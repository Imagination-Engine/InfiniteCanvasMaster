# Implementation Plan: Mastra Integration & LibreChat UI Convergence

## Phase 1: Structural Initialization & Brain (`packages/agents`)

- [ ] Task: Install `@mastra/core`, `@mastra/engine`, and `@mastra/memory` in relevant packages.
- [ ] Task: Create `packages/agents/src/mastra.config.ts` and configure Postgres memory.
- [ ] Task: Setup local OTEL dashboard (e.g., docker-compose for Jaeger) and configure Mastra telemetry.
- [ ] Task: Define the `ImaginationOrchestrator` agent using `gemini-2.5-pro`.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Structural Initialization & Brain' (Protocol in workflow.md)

## Phase 2: The Tool-Block Bridge (Common Blocks First)

- [ ] Task: Implement `createMastraToolFromBlock()` adapter in `@iem/core`.
- [ ] Task: Migrate/Port core Common Blocks (e.g., IO, basic routing) to Mastra Tools using the adapter.
- [ ] Task: Write schema and integration tests (TDD) for the newly adapted tools.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: The Tool-Block Bridge' (Protocol in workflow.md)

## Phase 3: Backend Refactor (The Mastra Cutover)

- [ ] Task: Refactor `apps/server/src/routes/chat.ts` to instantiate and call the `ImaginationOrchestrator`.
- [ ] Task: Replace manual Drizzle message inserts with Mastra thread passing.
- [ ] Task: Wire Mastra `agent.stream()` to the HTTP response.
- [ ] Task: Write adversarial tests ensuring the new streaming endpoints handle errors gracefully.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Backend Refactor' (Protocol in workflow.md)

## Phase 4: Canvas to Mastra Workflow Compiler

- [ ] Task: Implement compiler logic in `apps/web/src/agent/agentParser.ts` (React Flow to Mastra JSON).
- [ ] Task: Create backend runner endpoint `POST /api/projects/:id/execute`.
- [ ] Task: Implement dynamic Workflow construction and execution in the backend endpoint.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Canvas to Mastra Workflow Compiler' (Protocol in workflow.md)

## Phase 5: The LibreChat UI/UX Extraction

- [ ] Task: Script shallow clone of `danny-avila/LibreChat` to `temp/` for analysis.
- [ ] Task: Extract and port LibreChat message streaming and advanced markdown parsing.
- [ ] Task: Extract and port LibreChat "Agent is thinking..." and tool invocation visualizers.
- [ ] Task: Refactor `ChatShell.tsx` integrating these transplants while maintaining Dual-View stability.
- [ ] Task: Conductor - User Manual Verification 'Phase 5: The LibreChat UI/UX Extraction' (Protocol in workflow.md)

## Phase 6: Evals, Cleanup & Legacy Deprecation

- [ ] Task: Establish benchmark suite (`evals/`) with 5 user intent stories.
- [ ] Task: Implement Mastra Evals to score orchestration accuracy against the benchmarks.
- [ ] Task: Safely deprecate and remove legacy `CanvasScheduler`.
- [ ] Task: Conductor - User Manual Verification 'Phase 6: Evals, Cleanup & Legacy Deprecation' (Protocol in workflow.md)
