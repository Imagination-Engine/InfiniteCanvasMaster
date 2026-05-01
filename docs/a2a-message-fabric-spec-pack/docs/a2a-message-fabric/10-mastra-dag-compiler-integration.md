# 10 — Mastra DAG Compiler Integration

Integrate without duplicating the DAG engine.

```ts
type CompileGraphOptions = {
  messageFabric?: A2AMessageFabric;
  envelopeFactory?: EnvelopeFactory;
  nodeInputAdapters?: NodeInputAdapterRegistry;
  policyEngine?: A2APolicyEngine;
  eventLog?: A2AEventLog;
};
```

Emit run.started, node.started, node.input.prepared, tool.started, tool.output, tool.completed, node.output, node.completed, run.completed, failures, and approval events.

Downstream input flow: collect upstream envelopes -> select adapter -> policy check -> produce schema-valid input -> validate -> emit node.input.prepared -> execute.

Compiler emits events; canvas subscribes. Compiler must not call canvas state.
