# Implementation Plan: Deployment & CI/CD Hardening

## Phase 1: Edge Backend (Hono + Cloudflare Worker)
- [x] Task: Transition the `apps/server` Express backend to a Hono/Cloudflare Worker architecture.
    - [x] Sub-task: Red (Write API endpoint tests using `app.request()` without spinning up a full server)
    - [x] Sub-task: Green (Implement `src/index.ts` with Hono routing and the Cloudflare Worker entry point)
    - [x] Sub-task: Refactor (Extract route handlers into separate modules)
    - [x] Sub-task: Adversarial (Write tests asserting the `nodejs_compat` compatibility flag in `wrangler.toml`)
- [x] Task: Conductor - User Manual Verification 'Phase 1: Edge Backend (Hono + Cloudflare Worker)' (Protocol in workflow.md)

## Phase 2: Database Connectivity & Hyperdrive
- [x] Task: Configure Drizzle ORM and Postgres to utilize Cloudflare Hyperdrive.
    - [x] Sub-task: Red (Write integration tests mocking the Hyperdrive `connectionString` binding)
    - [x] Sub-task: Green (Implement the database connection utilizing the `c.env.HYPERDRIVE` context)
    - [x] Sub-task: Refactor (Ensure `c.executionCtx.waitUntil(client.end())` is properly implemented for connection cleanup)
- [x] Task: Conductor - User Manual Verification 'Phase 2: Database Connectivity & Hyperdrive' (Protocol in workflow.md)

## Phase 3: CI/CD Pipeline (GitHub Actions)
- [x] Task: Implement the rigorous CI workflow and deployment configurations.
    - [x] Sub-task: Red (Write tests verifying the existence and basic YAML syntax of the workflow files)
    - [x] Sub-task: Green (Create `.github/workflows/ci.yml` utilizing `actions/setup-node` and `pnpm install`, executing `npx turbo run build test lint`)
    - [x] Sub-task: Refactor (Configure Turborepo caching within the GitHub Action to reduce build times)
    - [x] Sub-task: Adversarial (Write a test script that intentionally fails a test to ensure the CI pipeline accurately returns a non-zero exit code)
- [x] Task: Configure the Cloudflare Pages deployment settings for `apps/web`.
- [x] Task: Conductor - User Manual Verification 'Phase 3: CI/CD Pipeline (GitHub Actions)' (Protocol in workflow.md)