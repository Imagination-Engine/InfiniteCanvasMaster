# 05 — Topic Grammar and Routing

Use topic helpers. Do not concatenate ad hoc topic strings.

```txt
dag.<runId>.event
dag.<runId>.node.<nodeId>.event
dag.<runId>.node.<nodeId>.output
dag.<runId>.node.<nodeId>.error
dag.<runId>.node.<nodeId>.approval
dag.<runId>.trace
canvas.<canvasId>.block.<blockId>.event
agent.<agentId>.task.<taskId>.event
openclaw.<runtimeId>.session.<sessionId>.task.<taskId>.event
approval.<runId>.event
artifact.<artifactId>.event
provenance.<traceId>.event
```

```ts
export const Topics = {
  dagTrace: (runId: string) => `dag.${runId}.trace`,
  dagNodeOutput: (runId: string, nodeId: string) =>
    `dag.${runId}.node.${nodeId}.output`,
  dagNodeError: (runId: string, nodeId: string) =>
    `dag.${runId}.node.${nodeId}.error`,
  dagNodeApproval: (runId: string, nodeId: string) =>
    `dag.${runId}.node.${nodeId}.approval`,
  canvasBlockEvent: (canvasId: string, blockId: string) =>
    `canvas.${canvasId}.block.${blockId}.event`,
  openClawTaskEvent: (runtimeId: string, sessionId: string, taskId: string) =>
    `openclaw.${runtimeId}.session.${sessionId}.task.${taskId}.event`,
};
```
