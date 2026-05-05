# Fabric package scaffold

This scaffold is intentionally minimal. It is a target structure for the implementation agents, not a claim that the fabric is already implemented.

Suggested implementation order:

1. contracts/types
2. InProcessTransport wrapper
3. FabricRouter
4. envelope v2 + serialization
5. topic helpers
6. MastraDagFabricAdapter
7. node input adapters
8. SSE projection
9. document-state adapter boundary
10. durable/provenance/command/runtime boundaries
