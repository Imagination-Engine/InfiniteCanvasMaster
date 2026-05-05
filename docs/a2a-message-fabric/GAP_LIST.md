# A2A Message Fabric Gap List

- **Durable Transport:** We currently lack a persistent message broker (e.g., Redis, Kafka) for cross-instance routing or durable event logs.
- **OpenClaw Integration:** The OpenClaw runtime is referenced in topics but not fully integrated into the test suite or adapter registry.
- **Cross-Process UI Subscription:** The mechanism for passing A2A envelopes from the server process to the React Canvas UI (e.g., SSE or WebSockets) needs standardizing, including the NDJSON boundary translation.
- **Complex Policy Rules:** The initial policy engine will be basic (trust validation). More complex rules (budgets, capability blocking) will require integration with the `@iem/db` layer.
