// @ts-nocheck
export type OpenClawBlockStatus =
  | "unconfigured"
  | "binding"
  | "ready"
  | "thinking"
  | "running"
  | "using_tool"
  | "waiting_for_approval"
  | "paused"
  | "completed"
  | "failed"
  | "revoked"
  | "sandbox_blocked"
  | "offline";

export type OpenClawSandboxMode =
  | "strict"
  | "workspace"
  | "device"
  | "edge"
  | "cloud"
  | "disabled";

export interface OpenClawRuntimeBinding {
  runtimeId?: string;
  gatewayId?: string;
  gatewayUrl?: string;
  workspaceId?: string;
  workspaceRoot?: string;
  sessionId?: string;
  agentId?: string;
  nodeId?: string;
  channelId?: string;
  environment: "local" | "device_mesh" | "edge_twin" | "cloud" | "unknown";
  connectionStatus:
    | "unbound"
    | "connecting"
    | "connected"
    | "degraded"
    | "disconnected"
    | "error";
  lastHeartbeatAt?: string;
}

export interface OpenClawApprovalRequest {
  requestId: string;
  blockId: string;
  taskId?: string;
  actionType:
    | "shell"
    | "file_write"
    | "file_delete"
    | "external_message"
    | "calendar_modify"
    | "email_send"
    | "browser_login"
    | "purchase"
    | "skill_install"
    | "cloud_model_sensitive"
    | "identity_wallet"
    | "provenance_write"
    | "other";
  title: string;
  summary: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  requestedBy: "openclaw" | "mastra" | "user" | "system";
  rawDetails?: unknown;
  redactedDetails?: unknown;
  createdAt: string;
  expiresAt?: string;
}

export interface OpenClawBlockRuntimeState {
  status: OpenClawBlockStatus;
  currentTaskId?: string;
  currentTask?: string;
  progress?: number;
  activeToolName?: string;
  activeSkillName?: string;
  modelRoute?: string;
  computeRoute?: "local" | "device_mesh" | "edge_twin" | "cloud" | "hybrid";
  lastEventAt?: string;
  error?: {
    code: string;
    message: string;
    recoverable: boolean;
  };
  approvalQueue?: OpenClawApprovalRequest[];
}

export interface OpenClawSkillSummary {
  id: string;
  name: string;
  description?: string;
  source: "bundled" | "managed" | "workspace" | "registry" | "unknown";
  trusted: boolean;
  enabled: boolean;
  riskLevel: "low" | "medium" | "high" | "critical" | "unknown";
}

export interface OpenClawToolSummary {
  id: string;
  name: string;
  category:
    | "filesystem"
    | "shell"
    | "browser"
    | "canvas"
    | "nodes"
    | "cron"
    | "sessions"
    | "messaging"
    | "calendar"
    | "email"
    | "network"
    | "other";
  enabled: boolean;
  requiresApproval: boolean;
  riskLevel: "low" | "medium" | "high" | "critical" | "unknown";
}

export interface OpenClawBlockCapabilities {
  skills: OpenClawSkillSummary[];
  tools: OpenClawToolSummary[];
  channels: string[];
  models: string[];
  canBrowse: boolean;
  canUseShell: boolean;
  canUseFiles: boolean;
  canUseCalendar: boolean;
  canUseEmail: boolean;
  canUseCanvas: boolean;
  canUseCron: boolean;
  canUseNodes: boolean;
  canUseMessaging: boolean;
}

export interface OpenClawBlockPolicy {
  sandboxMode: OpenClawSandboxMode;
  approvalRequiredFor: string[];
  deniedTools: string[];
  allowedTools: string[];
  deniedSkills: string[];
  allowedSkills: string[];
  allowedPaths?: string[];
  deniedPaths?: string[];
  allowedChannels?: string[];
  maxRuntimeMs?: number;
  maxSpendCredits?: number;
  maxToolCalls?: number;
  modelPolicyId?: string;
  memoryScopeId?: string;
  requireHumanApprovalForExternalMessages: boolean;
  requireHumanApprovalForFileWrites: boolean;
  requireHumanApprovalForShell: boolean;
  requireHumanApprovalForPurchases: boolean;
  requireHumanApprovalForCredentialAccess: boolean;
}

export interface OpenClawBalnceBindings {
  mastraAgentId?: string;
  mastraWorkflowId?: string;
  mastraNetworkId?: string;
  memoryScopeId?: string;
  canvasRegionId?: string;
  provenanceId?: string;
  vladIdentityId?: string;
  auraBudgetId?: string;
  edgeTwinJobId?: string;
  deviceMeshSessionId?: string;
}

