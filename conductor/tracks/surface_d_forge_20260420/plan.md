# Implementation Plan: Surface D — Forge (App Builder)

## Phase 1: Shared Blackboard & Role Blocks
- [ ] Task: Implement the Blackboard state manager and register the four Agent Role blocks.
    - [ ] Sub-task: Red (Write schema validation tests for the Blackboard object and the I/O of all four blocks)
    - [ ] Sub-task: Green (Implement the Blackboard store and the `Architect`, `Designer`, `Builder`, and `Tester` block definitions)
    - [ ] Sub-task: Refactor (Clean up the state mutation logic to ensure immutability during graph execution)
    - [ ] Sub-task: Adversarial (Write tests simulating conflicting mutations from parallel blocks)
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Shared Blackboard & Role Blocks' (Protocol in workflow.md)

## Phase 2: Gemini 3.5 Pro Integration & Build Log
- [ ] Task: Update the Agent Runtime to support Gemini 3.5 Pro specifically for the Builder node.
    - [ ] Sub-task: Red/Green/Refactor for the specific provider configuration and prompt engineering.
- [ ] Task: Implement the real-time Build Log UI.
    - [ ] Sub-task: Red (Write tests verifying log updates based on streaming execution state)
    - [ ] Sub-task: Green (Build the streaming log panel component)
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Gemini 3.5 Pro Integration & Build Log' (Protocol in workflow.md)

## Phase 3: WebContainers Sandbox & Export
- [ ] Task: Integrate the WebContainer API for compiling and serving the output.
    - [ ] Sub-task: Red (Write tests mocking the WebContainer boot and file-write processes)
    - [ ] Sub-task: Green (Implement the compilation bridge from the Blackboard state to the WebContainer filesystem)
    - [ ] Sub-task: Refactor (Optimize container boot times using snapshots if applicable)
    - [ ] Sub-task: Adversarial (Test the sandbox with generated code containing infinite loops or excessive memory allocation)
- [ ] Task: Implement the "Launch as Creation" route for the sandboxed app.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: WebContainers Sandbox & Export' (Protocol in workflow.md)