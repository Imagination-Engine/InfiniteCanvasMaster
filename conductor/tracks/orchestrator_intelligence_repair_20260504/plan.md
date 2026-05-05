# Implementation Plan: Orchestrator Intelligence Repair

## Phase 1: Intent Classification Engine

- [ ] Task: Implement `OrchestratorIntentClassifier` utility.
  - [ ] Sub-task: Red (Write tests defining intent categories like `emotional_expression`, `create_block`, `plan_request` based on sample inputs).
  - [ ] Sub-task: Green (Implement classification logic, potentially using a lightweight local regex/heuristic or bridging to an LLM utility).
  - [ ] Sub-task: Refactor (Optimize classification function).
  - [ ] Sub-task: Adversarial (Test with ambiguous or malformed inputs).
- [ ] Task: Integrate Classifier into `FloatingOrchestratorChat`.
  - [ ] Sub-task: Red (Write tests ensuring emotional inputs do not trigger the DAG planning payload).
  - [ ] Sub-task: Green (Wire the classifier into the `handleSubmit` execution path to intercept and handle praise/casual input conversationally).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Intent Classification Engine' (Protocol in workflow.md)

## Phase 2: Canvas Awareness & Context Continuity

- [ ] Task: Expand Orchestrator Store/Hooks for Canvas State.
  - [ ] Sub-task: Red (Write tests verifying the orchestrator hook correctly reads `selectedBlockId` and `recentDrops` from `useCanvasStore`).
  - [ ] Sub-task: Green (Implement the bridging logic to feed canvas state into the orchestrator's context window/prompt).
- [ ] Task: Implement Context Adapter Boundary.
  - [ ] Sub-task: Red (Write tests ensuring the orchestrator receives the original session intent/DAG summary).
  - [ ] Sub-task: Green (Wire the `DualViewContainer` or relevant layout to pass session context down to the Orchestrator).
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Canvas Awareness & Context Continuity' (Protocol in workflow.md)

## Phase 3: Block Operations

- [ ] Task: Implement Block Creation Capabilities via Orchestrator.
  - [ ] Sub-task: Red (Write tests for `create_block` intent triggering an `addObject` mutation).
  - [ ] Sub-task: Green (Wire the orchestrator's tool payload or simulated response to actually instantiate typed blocks like 'Video Studio' or 'Note').
  - [ ] Sub-task: Refactor (Ensure coordinate placement is intelligent, not just 0,0).
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Block Operations' (Protocol in workflow.md)
