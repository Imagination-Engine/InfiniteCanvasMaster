# Specification: Surface D — Forge (App Builder)

## 1. Overview

This track implements the fourth specialized surface (Section 15 of the Master Plan). Surface D transforms the canvas into a software forge, where a chain of specialized agent blocks collaboratively architects, designs, builds, and tests a runnable mini-app based on a user's prompt.

## 2. Functional Requirements

### 2.1 Multi-Agent Composition

- **The Blackboard:** Implement a shared 'Blackboard' state object. Instead of simple string passing, the `Architect`, `Designer`, `Builder`, and `Tester` blocks will read from and incrementally mutate this shared structured state throughout the DAG execution.
- **Agent Blocks:**
  - `Architect`: Produces the structured spec (file list, component tree).
  - `Designer`: Produces the layout and styling guidelines.
  - `Builder`: Generates the actual code using **Gemini 3.5 Pro**.
  - `Tester`: Evaluates the generated code against the initial spec.

### 2.2 Compilation & Execution Sandbox

- **WebContainers Integration:** Implement the WebContainer API to run a full Node.js environment directly within the user's browser, allowing the generated apps to utilize standard dev servers (like Vite).
- **Build Log UI:** Create a dedicated panel that streams the internal thoughts, outputs, and status of the four agents in real-time as they work.

### 2.3 Artifact Export

- **Launchable Artifact:** Ensure the final compiled output from the WebContainer can be saved as a Creation and launched from the drawer as a full-screen application.

## 3. Non-Functional Requirements

- **Security:** Ensure the WebContainer instance is strictly sandboxed to prevent malicious generated code from escaping or accessing the host application's data.
- **TDD:** Adhere to the strict 85% coverage "Red, Green, Refactor, Adversarial" workflow, particularly focusing on the Tester block's validation logic.

## 4. Out of Scope

- Building complex multi-container orchestration; the scope is limited to single-container web applications.
