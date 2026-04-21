# Implementation Plan: Advanced Data Model & Persistence Layer

## Phase 1: Local Dev & Infrastructure
- [x] Task: Provision the local PostgreSQL + pgvector environment.
    - [x] Sub-task: Red (Write shell script tests verifying DB connectivity)
    - [x] Sub-task: Green (Create `docker-compose.yml` and `pnpm db:start` scripts)
    - [x] Sub-task: Refactor (Optimize Docker image sizes and startup times)
- [x] Task: Set up Drizzle ORM and Drizzle Kit.
    - [x] Sub-task: Red (Write tests confirming Drizzle instance creation and connection)
    - [x] Sub-task: Green (Install dependencies and configure `drizzle.config.ts`)
- [x] Task: Conductor - User Manual Verification 'Phase 1: Local Dev & Infrastructure' (Protocol in workflow.md)

## Phase 2: Schema Definition & Migrations
- [ ] Task: Define the core schema (`users`, `sessions`, `messages`, `custom_agents`) in Drizzle.
    - [ ] Sub-task: Red (Write repository-level tests for CRUD operations on these entities)
    - [ ] Sub-task: Green (Implement schemas and generate initial migrations)
    - [ ] Sub-task: Refactor (Clean up schema definitions and export types)
    - [ ] Sub-task: Adversarial (Write tests attempting to violate unique constraints, e.g., duplicate emails)
- [ ] Task: Define the normalized Graph schema (`canvases`, `blocks`, `edges`).
    - [ ] Sub-task: Red (Write tests verifying foreign key constraints and cascade deletes)
    - [ ] Sub-task: Green (Implement relational graph tables and generate migrations)
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Schema Definition & Migrations' (Protocol in workflow.md)

## Phase 3: Seeding & Data Access Layer
- [ ] Task: Implement the database seeder.
    - [ ] Sub-task: Red (Write tests verifying the database is populated after the script runs)
    - [ ] Sub-task: Green (Implement `pnpm db:seed` creating a demo user, session, and wired canvas)
    - [ ] Sub-task: Refactor (Abstract seed logic into reusable factory functions)
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Seeding & Data Access Layer' (Protocol in workflow.md)