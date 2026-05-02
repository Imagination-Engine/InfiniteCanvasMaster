# Imagination Canvas Extraction: 14 - Design Token Map

## Overview

This track implements the foundational Design Token Map for the Imagination Canvas based on `docs/imagination-canvas-extraction/14-design-token-map.md`. These tokens ensure that the canvas feels spatial, soft but precise, and cinematic during transitions. It bridges the gap between raw CSS values and semantic, accessible UI components.

## Functional Requirements

1. **Token Registries:**
   - Define exact, typed token structures for Spacing, Typography, Radius, Elevation, Motion, and Hit Targets.
   - Implement these tokens in the project's styling system (e.g., expanding the `tailwind.config.ts` or creating a dedicated CSS variable scope).

2. **Density Modes:**
   - Implement state management and CSS classes for `comfortable`, `compact`, `presentation`, and `immersive` density modes.
   - Ensure the CanvasShell responds to density mode changes by adjusting internal variables (e.g., padding, visibility of chrome).

3. **Accessibility Overrides:**
   - Implement structured fallbacks for `prefers-reduced-motion` (mapping cinematic/spatial easings to instant or fast fades).
   - Ensure explicit keyboard focus rings (`focus-visible`) and minimum text contrast ratios are enforced across all tokens.

4. **Agent Status Visualization:**
   - Implement specific animation/color semantic tokens for Agent states (Thinking, Generating, Waiting for Approval, etc.).

## Non-Functional Requirements

- **Theme Agnostic:** Tokens must use semantic naming (e.g., `canvas-background`, `agent-activity`) rather than literal colors (`gray-900`, `purple-500`) to support dark/light mode and custom workspace theming.
- **Precision:** Motion tokens must strictly map to the exact `cubic-bezier` curves defined in the spec to guarantee the correct "feel".

## Acceptance Criteria

- Tailwind configuration includes the new spacing, radius, elevation, and motion primitives.
- Switching between Density Modes immediately updates the visual scale of canvas blocks and toolbars.
- A user with "reduced motion" enabled in their OS experiences instant or fade-only transitions instead of spring scaling.
- The UI maintains strict accessibility compliance (contrast, hit targets).
