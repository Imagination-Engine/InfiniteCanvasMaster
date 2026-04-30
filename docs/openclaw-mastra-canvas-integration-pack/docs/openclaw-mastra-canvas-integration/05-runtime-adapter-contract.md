# 05 — Runtime Adapter Contract

## Purpose

The OpenClaw Block Adapter isolates the Balnce canvas and Mastra substrate from raw OpenClaw internals.

The UI must never directly call privileged OpenClaw host tools.
The UI must call the adapter.
The adapter must pass through policy, runtime routing, event handling, and approval gates.

## Adapter Interface

```ts
export interface OpenClawBlockAdapter {
  getRuntimeStatus(
    input: GetOpenClawRuntimeStatusInput,
  ): Promise<OpenClawRuntimeStatus>;
  createSession(input: CreateOpenClawSessionInput): Promise<OpenClawSession>;
  bindSession(input: BindOpenClawSessionInput): Promise<OpenClawRuntimeBinding>;
  listSessions(input: ListOpenClawSessionsInput): Promise<OpenClawSession[]>;
  listSkills(input: ListOpenClawSkillsInput): Promise<OpenClawSkillSummary[]>;
  listTools(input: ListOpenClawToolsInput): Promise<OpenClawToolSummary[]>;
  startTask(input: StartOpenClawTaskInput): Promise<OpenClawTask>;
  pauseTask(input: PauseOpenClawTaskInput): Promise<void>;
  resumeTask(input: ResumeOpenClawTaskInput): Promise<void>;
  stopTask(input: StopOpenClawTaskInput): Promise<void>;
  approveAction(input: ApproveOpenClawActionInput): Promise<void>;
  denyAction(input: DenyOpenClawActionInput): Promise<void>;
  updatePolicy(input: UpdateOpenClawPolicyInput): Promise<OpenClawBlockPolicy>;
  streamEvents(
    input: StreamOpenClawEventsInput,
  ): AsyncIterable<OpenClawBlockEvent>;
  getTaskTimeline(
    input: GetOpenClawTaskTimelineInput,
  ): Promise<OpenClawTaskEvent[]>;
  getOutputs(input: GetOpenClawOutputsInput): Promise<OpenClawOutput[]>;
  revokeBinding(input: RevokeOpenClawBindingInput): Promise<void>;
}
```

## Core Input / Output Types

```ts
export interface GetOpenClawRuntimeStatusInput {
  blockId: string;
  runtimeId?: string;
  gatewayId?: string;
}

export interface OpenClawRuntimeStatus {
  runtimeId: string;
  connectionStatus:
    | "unbound"
    | "connecting"
    | "connected"
    | "degraded"
    | "disconnected"
    | "error";
  version?: string;
  environment: "local" | "device_mesh" | "edge_twin" | "cloud" | "unknown";
  capabilities: OpenClawBlockCapabilities;
  lastHeartbeatAt?: string;
  error?: string;
}

export interface CreateOpenClawSessionInput {
  blockId: string;
  workspaceId?: string;
  requestedSkills?: string[];
  requestedTools?: string[];
  policy: OpenClawBlockPolicy;
  memoryScopeId?: string;
  modelPolicyId?: string;
}

export interface OpenClawSession {
  sessionId: string;
  workspaceId?: string;
  status: "created" | "ready" | "failed";
  runtimeBinding: OpenClawRuntimeBinding;
  createdAt: string;
}

export interface StartOpenClawTaskInput {
  blockId: string;
  sessionId: string;
  task: string;
  taskType?:
    | "general"
    | "research"
    | "browser"
    | "coding"
    | "messaging"
    | "canvas"
    | "workflow"
    | "other";
  policy: OpenClawBlockPolicy;
  expectedOutputs?: OpenClawExpectedOutput[];
  modelRouteHint?: string;
  computeRouteHint?: "local" | "device_mesh" | "edge_twin" | "cloud" | "hybrid";
  requireApproval?: boolean;
}

export interface OpenClawTask {
  taskId: string;
  blockId: string;
  sessionId: string;
  status: OpenClawBlockStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OpenClawExpectedOutput {
  kind:
    | "artifact"
    | "note"
    | "file"
    | "message"
    | "workflow_step"
    | "canvas_object"
    | "summary";
  description: string;
}

export interface UpdateOpenClawPolicyInput {
  blockId: string;
  policyPatch: Partial<OpenClawBlockPolicy>;
  reason: string;
  requiresUserApproval: boolean;
}
```

## Adapter Implementations

There may be multiple adapter implementations:

```txt
OpenClawLocalGatewayAdapter
OpenClawEdgeTwinAdapter
OpenClawCloudAdapter
OpenClawNoRuntimeAdapter
OpenClawDevelopmentTestAdapter
```

The development/test adapter may only be used in tests or explicitly marked local dev environments. It must never masquerade as production runtime behavior.

## Adapter Rules

1. All task starts must pass policy evaluation.
2. All sensitive actions must create approval requests.
3. All event streams must be typed.
4. All errors must be structured.
5. All outputs must include source metadata.
6. All runtime bindings must be revocable.
7. Missing integrations must be represented as capability gaps, not silent failures.
8. No secrets may flow into canvas UI state.
9. UI components must depend on the adapter interface, not raw OpenClaw internal calls.
