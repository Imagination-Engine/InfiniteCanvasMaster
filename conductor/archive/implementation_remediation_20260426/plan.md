# Implementation Plan: Implementation Remediation & Baseline Realization

## Phase 1: Unified Brain & Execution (The Mastra Pivot)

- [ ] Task: Refactor `mastra.config.ts` to share the PostgreSQL connection pool with `@iem/db`.
- [ ] Task: Implement `TldrawToMastra` compiler logic (converting spatial nodes/edges to Mastra Workflow JSON).
- [ ] Task: Create `POST /api/projects/:id/execute` endpoint to instantiate and run compiled Mastra Workflows.
- [ ] Task: Eradicate mock logic in core tool executions (e.g., replace `mock://` with pragmatic fallbacks or real APIs).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Unified Brain & Execution' (Protocol in workflow.md)

## Phase 2: Native UI Convergence (The LibreChat Extraction)

- [ ] Task: Remove iframe implementation from `ChatShell.tsx`.
- [ ] Task: Implement native Vercel AI SDK `useChat` hook with custom message parsing in `ChatShell`.
- [ ] Task: Extract and implement LibreChat's advanced Markdown renderer (`Markdown.tsx` enhancements).
- [ ] Task: Implement "Agent is thinking..." and real-time tool invocation visualizers in the chat stream.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Native UI Convergence' (Protocol in workflow.md)

## Phase 3: Spatial Realization (The Tldraw Hardening)

- [ ] Task: Implement the underlying generic Tldraw shape architecture for IEM blocks.
- [ ] Task: Scaffold and implement production-ready Tldraw shapes for Scribe Surface blocks.
- [ ] Task: Scaffold and implement production-ready Tldraw shapes for Playable Surface blocks.
- [ ] Task: Scaffold and implement production-ready Tldraw shapes for Atlas, Reel, and Forge blocks.
- [ ] Task: Wire the `IntentcastingBar` to directly manipulate the Tldraw store based on agent blueprints.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Spatial Realization' (Protocol in workflow.md)

## Phase 4: Production Automation

- [ ] Task: Expand `scripts/cli/index.ts` to support automated generation of full surface boilerplates.
- [ ] Task: Implement `iem:pr-prep` command combining type-checking, linting, formatting, and Evals.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Production Automation' (Protocol in workflow.md)
