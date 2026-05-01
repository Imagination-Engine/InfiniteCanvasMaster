# Specification: Doc 01: Dependency Atlas & Hygiene Protocol

## 1. Overview

This track implements the final functional component of the Execution Kit Addendum (Part V). It establishes the canonical "Dependency Atlas" for the monorepo, mapping the exact packages each surface is permitted to use. It also formalizes the "Dependency Hygiene Rule" to prevent dependency bloat and ensure agentic adherence to the prescribed tech stack.

## 2. Functional Requirements

### 2.1 The Dependency Atlas (Documentation)

- **Central Authority:** Create `docs/DEPENDENCIES.md`.
- **Content:** Transcribe the exhaustive dependency tables from Sections 5.1 through 5.10 of Document 01 into this central file. The document must categorize dependencies by core, UI, database, and per-surface (Playable, Conductor, Reel, Forge, Scribe).
- **Lazy Execution:** Do _not_ install these dependencies into the `package.json` files yet; the respective surface tracks will handle installation when required. The Atlas serves as the strict blueprint.

### 2.2 Dependency Hygiene Protocol

- **Agent Rule:** Create `.agent/rules/dependencies.md`.
- **Enforcement:** The rule file must explicitly instruct the agent CLIs to:
  1. Consult the Dependency Atlas before proposing any new `npm install` command.
  2. If a new dependency is required outside the Atlas, the agent must prompt the user to justify it (Problem solved, Why existing fails, Bundle impact, Maintenance signal).
  3. The agent must inject this justification into the PR description.

## 3. Non-Functional Requirements

- **Integration:** Ensure the new `.agent/rules/dependencies.md` file is explicitly referenced in the Agent Session-Opening Protocol created in the previous track.
- **TDD:** Adhere to the strict 85% coverage "Red, Green, Refactor, Adversarial" workflow (focusing on testing the automated scripts that might read these rules).

## 4. Out of Scope

- Actually modifying `package.json` files or installing node modules; this track establishes the _governance_ over them.
