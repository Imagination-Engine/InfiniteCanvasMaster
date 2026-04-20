# Implementation Plan: Doc 01: Dependency Atlas & Hygiene Protocol

## Phase 1: The Dependency Atlas
- [ ] Task: Create `docs/DEPENDENCIES.md`.
    - [ ] Sub-task: Red (Write shell tests verifying the existence and required sections of the Dependency Atlas)
    - [ ] Sub-task: Green (Transcribe the exhaustive tables from Document 01 into the central file)
    - [ ] Sub-task: Refactor (Organize the tables clearly by core, UI, DB, and the five surfaces)
- [ ] Task: Conductor - User Manual Verification 'Phase 1: The Dependency Atlas' (Protocol in workflow.md)

## Phase 2: Dependency Hygiene Protocol
- [ ] Task: Create `.agent/rules/dependencies.md`.
    - [ ] Sub-task: Red (Write tests verifying the agent rule file exists and explicitly references the justification checklist)
    - [ ] Sub-task: Green (Generate the rule file instructing the agent CLI to consult the Atlas and prompt for justification on deviation)
    - [ ] Sub-task: Refactor (Ensure the file explicitly maps to the 4-point justification checklist from Section 5.11)
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Dependency Hygiene Protocol' (Protocol in workflow.md)