export interface OpenClawBlockUIState {
  displayMode: "compact" | "inspect" | "expanded" | "fullscreen";
  selected: boolean;
  locked: boolean;
  collapsed: boolean;
  showDebugTrace: boolean;
  showProvenance: boolean;
  showSecurityPanel: boolean;
  showCostPanel: boolean;
}

export interface OpenClawBlock {
  id: string;
  type: "openclaw.block";
  title: string;
  description?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  rotation?: number;
  runtime: OpenClawRuntimeBinding;
  state: OpenClawBlockRuntimeState;
  capabilities: OpenClawBlockCapabilities;
  policy: OpenClawBlockPolicy;
  bindings: OpenClawBalnceBindings;
  ui: OpenClawBlockUIState;
  provenance?: any; // To be refined with ProvenanceState
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
}

export interface OpenClawOutput {
  outputId: string;
  kind:
    | "text"
    | "artifact"
    | "file"
    | "message_draft"
    | "canvas_object"
    | "workflow_result"
    | "summary"
    | "log";
  title?: string;
  summary?: string;
  contentRef?: string;
  objectIds?: string[];
  provenanceId?: string;
  createdAt: string;
}

export type OpenClawBlockEvent =
  | { type: "openclaw.block.created"; blockId: string; timestamp: string }
  | { type: "openclaw.block.configured"; blockId: string; timestamp: string }
  | {
      type: "openclaw.runtime.binding.started";
      blockId: string;
      timestamp: string;
    }
  | {
      type: "openclaw.runtime.bound";
      blockId: string;
      runtime: OpenClawRuntimeBinding;
      timestamp: string;
    }
  | {
      type: "openclaw.runtime.disconnected";
      blockId: string;
      reason?: string;
      timestamp: string;
    }
  | {
      type: "openclaw.runtime.error";
      blockId: string;
      error: any;
      timestamp: string;
    }
  | {
      type: "openclaw.session.created";
      blockId: string;
      sessionId: string;
      timestamp: string;
    }
  | {
      type: "openclaw.session.bound";
      blockId: string;
      sessionId: string;
      timestamp: string;
    }
  | {
      type: "openclaw.session.revoked";
      blockId: string;
      sessionId: string;
      timestamp: string;
    }
  | {
      type: "openclaw.task.requested";
      blockId: string;
      task: string;
      timestamp: string;
    }
  | {
      type: "openclaw.task.started";
      blockId: string;
      taskId: string;
      timestamp: string;
    }
  | {
      type: "openclaw.task.progress";
      blockId: string;
      taskId: string;
      message: string;
      progress?: number;
      timestamp: string;
    }
  | {
      type: "openclaw.task.paused";
      blockId: string;
      taskId: string;
      timestamp: string;
    }
  | {
      type: "openclaw.task.resumed";
      blockId: string;
      taskId: string;
      timestamp: string;
    }
  | {
      type: "openclaw.task.stopped";
      blockId: string;
      taskId: string;
      reason?: string;
      timestamp: string;
    }
  | {
      type: "openclaw.task.completed";
      blockId: string;
      taskId: string;
      outputs?: OpenClawOutput[];
      timestamp: string;
    }
  | {
      type: "openclaw.task.failed";
      blockId: string;
      taskId: string;
      error: any;
      timestamp: string;
    }
  | {
      type: "openclaw.tool.started";
      blockId: string;
      taskId?: string;
      toolName: string;
      timestamp: string;
    }
  | {
      type: "openclaw.tool.progress";
      blockId: string;
      toolName: string;
      message: string;
      timestamp: string;
    }
  | {
      type: "openclaw.tool.completed";
      blockId: string;
      toolName: string;
      summary?: string;
      timestamp: string;
    }
  | {
      type: "openclaw.tool.failed";
      blockId: string;
      toolName: string;
      error: any;
      timestamp: string;
    }
  | {
      type: "openclaw.skill.enabled";
      blockId: string;
      skillId: string;
      timestamp: string;
    }
  | {
      type: "openclaw.skill.disabled";
      blockId: string;
      skillId: string;
      timestamp: string;
    }
  | {
      type: "openclaw.approval.required";
      blockId: string;
      request: OpenClawApprovalRequest;
      timestamp: string;
    }
  | {
      type: "openclaw.approval.approved";
      blockId: string;
      requestId: string;
      timestamp: string;
    }
  | {
      type: "openclaw.approval.denied";
      blockId: string;
      requestId: string;
      timestamp: string;
    }
  | {
      type: "openclaw.policy.updated";
      blockId: string;
      policy: OpenClawBlockPolicy;
      timestamp: string;
    }
  | {
      type: "openclaw.output.created";
      blockId: string;
      output: OpenClawOutput;
      timestamp: string;
    }
  | {
      type: "openclaw.output.converted_to_canvas_object";
      blockId: string;
      outputId: string;
      objectId: string;
      timestamp: string;
    }
  | {
      type: "openclaw.provenance.recorded";
      blockId: string;
      provenanceId: string;
      timestamp: string;
    };

