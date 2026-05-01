# Specification: Custom Agent Flow & Wizard

## 1. Overview

This track implements the Custom Agent Flow (Section 10 of the Master Plan). It enables users to parameterize their own agentic blocks by authoring a story, persona, skills, context, and capabilities. This turns a generic block into a reusable, named Custom Agent available in the palette.

## 2. Functional Requirements

### 2.1 The Wizard UI

- **Implementation:** Build a Sliding Panel Form that emerges from the right side of the screen, housing the 6-step configuration process.
- **Steps:**
  1. **Story:** Text area for background/purpose.
  2. **Persona:** Name, tagline, avatar, and tone selector.
  3. **Skills:** Multi-select checklist of available MCP tools.
  4. **Context:** Upload area for text/PDF/URL sources.
  5. **Capabilities:** Execution mode (triggered/streaming) and output types.
  6. **Purpose:** One-sentence summary for the palette.

### 2.2 Context & Embeddings (RAG Foundation)

- **Vector Store:** Integrate `pgvector` into the PostgreSQL database to store and retrieve document embeddings.
- **Embeddings API:** Utilize the `@google/genai` SDK and the `gemini-embedding-001` model to generate embeddings for the user-uploaded context chunks.

### 2.3 Registration Flow

- **Data Model:** Create the `custom_agents` table schema as defined in the Master Plan.
- **Palette Integration:** Ensure that upon completion of the wizard, the new `BlockDefinition` is dynamically registered and immediately appears in the Canvas block palette.

## 3. Non-Functional Requirements

- **Security:** Ensure uploaded context files are scoped securely to the owner's workspace.
- **TDD:** Adhere to the strict 85% coverage "Red, Green, Refactor, Adversarial" workflow.

## 4. Out of Scope

- Building complex PDF parsing logic (use basic text extraction for the capstone scope).
