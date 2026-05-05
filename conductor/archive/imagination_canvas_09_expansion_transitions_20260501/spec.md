# Imagination Canvas Extraction: 09 - Expansion Transitions and App Blocks

## Overview

This track implements the "Expansion" system for the Imagination Canvas based on `docs/imagination-canvas-extraction/09-expansion-transitions-and-app-blocks.md`. This is a core differentiator for Balnce: the ability for a spatial block (like a card) to fluidly transition into a full-screen application or focused view, and then return to the exact same spatial context.

## Functional Requirements

1. **Expansion Modes:**
   - Define and implement rendering logic for the 9 expansion modes (`peek`, `inline-expanded`, `side-panel`, `focus-region`, `fullscreen`, etc.).
2. **Transition Choreography (`framer-motion`):**
   - Implement the visual transition where a block scales up to fill the viewport (or a modal layer) while the canvas background dims.
   - Implement the return transition that scales the expanded view back down into the exact canvas coordinates of the original block.

3. **Context Preservation:**
   - Integrate with `viewportStore` (implemented in Track 03) to utilize the `previous` state stack.
   - Ensure that expanding a block pushes the current camera state, and closing the expansion pops the camera state to return the user exactly where they left off.

4. **App Block Foundation:**
   - Implement the `AppBlockObject` schema (which extends `BaseCanvasObject`).
   - Scaffold the base React component for an App Block that knows how to render its "card" state vs its "fullscreen" state.

## Non-Functional Requirements

- **Animation Fluidity:** Transitions must be 60fps and use spring physics (via Framer Motion) to feel tactile and native, avoiding jarring layout shifts.
- **State Integrity:** Expanding a block must not unmount the underlying canvas or destroy the block's spatial data.

## Acceptance Criteria

- Users can click an "Expand" affordance on a supported block.
- The block smoothly animates into a fullscreen or focused overlay.
- A "Close/Back" affordance smoothly animates the view back to the original canvas block.
- The `AppBlockObject` schema is strictly validated.
