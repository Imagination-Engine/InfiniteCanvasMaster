# Implementation Plan: Monorepo Transition & Turbo Orchestration

## Phase 1: Workspace Scaffolding
- [ ] Task: Initialize `pnpm` workspaces and Turborepo.
    - [ ] Sub-task: Red (Write shell tests verifying the absence of existing legacy lockfiles)
    - [ ] Sub-task: Green (Create `pnpm-workspace.yaml`, `turbo.json`, and the root `package.json`)
    - [ ] Sub-task: Refactor (Clean up root dependencies)
- [ ] Task: Scaffold the package directories (`apps/*`, `packages/*`).
    - [ ] Sub-task: Red/Green/Refactor for creating the directories and their base `package.json` files.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Workspace Scaffolding' (Protocol in workflow.md)

## Phase 2: Code Migration
- [ ] Task: Move existing frontend code into `apps/web`.
    - [ ] Sub-task: Red (Write tests verifying paths before move)
    - [ ] Sub-task: Green (Execute `mv` commands and update internal imports)
    - [ ] Sub-task: Refactor (Verify the Vite build succeeds in the new location)
- [ ] Task: Move existing backend code into `apps/server`.
    - [ ] Sub-task: Red/Green/Refactor for the backend migration.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Code Migration' (Protocol in workflow.md)

## Phase 3: Collaboration Tools
- [ ] Task: Implement the Github collaboration infrastructure.
    - [ ] Sub-task: Red (Write tests verifying the existence of `.github` files)
    - [ ] Sub-task: Green (Create `CODEOWNERS` (Open mode) and `pull_request_template.md`)
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Collaboration Tools' (Protocol in workflow.md)