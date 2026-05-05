# Balnce Message Fabric Refactor Specification

## Overview

This track upgrades the existing A2A Message Fabric into the lane-aware Balnce Message Fabric. It transitions the system from a generic local event bus into a structured, semantically segregated nervous system capable of supporting collaborative document state, agent streams, durable events, and execution control across multiple transports.

## Core Architectural Shifts

1.  **Semantic Lanes:** Introduction of `BalnceFabricLane` (e.g., `document_state`, `agent_stream`, `command_control`). Routing is determined by semantics first, not transport.
2.  **Envelope V2:** Upgrade to `BalnceEnvelope` v0.2.0, making `lane` and `delivery` required top-level fields.
3.  **Fabric Router:** Implementation of a central router that delegates envelopes to the appropriate transport (e.g., `InProcessTransport`, `SSEProjectionTransport`) based on their lane and delivery semantics.
4.  **Transport Segregation:** Clarifying transport responsibilities. SSE is read-only projection; local EventEmitter is for local execution only; Yjs/tldraw sync handles canonical document state.

## Implementation Cadence

This track strictly adheres to the 18-slice implementation cadence defined in `docs/balnce-message-fabric-refactor/16-implementation-slices-cadence.md`.
