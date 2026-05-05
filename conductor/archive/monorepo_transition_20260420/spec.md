# Specification: Monorepo Transition & Turbo Orchestration

## 1. Overview

This track restructures the repository into a high-velocity monorepo (Section 17 of the Master Plan). It establishes the necessary isolation for five students to work concurrently on their respective surfaces without causing merge conflicts, while sharing a common core substrate.

## 2. Functional Requirements

### 2.1 Workspace Architecture (pnpm)

- **Setup:** Initialize `pnpm workspaces` across the repository.
- **Directory Structure:** Create the structured directories defined in the Master Plan:
  - `apps/web` (The main application shell)
  - `apps/server` (The backend API)
  - `packages/core` (Block Protocol, Agent Runtime)
  - `packages/ui` (Shared shadcn components)
  - `packages/db` (Drizzle schema)
  - `packages/surface-*` (The 5 individual student surfaces)

### 2.2 Build Orchestration (Turborepo)

- **Integration:** Install and configure `turbo` to orchestrate parallel tasks (`lint`, `typecheck`, `test`, `build`) across all workspaces.
- **Caching:** Configure the `turbo.json` pipeline to leverage aggressive caching to keep CI/CD times minimal.

### 2.3 Collaboration Infrastructure

- **Open Ownership:** Create a `.github/CODEOWNERS` file configured for an "Open Ownership" model to prioritize speed during the capstone, while still loosely defining the conceptual boundaries.
- **PR Templates:** Create standard Pull Request templates that explicitly require developers to check off the "Red, Green, Refactor, Adversarial" TDD steps.

## 3. Non-Functional Requirements

- **Disruption:** The transition must be atomic; all existing code must be successfully migrated into the new structure without breaking the current prototype build.
- **TDD:** Adhere to the strict 85% coverage "Red, Green, Refactor, Adversarial" workflow (focusing on ensuring tests pass across all workspace boundaries).

## 4. Out of Scope

- Actually implementing the code for the new surfaces; this track only creates the scaffolded folders and package.json files for them.
