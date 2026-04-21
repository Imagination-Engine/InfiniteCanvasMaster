# Initial Concept
There are 3 documents in the /docs folder, 00, 01, and 02. Document 00 is the foundational document, but 01 and 02 are deeply interlinked. The objective, tasks, outline, narrative spine, and all details for this project are contained within. Confirm?

## Product Vision
The Imagination Engine is a unified, agentic canvas substrate designed to support five distinct interactive expressions (Playable, Conductor, Reel, Forge, and an Open Slot). It transforms a standard node-based canvas into an elite, multi-surface studio.

## Target Audience & Quality Standard
The primary audience is **everyday people**. We do not design for a niche subset; the platform must be universally accessible and intuitive. To achieve this, the underlying architecture must consist of comprehensive, elite-level, production-hardened code and features that rival top-tier commercial products.

## Core Interaction Paradigm: Dual-View
The platform employs a **Dual-View** interaction model. Users are not forced into a single mode of operation. Instead, there is equal emphasis on both conversational and visual interactions, allowing users to seamlessly toggle between a **Unified Chat Shell** (the chat-first entry surface) and the **Canvas** (direct manipulation of visual blocks). The transition is managed via **Session Duality**, where a canvas is materialized lazily as the conversation evolves.

## Foundational Priorities
To realize this vision, the initial development sprints will prioritize four core architectural pillars:
1. **Chat Shell & Duality:** Building the chat-first entry surface and establishing the deep bidirectional sync between the chat session and the canvas runtime.
2. **Persistent Organization:** Implementing the Navigation Sidebar, Session History (List/Grid), and the Creations Drawer to ensure users can seamlessly organize and relaunch their work.
3. **Block Protocol:** Refactoring the existing hardcoded node types into a standard, composable protocol, allowing them to function as true MCP (Model Context Protocol) tools that can be utilized by external agents.
4. **Collaboration Infrastructure:** Establishing an elite monorepo layout, strict workspaces, and a robust TDD (Test-Driven Development) harness to ensure the engineering team can build all five surfaces concurrently without friction.
5. **Custom Agent Flow:** Enabling users to dynamically construct and parameterize custom agentic blocks—defining their story, persona, context (RAG), and capabilities—directly from the UI, expanding the capabilities of the engine without writing code.
6. **Robust Persistence Layer:** Implementing a formal relational data model using Drizzle ORM to ensure data integrity, relational graph storage, and a production-grade local development experience via Docker.
7. **Playable Surface (Game Studio):** Implementing a live, collaborative multiplayer game studio environment featuring deterministic physics sync, enabling the canvas to transform into a playable world.
8. **Conductor Surface (Workflow Orchestration):** Evolving the canvas into a powerful, agentic workflow orchestrator featuring advanced DAG execution (conditionals, loops, exponential backoff) and deep integrations with productivity SaaS tools (Slack, Notion).
9. **Reel Surface (Generative Media):** Transforming the canvas into a generative media studio, allowing users to arrange prompts for images, audio, and dialogue on a temporal timeline to produce short films (e.g., an anime scene) through a robust rendering pipeline.