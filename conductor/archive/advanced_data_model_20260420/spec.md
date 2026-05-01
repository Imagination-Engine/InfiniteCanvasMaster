# Specification: Advanced Data Model & Persistence Layer

## 1. Overview

This track formalizes the persistence layer for the Imagination Engine (Section 11 of the Master Plan). It establishes full end-to-end type safety by migrating to Drizzle ORM and provisions the local development environment with Docker and robust seed scripts.

## 2. Functional Requirements

### 2.1 Full Drizzle ORM Implementation

- **Schema Definition:** Define all core tables (`users`, `sessions`, `messages`, `canvases`, `canvas_executions`, `custom_agents`) strictly using Drizzle ORM schema definitions.
- **Migration:** Convert any existing raw SQL migrations to Drizzle-authored migrations.

### 2.2 Relational Graph Storage

- **Normalization:** Instead of a single JSONB blob, store the canvas state relationally. Create dedicated tables for `blocks` and `edges` (with foreign keys to the `canvases` table) to allow for fine-grained querying and partial updates.

### 2.3 Local Development Experience

- **Docker Compose:** Create a `docker-compose.yml` that provisions PostgreSQL with the `pgvector` extension.
- **Seeding:** Implement a `pnpm db:seed` command that populates the database with a demo user, session, and a pre-wired canvas to ensure immediate functionality for new developers.

## 3. Non-Functional Requirements

- **Data Integrity:** Ensure strict foreign key constraints and cascading deletes where appropriate (e.g., deleting a session deletes its canvas, blocks, and edges).
- **TDD:** Adhere to the strict 85% coverage "Red, Green, Refactor, Adversarial" workflow (focusing on repository pattern tests and DB constraint validations).

## 4. Out of Scope

- Building the frontend UI to consume this data (this track is strictly the backend persistence layer).
