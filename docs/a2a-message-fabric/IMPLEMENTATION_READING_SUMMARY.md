# A2A Message Fabric: Implementation Reading Summary

## Core Concepts Absorbed

1.  **Balnce Envelope Protocol:** The central data structure for all internal communication, replacing raw NDJSON strings with strictly typed objects containing rich metadata (trace, trust, policy, debug).
2.  **Transport Decoupling:** Moving away from a global `EventEmitter` singleton to an `A2AMessageFabric` interface, supporting diverse transports (local, durable, distributed).
3.  **Topic Grammar:** Standardized routing strings (e.g., `dag.<runId>.node.<nodeId>.output`) using helper functions to ensure consistency across domains (DAG, Canvas, OpenClaw).
4.  **Node Input Adapters:** Replacing unsafe universal input mutation with specific adapters that sanitize and prepare upstream envelopes into valid downstream inputs, considering instruction trust.
5.  **Policy and Trust Engine:** A security layer evaluating message publication, delivery, and adaptation based on instruction origin, sensitivity, and required approvals.
6.  **Observability and Replay:** Implementing an `A2AEventLog` to durably store and query envelopes for debugging, timeline UI, and provenance.

## Key Shifts from Current State

- From string-based NDJSON passing to typed `BalnceEnvelope` objects internally.
- From a hardcoded singleton to injected fabric dependencies in the DAG compiler.
- From blind input merging to schema-aware, trust-evaluating Node Input Adapters.
