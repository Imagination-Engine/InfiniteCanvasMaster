# Balnce Message Fabric Refactor: Updated Gap List

- **Durable Persistence Backend:** The `durable_event` and `provenance` lanes require a production-grade durable store (beyond local Postgres) for high-scale environments.
- **Yjs/tldraw Integration:** While boundaries are defined, full integration with Yjs/tldraw collaborative state adapters is deferred to the Canvas-specific tracks.
- **Cross-Instance Scaling:** `InProcessTransport` is limited to a single Node.js process. Distributed scaling will require a `RedisTransport` implementation.
- **Security Policy Enforcement:** Advanced policy checks (budgets, fine-grained capabilities) are scaffolded but require further database integration.
