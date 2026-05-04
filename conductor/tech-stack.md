# Technology Stack

The Imagination Engine capstone project employs a modern, hybrid architecture designed to support the multi-surface agentic canvas while accommodating advanced AI runtimes and high-performance requirements.

## Frontend & Presentation Layer

- **Core Framework:** React + Vite + TypeScript. This provides a fast, modern, and type-safe SPA experience.
- **Imagination Canvas Kit (`@iem/imagination-canvas-kit`):** A sovereign, production-grade spatial engine implementing a **Rich Semantic Object Model**, foundational state management (Zustand), a modular shell architecture, a specialized Viewport Engine, a high-fidelity **Selection & Transformation Engine**, robust **Native Interactions** (creation via paste/drop), **Rich Embedded Content** blocks equipped with deep event isolation, advanced **Spatial Organization Algorithms**, a **Framer Motion Choreography Engine** enabling seamless, state-preserving expansion transitions, the **Spatial Agent Interaction Layer** comprising the `agentTaskStore`, **Mutation Preview** hooks, and **Streaming Choreography** components, the **History & Persistence Engine** (`useHistoryStore`, `useAutosave`) for transactional Undo/Redo and snapshotting, the **Collaboration & Presence Engine** managing semantic spatial comments and multi-actor cursor/viewport syncing, a comprehensive **Touch Gesture Engine** optimizing interactions and hit targets for mobile and tablet parity, and a standardized **Semantic Design Token Map** managing density modes, motion fallbacks, and agent status stylings.
- **Styling:** Tailwind CSS for rapid, utility-first UI development that aligns with our vibrant and accessible design guidelines.
- **Chat Interaction Kit:** A dedicated, internal package (`@iem/chat-interaction-kit`) providing a production-grade extraction of mature chat UX paradigms (e.g., LibreChat). This ensures stable auto-scrolling, native Markdown parsing, smooth composer growth, and dynamic tool-call visualizers, completely replacing iframe-based legacy approaches.
- **Chat Primitives:** **Vercel AI SDK** (`ai` package) mapped through our custom `ChatShell` for streaming text and tool payloads.
- **Onboarding & Layout:** **Embla Carousel** for fluid, touch-friendly onboarding and instructional carousels.
- **Canvas Engines:**
  - **React Flow:** The current foundational node-based canvas implementation, retained for stability in the short term.
  - **tldraw:** Introduced as a parallel or transitional canvas engine to pave the way for the sovereign product's future path.
- **Workspace Orchestration:**
  - **pnpm Workspaces:** Strict dependency isolation and package management across the monorepo (`apps/*`, `packages/*`).
  - **Turborepo:** Orchestrates parallel builds, testing, and aggressive task caching across the monorepo.
  - **Dependency Atlas Governance:** Strict adherence to the monorepo dependency ledger (`docs/DEPENDENCIES.md`), enforced by the agent rules framework to prevent module bloat.
- **Animation:** **Framer Motion** will be utilized to deliver the fluid, playful, and engaging UX required by the product guidelines.
- **State Management:** **Zustand** is utilized for lightweight, high-performance state management within the Imagination Canvas Kit, including local persistence for canvas, viewport, and shell layout states.
- **Schema Validation:** **Zod** is used for strict runtime validation of the entire canvas taxonomy, including expansion modes, provenance descriptors, and complex semantic relationships.
- **Desktop Wrapper (Stretch Goal):** **Electrobun** is utilized to scaffold the baseline build configuration to wrap the Vite frontend and embed the local Node.js backend.
- **Advanced Game Engine (Surface A):**
  - **Phaser 4 & WebGL 2:** Core engine for high-performance game rendering.
  - **Enable3D:** Integration for 3D depth and objects within Phaser.
  - **Matter.js & Spine 2D:** Physics and skeletal animations integration.

## Orchestration & Integrations (Surface B)

- **Advanced DAG Scheduler:** Custom execution engine supporting cyclic dependencies detection, exponential backoff retries, conditional routing (`If`), and looping (`ForEach`).
- **SaaS Tool Bindings:** Composable MCP tools orchestrating remote services, initially targeting Web Fetch, Slack, and Notion APIs.

## Exterior Integrations & Automation

- **Tier 1 MCP Servers:** Dedicated MCP server implementations for external platforms including Google Workspace (Gmail, Calendar) to enable autonomous agent interactions.
- **CLI Automation Suite:** Custom Node.js CLI suite (`commander`, `inquirer`) providing `iem:*` commands, wrapped as executable MCP tools for the agent. **Gap Tracking Tooling:** Features a strict schema parser and verification engine (`gap-tracker`, `gap-verifier`) ensuring robust "Zero-Tolerance Production Readiness" enforcement across the workspace.

## Generative Media & Rendering (Surface C)

