# Balnce Message Fabric Refactor: Repo Integration Map

- **`@iem/core` (Primary Target):** The central hub for the refactor.
  - `src/fabric/`: New directory containing lanes, envelope v2, delivery semantics, and the central `FabricRouter`.
  - `src/fabric/transports/`: Contains `InProcessTransport` (promoted from legacy bus) and `SSEProjectionTransport`.
  - `src/fabric/adapters/`: Contains integration adapters for Mastra, Canvas, and Document State.
- **`@iem/agents`:**
  - `src/workflows/compiler.ts`: Refactored to use `MastraDagFabricAdapter` and emit lane-aware events (`workflow_trace`, `agent_stream`).
- **`apps/server`:**
  - `src/routes/a2a.ts`: Refactored to use the `SSEProjectionTransport` for UI streaming.
- **`apps/web`:**
  - `src/hooks/useA2A.ts`: Updated to subscribe to specific lanes via the new fabric subscription filters.
