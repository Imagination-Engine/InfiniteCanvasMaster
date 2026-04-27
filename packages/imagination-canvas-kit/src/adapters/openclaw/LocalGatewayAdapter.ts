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
 * Adapter that connects to a real local OpenClaw gateway via REST API.
 */
export class LocalOpenClawGatewayAdapter implements OpenClawBlockAdapter {
  constructor(private baseUrl: string = "http://localhost:8080/api/v1") {}

  private async fetchApi(path: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Gateway error: ${response.statusText}`);
    }

    return response.json();
  }

  async getRuntimeStatus(blockId: string, runtimeId?: string) {
    try {
      const data = await this.fetchApi("/health");
      return {
        runtimeId: runtimeId || "local-gateway",
        connectionStatus: "connected",
        environment: "local",
        version: data.version,
      };
    } catch (err: any) {
      return {
        connectionStatus: "error",
        error: err.message || "Failed to fetch from local gateway",
      };
    }
  }

  async createSession(blockId: string, policy: OpenClawBlockPolicy) {
    const data = await this.fetchApi("/sessions", {
      method: "POST",
      body: JSON.stringify({ blockId, policy }),
    });
    return {
      sessionId: data.session_id,
      status: "ready",
    };
  }

  async bindSession(
    blockId: string,
    sessionId: string,
  ): Promise<OpenClawRuntimeBinding> {
    return {
      runtimeId: "local-gateway",
      sessionId,
      environment: "local",
      connectionStatus: "connected",
    };
  }

  async listSkills(blockId: string): Promise<OpenClawSkillSummary[]> {
    try {
      const data = await this.fetchApi("/skills");
      return data.skills || [];
    } catch {
      return [];
    }
  }

  async listTools(blockId: string): Promise<OpenClawToolSummary[]> {
    try {
      const data = await this.fetchApi("/tools");
      return data.tools || [];
    } catch {
      return [];
    }
  }

  async startTask(
    blockId: string,
    sessionId: string,
    task: string,
    policy: OpenClawBlockPolicy,
  ) {
    const data = await this.fetchApi(`/sessions/${sessionId}/tasks`, {
      method: "POST",
      body: JSON.stringify({ task, policy }),
    });

    return {
      taskId: data.task_id,
      status: data.status || "running",
    };
  }

  async pauseTask(blockId: string, taskId: string): Promise<void> {
    await this.fetchApi(`/tasks/${taskId}/pause`, { method: "POST" });
  }

  async resumeTask(blockId: string, taskId: string): Promise<void> {
    await this.fetchApi(`/tasks/${taskId}/resume`, { method: "POST" });
  }

  async stopTask(blockId: string, taskId: string): Promise<void> {
    await this.fetchApi(`/tasks/${taskId}/stop`, { method: "POST" });
  }

  async approveAction(blockId: string, requestId: string): Promise<void> {
    await this.fetchApi(`/approvals/${requestId}/approve`, { method: "POST" });
  }

  async denyAction(blockId: string, requestId: string): Promise<void> {
    await this.fetchApi(`/approvals/${requestId}/deny`, { method: "POST" });
  }

  async updatePolicy(
    blockId: string,
    policyPatch: Partial<OpenClawBlockPolicy>,
  ): Promise<OpenClawBlockPolicy> {
    // In reality we'd push this to the active session
    return policyPatch as OpenClawBlockPolicy;
  }

  async *streamEvents(blockId: string): AsyncIterable<OpenClawBlockEvent> {
    // Local streaming fallback (in real system, would use SSE/WebSocket from gateway)
    yield {
      type: "openclaw.task.progress",
      blockId,
      taskId: "system",
      message: "Local gateway SSE not fully wired. Connecting...",
      progress: 10,
      timestamp: new Date().toISOString(),
    };
  }

  async getOutputs(blockId: string): Promise<OpenClawOutput[]> {
    return [];
  }

  async revokeBinding(blockId: string): Promise<void> {
    await this.fetchApi(`/bindings/${blockId}`, { method: "DELETE" });
  }
}
