# 03 — OpenClaw Block Runtime Spec

## Overview

The `OpenClawBlock` is a Balnce-native canvas object that binds visual state to a managed OpenClaw runtime/session/workspace. It must be represented as a typed canvas object and a registered Balnce block renderer.

## Canonical Type

```ts
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
  provenance?: OpenClawProvenanceState;

  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
}

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
```

## Required Runtime Lifecycle

```txt
Created
  → Unconfigured
  → Binding
  → Ready
  → Assigned
  → Running
  → Using Tool
  → Waiting for Approval
  → Running
  → Producing Output
  → Completed

Alternative paths:
  → Failed
  → Paused
  → Revoked
  → Sandbox Blocked
  → Offline
```

## Required User Actions

Every OpenClaw Block should eventually expose:

- configure runtime
- bind session
- start task
- pause task
- resume task
- stop task
- inspect event stream
- inspect skills/tools
- approve requested action
- deny requested action
- change policy
- open expanded workspace
- export outputs to artifacts
- convert output to canvas blocks
- group with other OpenClaw blocks
- revoke runtime binding

## Required Block States

### Compact State

Shows title, runtime connection status, current status, current task summary, safe capability icons, and active/waiting/error badge. Must not show secrets or sensitive raw data.

### Inspect State

Shows runtime binding, active task, skills, tools, policy, approvals, event timeline, model/compute route, output artifacts, provenance state, and cost/budget state.

### Expanded State

Shows richer task stream, local conversation/task transcript, produced artifacts, approval queue, security panel, and debug trace if allowed.

### Error State

Shows what failed, likely reason, retry option, stop/revoke option, and relevant logs if safe.

## Implementation Requirement

Do not represent OpenClaw as a generic `AppBlock`. It must have a dedicated type, renderer, adapter, events, policies, and tests.
