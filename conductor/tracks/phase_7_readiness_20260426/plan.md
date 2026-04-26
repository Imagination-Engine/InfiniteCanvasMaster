# Implementation Plan: Phase 7 Readiness & Final Polish

## Phase 1: Pure Yjs Collaboration (Spatial Sync)

- [x] Task: Install `yjs`, `y-websocket` (or `y-webrtc`), and `y-protocols`.
- [x] Task: Set up a centralized Yjs provider in `apps/web/src/lib/yjs.ts`.
- [ ] Task: Bind Tldraw store to Yjs using the `@tldraw/tldraw` Yjs adapter logic.
- [ ] Task: Implement multiplayer presence (live cursors and user name tags) via Yjs awareness.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Pure Yjs Collaboration' (Protocol in workflow.md)

## Phase 2: Zero-Tolerance Mock Eradication

- [ ] Task: Global search for `mock://` and `// TODO: stub` across the monorepo.
- [ ] Task: Replace `mock://` in `creativeNodeService.ts` and surface blocks with real API calls/Mastra tools.
- [ ] Task: Ensure all 5 surfaces (A-E) have non-mocked data paths for their primary components.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Zero-Tolerance Mock Eradication' (Protocol in workflow.md)

## Phase 3: Playwright E2E Matrix

- [ ] Task: Configure Playwright in the project root and create `tests/e2e/`.
- [ ] Task: Write E2E test for the "Intent-to-Blueprint" flow: Prompt -> Mastra DAG -> Tldraw Rendering.
- [ ] Task: Write E2E test for Dual-View toggling and spatial sync verification.
- [ ] Task: Integrate Playwright into the `iem:pr-prep` script for automated gating.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Playwright E2E Matrix' (Protocol in workflow.md)

## Phase 4: Round-Robin UI Polish & Demo Hardening

- [ ] Task: Execute the Physical Testing loop for all 5 surface expressions.
- [ ] Task: Refine spacing, typography, and Framer Motion transitions based on user feedback.
- [ ] Task: Seed the production Postgres database with high-quality demo templates.
- [ ] Task: Conduct a final end-to-end demo dry run.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Round-Robin UI Polish & Demo Hardening' (Protocol in workflow.md)
