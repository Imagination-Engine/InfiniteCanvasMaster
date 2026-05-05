# Implementation Plan: Unified Chat Shell & Session Duality

## Phase 1: Chat Shell Core

- [x] Task: Build the base Chat Shell UI and integrate Vercel AI SDK.
  - [x] Sub-task: Red (Write tests for message rendering, input submission, and markdown parsing)
  - [x] Sub-task: Green (Implement `useChat` hook and UI with `shadcn/ui` and `react-markdown`)
  - [x] Sub-task: Refactor (Clean up component hierarchy)
  - [x] Sub-task: Adversarial (Write tests simulating network errors and malformed streaming chunks)
- [x] Task: Conductor - User Manual Verification 'Phase 1: Chat Shell Core' (Protocol in workflow.md)

## Phase 2: Session Link & Lazy Canvas

- [x] Task: Implement the Session state logic connecting Chat and Canvas views.
  - [x] Sub-task: Red (Write state machine tests for lazy canvas initialization)
  - [x] Sub-task: Green (Implement the logic to detect tool calls and trigger background canvas creation)
  - [x] Sub-task: Refactor (Abstract the "Open Canvas" inline notification component)
  - [x] Sub-task: Adversarial (Write test for rapid toggling between views during a streaming generation)
- [x] Task: Conductor - User Manual Verification 'Phase 2: Session Link & Lazy Canvas' (Protocol in workflow.md)

## Phase 3: Onboarding Experience

- [x] Task: Build the 4-slide first-run onboarding carousel.
  - [x] Sub-task: Red (Write tests for slide navigation and completion state persistence)
  - [x] Sub-task: Green (Implement the carousel using `embla-carousel-react`)
  - [x] Sub-task: Refactor (Optimize slide image loading)
- [x] Task: Conductor - User Manual Verification 'Phase 3: Onboarding Experience' (Protocol in workflow.md)
