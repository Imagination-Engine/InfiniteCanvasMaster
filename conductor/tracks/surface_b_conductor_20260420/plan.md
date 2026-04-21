# Implementation Plan: Surface B — Conductor (Workflow Orchestration)

## Phase 1: Advanced DAG Scheduler
- [x] Task: Extend the `CanvasScheduler` to support conditional routing and loops.
    - [x] Sub-task: Red (Write tests for if/else branching, loop iteration, and cyclic dependency detection)
    - [x] Sub-task: Green (Implement execution logic for conditional and loop edges)
    - [x] Sub-task: Refactor (Optimize memory usage during large array iterations)
    - [x] Sub-task: Adversarial (Write tests creating infinite loops to verify the scheduler's circuit breaker)
- [x] Task: Implement Retry Policies.
    - [x] Sub-task: Red/Green/Refactor for exponential backoff on block execution failures.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Advanced DAG Scheduler' (Protocol in workflow.md)

## Phase 2: Orchestration Blocks
- [x] Task: Build and register the Trigger, `If`, and `ForEach` MCP blocks.
    - [x] Sub-task: Red (Write schema and validation tests for the new blocks)
    - [x] Sub-task: Green (Implement block definitions and their minimal UI representations)
- [x] Task: Implement the Webhook and Schedule trigger listeners in the backend.
    - [x] Sub-task: Red/Green/Refactor for the API endpoints that start a canvas execution.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Orchestration Blocks' (Protocol in workflow.md)

## Phase 3: SaaS Integrations
- [x] Task: Implement MCP tool bindings for Generic Web/File operations.
    - [x] Sub-task: Red/Green/Refactor/Adversarial for the scraping and fetch tools.
- [x] Task: Implement MCP tool bindings for the Productivity Suite (Slack, Discord, Notion).
    - [x] Sub-task: Red (Write tests mocking the external APIs)
    - [x] Sub-task: Green (Implement the OAuth/Token handling and API calls)
    - [x] Sub-task: Adversarial (Write tests simulating API rate limits and authentication failures)
- [x] Task: Conductor - User Manual Verification 'Phase 3: SaaS Integrations' (Protocol in workflow.md)