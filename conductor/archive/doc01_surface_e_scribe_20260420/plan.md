# Implementation Plan: Doc 01: Surface E (Scribe) & Exhaustive Block Scaffolding

## Phase 1: Exhaustive Block Automation (`pnpm iem:new-block`)

- [x] Task: Build the Node.js CLI script for automated block scaffolding.
  - [x] Sub-task: Red (Write shell/unit tests verifying directory creation and correct file contents based on CLI arguments)
  - [x] Sub-task: Green (Implement `scripts/new-block.ts` utilizing `commander` or `inquirer` for input and `fs` for template generation)
  - [x] Sub-task: Refactor (Extract string templates into distinct files for easier maintenance)
  - [x] Sub-task: Adversarial (Write tests invoking the script with invalid or existing IDs to ensure proper error handling)
- [x] Task: Integrate the CLI into an MCP tool to allow agents to generate new blocks dynamically.
  - [x] Sub-task: Red/Green/Refactor the MCP server binding (`generate_block`) for the CLI.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Exhaustive Block Automation' (Protocol in workflow.md)

## Phase 2: Surface E (Scribe) Foundation

- [x] Task: Implement the Tiptap-powered `Prose` and `Chapter` blocks.
  - [x] Sub-task: Red (Write schema and rendering tests for Tiptap integration)
  - [x] Sub-task: Green (Use `pnpm iem:new-block` to scaffold the blocks, then implement the Tiptap editor view components)
  - [x] Sub-task: Refactor (Optimize memory usage for large documents loaded into Tiptap)
- [x] Task: Implement the Manuscript View Mode and the Revision Track slider.
  - [x] Sub-task: Red (Write tests verifying the transition from node-based view to page-based serial view)
  - [x] Sub-task: Green (Implement the layout engine and the `jsonb` array persistence logic for revisions)
- [x] Task: Conductor - User Manual Verification 'Phase 2: Surface E (Scribe) Foundation' (Protocol in workflow.md)

## Phase 3: Export Pipeline (EPUB/PDF/Web)

- [x] Task: Build the surface-specific export toolchain.
  - [x] Sub-task: Red (Write tests mocking the `epub-gen` and `Puppeteer` APIs)
  - [x] Sub-task: Green (Implement the `ExportPipeline` utility parsing the manuscript state into the four formats)
  - [x] Sub-task: Refactor (Abstract the HTML layout template used for both PDF generation and Web export)
  - [x] Sub-task: Adversarial (Test the export pipeline with empty chapters or extremely large image assets)
- [x] Task: Conductor - User Manual Verification 'Phase 3: Export Pipeline' (Protocol in workflow.md)
