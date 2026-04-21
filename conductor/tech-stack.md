# Technology Stack

The Imagination Engine capstone project employs a modern, hybrid architecture designed to support the multi-surface agentic canvas while accommodating advanced AI runtimes and high-performance requirements.

## Frontend & Presentation Layer
- **Core Framework:** React + Vite + TypeScript. This provides a fast, modern, and type-safe SPA experience.
- **Styling:** Tailwind CSS for rapid, utility-first UI development that aligns with our vibrant and accessible design guidelines.
- **Chat & UI Components:** **Vercel AI SDK** (`ai` package) for streaming chat primitives, and **shadcn/ui** (copied components) for consistent, accessible interface elements.
- **Onboarding & Layout:** **Embla Carousel** for fluid, touch-friendly onboarding and instructional carousels.
- **Canvas Engines:**
  - **React Flow:** The current foundational node-based canvas implementation, retained for stability in the short term.
  - **tldraw:** Introduced as a parallel or transitional canvas engine to pave the way for the sovereign product's future path.
- **Animation:** **Framer Motion** will be utilized to deliver the fluid, playful, and engaging UX required by the product guidelines.
- **Advanced Game Engine (Surface A):**
  - **Phaser 4 & WebGL 2:** Core engine for high-performance game rendering.
  - **Enable3D:** Integration for 3D depth and objects within Phaser.
  - **Matter.js & Spine 2D:** Physics and skeletal animations integration.

## Orchestration & Integrations (Surface B)
- **Advanced DAG Scheduler:** Custom execution engine supporting cyclic dependencies detection, exponential backoff retries, conditional routing (`If`), and looping (`ForEach`).
- **SaaS Tool Bindings:** Composable MCP tools orchestrating remote services, initially targeting Web Fetch, Slack, and Notion APIs.

## Generative Media & Rendering (Surface C)
- **Media Providers:** Integration with Nanobanana (TextToImage) and ElevenLabs (TextToSpeech) via MCP bindings.
- **Render Pipeline:** Robust video stitching pipeline utilizing FFmpeg (evaluating Node.js worker or client-side WASM) to compile ordered scenes and overlay audio into MP4 artifacts.

## App Builder & Sandbox (Surface D)
- **LLM Integration:** Specific integration with **Gemini 3.5 Pro** for advanced code generation within the Builder agent block.
- **Execution Sandbox:** **WebContainers API** utilized to run a full, secure Node.js environment directly within the browser, enabling compilation and hosting of generated mini-apps.
- **State Management:** A custom Blackboard state manager ensuring immutable, shared structured data across parallel agent nodes during the build process.

## Real-Time Collaboration
- **Presence & Sync:** **Liveblocks** is utilized for real-time multiplayer presence (cursors, selections, and editing locks) and state synchronization across clients.

## Backend & Agent Runtime
To handle both standard web requests and heavy AI workloads, the backend utilizes a polyglot microservice approach:
- **Core Application Server:** Node.js + Express + TypeScript. Maintains the current stable backend routing and standard API endpoints.
- **High-Performance Services:** Node.js + Fastify + TypeScript. Utilized for components requiring higher throughput or lower latency (e.g., real-time canvas syncing).
- **Agentic / AI Runtime:** Python + FastAPI. Dedicated infrastructure for the Agent Runtime, LLM orchestration, and complex Python-native AI integrations (e.g., the Autogen exploration).
- **Block Protocol / MCP Integration:** TypeScript + `@modelcontextprotocol/sdk` + `zod`. Node implementations are decoupled into composable Model Context Protocol blocks with strict Zod schema validations for inputs and outputs.

## Database & Persistence
- **Primary Data Store:** PostgreSQL. Provides robust relational data integrity for users, workspaces, and canvas states.
- **Vector Search (RAG):** `pgvector` extension for PostgreSQL combined with Gemini Embeddings to power context-aware knowledge retrieval for Custom Agents.
- **ORM:** Drizzle ORM. Ensures strict, end-to-end type safety from the database schema up to the TypeScript APIs.

## Testing & Quality Assurance
- **Containerization:** Docker & Docker Compose. Provisions the local PostgreSQL + pgvector environment to ensure development parity.
- **Unit & Integration Testing:** Vitest. Provides a fast, Vite-native testing environment for core logic and components.
- **E2E Testing:** Playwright. Utilized for verifying high-level user flows and canvas interactions.
- **Workflow:** Strict Test-Driven Development (TDD) following the Red/Green/Refactor/Adversarial cycle.