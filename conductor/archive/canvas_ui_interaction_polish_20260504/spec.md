# Specification: Canvas UI & Interaction Polish

## Overview

This track executes a comprehensive UI/UX repair pass on the core spatial elements of the Imagination Canvas, based on the "IEM Canvas Plz.md" document. It targets the Minimized Block UI, the Block Icon System, the Drag/Drop fluidity, and the visual design of Connector lines. The goal is to transform the canvas from a collection of "perfunctory cards" into a premium, cohesive creative workspace.

## Functional Requirements

1. **Minimized Block UI Repair:**
   - Redesign the minimized state to be a deliberate, compact UI, not a squeezed modal.
   - Clean the top bar: Retain only the block icon, clean title, and maximize icon. Remove gear and minimize icons.
   - Body: Display role/purpose, one dynamic status line, max 2 capability chips.
   - Footer: Display runtime state and output previews.
   - Implement a subtle Human-in-the-loop indicator (e.g., a colored dot/badge) for states like 'input_needed' or 'approval_needed'.
   - Fix visual bugs: Align border radius with the block shape, remove sharp white borders, ensure high contrast.
2. **Block Icon System:**
   - Implement a robust icon mapping system for 40+ block types/categories using existing Lucide icons.
   - Fallback hierarchy: Exact Type -> Category -> Studio -> Generic Runtime.
3. **Drag/Move Fluidity:**
   - Ensure block movement is driven by smooth transforms, avoiding layout thrashing.
   - Elevate the visual state (z-index, drop shadow) of a block while it is being dragged.
   - Prevent accidental text selection or unintended modal expansion during drags.
4. **Connector / Intention Lines:**
   - Implement directional, flowing SVG connectors indicating data/intention flow.
   - Connectors should be subtle, supporting hover states and selected path emphasis without overwhelming the canvas.
   - Edges representing active/running tasks should feature a subtle pulse animation.

## Acceptance Criteria

- [ ] Minimized blocks display only the maximize control in the top bar.
- [ ] Block border radii are visually consistent and free of rendering artifacts.
- [ ] A subtle indicator clearly communicates when a block requires human input.
- [ ] Diverse blocks on the canvas exhibit unique, category-appropriate icons.
- [ ] Dragging a block lifts it visually and feels performant (no jumping or lag).
- [ ] Connector lines clearly indicate directionality and pulse when active.

## Out of Scope

- Block Library redesign and drag-from-library (reserved for the next track).
- Expanded/Maximized block content (except for the maximize button itself).
