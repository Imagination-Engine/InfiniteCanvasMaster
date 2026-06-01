# 01 System Map

## Mission Restatement

The Imagination Engine is a unified, agentic canvas substrate providing a Dual-View interaction model (Unified Chat Shell + Canvas). It hosts five distinct interactive surfaces (Playable, Conductor, Reel, Forge, Scribe) to act as a world-class workspace. Our target standard is production-grade, highly resilient code that gracefully manages AI orchestration, real-time collaboration, and dense data manipulation across Edge boundaries.

## Architecture Boundaries

### Applications (`apps/`)

- **`web`**: Primary React + Vite SPA. Employs `shadcn/ui`, `Tailwind`, `Framer Motion`. Integrates Dual-View paradigm.
- **`server`**: Core API and Agent Runtime. Transitioned to Hono + Cloudflare Workers for Edge performance.
- **`desktop`**: Stretch goal wrapper utilizing Electrobun for local-first embedded runtime.

### Packages (`packages/`)

- **`core`**: Shared utilities, orchestrator abstractions, base MCP protocols, error boundaries.
- **`db`**: Drizzle ORM schema, migrations, connection proxies for Postgres + pgvector. Encrypted field resolvers.
- **`ui`**: Shared design system components, strict accessibility implementation.
- **`agents`**: Vercel AI SDK wrappers, custom Model Context Protocol (MCP) tool bindings.
- **Surfaces**:
  - `surface-playable`: Phaser 4 + Enable3D web game studio logic.
  - `surface-conductor`: Advanced DAG execution, conditional routing, integration webhooks.
  - `surface-reel`: Temporal media arrangement, FFmpeg video stitching.
  - `surface-forge`: WebContainers browser-based Node sandbox + LLM coder agents.
  - `surface-scribe`: Tiptap rich-text editing, revision history, export toolchains (EPUB/PDF).

## Flow & State

- **Primary Data Store:** PostgreSQL via Cloudflare Hyperdrive.
- **Encryption:** AES-256-GCM for "Class B" secrets at rest.
- **Vector Search:** `pgvector` for context/RAG on custom agents.
- **Real-Time Sync:** Liveblocks for multiplayer presence and canvas state synchronization.
- **Canvas Engines:** React Flow (legacy/current) transitioning/coexisting with `tldraw`.

## Completeness Gap Analysis

1. **Monorepo Migration**: Repositories appear partially migrated (e.g., `imagination-canvas` folder vs `apps/web`). `packages` are initialized but empty of detailed documentation per MAP.
2. **Surfaces**: Most surfaces (Playable, Reel, Forge, Scribe, Conductor) are initialized in concept and package structure but lack deep implementation wiring.
3. **Secret Hygiene**: Hooks are present but require rigorous validation against `.env.example`.
4. **Agent Harness**: Previous Python/Autogen code (`autogen_exploration/`) exists but needs formal deprecation as Vercel AI SDK in TS takes over.

## Known Risks

- Transitioning from legacy React Flow to tldraw while maintaining state compatibility.
- Syncing state between Chat Shell (Vercel AI streaming) and Canvas (Liveblocks).
- Edge computing constraints (Cloudflare Workers) vs heavy DAG orchestrations.
