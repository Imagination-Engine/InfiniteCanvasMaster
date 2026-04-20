# Implementation Plan: Agent Runtime & MCP Orchestration

## Phase 1: Model Provider Abstraction
- [ ] Task: Define the `ModelProvider` interface and implement the `GeminiProvider`.
    - [ ] Sub-task: Red (Write failing tests for interface contract and mocked Gemini responses)
    - [ ] Sub-task: Green (Implement `ModelProvider` interface and `GeminiProvider` logic)
    - [ ] Sub-task: Refactor (Clean up network request and parsing logic)
    - [ ] Sub-task: Adversarial (Write tests simulating Gemini API rate limits and timeouts)
- [ ] Task: Scaffold the `OllamaProvider` (dormant foundation).
    - [ ] Sub-task: Red/Green/Refactor/Adversarial for the basic Ollama connection class.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Model Provider Abstraction' (Protocol in workflow.md)

## Phase 2: MCP Client Integration
- [ ] Task: Implement the MCP Client wrapper to allow blocks to dispatch to tools.
    - [ ] Sub-task: Red (Write tests for local and remote `MCPToolBinding` dispatches)
    - [ ] Sub-task: Green (Integrate `@modelcontextprotocol/sdk` client)
    - [ ] Sub-task: Refactor (Optimize connection lifecycle management)
    - [ ] Sub-task: Adversarial (Write tests for broken remote MCP server connections)
- [ ] Task: Conductor - User Manual Verification 'Phase 2: MCP Client Integration' (Protocol in workflow.md)

## Phase 3: Canvas MCP Server (Full Recursion)
- [ ] Task: Implement the Canvas backend MCP server exposing `canvas.*` tools.
    - [ ] Sub-task: Red (Write tests for `describe`, `addBlock`, and `connect` endpoints)
    - [ ] Sub-task: Green (Implement the MCP server using the SDK)
    - [ ] Sub-task: Refactor (Abstract the canvas manipulation logic from the transport layer)
    - [ ] Sub-task: Adversarial (Write full integration test: Remote agent connects, adds blocks, wires them, and executes them)
- [ ] Task: Automatically expose registered blocks as MCP tools on the Canvas server.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Canvas MCP Server' (Protocol in workflow.md)