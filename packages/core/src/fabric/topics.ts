export const FabricTopics = {
  // DAG/Workflow Topics
  workflowTrace: (runId: string) => `dag.${runId}.trace`,
  workflowNodeOutput: (runId: string, nodeId: string) =>
    `dag.${runId}.node.${nodeId}.output`,
  workflowNodeStatus: (runId: string, nodeId: string) =>
    `dag.${runId}.node.${nodeId}.status`,

  // Agent Stream Topics
  agentStream: (agentId: string) => `agent.${agentId}.stream`,
  agentDelta: (runId: string, agentId: string) =>
    `dag.${runId}.agent.${agentId}.delta`,

  // Canvas Topics
  canvasState: (canvasId: string) => `canvas.${canvasId}.state`,
  canvasPresence: (canvasId: string) => `canvas.${canvasId}.presence`,
  canvasBlockEvent: (canvasId: string, blockId: string) =>
    `canvas.${canvasId}.block.${blockId}.event`,

  // Durable & Provenance
  durableEvent: (runId: string) => `durable.${runId}.event`,
  provenanceRecord: (traceId: string) => `provenance.${traceId}.record`,

  // Command & Control
  commandControl: (targetId: string) => `cmd.${targetId}.control`,
  approvalQueue: (runId: string) => `approval.${runId}.queue`,

  // UI Projection
  uiProjection: (viewId: string) => `ui.${viewId}.projection`,
};
