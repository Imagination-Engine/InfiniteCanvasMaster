# Implementation Plan: Monorepo Transition & Turbo Orchestration

## Phase 1: Workspace Scaffolding

- [x] Task: Initialize `pnpm` workspaces and Turborepo.
  - [x] Sub-task: Red (Write shell tests verifying the absence of existing legacy lockfiles)
  - [x] Sub-task: Green (Create `pnpm-workspace.yaml`, `turbo.json`, and the root `package.json`)
  - [x] Sub-task: Refactor (Clean up root dependencies)
- [x] Task: Scaffold the package directories (`apps/*`, `packages/*`).
  - [x] Sub-task: Red/Green/Refactor for creating the directories and their base `package.json` files.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Workspace Scaffolding' (Protocol in workflow.md)

## Phase 2: Code Migration

- [x] Task: Move existing frontend code into `apps/web`.
  - [x] Sub-task: Red (Write tests verifying paths before move)
  - [x] Sub-task: Green (Execute `mv` commands and update internal imports)
  - [x] Sub-task: Refactor (Verify the Vite build succeeds in the new location)
- [x] Task: Move existing backend code into `apps/server`.
  - [x] Sub-task: Red/Green/Refactor for the backend migration.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Code Migration' (Protocol in workflow.md)

## Phase 3: Collaboration Tools

- [x] Task: Implement the Github collaboration infrastructure.
  - [x] Sub-task: Red (Write tests verifying the existence of `.github` files)
  - [x] Sub-task: Green (Create `CODEOWNERS` (Open mode) and `pull_request_template.md`)
- [x] Task: Conductor - User Manual Verification 'Phase 3: Collaboration Tools' (Protocol in workflow.md)
