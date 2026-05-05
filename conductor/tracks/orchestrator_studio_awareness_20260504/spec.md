# Specification: Intelligent Orchestrator Studio Awareness

## Overview

This is Track 7 of the "Studio Capability Manifest" implementation, executing Phase 8 of the master prompt. The objective is to elevate the Orchestrator's context window so that it natively understands the newly implemented studio manifests and can guide users intelligently.

## Functional Requirements

1. **Manifest Context Injection:**
   - Modify the Orchestrator's system prompt generation to include summarized data from the `StudioInteropResolver` and `BlockRegistry`.
   - The Orchestrator must know what studios exist, what blocks they offer, and what artifacts they produce/accept.
2. **Intelligent Suggestions:**
   - When a block is selected on the canvas, the Orchestrator should proactively suggest compatible "next step" blocks (e.g., suggesting a "Publish" block when a "Manuscript" block is active).
3. **Runtime & Tool Mount Awareness:**
   - The Orchestrator must be aware if a block requires a specific `ToolMount` that is not currently configured by the user, and guide them through the configuration.

## Acceptance Criteria

- [ ] Orchestrator system prompt includes dynamic capability summaries.
- [ ] Asking "What can I connect to this block?" yields an accurate, registry-aware response.
- [ ] Orchestrator can identify missing tool mounts for a selected block.

## Out of Scope

- Actually executing the tools (this is handled by the block runtime itself).
