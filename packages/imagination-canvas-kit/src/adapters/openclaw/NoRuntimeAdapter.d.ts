import {
  OpenClawBlockAdapter,
  OpenClawBlockPolicy,
  OpenClawOutput,
  OpenClawRuntimeBinding,
  OpenClawSkillSummary,
  OpenClawToolSummary,
  OpenClawBlockEvent,
} from "../../contracts/openclaw";
/**
 * Fallback adapter for when no OpenClaw runtime is available.
 * Operates in a degraded state and prevents any real execution.
 */
export declare class NoRuntimeOpenClawAdapter implements OpenClawBlockAdapter {
  getRuntimeStatus(
    blockId: string,
    runtimeId?: string,
  ): Promise<{
    runtimeId: string;
    connectionStatus: string;
    environment: string;
    capabilities: {
      skills: never[];
      tools: never[];
      channels: never[];
      models: never[];
      canBrowse: boolean;
      canUseShell: boolean;
      canUseFiles: boolean;
      canUseCalendar: boolean;
      canUseEmail: boolean;
      canUseCanvas: boolean;
      canUseCron: boolean;
      canUseNodes: boolean;
      canUseMessaging: boolean;
    };
    error: string;
  }>;
  createSession(blockId: string, policy: OpenClawBlockPolicy): Promise<void>;
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
  ): Promise<void>;
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
//# sourceMappingURL=NoRuntimeAdapter.d.ts.map
