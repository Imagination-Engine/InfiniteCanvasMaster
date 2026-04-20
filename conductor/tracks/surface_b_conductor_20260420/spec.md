# Specification: Surface B — Conductor (Workflow Orchestration)

## 1. Overview
This track implements the second specialized surface (Section 13 of the Master Plan). Surface B transforms the canvas into a powerful workflow orchestration tool, akin to n8n, but fully agentic. It focuses on advanced DAG execution, conditional logic, and deep integration with external web and productivity tools.

## 2. Functional Requirements
### 2.1 Advanced DAG Execution
- **Scheduler Enhancements:** Extend the core `CanvasScheduler` to support:
  - **Conditional Branches:** Implementation of an `If` block that routes execution based on dynamic conditions.
  - **Loop Constructs:** Implementation of a `ForEach` block to iterate over collections.
  - **Retry Policies:** Built-in error handling and exponential backoff wrappers for unreliable network calls.

### 2.2 Orchestration Blocks & Triggers
- **Trigger Blocks:** Implement blocks that initiate workflows (`WebhookTrigger`, `ScheduleTrigger`, `ManualTrigger`).
- **Control Flow Blocks:** Implement the `If` and `ForEach` logic blocks.

### 2.3 MCP SaaS Integrations
- **Generic Web/File:** Ensure robust MCP bindings for web scraping, generic API fetching, and local filesystem access.
- **Productivity Suite:** Implement and test deep MCP bindings for core productivity tools (Slack, Discord, Notion).

### 2.4 Execution UX
- **Minimal Output:** The UI will prioritize a clean, uncluttered interface during execution, surfacing only the final output or critical error states directly on the canvas, rather than a dense, developer-heavy log panel.

## 3. Non-Functional Requirements
- **Reliability:** Long-running workflows must not block the main thread or crash the Node.js process.
- **TDD:** Adhere to the strict 85% coverage "Red, Green, Refactor, Adversarial" workflow, particularly focusing on cyclic loop detection and infinite retry prevention.

## 4. Out of Scope
- Developer-suite integrations (GitHub, Linear) will be deferred to a later phase or Surface D.