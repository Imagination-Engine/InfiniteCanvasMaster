# Implementation Plan: Custom Agent & Saved Block Flow

## Phase 1: Blank Template & Orchestrator Flow

- [ ] Task: Scaffold the "Blank Agent Template" in the Block Registry.
  - [ ] Sub-task: Red (Write tests ensuring the blank template is resolvable and renderable).
  - [ ] Sub-task: Green (Add the template to the registry and library data structure).
- [ ] Task: Expand Orchestrator Capabilities.
  - [ ] Sub-task: Red (Write tests for the Orchestrator intent parsing an agent creation request with specific traits).
  - [ ] Sub-task: Green (Implement Orchestrator logic to parse requested traits and drop a pre-configured `AgentBlockObject`).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Blank Template & Orchestrator Flow' (Protocol in workflow.md)

## Phase 2: Manual Configuration UI

- [ ] Task: Expand Agent Block UI.
  - [ ] Sub-task: Red (Write tests for editing role, instructions, and tools within the block's maximized state).
  - [ ] Sub-task: Green (Implement form inputs in the expanded `AgentBlock` component, wired to `useCanvasStore.updateObject`).
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Manual Configuration UI' (Protocol in workflow.md)

## Phase 3: "Save to Library" Pipeline

- [ ] Task: Implement Save Action.
  - [ ] Sub-task: Red (Write tests verifying the "Save" button triggers a network dispatch with the correct block schema).
  - [ ] Sub-task: Green (Implement the save button, dispatching a POST request to the backend, falling back to a mock success state if the endpoint is 404).
- [ ] Task: Update Library UI.
  - [ ] Sub-task: Red (Write tests ensuring saved blocks are grouped under a "Custom" category).
  - [ ] Sub-task: Green (Update the Library state to fetch/display custom blocks alongside system primitives).
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Save to Library Pipeline' (Protocol in workflow.md)
