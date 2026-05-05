# Implementation Plan: Studio Registration

## Phase 1: Manifest Scaffolding

- [ ] Task: Create Studio Manifest Files.
  - [ ] Sub-task: Red (Write tests asserting the presence and schema validity of all 7 core manifests).
  - [ ] Sub-task: Green (Implement `writersStudio.ts`, `videoStudio.ts`, etc., strictly adhering to the `StudioManifest` Zod schema).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Manifest Scaffolding' (Protocol in workflow.md)

## Phase 2: Tool Mount Infrastructure

- [ ] Task: Implement Tool Mount Registry.
  - [ ] Sub-task: Red (Write tests for registering and retrieving Tool Mounts).
  - [ ] Sub-task: Green (Build the `ToolMountRegistry` singleton).
  - [ ] Sub-task: Refactor (Seed the registry with basic mounts mapped from the manifests).
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Tool Mount Infrastructure' (Protocol in workflow.md)
