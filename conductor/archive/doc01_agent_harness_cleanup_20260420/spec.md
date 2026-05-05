# Specification: Doc 01: Agent Harness Cleanup & Migration Strategy

## 1. Overview

This track implements Part I of the Execution Kit Addendum (IEM-MASTER-01). It formally retires the Python-based Autogen exploration in favor of a lean, TypeScript-native orchestration layer built on the Block Protocol, Canvas Scheduler, and Vercel AI SDK. It ensures the team is aligned on the orchestration framework (ours) and the model providers (Ollama + Gemini).

## 2. Functional Requirements

### 2.1 Autogen Retirement

- **Archive & Document:** Preserve the existing `autogen_exploration/` directory as an archive of learnings. Write a detailed `README.md` within it explaining why the framework was retired (language mismatch, metaphor mismatch, redundancy) in favor of the native TypeScript substrate.

### 2.2 Orchestration Utilities

- **Chain Executor (`@iem/core/chain`):** Build a lightweight TypeScript helper utility that handles linear sequences of agent roles (e.g., Architect -> Designer -> Builder -> Tester) specifically designed to support Surface D's execution pattern, without introducing a heavy third-party framework.

### 2.3 Local Model Onboarding Automation

- **Automated Setup Script (`pnpm setup:models`):** Create a Node.js/Bash script that detects if Ollama is running, lists available models, and automatically executes `ollama pull` for a configurable list of target models (e.g., `hermes3`, `qwen2.5-coder`). The script must be flexible to support pulling any model from the Ollama catalog.

## 3. Non-Functional Requirements

- **Simplicity:** The `ChainExecutor` must remain under a few hundred lines of code; it is a utility, not a framework.
- **TDD:** Adhere to the strict 85% coverage "Red, Green, Refactor, Adversarial" workflow for the new utilities.

## 4. Out of Scope

- Removing the Vercel AI SDK or MCP SDK integrations (these are the officially supported upstream tools).
