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
 * TEST ONLY: Development adapter for simulating OpenClaw Block interactions.
 * Do not use in production runtime.
 */
export class TestOpenClawAdapter implements OpenClawBlockAdapter {
  private mockState: Record<string, any> = {};

  async getRuntimeStatus(blockId: string, runtimeId?: string) {
    return {
      runtimeId: runtimeId || "test-runtime-01",
      connectionStatus: "connected",
      environment: "local",
      capabilities: {
        skills: [
          {
            id: "test-skill",
            name: "Test Skill",
            source: "managed",
            trusted: true,
            enabled: true,
            riskLevel: "low",
          },
        ],
        tools: [
          {
            id: "test-tool",
            name: "Test Tool",
            category: "other",
            enabled: true,
            requiresApproval: false,
            riskLevel: "low",
          },
        ],
        channels: [],
        models: ["test-model-7b"],
        canBrowse: true,
        canUseShell: false,
        canUseFiles: true,
        canUseCalendar: false,
        canUseEmail: false,
        canUseCanvas: true,
        canUseCron: false,
        canUseNodes: false,
        canUseMessaging: false,
      },
    };
  }

  async createSession(blockId: string, policy: OpenClawBlockPolicy) {
    return {
      sessionId: `sess-${Date.now()}`,
      status: "ready",
    };
  }

  async bindSession(
    blockId: string,
    sessionId: string,
  ): Promise<OpenClawRuntimeBinding> {
    return {
      runtimeId: "test-runtime-01",
      sessionId,
      environment: "local",
      connectionStatus: "connected",
    };
  }

  async listSkills(blockId: string): Promise<OpenClawSkillSummary[]> {
    return [
      {
        id: "test-skill",
        name: "Test Skill",
        source: "managed",
        trusted: true,
        enabled: true,
        riskLevel: "low",
      },
    ];
  }

  async listTools(blockId: string): Promise<OpenClawToolSummary[]> {
    return [
      {
        id: "test-tool",
        name: "Test Tool",
        category: "other",
        enabled: true,
        requiresApproval: false,
        riskLevel: "low",
      },
    ];
  }

  async startTask(
    blockId: string,
    sessionId: string,
    task: string,
    policy: OpenClawBlockPolicy,
  ) {
    const taskId = `task-${Date.now()}`;
    this.mockState[taskId] = { status: "running" };
    return { taskId, status: "running" };
  }

  async pauseTask(blockId: string, taskId: string): Promise<void> {
    if (this.mockState[taskId]) this.mockState[taskId].status = "paused";
  }

  async resumeTask(blockId: string, taskId: string): Promise<void> {
    if (this.mockState[taskId]) this.mockState[taskId].status = "running";
  }

  async stopTask(blockId: string, taskId: string): Promise<void> {
    if (this.mockState[taskId]) this.mockState[taskId].status = "stopped";
  }

  async approveAction(blockId: string, requestId: string): Promise<void> {
    console.log(`[TestAdapter] Action ${requestId} approved`);
  }

  async denyAction(blockId: string, requestId: string): Promise<void> {
    console.log(`[TestAdapter] Action ${requestId} denied`);
  }

  async updatePolicy(
    blockId: string,
    policyPatch: Partial<OpenClawBlockPolicy>,
  ): Promise<OpenClawBlockPolicy> {
    return policyPatch as OpenClawBlockPolicy;
  }

  async *streamEvents(blockId: string): AsyncIterable<OpenClawBlockEvent> {
    yield {
      type: "openclaw.task.progress",
      blockId,
      taskId: "test-task",
      message: "[Test] Event stream initialized.",
      progress: 10,
      timestamp: new Date().toISOString(),
    };
  }

  async getOutputs(blockId: string): Promise<OpenClawOutput[]> {
    return [];
  }

  async revokeBinding(blockId: string): Promise<void> {
    console.log(`[TestAdapter] Binding revoked for ${blockId}`);
  }
}
