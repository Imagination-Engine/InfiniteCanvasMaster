# 06 — Topic Grammar and Routing

Topics must be generated through helpers, not hand-built strings.

## Topic grammar

```txt
dag.<runId>.node.<nodeId>.event
dag.<runId>.node.<nodeId>.output
dag.<runId>.node.<nodeId>.error
dag.<runId>.node.<nodeId>.approval
dag.<runId>.trace
canvas.<canvasId>.block.<blockId>.event
canvas.<canvasId>.document.state
canvas.<canvasId>.presence
agent.<agentId>.task.<taskId>.event
workflow.<workflowId>.run.<runId>.event
runtime.<runtimeId>.session.<sessionId>.event
provenance.<traceId>.event
```

## Required helper API

```ts
export const FabricTopics = {
  dagNodeEvent: (runId: string, nodeId: string) =>
    `dag.${runId}.node.${nodeId}.event`,
  dagNodeOutput: (runId: string, nodeId: string) =>
    `dag.${runId}.node.${nodeId}.output`,
  dagTrace: (runId: string) => `dag.${runId}.trace`,
  canvasBlockEvent: (canvasId: string, blockId: string) =>
    `canvas.${canvasId}.block.${blockId}.event`,
  canvasDocumentState: (canvasId: string) =>
    `canvas.${canvasId}.document.state`,
  canvasPresence: (canvasId: string) => `canvas.${canvasId}.presence`,
  workflowRunEvent: (workflowId: string, runId: string) =>
    `workflow.${workflowId}.run.${runId}.event`,
};
```

## Routing order

The router must consider:

1. lane
2. delivery class
3. target type
4. topic
5. policy
6. transport availability

## Routing examples

### Agent token delta

```txt
lane: agent_stream
delivery: ephemeral or replayable
topic: canvas.<canvasId>.block.<blockId>.event
transport: InProcess + SSE/WebSocket projection
```

### Canvas object moved

```txt
lane: document_state
delivery: replayable/persistent
topic: canvas.<canvasId>.document.state
transport: Yjs/tldraw sync adapter
```

### Approval required

```txt
lane: command_control + durable_event
delivery: approval_required
topic: workflow.<workflowId>.run.<runId>.event
transport: command adapter + durable store + UI projection
```

### Game entity update

```txt
lane: runtime_simulation
delivery: realtime_low_latency
topic: runtime.<runtimeId>.session.<sessionId>.event
transport: local runtime / WebSocket / WebTransport candidate
```
