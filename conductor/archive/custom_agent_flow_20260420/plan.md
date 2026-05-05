# Implementation Plan: Custom Agent Flow & Wizard

## Phase 1: Database & RAG Foundation

- [x] Task: Set up the database tables and embedding infrastructure.
  - [x] Sub-task: Red (Write tests for DB schema constraints and embedding generation mocks)
  - [x] Sub-task: Green (Implement `custom_agents` table migration with `pgvector` and the Gemini embedding utility)
  - [x] Sub-task: Refactor (Clean up the chunking and embedding logic)
  - [x] Sub-task: Adversarial (Write tests attempting to retrieve embeddings scoped to a different user ID)
- [x] Task: Conductor - User Manual Verification 'Phase 1: Database & RAG Foundation' (Protocol in workflow.md)

## Phase 2: The Sliding Panel UI

- [x] Task: Build the 6-step Custom Agent configuration form.
  - [x] Sub-task: Red (Write tests for form validation and step progression)
  - [x] Sub-task: Green (Implement the Sliding Panel UI and the 6 form steps using React Hook Form and Zod)
  - [x] Sub-task: Refactor (Extract individual step components)
  - [x] Sub-task: Adversarial (Write tests submitting the form with payload sizes exceeding expected limits, e.g., massive story text)
- [x] Task: Conductor - User Manual Verification 'Phase 2: The Sliding Panel UI' (Protocol in workflow.md)

## Phase 3: Registration & Palette Integration

- [x] Task: Connect the form submission to the block registry.
  - [x] Sub-task: Red (Write tests for dynamic `BlockDefinition` generation)
  - [x] Sub-task: Green (Implement the API endpoint to save the agent and the client logic to update the block registry)
  - [x] Sub-task: Refactor (Optimize the registry state update to avoid full canvas re-renders)
- [x] Task: Conductor - User Manual Verification 'Phase 3: Registration & Palette Integration' (Protocol in workflow.md)
