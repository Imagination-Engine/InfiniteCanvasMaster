# Implementation Plan: Block Registry Normalization

## Phase 1: Core Registry Upgrade

- [ ] Task: Upgrade `BlockDefinition` in `@iem/core`.
  - [ ] Sub-task: Red (Write tests verifying schema rejection of legacy block shapes).
  - [ ] Sub-task: Green (Update the TS interface and Zod schema with the new manifest fields).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Core Registry Upgrade' (Protocol in workflow.md)

## Phase 2: Mass Block Refactor

- [ ] Task: Update all existing block registrations.
  - [ ] Sub-task: Red (Compile check - verify workspace fails due to TS errors).
  - [ ] Sub-task: Green (Iterate through `packages/surface-*` and `apps/server/src/registry-init.ts` updating every `createBlock` call with the required fields).
  - [ ] Sub-task: Refactor (Ensure data is semantically correct based on the Track 1 Audit).
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Mass Block Refactor' (Protocol in workflow.md)
