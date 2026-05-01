# Specification: Documentation Repo & Agent Primer System

## 1. Overview

This track implements Part V of the Master Plan, establishing the infrastructure for distributed knowledge. It ensures that both human engineers and agent CLIs have immediate, contextual understanding of the codebase through strict READMEs and unified primer files.

## 2. Functional Requirements

### 2.1 Agent Primer System

- **Unified Root Setup:** Create a comprehensive `AGENTS.md` file at the repository root. This file serves as the primary initialization payload for agent CLIs, containing the core architecture overview, strict TDD workflow rules, and links to relevant workspace documentation.
- **Aliases:** Ensure common agent aliases (e.g., `CLAUDE.md`, `.cursorrules`) are symlinked or point to the canonical `AGENTS.md` to ensure consistency regardless of the tool used.

### 2.2 README-at-Every-Juncture (100% Strict)

- **Comprehensive Scaffolding:** Implement the strict requirement (Section 23) by generating a templated `README.md` for _every_ directory within the monorepo that contains code or significant documentation.
- **Template Structure:** The template must include: Description (What lives here and why), How to use this, and Links to adjacent/relevant files.

### 2.3 Semantic Document Map

- **Auto-Generation:** Develop a Node.js or bash script (`pnpm docs:map`) that traverses the repository, reads the headers of every `README.md`, and automatically generates the Semantic Document Map (`docs/MAP.md`).
- **CI Integration:** Integrate the `pnpm docs:map` execution into the pre-commit or CI workflow to ensure the map is always up-to-date with the codebase structure.

## 3. Non-Functional Requirements

- **Maintenance:** The auto-generated map script must execute quickly (under 2 seconds) to not impede the developer workflow.
- **TDD:** Adhere to the strict 85% coverage "Red, Green, Refactor, Adversarial" workflow for the mapping script logic.

## 4. Out of Scope

- Actually writing the deep content for every single package README (the students will populate the details; this track creates the scaffolded structure and automation).
