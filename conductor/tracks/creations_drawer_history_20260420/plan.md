# Implementation Plan: Creations Drawer & Sidebar Navigation

## Phase 1: Sidebar Layout & History Views
- [x] Task: Build the responsive Left Sidebar container and History views.
    - [x] Sub-task: Red (Write tests for sidebar rendering, collapse state, and List/Grid toggling)
    - [x] Sub-task: Green (Implement the UI components with Tailwind and `shadcn/ui`)
    - [x] Sub-task: Refactor (Extract List item and Grid card sub-components)
    - [x] Sub-task: Adversarial (Write tests for rendering with zero history items vs. 500+ history items)
- [x] Task: Conductor - User Manual Verification 'Phase 1: Sidebar Layout & History Views' (Protocol in workflow.md)

## Phase 2: Client-Side Search & Data Hookup
- [x] Task: Implement client-side filtering and connect the UI to the session data store.
    - [x] Sub-task: Red (Write tests for search input filtering logic)
    - [x] Sub-task: Green (Implement the search state and filter functions)
    - [x] Sub-task: Refactor (Debounce the search input)
- [x] Task: Conductor - User Manual Verification 'Phase 2: Client-Side Search & Data Hookup' (Protocol in workflow.md)

## Phase 3: Creations Drawer & Routing
- [x] Task: Implement the Creations section and the polymorphic Surface Router.
    - [x] Sub-task: Red (Write tests for route generation based on `creation_surface` metadata)
    - [x] Sub-task: Green (Build the Creations grid and the `LaunchRouter` component)
    - [x] Sub-task: Refactor (Clean up route definitions mapping to future surface tracks)
    - [x] Sub-task: Adversarial (Test routing behavior when a creation has an invalid or unknown surface type)
- [x] Task: Conductor - User Manual Verification 'Phase 3: Creations Drawer & Routing' (Protocol in workflow.md)