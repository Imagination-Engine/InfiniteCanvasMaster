# 13 — Mastra DAG Integration Refactor

## Current behavior

The DAG compiler intercepts tool output, wraps it in a BalnceEnvelope, publishes to the bus, and merges upstream instructions/context into downstream inputs.

## Target behavior

The DAG compiler should depend on a fabric interface, not a global bus singleton.

## Suggested signature

```ts
compileGraphToWorkflow(graph, {
  fabric,
  envelopeFactory,
  nodeInputAdapters,
  topicFactory,
  traceContext,
});
```

## Output publication

When a node/tool emits output:

```txt
node/tool output
  ↓
create envelope lane=agent_stream or workflow_trace
  ↓
fabric.publish(envelope)
  ↓
if output is final/durable, mirror to durable_event/provenance as configured
```

## Node lifecycle events

Emit:

- workflow.started
- node.started
- tool.started
- tool.output
- tool.failed
- node.completed
- node.failed
- workflow.completed
- workflow.failed
- approval.required
- branch.chosen

## Lane defaults

- lifecycle traces → `workflow_trace`
- partial agent/tool deltas → `agent_stream`
- final accepted canvas block content → `document_state`
- approval facts → `command_control` + `durable_event`
- generated artifact facts → `durable_event` + optional `provenance`

## No universal mutation

Remove universal `(mergedInput as any)` mutation from the core path.

Use node input adapters.

Compatibility shim may remain temporarily, but must be isolated and marked as migration-only.
