# Implementation Plan: Substrate Foundation: Chat Shell and Canvas Duality

## Phase 1: View State Management
- [ ] Task: Implement global view state store (Zustand/Redux) for Chat, Canvas, and Dual modes
    - [ ] Sub-task: Red (Write failing tests for state transitions)
    - [ ] Sub-task: Green (Implement basic state store)
    - [ ] Sub-task: Refactor (Clean up store logic)
    - [ ] Sub-task: Adversarial (Write test for rapid, repeated view toggling to ensure no race conditions)
- [ ] Task: Conductor - User Manual Verification 'Phase 1: View State Management' (Protocol in workflow.md)

## Phase 2: Chat Shell UI Component
- [ ] Task: Build the Chat Shell React component structural layout
    - [ ] Sub-task: Red (Write component render and structural tests)
    - [ ] Sub-task: Green (Implement component with Tailwind styling)
    - [ ] Sub-task: Refactor (Extract sub-components like InputBox and MessageList)
    - [ ] Sub-task: Adversarial (Test component rendering with extremely long text inputs)
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Chat Shell UI Component' (Protocol in workflow.md)

## Phase 3: Dual-View Layout & Toggling
- [ ] Task: Implement the main application layout wrapper supporting the three view modes
    - [ ] Sub-task: Red (Write tests for layout rendering based on state)
    - [ ] Sub-task: Green (Implement layout CSS grid/flexbox for split view and toggles)
    - [ ] Sub-task: Refactor (Optimize responsive breakpoints)
    - [ ] Sub-task: Adversarial (Test layout behavior at extreme minimum viewport sizes)
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Dual-View Layout & Toggling' (Protocol in workflow.md)