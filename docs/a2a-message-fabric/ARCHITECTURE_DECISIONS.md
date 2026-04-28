# A2A Message Fabric Architecture Decisions

1.  **Strict Internal Typing:** We will enforce `BalnceEnvelope` structures for all internal in-memory routing. NDJSON serialization is strictly reserved for process boundaries (e.g., WebSockets, MCP streams) or durable storage.
2.  **Dependency Injection First:** The DAG compiler will no longer rely on a global `MessageBus` singleton. The fabric components (`A2AMessageFabric`, `A2APolicyEngine`, `NodeInputAdapterRegistry`) will be passed via an options object to enable testing and alternative transports.
3.  **Adapter-Driven Input:** We reject the "universal mutation" approach. Upstream data will only flow downstream through specific `NodeInputAdapter` implementations, allowing strict schema validation and trust downgrading.
4.  **Local Transport First:** The initial `A2AMessageFabric` implementation will use a local `EventEmitter` transport, but the architecture ensures that durable logs (e.g., Redis Streams, Postgres) can be seamlessly swapped in later.
