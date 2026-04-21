# Technology Stack

The Imagination Engine capstone project employs a modern, hybrid architecture designed to support the multi-surface agentic canvas while accommodating advanced AI runtimes and high-performance requirements.

## Frontend & Presentation Layer
- **Core Framework:** React + Vite + TypeScript. This provides a fast, modern, and type-safe SPA experience.
- **Styling:** Tailwind CSS for rapid, utility-first UI development that aligns with our vibrant and accessible design guidelines.
- **Canvas Engines:**
  - **React Flow:** The current foundational node-based canvas implementation, retained for stability in the short term.
  - **tldraw:** Introduced as a parallel or transitional canvas engine to pave the way for the sovereign product's future path.
- **Animation:** **Framer Motion** will be utilized to deliver the fluid, playful, and engaging UX required by the product guidelines.

## Backend & Agent Runtime
To handle both standard web requests and heavy AI workloads, the backend utilizes a polyglot microservice approach:
- **Core Application Server:** Node.js + Express + TypeScript. Maintains the current stable backend routing and standard API endpoints.
- **High-Performance Services:** Node.js + Fastify + TypeScript. Utilized for components requiring higher throughput or lower latency (e.g., real-time canvas syncing).
- **Agentic / AI Runtime:** Python + FastAPI. Dedicated infrastructure for the Agent Runtime, LLM orchestration, and complex Python-native AI integrations (e.g., the Autogen exploration).
- **Block Protocol / MCP Integration:** TypeScript + `@modelcontextprotocol/sdk` + `zod`. Node implementations are decoupled into composable Model Context Protocol blocks with strict Zod schema validations for inputs and outputs.

## Database & Persistence
- **Primary Data Store:** PostgreSQL. Provides robust relational data integrity for users, workspaces, and canvas states.
- **ORM:** Drizzle ORM. Ensures strict, end-to-end type safety from the database schema up to the TypeScript APIs.

## Testing & Quality Assurance
- **Unit & Integration Testing:** Vitest. Provides a fast, Vite-native testing environment for core logic and components.
- **E2E Testing:** Playwright. Utilized for verifying high-level user flows and canvas interactions.
- **Workflow:** Strict Test-Driven Development (TDD) following the Red/Green/Refactor/Adversarial cycle.