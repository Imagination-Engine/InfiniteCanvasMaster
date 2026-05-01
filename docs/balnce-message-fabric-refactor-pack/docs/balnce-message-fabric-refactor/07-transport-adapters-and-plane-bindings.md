# 07 — Transport Adapters and Plane Bindings

The fabric is not a transport. It is a semantic router with adapters.

## Required interface

```ts
export interface FabricTransport {
  readonly id: string;
  readonly kind: string;
  publish<T>(envelope: BalnceEnvelope<T>): Promise<void>;
  subscribe<T>(
    filter: FabricSubscriptionFilter,
    handler: FabricHandler<T>,
  ): Promise<FabricUnsubscribe>;
  supports?(capability: FabricTransportCapability): boolean;
}
```

## Initial transports

### InProcessTransport

Current EventEmitter bus becomes this.

Use for:

- local DAG execution
- tests
- local event fanout

Do not use for:

- durability
- cross-process messaging
- collaborative document sync

### SSEProjectionTransport

Use for:

- server-to-client UI projection
- workflow timelines
- block generation feeds
- read-only event streams

Do not use for:

- bidirectional control
- internal agent negotiation
- canonical document state
- game runtime

### WebSocketTransport

Use for:

- bidirectional browser control
- interactive block control
- commands requiring frequent responses

### YjsDocumentStateAdapter

Use for:

- collaborative canvas object state
- rich text/block state
- offline merge-tolerant document state

### TldrawSyncAdapter

Use if the canvas engine is tldraw-heavy.

Use for:

- tldraw store synchronization
- multiplayer canvas editing
- tldraw presence/follow behavior

### DurableEventStoreAdapter

Use for:

- approval records
- artifact creation
- memory writes
- workflow completion/failure
- event replay

### ProvenanceAdapter

Use for:

- PLOG records
- content hashes
- signed traces
- VLAD-bound actions

### GrpcServiceTransport

Candidate for:

- backend service-to-service calls
- Mastra/OpenClaw gateway bindings
- model router to inference workers
- Edge Twin service boundaries

### ZeroMqExecutionTransport

Candidate for:

- local multi-process agent runtime
- device mesh experiments
- high-control execution planes
- worker pools

## Transport choice matrix

| Lane               | Preferred transport/adaptor          | Notes                            |
| ------------------ | ------------------------------------ | -------------------------------- |
| document_state     | Yjs or tldraw sync                   | canonical collaborative state    |
| presence           | Yjs Awareness or tldraw presence     | ephemeral awareness              |
| agent_stream       | InProcess + SSE/WebSocket projection | live deltas, not canonical state |
| command_control    | HTTP/WebSocket/gRPC/local dispatcher | must acknowledge                 |
| workflow_trace     | InProcess + durable mirror optional  | timeline/debug                   |
| runtime_simulation | local runtime/WebSocket/WebTransport | low-latency                      |
| durable_event      | event store/database                 | must not vanish                  |
| provenance         | PLOG/provenance adapter              | high integrity                   |
| ui_projection      | SSE/WebSocket                        | visible stream only              |
