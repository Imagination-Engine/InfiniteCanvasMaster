# Implementation Plan: Documentation Repo & Agent Primer System

## Phase 1: Unified Agent Primer & Aliases
- [x] Task: Create the comprehensive `AGENTS.md` file at the root.
    - [x] Sub-task: Red (Write tests verifying the existence of `AGENTS.md` and required keywords/sections)
    - [x] Sub-task: Green (Generate the file with the core architecture, workflow rules, and pointers to specific packages)
    - [x] Sub-task: Refactor (Ensure symlinks/aliases like `CLAUDE.md` correctly point to `AGENTS.md`)
    - [x] Sub-task: Adversarial (Write tests verifying the agent primer parses correctly as valid Markdown)
- [x] Task: Conductor - User Manual Verification 'Phase 1: Unified Agent Primer & Aliases' (Protocol in workflow.md)

## Phase 2: 100% Strict README Coverage (Scaffolding)
- [ ] Task: Scaffold templated `README.md` files for every directory containing code.
    - [ ] Sub-task: Red (Write tests validating that all specified directories contain a `README.md`)
    - [ ] Sub-task: Green (Implement a script that traverses the workspace directories and generates the templates)
    - [ ] Sub-task: Refactor (Refine the template format as specified in Section 23.1)
- [ ] Task: Conductor - User Manual Verification 'Phase 2: 100% Strict README Coverage (Scaffolding)' (Protocol in workflow.md)

## Phase 3: Semantic Document Map Auto-Generation
- [ ] Task: Develop the `pnpm docs:map` script.
    - [ ] Sub-task: Red (Write tests for the auto-generation logic, mocking file system traversal)
    - [ ] Sub-task: Green (Implement the Node.js or bash script to traverse, read headers, and output `docs/MAP.md`)
    - [ ] Sub-task: Refactor (Optimize file reading to ensure execution time is under 2 seconds)
    - [ ] Sub-task: Adversarial (Write tests creating cyclic directories or malformed README headers to ensure the script does not hang)
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Semantic Document Map Auto-Generation' (Protocol in workflow.md)