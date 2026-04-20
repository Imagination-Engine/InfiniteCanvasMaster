# Specification: Agent Runtime & MCP Orchestration

## 1. Overview
This track builds the core Agent Runtime (Section 6 of the Master Plan). It establishes the layer that allows blocks to communicate with AI models and external tools without reinventing the conversation logic. Crucially, it implements the recursive Model Context Protocol (MCP) architecture: the Canvas acts as an MCP server, and every Block acts as an MCP tool.

## 2. Functional Requirements
### 2.1 The Provider Abstraction
- **Unified Interface:** Create the `ModelProvider` interface (`chat`, `stream`, `supportsTools`).
- **Implementations:** 
  - Build `GeminiProvider` as the primary, default intelligence engine.
  - Build the foundation for `OllamaProvider` (to be activated in a later phase for on-device inference).

### 2.2 The Recursive MCP Architecture
- **MCP Client:** Wrap `@modelcontextprotocol/sdk` to allow blocks to call local or remote MCP tools.
- **Canvas as MCP Server:** Expose core canvas actions (`describe`, `addBlock`, `connect`, `run`, `get`, `listBlocks`) via an MCP server, allowing external agents or the Chat Shell to manipulate the canvas.
- **Block as MCP Tool:** Automatically expose every registered block as a named MCP tool on the Canvas's MCP server.

## 3. Non-Functional Requirements
- **Interchangeability:** Provider implementations must be cleanly swappable via configuration.
- **TDD Contract:** Must fulfill the rigorous testing contract defined in Section 6.6, including full integration tests verifying that a remote agent can build and run a canvas using local tools.

## 4. Out of Scope
- Building the actual UI for the Chat Shell or Canvas (this track is strictly the backend runtime and protocol wrappers).