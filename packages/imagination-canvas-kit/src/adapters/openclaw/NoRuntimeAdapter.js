/**
 * Fallback adapter for when no OpenClaw runtime is available.
 * Operates in a degraded state and prevents any real execution.
 */
export class NoRuntimeOpenClawAdapter {
  async getRuntimeStatus(blockId, runtimeId) {
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
  async createSession(blockId, policy) {
    throw new Error("Cannot create session: No runtime available.");
  }
  async bindSession(blockId, sessionId) {
    throw new Error("Cannot bind session: No runtime available.");
  }
  async listSkills(blockId) {
    return [];
  }
  async listTools(blockId) {
    return [];
  }
  async startTask(blockId, sessionId, task, policy) {
    throw new Error("Cannot start task: No runtime available.");
  }
  async pauseTask(blockId, taskId) {
    throw new Error("Cannot pause task: No runtime available.");
  }
  async resumeTask(blockId, taskId) {
    throw new Error("Cannot resume task: No runtime available.");
  }
  async stopTask(blockId, taskId) {
    throw new Error("Cannot stop task: No runtime available.");
  }
  async approveAction(blockId, requestId) {
    throw new Error("Cannot approve action: No runtime available.");
  }
  async denyAction(blockId, requestId) {
    throw new Error("Cannot deny action: No runtime available.");
  }
  async updatePolicy(blockId, policyPatch) {
    return policyPatch;
  }
  async *streamEvents(blockId) {
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
  async getOutputs(blockId) {
    return [];
  }
  async revokeBinding(blockId) {
    return;
  }
}