- **Media Providers:** Integration with Nanobanana (TextToImage) and ElevenLabs (TextToSpeech) via MCP bindings.
- **Render Pipeline:** Robust video stitching pipeline utilizing FFmpeg (evaluating Node.js worker or client-side WASM) to compile ordered scenes and overlay audio into MP4 artifacts.

## App Builder & Sandbox (Surface D)

- **LLM Integration:** Specific integration with **Gemini 3.5 Pro** for advanced code generation within the Builder agent block.
- **Execution Sandbox:** **WebContainers API** utilized to run a full, secure Node.js environment directly within the browser, enabling compilation and hosting of generated mini-apps.
- **State Management:** A custom Blackboard state manager ensuring immutable, shared structured data across parallel agent nodes during the build process.

## Longform Writing & Publishing (Surface E - Scribe)

- **Rich Text Editing:** Integration with **Tiptap** for robust, extensible rich text capabilities within Prose and Chapter blocks.
- **Revision Tracking:** Linear revision history persistence utilizing Postgres `jsonb` arrays.
- **Publishing Pipeline:** Automated export toolchain utilizing `epub-gen` (for EPUB) and `Puppeteer` + `Paged.js` (for PDF/Print formatting).

## Real-Time Collaboration

- **Presence & Sync:** **Liveblocks** is utilized for real-time multiplayer presence (cursors, selections, and editing locks) and state synchronization across clients.

## Backend & Agent Runtime

To handle both standard web requests and heavy AI workloads, the backend utilizes a robust orchestration framework:

- **Core Application Server:** Node.js + Hono. Provides the HTTP layer for API endpoints and WebSocket handlers.
- **Mastra Orchestration (`@mastra/core`):** The primary brain of the Imagination Engine. Mastra manages Agent instantiation, handles dynamic workflow DAG compilation (`compileGraphToWorkflow`), and persists session thread memory.
- **Balnce Message Fabric:** A highly structured messaging layer utilizing typed `v2` envelopes, strict semantic routing lanes, and a dedicated `FabricRouter`. Governed by an `A2APolicyEngine` and `NodeInputAdapterRegistry`, it orchestrates multiple specialized transports (In-Process, SSE Projection) and securely enforces boundaries between standard execution, collaborative document state, and durable event logging.
- **Distributed Edge Mesh:** The A2A Fabric is extended with a robust `A2AGateway` router and `RedisA2ATransport` abstractions, enabling seamless cross-process and cloud-to-edge message delivery.
- **Vercel AI SDK:** Retained primarily as the Edge-compatible transport and streaming layer, utilized on the frontend (`useChat`) and integrated within Mastra.
- **Model Context Protocol (MCP) & Mastra Tools:** TypeScript + `zod`. Legacy blocks have been bridged into native Mastra Tools via the `createMastraToolFromBlock` adapter, ensuring strict input/output validation.
- **Google Gemini API:** `gemini-2.5-pro` is the designated intelligence model driving the DAG Goal Deconstruction Engine.

## Database & Persistence

- **Primary Data Store:** PostgreSQL. Provides robust relational data integrity for users, workspaces, and canvas states.
- **A2A Event Logs & Approvals:** Dedicated PostgreSQL tables for `a2a_event_logs` and `a2a_approvals` to support the durable messaging layer and persistent human-in-the-loop gating.
- **Encrypted Storage:** AES-256-GCM authenticated encryption utilizing Node.js `crypto` primitives to secure "Class B" secrets at rest.
- **Connection Pooling:** Cloudflare Hyperdrive. Proxies and accelerates database connections between the Edge Worker and the Postgres database.
- **Vector Search (RAG):** `pgvector` extension for PostgreSQL combined with Gemini Embeddings to power context-aware knowledge retrieval for Custom Agents.
- **ORM:** Drizzle ORM. Ensures strict, end-to-end type safety from the database schema up to the TypeScript APIs.
- **Security Monitoring:** Dedicated `auth_events` schema tracking logins and an automated CLI reporting system (`iem:security-audit`).

## Testing & Quality Assurance

- **Containerization:** Docker & Docker Compose. Provisions the local PostgreSQL + pgvector environment to ensure development parity.
- **Unit & Integration Testing:** Vitest. Provides a fast, Vite-native testing environment for core logic and components.
- **E2E Testing:** Playwright. Utilized for verifying high-level user flows and canvas interactions.
- **Workflow:** Strict Test-Driven Development (TDD) following the Red/Green/Refactor/Adversarial cycle.
- **CI/CD Pipeline:** GitHub Actions. Enforces PR gates, runs parallel Turbo tasks, and automates deployment to Cloudflare.
- **Pre-commit Hooks:** Husky + `lint-staged`. Enforces automated formatting (Prettier), linting (ESLint), and custom regex-based secret scanning (`git-secrets` equivalent) before any code enters the repository.
