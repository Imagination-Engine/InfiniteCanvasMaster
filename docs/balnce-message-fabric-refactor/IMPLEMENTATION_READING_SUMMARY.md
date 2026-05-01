# Balnce Message Fabric Refactor: Implementation Reading Summary

## Core Thesis Absorbed

1.  **Promotion, not Rewrite:** We are upgrading the existing local `A2AMessageFabric` (which was built around `BalnceEnvelope` v1 and a `LocalEventEmitterTransport`) into the **Balnce Message Fabric**.
2.  **Semantic Lanes:** The core architectural shift is the introduction of `BalnceFabricLane`. The fabric will no longer be a generic pipe. Every message must be explicitly assigned a lane (e.g., `document_state`, `agent_stream`, `command_control`) that dictates its behavior and transport.
3.  **Envelope V2:** `BalnceEnvelope` will be upgraded to `v0.2.0`, which makes `lane` and `delivery` required fields and introduces a tighter `FabricEndpoint` schema.
4.  **Transport Segregation:** The current `MessageBus` logic will be explicitly wrapped as an `InProcessTransport`. SSE will be explicitly demoted to a projection-only transport (`SSEProjectionTransport`) that is forbidden from owning canonical state or control flows.
5.  **Strict Boundaries:** The refactor enforces hard boundaries. Document state (Yjs/tldraw) must not be mutated directly by raw token streams. Command and control events require acknowledgments.

## Implementation Slices

I have absorbed the 18-slice implementation cadence. We will proceed linearly from baseline testing (Slice 1) through envelope upgrades, router creation, Mastra integration, node input adapters, transport creation, boundary definitions, and finally, a production hardening audit. No stubs or fake production paths will remain.
