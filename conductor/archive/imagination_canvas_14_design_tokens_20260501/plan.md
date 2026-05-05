# Imagination Canvas 14: Design Token Map Implementation Plan

## Phase 1: Core Token Definitions

- [x] Task: Translate spec tokens into Tailwind and CSS variables.
  - [x] Sub-task: Red (Tests for token presence in theme provider or CSS parsing).
  - [x] Sub-task: Green (Update `tailwind.config.ts` and base CSS files with spacing, radius, and elevation tokens).
- [x] Task: Conductor - User Manual Verification 'Phase 1: Core Tokens' (Protocol in workflow.md)

## Phase 2: Motion & Accessibility

- [x] Task: Implement `framer-motion` variants and accessibility fallbacks.
  - [x] Sub-task: Red (Tests for `prefers-reduced-motion` detection).
  - [x] Sub-task: Green (Create `motion-utils.ts` exporting exact cubic-bezier variants).
- [x] Task: Conductor - User Manual Verification 'Phase 2: Motion' (Protocol in workflow.md)

## Phase 3: Density Modes

- [x] Task: Implement the Density Mode context.
  - [x] Sub-task: Red (Tests verifying density mode toggling updates component classes).
  - [x] Sub-task: Green (Integrate density modes into `shellStore` and apply to component base styles).
- [x] Task: Conductor - User Manual Verification 'Phase 3: Density Modes' (Protocol in workflow.md)

## Phase 4: Semantic Status Mapping

- [x] Task: Map agent states to visual tokens.
  - [x] Sub-task: Red (Tests for mapping status strings to correct CSS classes).
  - [x] Sub-task: Green (Implement `AgentStatusIndicator` using strict semantic tokens).
- [x] Task: Conductor - User Manual Verification 'Phase 4: Status Mapping' (Protocol in workflow.md)
