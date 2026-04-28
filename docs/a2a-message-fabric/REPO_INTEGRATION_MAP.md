# A2A Message Fabric: Repo Integration Map

- **`@iem/core`:** The heart of the fabric. Contains protocols, types, topic helpers, transport interfaces, policy engine interfaces, adapter registries, and the local implementation.
- **`@iem/agents` (or DAG Compiler):** The primary publisher and consumer. The DAG execution logic (`ChainExecutor`) must be updated to inject the fabric, use adapters, and publish typed envelopes.
- **`@iem/imagination-canvas-kit` (or equivalent Canvas UI):** Must subscribe to the fabric (via WebSockets or IPC if across process boundaries) to observe `canvas.*.block.*.event` and `dag.*.node.*.event` for real-time state updates.
- **`@iem/desktop` / `apps/server`:** Responsible for wiring the dependencies. Initializes the `LocalEventEmitterTransport`, `CoreMessageFabric`, `BasicPolicyEngine`, and injects them into the agent runtime and UI endpoints.
