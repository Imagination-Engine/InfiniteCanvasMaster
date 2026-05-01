export const FabricTopics = {
  dagNodeEvent: (runId: string, nodeId: string) =>
    `dag.${runId}.node.${nodeId}.event`,
  dagNodeOutput: (runId: string, nodeId: string) =>
    `dag.${runId}.node.${nodeId}.output`,
  dagNodeError: (runId: string, nodeId: string) =>
    `dag.${runId}.node.${nodeId}.error`,
  dagNodeApproval: (runId: string, nodeId: string) =>
    `dag.${runId}.node.${nodeId}.approval`,
  dagTrace: (runId: string) => `dag.${runId}.trace`,
  canvasBlockEvent: (canvasId: string, blockId: string) =>
    `canvas.${canvasId}.block.${blockId}.event`,
  canvasDocumentState: (canvasId: string) =>
    `canvas.${canvasId}.document.state`,
  canvasPresence: (canvasId: string) => `canvas.${canvasId}.presence`,
  workflowRunEvent: (workflowId: string, runId: string) =>
    `workflow.${workflowId}.run.${runId}.event`,
  runtimeSessionEvent: (runtimeId: string, sessionId: string) =>
    `runtime.${runtimeId}.session.${sessionId}.event`,
  provenanceEvent: (traceId: string) => `provenance.${traceId}.event`,
} as const;
