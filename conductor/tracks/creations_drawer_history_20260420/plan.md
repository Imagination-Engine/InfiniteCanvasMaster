# Implementation Plan: Creations Drawer & Sidebar Navigation

## Phase 1: Sidebar Layout & History Views
- [ ] Task: Build the responsive Left Sidebar container and History views.
    - [ ] Sub-task: Red (Write tests for sidebar rendering, collapse state, and List/Grid toggling)
    - [ ] Sub-task: Green (Implement the UI components with Tailwind and `shadcn/ui`)
    - [ ] Sub-task: Refactor (Extract List item and Grid card sub-components)
    - [ ] Sub-task: Adversarial (Write tests for rendering with zero history items vs. 500+ history items)
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Sidebar Layout & History Views' (Protocol in workflow.md)

## Phase 2: Client-Side Search & Data Hookup
- [ ] Task: Implement client-side filtering and connect the UI to the session data store.
    - [ ] Sub-task: Red (Write tests for search input filtering logic)
    - [ ] Sub-task: Green (Implement the search state and filter functions)
    - [ ] Sub-task: Refactor (Debounce the search input)
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Client-Side Search & Data Hookup' (Protocol in workflow.md)

## Phase 3: Creations Drawer & Routing
- [ ] Task: Implement the Creations section and the polymorphic Surface Router.
    - [ ] Sub-task: Red (Write tests for route generation based on `creation_surface` metadata)
    - [ ] Sub-task: Green (Build the Creations grid and the `LaunchRouter` component)
    - [ ] Sub-task: Refactor (Clean up route definitions mapping to future surface tracks)
    - [ ] Sub-task: Adversarial (Test routing behavior when a creation has an invalid or unknown surface type)
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Creations Drawer & Routing' (Protocol in workflow.md)