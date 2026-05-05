# Balnce Message Fabric Refactor: Architecture Decisions

1.  **Semantics First:** Routing is determined by the `lane` and `delivery` properties of the envelope, not the transport. Transports are chosen by the `FabricRouter` to satisfy the requirements of the lane.
2.  **Explicit Adapters:** We reject universal/blind instruction injection. Upstream data flows into DAG nodes only through explicit `NodeInputAdapter` implementations.
3.  **Read-Only SSE:** Server-Sent Events (SSE) is strictly for UI projection. It cannot be used for state mutation or command/control loops.
4.  **No Stubs in Production:** Every lane must have an interface and a real implementation path (even if it's a dev-only local persistence implementation with a gap-list entry for production scale).
