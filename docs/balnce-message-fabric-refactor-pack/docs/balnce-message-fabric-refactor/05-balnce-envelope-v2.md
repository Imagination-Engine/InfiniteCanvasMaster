# 05 — BalnceEnvelope v2

The envelope is the shared contract across the fabric.

## Requirements

The envelope must capture:

- identity
- version
- trace/correlation/causation
- lane
- source/target
- event type
- delivery class
- trust/policy
- provenance hooks
- payload

## Canonical schema shape

```ts
export type BalnceEnvelope<TPayload = unknown> = {
  protocol: "balnce.fabric";
  version: "0.2.0";

  id: string;
  traceId: string;
  runId?: string;
  parentId?: string;
  correlationId?: string;
  causationId?: string;

  lane: BalnceFabricLane;

  source: FabricEndpoint;
  target?: FabricEndpoint;

  event: FabricEventDescriptor;
  delivery: FabricDelivery;
  instruction?: FabricInstruction;
  context?: FabricContext;
  policy?: FabricPolicy;
  provenance?: FabricProvenance;

  payload: TPayload;
};
```

## Delivery class

```ts
export type FabricDeliveryClass =
  | "ephemeral"
  | "replayable"
  | "durable"
  | "approval_required"
  | "provenance_required"
  | "realtime_low_latency";
```

## Instruction trust

```ts
export type FabricInstructionTrust =
  | "system"
  | "user"
  | "delegated_agent"
  | "agent_advisory"
  | "tool_output"
  | "retrieved_content"
  | "untrusted";
```

## Critical instruction rule

No upstream tool output, retrieved content, web content, file content, or untrusted agent message may become privileged execution instruction unless a node input adapter explicitly promotes it under policy.

## Serialization rule

Internally, publish typed envelopes.

At transport boundaries, encode as needed:

- NDJSON for streaming text boundaries
- JSON for HTTP/WebSocket
- protobuf for gRPC if adopted
- binary frames for ZeroMQ if adopted
- CRDT update format for Yjs/tldraw sync when appropriate

Do not make NDJSON the internal source-of-truth representation.
