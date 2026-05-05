# Specification: Block Protocol Refactor & Internal Systems Setup

## 1. Overview

This track addresses multiple foundational aspects outlined in the Master Plan. It initiates the critical refactoring of the existing 9 hardcoded node types into a standard Block Protocol (MCP Tools). Simultaneously, it establishes the necessary internal tooling and workflows, including a bug triage system, documentation scaffolding, and an explicit workaround for Plan Mode file operations.

## 2. Functional Requirements

### 2.1 Block Protocol Refactoring

- **Establish Pattern:** Fully refine one existing node to establish the MCP tool pattern.
- **Complete Refactor:** Refactor all remaining 8 nodes to adhere to this new pattern.
- **Future Readiness:** Ensure the new pattern is fully compatible with the strict TDD workflow for any new nodes created in the future.

### 2.2 Internal Systems & Documentation Flows

- **Bug Triage Backlog:** Create and initialize `docs/backlog/TRIAGE.md` as an append-only log for humans and agents to record issues outside their current scope.
- **README-at-Every-Juncture:** Initialize the required `README.md` structure in key project directories to ensure disseminated knowledge and standard adherence.

## 3. Workflow Updates

- **File Flattening Workaround:** Update `conductor/workflow.md` to include a new section detailing the required shell command workaround (`mkdir -p ... && mv ...`) for Plan Mode file operations to assist future agents.

## 4. Non-Functional Requirements

- **Adherence:** All block refactoring must strictly adhere to the established "Red, Green, Refactor, Adversarial" TDD rhythm (85% coverage).

## 5. Out of Scope

- Building the actual Chat Shell or Canvas UI (handled in a separate track).
- Integrating the blocks with the final Agent Runtime (this track focuses purely on standardizing the blocks themselves).
