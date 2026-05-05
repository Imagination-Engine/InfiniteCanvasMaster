# Imagination Engine - Agent Primer

Welcome. You are operating within the Imagination Engine monorepo. This document serves as your foundational context.

## Architecture Overview

The Imagination Engine is a unified, agentic canvas substrate designed to support five distinct interactive expressions:

- **Surface A (Playable):** Multiplayer game studio (`packages/surface-playable`)
- **Surface B (Conductor):** Workflow orchestrator (`packages/surface-conductor`)
- **Surface C (Reel):** Generative media studio (`packages/surface-reel`)
- **Surface D (Forge):** App builder and sandbox (`packages/surface-forge`)
- **Surface E (Atlas):** Knowledge graph and RAG (`packages/surface-atlas`)

The core architecture consists of:

- `apps/web`: React/Vite frontend using a custom InfiniteViewport engine.
- `apps/server`: Hono/Node.js orchestration layer.
- `packages/core`: Core primitives, Block Protocol, and Scheduler.
- `packages/db`: Drizzle ORM schema.
- `packages/ui`: Shared UI components.

## TDD Workflow

We operate on a strict Red/Green/Refactor/Adversarial workflow:

1. **Red:** Write failing tests first.
2. **Green:** Write minimal code to pass tests.
3. **Refactor:** Clean up code while keeping tests green.
4. **Adversarial:** Add tests designed to break the logic (e.g., edge cases, limits).

## Workspace Documentation

For specific details on any package, consult its local README:

- [Web App](./apps/web/README.md)
- [Server](./apps/server/README.md)
- [Core](./packages/core/README.md)
- [Playable](./packages/surface-playable/README.md)
- [Conductor](./packages/surface-conductor/README.md)
- [Reel](./packages/surface-reel/README.md)
- [Forge](./packages/surface-forge/README.md)
- [Atlas](./packages/surface-atlas/README.md)

```bash
# Example command reference
pnpm install
npx turbo run build test lint
```
