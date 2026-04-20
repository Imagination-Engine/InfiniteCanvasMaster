# Implementation Plan: Block Protocol Refactor & Internal Systems Setup

## Phase 1: Workflow & Internal Systems Setup
- [ ] Task: Update `conductor/workflow.md` to include the Plan Mode file-flattening workaround.
- [ ] Task: Initialize the Agent-Assisted Bug Triage system.
    - [ ] Sub-task: Create `docs/backlog/TRIAGE.md` with the standard template.
- [ ] Task: Initialize the README-at-Every-Juncture structure.
    - [ ] Sub-task: Identify primary code and documentation directories.
    - [ ] Sub-task: Inject standard `README.md` templates into these directories.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Workflow & Internal Systems Setup' (Protocol in workflow.md)

## Phase 2: Establish Block Protocol Pattern
- [ ] Task: Select one existing node (e.g., 'Refiner' or 'Summarizer') and refactor it into an MCP-compliant Block.
    - [ ] Sub-task: Red (Write failing tests for request/response schemas, happy path, and error path)
    - [ ] Sub-task: Green (Implement the MCP tool interface and logic)
    - [ ] Sub-task: Refactor (Clean up the implementation)
    - [ ] Sub-task: Adversarial (Write test intentionally trying to break the tool with malformed inputs)
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Establish Block Protocol Pattern' (Protocol in workflow.md)

## Phase 3: Complete Block Refactoring
- [ ] Task: Refactor the remaining 8 existing hardcoded nodes to adhere to the established pattern.
    - [ ] Sub-task: Red (Write failing schema/logic tests for all 8 nodes)
    - [ ] Sub-task: Green (Implement the MCP tool interfaces for all 8 nodes)
    - [ ] Sub-task: Refactor (Clean up and optimize shared logic)
    - [ ] Sub-task: Adversarial (Write adversarial tests for all 8 nodes)
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Complete Block Refactoring' (Protocol in workflow.md)