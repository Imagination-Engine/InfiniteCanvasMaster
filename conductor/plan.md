# Implementation Plan: System-Wide Baseline Rescue & Mastra Integration

## Background & Motivation

The Imagination Engine has evolved rapidly from a prototype to a production-grade multi-surface studio. However, the current state contains technical debt: mock implementations (e.g., `mock://color-swapped-image`), legacy `console.log` telemetry, manual Vercel AI SDK loops, and broken UI states (like the frozen chat input in `HomeStudio.tsx`). With a 4-hour deadline for a critical grading milestone, we must systematically eradicate these weaknesses and return the project to a rock-solid, fully functioning baseline as defined in `IEM-MASTER-00` and `IEM-MASTER-03`.

## Scope & Impact

This rescue operation will touch all layers of the stack, utilizing a strict **Bottom-Up (Engine to UI)** sequence:

1.  **Persistence & Memory**: Drizzle schemas and Mastra Postgres Memory.
2.  **The Brain**: The `ImaginationOrchestrator` Mastra agent and genuine tool integrations.
3.  **The Transport**: The backend Express API endpoints (`chat.ts`).
4.  **The Surface**: The React frontend (`HomeStudio.tsx` and Dual-View UX).

## Alternatives Considered

- **Top-Down (UI to Engine):** Rejected. Fixing the React UI first risks building against unstable, mocked backend contracts, leading to double-work.
- **End-to-End Slicing:** Rejected. The core shared substrate (Agent Runtime) is currently compromised. A horizontal slice would carry over foundational rot. Bottom-up ensures the foundation is flawless before moving to the surface.

## Proposed Solution: Phased Implementation Plan

### Phase 1: Substrate & Persistence (Data & Memory)

- **Audit Database Schemas:** Verify that `packages/db` accurately reflects the tables required by the Master Plan (`users`, `sessions`, `messages`, `canvases`).
- **Mastra Config Initialization:** Configure `packages/agents/src/mastra.config.ts`. Strip out stubbed memory and wire up the Mastra Postgres Memory module utilizing our existing Drizzle connection string.
- **Telemetry:** Enable OpenTelemetry within Mastra to replace ad-hoc `console.log` statements found in routing and auth services.

### Phase 2: The Mastra Brain & Integrations (Eradicating Mocks)

- **Instantiate Orchestrator:** Define the `ImaginationOrchestrator` agent in `packages/agents` using `gemini-2.5-pro`.
- **Purge Mocks:** Search and destroy all instances of `mock://` (specifically targeting `apps/web/src/services/ai/creativeNodeService.ts` and any stubbed external APIs).
- **Tool Bridge:** Implement `createMastraToolFromBlock()` to convert the existing visual node logic into formal, executable Mastra Tools.

### Phase 3: The API & Transport Layer

- **Refactor `chat.ts`:** Strip manual Drizzle message insertions (`db.insert(messages)`) inside `apps/server/src/routes/chat.ts`.
- **Mastra Handoff:** Route the `sessionId` directly into Mastra as the `threadId`. Ensure the backend streams the Mastra execution output perfectly back to the Vercel AI SDK frontend.

### Phase 4: The Chat Shell & Canvas UI (Surface Polish)

- **Implement the Chat Interface Fix:** Apply the pending patch to `apps/web/src/Pages/HomeStudio.tsx`. Move the `isLoading` and `error` indicators out of the empty-state ternary. Stabilize the `useChat` session ID to eliminate the race condition.
- **LibreChat Extraction:** Port the LibreChat message parsing and auto-scroll behaviors into the Dual-View container.
- **Workflow Compiler Integration:** Ensure the Canvas's React Flow nodes are correctly parsing into JSON and dispatching to the new Mastra Workflow runner endpoint.

## Verification & Testing

- **Agent Evals:** Utilize Mastra Evals (LLM-as-a-judge) to benchmark the `ImaginationOrchestrator`'s ability to trigger the right tools.
- **Adversarial TDD:** For every mocked function replaced, an adversarial test will be written to ensure it handles malformed inputs gracefully.
- **Physical E2E:** Verify that a user can type a prompt in the Chat Shell, see a React Flow Canvas generated, and successfully execute a node without encountering `mock://` data or a locked UI.

## Migration & Rollback

- All backend code is isolated via the monorepo packages (`@iem/core`, `packages/agents`).
- If the Mastra stream fails, we will retain the legacy `test-chat.ts` manual loop as a fallback router until the stream is stabilized.
- Commits will strictly follow Red-Green-Refactor to ensure Git history is cleanly revertible at any step.
