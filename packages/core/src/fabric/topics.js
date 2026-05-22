// @ts-nocheck
export const FabricTopics = {
  // DAG/Workflow Topics
  workflowTrace: (runId) => `dag.${runId}.trace`,
  workflowNodeOutput: (runId, nodeId) => `dag.${runId}.node.${nodeId}.output`,
  workflowNodeStatus: (runId, nodeId) => `dag.${runId}.node.${nodeId}.status`,
  // Agent Stream Topics
  agentStream: (agentId) => `agent.${agentId}.stream`,
  agentDelta: (runId, agentId) => `dag.${runId}.agent.${agentId}.delta`,
  // Canvas Topics
  canvasState: (canvasId) => `canvas.${canvasId}.state`,
  canvasPresence: (canvasId) => `canvas.${canvasId}.presence`,
  canvasBlockEvent: (canvasId, blockId) =>
    `canvas.${canvasId}.block.${blockId}.event`,
  // Durable & Provenance
  durableEvent: (runId) => `durable.${runId}.event`,
  provenanceRecord: (traceId) => `provenance.${traceId}.record`,
  // Command & Control
  commandControl: (targetId) => `cmd.${targetId}.control`,
  approvalQueue: (runId) => `approval.${runId}.queue`,
  // UI Projection
  uiProjection: (viewId) => `ui.${viewId}.projection`,
};
