# A2A Message Fabric Specification

## Overview

This track implements the Balnce A2A Message Fabric, evolving the internal event bus from a basic `EventEmitter` into a semantic, strongly-typed messaging layer. This fabric will serve as the nervous system for Mastra DAGs, Imagination Canvas observation, and future distributed systems within the Imagination Engine.

## Objectives

1.  **Protocol & Typing:** Replace raw NDJSON strings with strictly typed `BalnceEnvelope` objects for all internal routing.
2.  **Transport Decoupling:** Introduce the `A2AMessageFabric` interface to decouple systems from a global singleton, paving the way for durable transports.
3.  **Governance & Safety:** Implement a `NodeInputAdapterRegistry` and `A2APolicyEngine` to manage data flow securely and prevent unsafe instruction execution.
4.  **Observability:** Implement an `A2AEventLog` for trace visibility and replay capabilities.

## Architecture

- **Interfaces:** `A2AMessageTransport`, `A2AMessageFabric`, `A2APolicyEngine`, `A2AEventLog`, `NodeInputAdapter`.
- **Core Envelope:** `BalnceEnvelope` containing strict fields for source, target, event, payload, and crucial metadata (policy, trust, provenance).
- **Topic Grammar:** Standardized string generation via topic helpers (e.g., `Topics.dagNodeOutput(runId, nodeId)`).

## Boundaries

- NDJSON is used strictly at boundaries (streaming, network transport). Internal memory routing uses the typed `BalnceEnvelope`.
- The DAG Compiler depends on the fabric interfaces; it does not dictate them.
