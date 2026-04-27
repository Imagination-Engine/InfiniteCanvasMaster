# 17 — Contract Appendix

This appendix gathers the most important TypeScript contracts in one place.

```ts
export type ComputeRoute =
  | "local"
  | "device_mesh"
  | "edge_twin"
  | "cloud"
  | "hybrid";

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
  runtime: OpenClawRuntimeBinding;
  state: OpenClawBlockRuntimeState;
  capabilities: OpenClawBlockCapabilities;
  policy: OpenClawBlockPolicy;
  bindings: OpenClawBalnceBindings;
  ui: OpenClawBlockUIState;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
}

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

Implementation agents must convert these into real project types and refine names to match repo conventions, while preserving the architectural meaning.
