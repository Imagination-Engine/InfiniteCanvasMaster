# Implementation Plan: Custom Agent Flow & Wizard

## Phase 1: Database & RAG Foundation
- [ ] Task: Set up the database tables and embedding infrastructure.
    - [ ] Sub-task: Red (Write tests for DB schema constraints and embedding generation mocks)
    - [ ] Sub-task: Green (Implement `custom_agents` table migration with `pgvector` and the Gemini embedding utility)
    - [ ] Sub-task: Refactor (Clean up the chunking and embedding logic)
    - [ ] Sub-task: Adversarial (Write tests attempting to retrieve embeddings scoped to a different user ID)
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Database & RAG Foundation' (Protocol in workflow.md)

## Phase 2: The Sliding Panel UI
- [ ] Task: Build the 6-step Custom Agent configuration form.
    - [ ] Sub-task: Red (Write tests for form validation and step progression)
    - [ ] Sub-task: Green (Implement the Sliding Panel UI and the 6 form steps using React Hook Form and Zod)
    - [ ] Sub-task: Refactor (Extract individual step components)
    - [ ] Sub-task: Adversarial (Write tests submitting the form with payload sizes exceeding expected limits, e.g., massive story text)
- [ ] Task: Conductor - User Manual Verification 'Phase 2: The Sliding Panel UI' (Protocol in workflow.md)

## Phase 3: Registration & Palette Integration
- [ ] Task: Connect the form submission to the block registry.
    - [ ] Sub-task: Red (Write tests for dynamic `BlockDefinition` generation)
    - [ ] Sub-task: Green (Implement the API endpoint to save the agent and the client logic to update the block registry)
    - [ ] Sub-task: Refactor (Optimize the registry state update to avoid full canvas re-renders)
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Registration & Palette Integration' (Protocol in workflow.md)