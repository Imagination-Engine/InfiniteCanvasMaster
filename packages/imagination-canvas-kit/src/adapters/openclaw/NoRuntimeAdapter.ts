// @ts-nocheck
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
export class NoRuntimeOpenClawAdapter implements OpenClawBlockAdapter {
  async getRuntimeStatus(blockId: string, runtimeId?: string) {
    return {
      runtimeId: runtimeId || "none",
      connectionStatus: "disconnected",
      environment: "unknown",
      capabilities: {
        skills: [],
        tools: [],
        channels: [],
        models: [],
        canBrowse: false,
        canUseShell: false,
        canUseFiles: false,
        canUseCalendar: false,
        canUseEmail: false,
        canUseCanvas: false,
        canUseCron: false,
        canUseNodes: false,
        canUseMessaging: false,
      },
      error:
        "No runtime adapter is currently bound. Operating in degraded mode.",
    };
  }

  async createSession(blockId: string, policy: OpenClawBlockPolicy) {
    throw new Error("Cannot create session: No runtime available.");
  }

  async bindSession(
    blockId: string,
    sessionId: string,
  ): Promise<OpenClawRuntimeBinding> {
    throw new Error("Cannot bind session: No runtime available.");
  }

  async listSkills(blockId: string): Promise<OpenClawSkillSummary[]> {
    return [];
  }

  async listTools(blockId: string): Promise<OpenClawToolSummary[]> {
    return [];
  }

  async startTask(
    blockId: string,
    sessionId: string,
    task: string,
    policy: OpenClawBlockPolicy,
  ) {
    throw new Error("Cannot start task: No runtime available.");
  }

  async pauseTask(blockId: string, taskId: string): Promise<void> {
    throw new Error("Cannot pause task: No runtime available.");
  }

  async resumeTask(blockId: string, taskId: string): Promise<void> {
    throw new Error("Cannot resume task: No runtime available.");
  }

  async stopTask(blockId: string, taskId: string): Promise<void> {
    throw new Error("Cannot stop task: No runtime available.");
  }

  async approveAction(blockId: string, requestId: string): Promise<void> {
    throw new Error("Cannot approve action: No runtime available.");
  }

  async denyAction(blockId: string, requestId: string): Promise<void> {
    throw new Error("Cannot deny action: No runtime available.");
  }

  async updatePolicy(
    blockId: string,
    policyPatch: Partial<OpenClawBlockPolicy>,
  ): Promise<OpenClawBlockPolicy> {
    return policyPatch as OpenClawBlockPolicy;
  }

  async *streamEvents(blockId: string): AsyncIterable<OpenClawBlockEvent> {
    yield {
      type: "openclaw.runtime.error",
      blockId,
      error: {
        code: "NO_RUNTIME",
        message: "No runtime available",
        recoverable: false,
      },
      timestamp: new Date().toISOString(),
    };
  }

  async getOutputs(blockId: string): Promise<OpenClawOutput[]> {
    return [];
  }

  async revokeBinding(blockId: string): Promise<void> {
    return;
  }
}
