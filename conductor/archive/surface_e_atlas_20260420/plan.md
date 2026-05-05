# Implementation Plan: Surface E — Atlas (Knowledge Graph)

## Phase 1: Atlas View & Auto-Layout

- [x] Task: Implement the `AtlasCanvas` view mode and auto-layout engine.
  - [x] Sub-task: Red (Write tests verifying node coordinate updates after a layout pass)
  - [x] Sub-task: Green (Integrate an auto-layout library like `dagre` or `d3-force` into the React Flow instance)
  - [x] Sub-task: Refactor (Optimize layout calculation to run in a Web Worker if necessary)
  - [x] Sub-task: Adversarial (Write tests triggering the layout engine with massive, highly-connected graphs)
- [x] Task: Conductor - User Manual Verification 'Phase 1: Atlas View & Auto-Layout' (Protocol in workflow.md)

## Phase 2: Knowledge-Primitive Blocks

- [x] Task: Build the `Ingestion`, `Retrieval`, and `Synthesis` MCP blocks.
  - [x] Sub-task: Red (Write schema validation and mocked vector DB retrieval tests)
  - [x] Sub-task: Green (Implement the block definitions, connecting to the `pgvector` store)
  - [x] Sub-task: Refactor (Abstract the embedding chunking logic into a reusable utility)
  - [x] Sub-task: Adversarial (Write tests attempting to ingest malformed documents or executing retrievals against empty databases)
- [x] Task: Conductor - User Manual Verification 'Phase 2: Knowledge-Primitive Blocks' (Protocol in workflow.md)

## Phase 3: Searchable Export

- [x] Task: Implement the "Launch as Creation" read-only knowledge explorer view.
  - [x] Sub-task: Red/Green/Refactor for the UI component that consumes the exported graph state.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Searchable Export' (Protocol in workflow.md)
