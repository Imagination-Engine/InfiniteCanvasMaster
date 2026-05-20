export declare const FabricTopics: {
  workflowTrace: (runId: string) => string;
  workflowNodeOutput: (runId: string, nodeId: string) => string;
  workflowNodeStatus: (runId: string, nodeId: string) => string;
  agentStream: (agentId: string) => string;
  agentDelta: (runId: string, agentId: string) => string;
  canvasState: (canvasId: string) => string;
  canvasPresence: (canvasId: string) => string;
  canvasBlockEvent: (canvasId: string, blockId: string) => string;
  durableEvent: (runId: string) => string;
  provenanceRecord: (traceId: string) => string;
  commandControl: (targetId: string) => string;
  approvalQueue: (runId: string) => string;
  uiProjection: (viewId: string) => string;
};
//# sourceMappingURL=topics.d.ts.map
