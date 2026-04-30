# Specification: Mastra Integration & LibreChat UI Convergence

## 1. Overview

Transition the Imagination Engine's orchestration layer to **Mastra**, replacing manual Vercel AI SDK implementations and custom canvas schedulers. Concurrently, extract and implement proven UI/UX paradigms from **LibreChat** to upgrade the Chat Shell. The objective is perfect working operation throughout the transition.

## 2. Scope

- **Backend First Migration:** Prioritize implementing Mastra for backend orchestration and ensuring its stability before executing the LibreChat frontend extraction.
- **Brain Initialization:** Set up `@mastra/core`, `@mastra/engine`, and `@mastra/memory` in `packages/agents` connected to our existing Postgres database.
- **Observability:** Implement OpenTelemetry (OTEL) with a local dashboard (e.g., Jaeger) for perfect visibility into DAG execution and tool calls.
- **Tool/Block Bridge:** Prioritize bridging "Common Blocks" (IO, generic AI routing) to native Mastra Tools first to validate the architecture.
- **LibreChat UI Extraction:** Port LibreChat's message streaming, markdown parsing, and tool-call visualizers into our Dual-View Chat Shell.
- **Mastra Workflow Compiler:** Convert React Flow JSON into server-side Mastra Workflows for backend execution.

## 3. Objectives

- Establish the `ImaginationOrchestrator` agent in Mastra.
- Achieve 1:1 mapping between Canvas Blocks and Mastra Tools via `createMastraToolFromBlock()`.
- Eliminate manual LLM memory handling in favor of Mastra's Postgres Memory Module.
- Deliver a production-grade Chat UI that visually articulates agent reasoning ("Agent is thinking...").
- Replace the legacy client-side `CanvasScheduler` with server-side Mastra Workflows.

## 4. Deliverables

1. **Configured Mastra Brain:** `mastra.config.ts` and `ImaginationOrchestrator` agent.
2. **OTEL Dashboard Setup:** Dockerized local telemetry viewer.
3. **Common Tool Bridge:** Adapter utility and migrated common blocks.
4. **Refactored Chat API:** Endpoint using Mastra `agent.stream()`.
5. **LibreChat UI Transplants:** Upgraded `ChatShell.tsx`.
6. **Workflow Compiler:** Canvas-to-Mastra execution pipeline.

## 5. Out of Scope

- Immediate migration of all complex surface-specific blocks (Playable, Scribe) to Mastra tools. This track focuses on the infrastructure and common blocks.
- External integrations beyond the immediate needs of the common blocks.

## 6. Constraints & Mandates

- **Perfect Operation:** Every inflection point or architectural decision must be explicitly surfaced to the user for guidance before proceeding. Strict TDD must be observed.
