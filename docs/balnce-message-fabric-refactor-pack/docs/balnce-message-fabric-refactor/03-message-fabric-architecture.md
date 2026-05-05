# 03 — Message Fabric Architecture

## Target architecture

```txt
Balnce Message Fabric
  ├── BalnceEnvelope v2
  ├── Lane registry
  ├── Topic grammar
  ├── Delivery semantics
  ├── Fabric router
  ├── Policy/trust model
  ├── Provenance hooks
  ├── Observability/replay hooks
  └── Transport/adaptor layer
        ├── InProcessTransport
        ├── SSEProjectionTransport
        ├── WebSocketTransport
        ├── YjsDocumentStateAdapter
        ├── TldrawSyncAdapter
        ├── CommandControlAdapter
        ├── RuntimeSimulationAdapter
        ├── DurableEventStoreAdapter
        ├── ProvenanceAdapter
        ├── GrpcServiceTransport
        └── ZeroMqExecutionTransport
```

## Developer-facing API

The goal is one conceptual API:

```ts
fabric.publish(envelope);
fabric.subscribe(filter, handler);
fabric.command(command);
fabric.projectToUI(filter);
fabric.commitDocumentChange(change);
fabric.recordDurableEvent(event);
fabric.recordProvenance(event);
```

Under the hood, the router chooses the correct lane adapter.

## Core rule

Do not route by transport first. Route by semantics first.

```txt
Wrong:
SSE event → bus event

Right:
agent_stream event → UI projection via SSE or WebSocket
```

## Relationship to current bus

The current EventEmitter implementation becomes:

```txt
InProcessTransport
```

It is useful for:

- Mastra DAG local execution
- tests
- synchronous internal subscribers
- lightweight development mode
- event fanout within a single process

It is not responsible for:

- document-state collaboration
- durable event retention
- approval persistence
- cross-process delivery
- game runtime state
- provenance record integrity
