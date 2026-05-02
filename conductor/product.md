# Initial Concept

There are 3 documents in the /docs folder, 00, 01, and 02. Document 00 is the foundational document, but 01 and 02 are deeply interlinked. The objective, tasks, outline, narrative spine, and all details for this project are contained within. Confirm?

## Product Vision

The Imagination Engine is a unified, agentic canvas substrate designed to support five distinct interactive expressions (Playable, Conductor, Reel, Forge, and an Open Slot). It transforms a standard node-based canvas into an elite, multi-surface studio.

## Target Audience & Quality Standard

The primary audience is **everyday people**. We do not design for a niche subset; the platform must be universally accessible and intuitive. To achieve this, the underlying architecture must consist of comprehensive, elite-level, production-hardened code and features that rival top-tier commercial products.

## Core Interaction Paradigm: Dual-View & Mastra Orchestration

The platform employs a **Dual-View** interaction model seamlessly managed by a **Mastra Orchestration Layer**. Users are not forced into a single mode of operation. There is equal emphasis on conversational and visual interactions. Users toggle between a **Unified Chat Shell** (the chat-first entry surface, enhanced with LibreChat UX paradigms) and the **Canvas** (direct manipulation of visual blocks).

The backend is powered by `@mastra/core` and `gemini-2.5-pro`. It acts as a **DAG Goal Deconstruction Engine**, translating user intents into fully wired React Flow blueprints using a stabilized 51-block vocabulary.

## Foundational Priorities (Achieved)

To realize this vision, the development sprints executed the following core architectural pillars:

