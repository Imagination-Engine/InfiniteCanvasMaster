# Balnce Message Fabric Refactor: Integration Task List

## Slice 1: Baseline Testing

- [ ] Implement baseline tests for existing A2A envelope/bus behavior.

## Slice 2: Fabric Types

- [ ] Define `BalnceFabricLane`, `FabricDeliveryClass`, and `FabricEndpoint` in `packages/core/src/fabric/`.
- [ ] Define `BalnceEnvelope` v0.2.0 schema.

## Slice 3-4: Transport & Router

- [ ] Implement `InProcessTransport` (wrapping current EventEmitter).
- [ ] Implement `FabricRouter` v1 (routing by lane/delivery).

## Slice 5-6: Envelope & Topics

- [ ] Implement envelope v2 upgrade/validation utilities.
- [ ] Implement `FabricTopics` helpers.

## Slice 7-8: Mastra & Adapters

- [ ] Implement `MastraDagFabricAdapter`.
- [ ] Replace universal input mutation with explicit `NodeInputAdapter` system.

## Slice 9-10: SSE & UI Projection

- [ ] Implement `SSEProjectionTransport`.
- [ ] Update UI subscription hooks for lane-aware filtering.

## Slice 11-14: Boundaries

- [ ] Define `document_state` boundary (Yjs/tldraw).
- [ ] Define `command_control` acknowledgment path.
- [ ] Define `durable_event` and `provenance` adapter contracts.

## Slice 15-18: Validation

- [ ] Add lane-specific tests.
- [ ] Perform No-Stub audit.
- [ ] Generate final review package.
