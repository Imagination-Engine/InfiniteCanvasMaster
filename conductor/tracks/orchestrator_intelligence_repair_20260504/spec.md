# Specification: Orchestrator Intelligence Repair

## Overview

This track focuses on the foundational repair of the on-canvas Orchestrator intelligence. Based on the "Imagination Canvas UI & Intelligence Repair" master document, we are prioritizing Intelligence before UI refinements. The orchestrator currently responds abruptly, over-triggers planning behavior, and lacks context awareness. This track will implement intent classification, canvas awareness, and direct block operation capabilities.

## Functional Requirements

1. **Intent Classification Engine:**
   - Implement a lightweight intent classification layer before the orchestrator takes action.
   - Categorize inputs into: `emotional_expression`, `question`, `plan_request`, `modify_canvas`, `create_block`, etc.
   - Prevent the orchestrator from generating implementation plans when the user expresses praise or casual remarks.
2. **Canvas Context & Awareness:**
   - Ensure the orchestrator is aware of the currently selected block, recent block drops, and canvas events.
   - Provide the orchestrator with access to the original intent/DAG summary (or a context adapter boundary) to maintain continuity from the immersive chat.
   - Orchestrator must react contextually to events like `canvas.block.added`.
3. **Block Operations (Tool of the Canvas):**
   - Empower the orchestrator to act as a composer, capable of explaining, refining, or connecting blocks.
   - Enable the orchestrator to suggest missing blocks or physically prepare/drop blocks onto the canvas based on user intent (e.g., "Add a video editor").
   - Actions must be gated by user confirmation unless explicitly requested.

## Non-Functional Requirements

- **Response Style:** The orchestrator must be supportive, playful when appropriate, and educational. It should not be over-eager or abrupt.
- **Performance:** Intent classification and canvas state reading should not introduce noticeable latency to the chat stream.

## Acceptance Criteria

- [ ] Praise messages (e.g., "This is awesome") yield conversational responses, not plans.
- [ ] The orchestrator demonstrates knowledge of recently dropped or selected blocks.
- [ ] The orchestrator successfully parses a request to "Add a [type] block" and prepares or creates it.
- [ ] Responses feel continuous and contextually relevant to the ongoing session.

## Out of Scope

- Visual repair of the Block Library or Minimized Block UI (reserved for subsequent tracks).
