# Balnce AI Imagination Engine

Welcome to the **Imagination Engine**—a premium, futuristic, decentralized personal AI platform built by Balnce AI. The Imagination Engine is a unified, agentic canvas substrate designed to support multiple interactive expressions and workflows, helping you unlock your unlimited digital potential.

## Architecture Overview

This project is a modern monorepo managed with `pnpm` and `turbo`. It is built to support robust agentic orchestration, hybrid intelligence (local and cloud), and strict isolation.

### Applications (`apps/`)

- **`apps/web`**: The frontend React/Vite application utilizing React Flow for the infinite canvas, TailwindCSS for styling, and Zustand for state management.
- **`apps/server`**: The backend API orchestrator using Hono/Cloudflare Workers and Express.

### Packages (`packages/`)

- **`surface-playable`**: Surface A - Multiplayer game studio.
- **`surface-conductor`**: Surface B - Workflow orchestrator.
- **`surface-reel`**: Surface C - Generative media studio.
- **`surface-forge`**: Surface D - App builder and sandbox layer.
- **`surface-atlas`**: Surface E - Knowledge graph and RAG.
- **`core`**: Core primitives, Block Protocol, and Scheduler.
- **`db`**: Drizzle ORM schema and PostgreSQL database setup.
- **`ui`**: Shared UI components.
- **`agents`**: Agent definitions and orchestration logic.

## Prerequisites

Before running the Imagination Engine, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v20+ recommended)
- [pnpm](https://pnpm.io/) (v8.15.5+): `npm install -g pnpm@8.15.5`
- [Docker & Docker Compose](https://www.docker.com/) (Required for supporting infrastructure)

## Setup Instructions

1. **Install Dependencies**
   Run the following command at the root of the repository to install all workspace dependencies:

   ```bash
   pnpm install
   ```

2. **Environment Configuration**
   Copy the example environment file to `.env`:

   ```bash
   cp .env.example .env
   ```

   Fill in the required values in `.env`. The file is split into different security classifications (e.g., Sovereign Secrets like `GEMINI_API_KEY`, Integration Tokens like `SLACK_BOT_TOKEN`, and safe Client variables).

3. **Database and Infrastructure (Docker)**
   Start the supporting infrastructure via Docker Compose. This spins up LibreChat, MongoDB, Meilisearch, Jaeger, and the MCP server:
   ```bash
   docker compose up -d
   ```
   _Optional: To initialize and seed the relational database (PostgreSQL via Drizzle):_
   ```bash
   pnpm --filter @iem/web db:generate
   pnpm --filter @iem/web db:push
   pnpm --filter @iem/web db:seed
   ```

## Running the Application Locally

With the dependencies installed and infrastructure running, start the development servers using Turbo:

```bash
pnpm dev
```

This command concurrently starts all `dev` tasks across the monorepo:

- **Frontend** (`apps/web`): Starts the Vite development server.
- **Backend** (`apps/server`): Starts the TSX watcher for the backend API.

## Testing & Workflow

The Imagination Engine team operates on a strict **Red/Green/Refactor/Adversarial** workflow. Write failing tests first, make them pass, refactor, and finally add tests designed to break the logic (e.g., edge cases).

Available Turbo commands:

- **Build all packages:** `pnpm run build --filter='!@iem/desktop'` (Note: The desktop app is currently excluded from standard builds due to dependency and environment configuration issues).
- **Run test suites:** `pnpm run test`
- **Lint the codebase:** `pnpm run lint`
- **Typecheck:** `pnpm run typecheck`

## Documentation

For specific details on any individual package or application, consult its local `README.md` (e.g., `apps/web/README.md`, `packages/surface-playable/README.md`).
