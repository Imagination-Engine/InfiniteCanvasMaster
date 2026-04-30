# Implementation Plan: Doc 01: Dependency Atlas & Hygiene Protocol

## Phase 1: The Dependency Atlas

- [x] Task: Create `docs/DEPENDENCIES.md`.
  - [x] Sub-task: Red (Write shell tests verifying the existence and required sections of the Dependency Atlas)
  - [x] Sub-task: Green (Transcribe the exhaustive tables from Document 01 into the central file)
  - [x] Sub-task: Refactor (Organize the tables clearly by core, UI, DB, and the five surfaces)
- [x] Task: Conductor - User Manual Verification 'Phase 1: The Dependency Atlas' (Protocol in workflow.md)

## Phase 2: Dependency Hygiene Protocol

- [x] Task: Create `.agent/rules/dependencies.md`.
  - [x] Sub-task: Red (Write tests verifying the agent rule file exists and explicitly references the justification checklist)
  - [x] Sub-task: Green (Generate the rule file instructing the agent CLI to consult the Atlas and prompt for justification on deviation)
  - [x] Sub-task: Refactor (Ensure the file explicitly maps to the 4-point justification checklist from Section 5.11)
- [x] Task: Conductor - User Manual Verification 'Phase 2: Dependency Hygiene Protocol' (Protocol in workflow.md)
