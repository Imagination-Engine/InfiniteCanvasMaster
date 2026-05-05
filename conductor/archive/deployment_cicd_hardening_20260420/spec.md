# Specification: Deployment & CI/CD Hardening

## 1. Overview

This track implements the deployment architecture and Continuous Integration pipeline (Sections 18, 19, and 22 of the Master Plan). It transitions the project to a high-performance, "forever free" edge architecture utilizing the Cloudflare ecosystem, and establishes strict GitHub Actions to enforce the "Red, Green, Refactor, Adversarial" TDD workflow across the student team.

## 2. Functional Requirements

### 2.1 The Free Edge Architecture (Cloudflare)

- **Frontend Hosting:** Configure the React/Vite application (`apps/web`) to deploy automatically to **Cloudflare Pages** upon pushes to the main branch.
- **Backend Hosting:** Migrate the Node.js API (`apps/server`) to run on the Edge as a **Cloudflare Worker** utilizing the lightweight `Hono` framework instead of Express.
- **Database Connection Pooling:** Implement **Cloudflare Hyperdrive** to proxy and accelerate the database connection between the Edge Worker and the external free-tier Postgres database (e.g., Neon or Supabase).

### 2.2 CI/CD Pipeline (GitHub Actions)

- **PR Gates:** Implement a GitHub Action workflow that runs on all Pull Requests to the `main` branch.
- **Turbo Orchestration:** The workflow must utilize Turborepo (`npx turbo run build test lint`) to execute the pipeline efficiently.
- **Enforcement:** The pipeline must strictly enforce the 85% test coverage requirement; PRs failing this gate are blocked from merging.

## 3. Non-Functional Requirements

- **Compatibility:** Ensure the Drizzle ORM and Postgres driver are configured with the `nodejs_compat` flag to operate successfully within the Cloudflare Worker V8 isolate environment.
- **Developer Experience:** The CI pipeline must provide fast feedback loops using Turbo caching.

## 4. Out of Scope

- Actually migrating the code; this track sets up the _infrastructure configurations_ (`wrangler.toml`, `.github/workflows`, environment variables).
