# Implementation Plan: Orchestrator Awareness

## Phase 1: Context Injection

- [ ] Task: Expand `useOrchestratorContext` with Capability Data.
  - [ ] Sub-task: Red (Write tests verifying the hook queries `StudioInteropResolver` for compatible blocks based on the current selection).
  - [ ] Sub-task: Green (Implement the logic to attach compatibility arrays to the context payload).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Context Injection' (Protocol in workflow.md)

## Phase 2: Orchestrator UI Integration

- [ ] Task: Update Orchestrator Response Logic.
  - [ ] Sub-task: Red (Write tests asserting the Orchestrator generates suggestion chips/messages based on the new context).
  - [ ] Sub-task: Green (Update the chat completion logic to format suggestions nicely).
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Orchestrator UI Integration' (Protocol in workflow.md)