export interface MastraOpenClawBinding {
  bindingId: string;
  blockId: string;
  mastraAgentId?: string;
  mastraWorkflowId?: string;
  mastraNetworkId?: string;
  mastraToolId?: string;
  role:
    | "single_task_executor"
    | "specialist_agent"
    | "workflow_step"
    | "supervised_worker"
    | "approval_gate"
    | "artifact_producer"
    | "memory_operator";
  createdAt: string;
  updatedAt: string;
}

export interface OpenClawMastraToolInput {
  blockId: string;
  task: string;
  policyOverride?: Partial<OpenClawBlockPolicy>;
  expectedOutputs?: string[];
  requireApproval?: boolean;
}

export interface OpenClawMastraToolOutput {
  taskId: string;
  status: "started" | "completed" | "waiting_for_approval" | "failed";
  summary?: string;
  outputObjectIds?: string[];
  approvalRequestIds?: string[];
  eventStreamId?: string;
}

export interface OpenClawBlockAdapter {
  getRuntimeStatus(blockId: string, runtimeId?: string): Promise<any>;
  createSession(blockId: string, policy: OpenClawBlockPolicy): Promise<any>;
  bindSession(
    blockId: string,
    sessionId: string,
  ): Promise<OpenClawRuntimeBinding>;
  listSkills(blockId: string): Promise<OpenClawSkillSummary[]>;
  listTools(blockId: string): Promise<OpenClawToolSummary[]>;
  startTask(
    blockId: string,
    sessionId: string,
    task: string,
    policy: OpenClawBlockPolicy,
  ): Promise<any>;
  pauseTask(blockId: string, taskId: string): Promise<void>;
  resumeTask(blockId: string, taskId: string): Promise<void>;
  stopTask(blockId: string, taskId: string): Promise<void>;
  approveAction(blockId: string, requestId: string): Promise<void>;
  denyAction(blockId: string, requestId: string): Promise<void>;
  updatePolicy(
    blockId: string,
    policyPatch: Partial<OpenClawBlockPolicy>,
  ): Promise<OpenClawBlockPolicy>;
  streamEvents(blockId: string): AsyncIterable<OpenClawBlockEvent>;
  getOutputs(blockId: string): Promise<OpenClawOutput[]>;
  revokeBinding(blockId: string): Promise<void>;
}

export interface OpenClawSubtask {
  subtaskId: string;
  assignedBlockId?: string;
  title: string;
  description: string;
  status:
    | "unassigned"
    | "assigned"
    | "running"
    | "waiting_for_approval"
    | "completed"
    | "failed";
  dependencies: string[];
  outputs?: OpenClawOutput[];
}

export interface OpenClawExpectedOutput {
  id: string;
  type: string;
  description: string;
}

export interface OpenClawGroupPlan {
  planId: string;
  summary: string;
}

export interface OpenClawGroupTask {
  taskId: string;
  userIntent: string;
  plan?: OpenClawGroupPlan;
  subtasks: OpenClawSubtask[];
  expectedOutputs: OpenClawExpectedOutput[];
  createdAt: string;
}

export interface OpenClawGroupPolicy {
  maxTotalSpendCredits?: number;
  maxRuntimeMs?: number;
  maxParallelTasks?: number;
  requireApprovalBeforeExternalActions: boolean;
  requireApprovalBeforeCloudForSensitiveData: boolean;
  allowSharedMemory: boolean;
  allowInterBlockMessaging: boolean;
  allowToolEscalation: boolean;
  defaultSandboxMode: OpenClawSandboxMode;
}

export interface OpenClawAgentGroup {
  id: string;
  type: "openclaw.agent_group";

  title: string;
  description?: string;

  memberBlockIds: string[];

  supervisor: {
    mastraAgentId?: string;
    mastraWorkflowId?: string;
    mastraNetworkId?: string;
    strategy: "manual" | "supervisor_agent" | "workflow" | "network";
  };

  task?: OpenClawGroupTask;

  sharedPolicy: OpenClawGroupPolicy;
  sharedMemoryScopeId?: string;
  outputCanvasRegionId?: string;

  state: {
    status:
      | "idle"
      | "planning"
      | "running"
      | "waiting_for_approval"
      | "paused"
      | "completed"
      | "failed"
      | "stopped";
    progress?: number;
    activeMembers: string[];
    blockedMembers: string[];
    completedMembers: string[];
  };

  createdAt: string;
  updatedAt: string;
}
