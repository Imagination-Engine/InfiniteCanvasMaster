# 02 Execution Plan

## Planning Methodology

We divide execution into parallelized structural Tracks, aligning with the Conductor manifest. Each track must enforce the TDD loop, Red/Green/Refactor, and rigorous adversarial review.

---

### Track 1: Substrate Foundation & Dual-View (Phase A)

**Objective**: Solidify the base monorepo (pnpm/turbo) and establish the Chat <-> Canvas duality sync.

- **Task 1.1**: Finalize monorepo workspace configurations. Remove legacy `imagination-canvas/` dependencies into `apps/web` and `apps/server`.
- **Task 1.2**: Implement base Drizzle ORM schemas in `packages/db` for Users, Workspaces, Canvases, Nodes, and Edges.
- **Task 1.3**: Scaffold unified Chat Shell in `apps/web` using Vercel AI SDK (`useChat`).
- **Task 1.4**: Implement Liveblocks integration in `apps/web` for real-time presence.
- **Acceptance**: Turborepo builds clean. DB migration runs. Chat shell renders.

### Track 2: MCP Block Protocol & Agentic Harness (Phase A)

**Objective**: Refactor node logic into standard Model Context Protocol (MCP) tools.

- **Task 2.1**: Define base MCP Zod schemas in `packages/core`.
- **Task 2.2**: Migrate Python Autogen logic to Vercel AI TS handlers in `packages/agents`.
- **Task 2.3**: Build Custom Agent Workflow wizard (RAG + Prompt injection).
- **Acceptance**: Agent nodes execute deterministically. `autogen_exploration` can be safely removed.

### Track 3: Core Surfaces Initialization (Phase B)

**Objective**: Build out the discrete interaction paradigms.

- **Task 3.1 - Conductor (Surface B)**: Implement custom DAG scheduler, conditionals, loops.
- **Task 3.2 - Forge (Surface D)**: Wire WebContainers API into the canvas node for browser execution.
- **Task 3.3 - Scribe (Surface E)**: Integrate Tiptap editor and revision state tracking.
- **Task 3.4 - Playable (Surface A)**: Mount Phaser 4 canvas within a React Flow/tldraw node boundary.
- **Task 3.5 - Reel (Surface C)**: Implement temporal timeline component and FFmpeg rendering path.
- **Acceptance**: Each surface can mount independently and sync data to Liveblocks and Postgres.

### Track 4: Production Hardening & Automation (Phase C)

**Objective**: Secure data, optimize deployments, test at scale.

- **Task 4.1**: Implement AES-256-GCM encryption resolver for OAuth tokens.
- **Task 4.2**: Configure GitHub Actions for CI/CD to Cloudflare Pages/Workers.
- **Task 4.3**: Enforce Husky pre-commit hooks for secret prevention.
- **Task 4.4**: Generate E2E Playwright test suite for Dual-View toggling.
- **Acceptance**: Zero plaintext secrets. CI passes. E2E coverage > 80% for critical paths.
