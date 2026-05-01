# 03 — Architecture Overview

```txt
Mastra DAG Compiler / Workflow Runtime
  -> A2A Message Fabric
      -> Envelope Protocol
      -> Topic Grammar
      -> Transport Interface
      -> Delivery Semantics
      -> Node Input Adapters
      -> Policy/Trust Layer
      -> Event Log / Replay
      -> Observability APIs
  -> Subscribers: Canvas, Debug Timeline, Orchestrator, OpenClaw Blocks, Approval UI, Artifact System, Provenance Logger
```

Correct dependency direction: compiler depends on A2A interfaces; transports implement interfaces; canvas subscribes; OpenClaw adapter uses interfaces. Incorrect: compiler imports global singleton EventEmitter, canvas scrapes DAG internals, tools mutate downstream input.
