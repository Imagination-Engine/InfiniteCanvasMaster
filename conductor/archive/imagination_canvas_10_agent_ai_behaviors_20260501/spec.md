# Imagination Canvas Extraction: 10 - Agent and AI Behaviors on Canvas

## Overview

This track implements the agentic interaction layer for the Imagination Canvas based on `docs/imagination-canvas-extraction/10-agent-and-ai-behaviors-on-canvas.md`. It elevates the AI from a simple chat interface to a spatial collaborator capable of executing scoped tasks, proposing canvas mutations, and managing long-running background processes (like the Edge Twin).

## Functional Requirements

1. **Agent Canvas Task Contract:**
   - Implement the `AgentCanvasTask` schema to track AI operations, scopes (canvas, selection, region, object), and statuses (`queued`, `running`, `waiting-for-user`, etc.).

2. **Scoped Interventions & Previews:**
   - Implement UI entry points for Global, Selection-Scoped, and Block-Level AI commands.
   - Implement the "Mutation Preview" system: When an agent proposes large structural changes (e.g., auto-layout, bulk edits), the changes must be rendered in a temporary preview state requiring explicit user acceptance or rejection.

3. **Agent Block & Status UI:**
   - Implement the `AgentBlockObject` visualization, showing compact status ("Thinking", "Waiting for approval") and an expanded view for configuring tools, prompts, and memory access.
   - Implement human-in-the-loop checkpoints (approval gates) that pause DAG execution and visually alert the user on the canvas.

4. **Streaming Generation:**
   - Implement the visual choreography for blocks streaming onto the canvas. Placeholders must reserve space while content is streamed, preventing layout jitter.

## Non-Functional Requirements

- **Reversibility:** Every applied agent mutation batch must be wrapped in a single Undo transaction in the `canvasStore`.
- **Non-blocking:** Agent execution (especially background agents) must not lock the main React thread or block user interaction with other canvas elements.

## Acceptance Criteria

- Users can trigger an AI action scoped to a specific selection.
- Destructive or large-scale AI operations trigger a visual preview before committing to the canvas store.
- Agent blocks accurately reflect their underlying execution status and pause for required human approvals.
- Streaming block generation reserves space and animates smoothly.
