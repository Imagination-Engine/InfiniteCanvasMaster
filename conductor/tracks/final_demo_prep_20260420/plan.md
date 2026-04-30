# Implementation Plan: Final Demo Preparation & Scripts

## Phase 1: Localized Demo Scripts

- [x] Task: Create the five `demo-script.md` files localized to each student's package.
  - [x] Sub-task: Red (Write shell tests verifying the existence of the script files in `packages/surface-*`)
  - [x] Sub-task: Green (Generate the scripts based on the specific 5-step routines outlined in Sections 12.5, 13.5, 14.5, 15.5, and 16.1)
  - [x] Sub-task: Refactor (Standardize markdown formatting across all five files)
- [x] Task: Conductor - User Manual Verification 'Phase 1: Localized Demo Scripts' (Protocol in workflow.md)

## Phase 2: Expanded Faculty Brief

- [x] Task: Generate `docs/demo/faculty-brief.md`.
  - [x] Sub-task: Red (Write shell tests verifying the existence of the brief and its required sections)
  - [x] Sub-task: Green (Implement the Master Plan's one-pager requirements plus the expanded technical deep-dives into MCP, Vercel AI SDK, and pgvector)
  - [x] Sub-task: Refactor (Refine the architectural diagram to ensure clarity for non-technical faculty members)
- [x] Task: Conductor - User Manual Verification 'Phase 2: Expanded Faculty Brief' (Protocol in workflow.md)

## Phase 3: Electrobun Desktop Wrapper (Stretch Goal)

- [x] Task: Scaffold the `apps/desktop` workspace with Electrobun.
  - [x] Sub-task: Red (Write tests confirming the build configurations can execute successfully without a full bundle)
  - [x] Sub-task: Green (Initialize the Electrobun wrapper and basic Node.js backend embedding config)
  - [x] Sub-task: Refactor (Ensure the `apps/desktop` package is correctly wired into the `pnpm-workspace.yaml` and `turbo.json` pipelines)
- [x] Task: Conductor - User Manual Verification 'Phase 3: Electrobun Desktop Wrapper (Stretch Goal)' (Protocol in workflow.md)