1. **Imagination Canvas Kit & Shell Architecture:** Established the sovereign, production-grade spatial engine (`@iem/imagination-canvas-kit`) with a formal architecture. This includes a robust, heavily typed object model, foundational state management via Zustand, and a high-fidelity Shell (`CanvasShell`) that orchestrates responsive layout regions (Top Bar, Left Rail, Right Inspector) and establishes a strict Z-index layering model for infinite canvas interaction.
2. **Mastra Brain & Memory:** Transitioned from manual Vercel AI SDK loops to a formal Mastra `Agent` equipped with Postgres Memory persistence and OpenTelemetry observability.
3. **Workflow Compilation:** Eliminated client-side block scheduling. Canvases are now dynamically compiled into native Mastra `Workflows` and executed securely on the backend.
4. **The 51-Block System:** Scaffolded, validated, and implemented exactly 51 distinct blocks across 5 surfaces (Scribe, Playable, Atlas, Reel, Conductor/Forge). Every block strictly implements a universal `BlockDefinition` and natively bridges to Mastra Tools.
5. **Phase 7 Live Round-Robin Iteration Loop:** Enforced a rigorous definition of "Done." All features must pass a human-in-the-loop physical test, be technically extrapolated by an AI PM across all architectural layers, and be implemented via strict TDD.
6. **Custom Agent Flow:** Enabling users to dynamically construct and parameterize custom agentic blocks—defining their story, persona, context (RAG), and capabilities—directly from the UI, expanding the capabilities of the engine without writing code.
7. **Robust Persistence Layer:** Implementing a formal relational data model using Drizzle ORM to ensure data integrity, relational graph storage, and a production-grade local development experience via Docker.
8. **Playable Surface (Game Studio):** Implementing a live, collaborative multiplayer game studio environment featuring deterministic physics sync, enabling the canvas to transform into a playable world.
9. **Conductor Surface (Workflow Orchestration):** Evolving the canvas into a powerful, agentic workflow orchestrator featuring advanced DAG execution (conditionals, loops, exponential backoff) and deep integrations with productivity SaaS tools (Slack, Notion).
10. **Reel Surface (Generative Media):** Transforming the canvas into a generative media studio, allowing users to arrange prompts for images, audio, and dialogue on a temporal timeline to produce short films (e.g., an anime scene) through a robust rendering pipeline.
11. **Forge Surface (App Builder):** Transforming the canvas into a software forge where a chain of specialized agent blocks (Architect, Designer, Builder, Tester) collaboratively construct and test runnable mini-apps within a secure in-browser sandbox.
12. **Scribe Surface (Longform Writing):** Transforming the canvas into a longform writing studio utilizing a new `Manuscript` view mode, rich text editing via Tiptap, a linear revision track, and an automated export pipeline for EPUB, PDF, and Web formats. This replaces the initial "Atlas" concept.
13. **Monorepo Architecture:** Transitioning the repository to a strict monorepo layout using `pnpm` workspaces and `turbo` to isolate and concurrently develop the five distinct surfaces on top of a shared foundational substrate.
14. **Deployment Architecture:** Transitioning to a high-performance "forever free" edge architecture using Cloudflare Pages and Workers, coupled with strict GitHub Actions enforcing the TDD workflow.
15. **Documentation Primer System:** Establishing an automated, unified documentation system that scaffolds strict READMEs across all workspace directories, generates a semantic MAP.md, and maintains a unified `AGENTS.md` primer for AI CLI alignment.
16. **Demo Artifact Generation:** Creating rigorous, localized demo scripts for all five surfaces, compiling a comprehensive faculty brief, and scaffolding the Electrobun stretch-goal desktop wrapper.
17. **Exhaustive Block Scaffolding:** Providing automated CLI tooling (`pnpm iem:new-block`) accessible to both human engineers and AI agents to rapidly and consistently scaffold strict TDD-compliant MCP blocks across all surfaces.
18. **Exterior Integrations & The 95% Automation Playbook:** Operationalizing the "self-executing master doc" thesis by building an executable boot sequence (`pnpm iem:boot`), conversational Student Playbooks, a CLI automation suite, and Tier 1 exterior integrations via the Model Context Protocol (Google Workspace, Slack, Notion).
19. **Dependency Atlas & Hygiene Protocol:** Establishing a canonical dependency reference (`docs/DEPENDENCIES.md`) and enforcing an agentic hygiene protocol (`.agent/rules/dependencies.md`) to prevent bloat and mandate 4-point justifications for external module inclusion.
20. **Pre-commit Prevention & Secret Hygiene:** Enforcing a rigorous zero-trust secret management protocol using a canonical `.env.example` blueprint and automated `git-secrets` scanning within Husky/lint-staged pre-commit hooks to categorically prevent credential leakage.
21. **Runtime Secret Isolation:** Securing "Class B" secrets (OAuth tokens, external API keys) by encrypting them at rest in PostgreSQL using AES-256-GCM, managed by a dedicated `CredentialResolver` service that decrypts them only ephemerally in memory.
22. **Security Lifecycle & Detection:** Implementing continuous security monitoring via `auth_events` logging, an automated weekly `iem:security-audit` reporter, strict agent behavioral constraints (`.agent/rules/security.md`), and a mandated student onboarding protocol including a "Did You Leak?" drill.
23. **Zero-Tolerance Production Readiness (Final Polish):** Achieved the absolute completion criteria for the engine by eradicating all technical debt (stubs/mocks), implementing real-time multiplayer spatial synchronization via Yjs, and locking the entire "Intent-to-Execution" pipeline with a comprehensive Playwright E2E matrix.
24. **Balnce Message Fabric & Lane Segregation:** Evolved the internal event bridge into the strongly-typed, policy-aware Balnce Message Fabric. This "nervous system" introduces strict semantic routing lanes (e.g., `agent_stream`, `document_state`, `ui_projection`) to prevent canvas state conflation. It utilizes explicit `BalnceEnvelope` schemas and formal `NodeInputAdapterRegistry` boundaries to secure instruction promotion, while a new SSE-based UI Bridge provides unprecedented real-time visibility into DAG progress, tool calls, and trust evaluations.
25. **Durable Persistence & Approval Gating:** Transitioned the A2A Message Fabric from in-memory logging to a durable PostgreSQL-backed Event Log. This enables long-term replayability of agentic sessions and introduces a formal 'Approval Required' delivery class, allowing the engine to securely pause DAG execution for human verification before proceeding with sensitive actions.
26. **Edge Mesh & Distributed Routing:** Expanded the A2A Message Fabric to support distributed cloud-to-edge routing, utilizing a robust Gateway pattern and Redis Pub/Sub abstractions to seamlessly sync execution events across local instances and remote execution cells.
