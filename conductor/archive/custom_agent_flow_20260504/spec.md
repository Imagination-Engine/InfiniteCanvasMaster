# Specification: Custom Agent & Saved Block Flow

## Overview

This track implements the capability for users to dynamically construct, configure, and save custom agentic blocks. Based on the "IEM Canvas Plz.md" document, users need a seamless flow to move from an idea to a persistent, reusable custom block within the library.

## Functional Requirements

1. **Agent Definition Flow:**
   - **Primary Flow (Orchestrator):** The user instructs the Orchestrator (e.g., "I need a copywriter agent"). The Orchestrator configures and drops a pre-populated custom agent block onto the canvas.
   - **Secondary Flow (Manual):** The user drags a "Blank Agent Template" from the library to the canvas, maximizes it, and configures the role, instructions, and tools manually.
2. **"Save to Library" Capability:**
   - Implement a "Save to Library" affordance on the expanded UI of any custom-configured block.
   - The action should capture the block's current configuration (role, tools, prompt).
3. **Persistence (Mock to DB pipeline):**
   - Implement the frontend service/hook to dispatch the custom block payload to the backend database.
   - If the backend endpoint is not fully wired, gracefully mock the network delay and success state, but the architecture MUST be designed to push to the DB, not just local storage.
4. **Library Integration:**
   - Saved custom blocks should appear in a dedicated "Custom" or "My Blocks" section within the Block Library.

## Acceptance Criteria

- [ ] A "Blank Agent Template" is available in the library.
- [ ] The Orchestrator can successfully generate and drop a custom-configured agent block based on a prompt.
- [ ] Users can manually configure an agent block in its expanded state.
- [ ] A "Save to Library" button exists and successfully executes the mock/DB-dispatch workflow.
- [ ] Saved blocks appear in the "Custom" section of the Block Library.

## Out of Scope

- Backend database schema migrations (assuming the payload matches an existing generic block schema).
