# Imagination Canvas 14: Design Token Map Implementation Plan

## Phase 1: Core Token Definitions

- [ ] Task: Translate spec tokens into Tailwind and CSS variables.
  - [ ] Sub-task: Red (Tests for token presence in theme provider or CSS parsing).
  - [ ] Sub-task: Green (Update `tailwind.config.ts` and base CSS files with spacing, radius, and elevation tokens).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Core Tokens' (Protocol in workflow.md)

## Phase 2: Motion & Accessibility

- [ ] Task: Implement `framer-motion` variants and accessibility fallbacks.
  - [ ] Sub-task: Red (Tests for `prefers-reduced-motion` detection).
  - [ ] Sub-task: Green (Create `motion-utils.ts` exporting exact cubic-bezier variants).
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Motion' (Protocol in workflow.md)

## Phase 3: Density Modes

- [ ] Task: Implement the Density Mode context.
  - [ ] Sub-task: Red (Tests verifying density mode toggling updates component classes).
  - [ ] Sub-task: Green (Integrate density modes into `shellStore` and apply to component base styles).
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Density Modes' (Protocol in workflow.md)

## Phase 4: Semantic Status Mapping

- [ ] Task: Map agent states to visual tokens.
  - [ ] Sub-task: Red (Tests for mapping status strings to correct CSS classes).
  - [ ] Sub-task: Green (Implement `AgentStatusIndicator` using strict semantic tokens).
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Status Mapping' (Protocol in workflow.md)
