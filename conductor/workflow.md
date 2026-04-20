# Project Workflow

This document outlines the standard development workflow and rules for the Imagination Engine project. Agents and engineers must adhere to this protocol.

## 1. Test-Driven Development (TDD) Protocol
Every new feature, block, and MCP tool must follow the strict four-step rhythm defined in the Master Plan:
1. **Red:** Write the failing test first. The test describes the desired behavior. Run it and watch it fail.
2. **Green:** Write the simplest implementation that makes the test pass.
3. **Refactor:** Clean up the code, extract functions, and rename variables while keeping the tests green.
4. **Adversarial:** Add one test that intentionally tries to break what was just written (e.g., edge cases, malformed inputs, race conditions). If it passes, proceed.

## 2. Quality & Coverage Standards
- **Test Coverage Requirement:** >85%. Code cannot be considered complete until this threshold is demonstrably met.
- **Required Tests per Tool:** Every MCP tool/block requires a request-schema test, a response-schema test, a happy-path test, and an error-path test.

## 3. Version Control & Commits
- **Commit Frequency:** Commits are required **Per Phase** (after an entire phase of tasks is completed).
- **Task Summaries:** Task and phase summaries must be recorded directly in the **Commit Messages** (e.g., in the commit body).
- **PR Gates:** No PR is merged unless the commit history visibly reflects the Red/Green/Refactor/Adversarial cycle.

## 4. Phase Completion Verification and Checkpointing Protocol
When generating `plan.md` files, a final verification task must be appended to every phase to ensure quality before moving to the next phase:
`- [ ] Task: Conductor - User Manual Verification '<Phase Name>' (Protocol in workflow.md)`