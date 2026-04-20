# Specification: Substrate Foundation: Chat Shell and Canvas Duality

## 1. Overview
This track establishes the foundational user interface substrate for the Imagination Engine. It introduces the Chat Shell and implements the bidirectional "Dual-View" toggling mechanism, allowing users to seamlessly switch between a pure conversational interface and the React Flow visual canvas.

## 2. Functional Requirements
- **Chat Shell Component:** A persistent conversational interface where users can type commands and interact with the agent.
- **View Toggling:** A UI mechanism to toggle the primary view state between:
  - Chat-Only Mode
  - Canvas-Only Mode
  - Dual-View (Split Screen) Mode
- **State Synchronization Framework:** Foundational state management (e.g., via Zustand or Redux) to ensure the chat input and canvas nodes are aware of the same application state.

## 3. Non-Functional Requirements
- **Performance:** 60fps UI performance during view toggling.
- **Quality:** Strict adherence to 85% test coverage and the Red/Green/Refactor/Adversarial TDD workflow.
- **Accessibility:** Keyboard navigation support for toggling views.

## 4. Out of Scope
- Implementing the actual LLM agent logic or network calls to Ollama/Gemini (this will be a separate track).
- Refactoring the 9 existing nodes to MCP tools (this will be a separate track).