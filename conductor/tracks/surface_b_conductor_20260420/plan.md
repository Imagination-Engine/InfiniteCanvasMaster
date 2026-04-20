# Implementation Plan: Surface B — Conductor (Workflow Orchestration)

## Phase 1: Advanced DAG Scheduler
- [ ] Task: Extend the `CanvasScheduler` to support conditional routing and loops.
    - [ ] Sub-task: Red (Write tests for if/else branching, loop iteration, and cyclic dependency detection)
    - [ ] Sub-task: Green (Implement execution logic for conditional and loop edges)
    - [ ] Sub-task: Refactor (Optimize memory usage during large array iterations)
    - [ ] Sub-task: Adversarial (Write tests creating infinite loops to verify the scheduler's circuit breaker)
- [ ] Task: Implement Retry Policies.
    - [ ] Sub-task: Red/Green/Refactor for exponential backoff on block execution failures.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Advanced DAG Scheduler' (Protocol in workflow.md)

## Phase 2: Orchestration Blocks
- [ ] Task: Build and register the Trigger, `If`, and `ForEach` MCP blocks.
    - [ ] Sub-task: Red (Write schema and validation tests for the new blocks)
    - [ ] Sub-task: Green (Implement block definitions and their minimal UI representations)
- [ ] Task: Implement the Webhook and Schedule trigger listeners in the backend.
    - [ ] Sub-task: Red/Green/Refactor for the API endpoints that start a canvas execution.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Orchestration Blocks' (Protocol in workflow.md)

## Phase 3: SaaS Integrations
- [ ] Task: Implement MCP tool bindings for Generic Web/File operations.
    - [ ] Sub-task: Red/Green/Refactor/Adversarial for the scraping and fetch tools.
- [ ] Task: Implement MCP tool bindings for the Productivity Suite (Slack, Discord, Notion).
    - [ ] Sub-task: Red (Write tests mocking the external APIs)
    - [ ] Sub-task: Green (Implement the OAuth/Token handling and API calls)
    - [ ] Sub-task: Adversarial (Write tests simulating API rate limits and authentication failures)
- [ ] Task: Conductor - User Manual Verification 'Phase 3: SaaS Integrations' (Protocol in workflow.md)