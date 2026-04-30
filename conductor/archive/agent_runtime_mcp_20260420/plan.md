# Implementation Plan: Agent Runtime & MCP Orchestration

## Phase 1: Model Provider Abstraction
- [x] Task: Define the `ModelProvider` interface and implement the `GeminiProvider`.
    - [x] Sub-task: Red (Write failing tests for interface contract and mocked Gemini responses)
    - [x] Sub-task: Green (Implement `ModelProvider` interface and `GeminiProvider` logic)
    - [x] Sub-task: Refactor (Clean up network request and parsing logic)
    - [x] Sub-task: Adversarial (Write tests simulating Gemini API rate limits and timeouts)
- [x] Task: Scaffold the `OllamaProvider` (dormant foundation).
    - [x] Sub-task: Red/Green/Refactor/Adversarial for the basic Ollama connection class.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Model Provider Abstraction' (Protocol in workflow.md)

## Phase 2: MCP Client Integration
- [x] Task: Implement the MCP Client wrapper to allow blocks to dispatch to tools.
    - [x] Sub-task: Red (Write tests for local and remote `MCPToolBinding` dispatches)
    - [x] Sub-task: Green (Integrate `@modelcontextprotocol/sdk` client)
    - [x] Sub-task: Refactor (Optimize connection lifecycle management)
    - [x] Sub-task: Adversarial (Write tests for broken remote MCP server connections)
- [x] Task: Conductor - User Manual Verification 'Phase 2: MCP Client Integration' (Protocol in workflow.md)

## Phase 3: Canvas MCP Server (Full Recursion)
- [x] Task: Implement the Canvas backend MCP server exposing `canvas.*` tools.
    - [x] Sub-task: Red (Write tests for `describe`, `addBlock`, and `connect` endpoints)
    - [x] Sub-task: Green (Implement the MCP server using the SDK)
    - [x] Sub-task: Refactor (Abstract the canvas manipulation logic from the transport layer)
    - [x] Sub-task: Adversarial (Write full integration test: Remote agent connects, adds blocks, wires them, and executes them)
- [x] Task: Automatically expose registered blocks as MCP tools on the Canvas server.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Canvas MCP Server' (Protocol in workflow.md)