# 02 — Current Implementation Assessment

## Current assets

The implementation described by the team includes:

- `packages/core/src/bus/protocol.ts`
- `BalnceEnvelopeSchema`
- `wrapInEnvelope`
- `packages/core/src/bus/MessageBus.ts`
- Node `EventEmitter` publish/subscribe
- NDJSON string payloads
- Mastra DAG compiler interception inside `compileGraphToWorkflow`
- semantic envelope wrapping around tool outputs
- topic publishing such as `dag.<traceId>.block.<nodeId>.output`
- downstream unwrapping and merging into tool inputs
- compatibility field injection such as `_instructions`, `additionalInstructions`, `_context`, and `context`

## What is good

- Existing DAG engine is reused instead of duplicated.
- Semantic envelopes are introduced.
- Outputs become observable.
- Canvas/orchestrator subscribers become possible.
- The implementation provides a working in-process path.

## What must change

### 1. Rename the scope

Current bus should not be described as the full internal fabric.

Preferred language:

```txt
Local A2A Event Bridge for Mastra DAG Execution
```

### 2. Publish typed envelopes internally

NDJSON should be an edge encoding, not the internal representation.

### 3. Introduce lanes

A topic alone is not enough. The envelope needs a `lane` that tells the system what semantic plane the event belongs to.

### 4. Replace universal input mutation

Do not universally inject `_instructions`, `additionalInstructions`, `_context`, and `context` into arbitrary tool inputs. Introduce node input adapters.

### 5. Make SSE a projection adapter

SSE should project events to UI, not serve as the internal coordination fabric.

### 6. Add delivery classes

Cursor events, token deltas, approval requests, artifact records, and game ticks cannot share the same durability and ordering assumptions.
