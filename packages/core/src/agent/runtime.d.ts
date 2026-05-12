import type { ChatRequest, ChatResponse } from "./provider";
export declare class AgentRuntime {
  private defaultModel;
  private mastraOrchestrator;
  setOrchestrator(mastraAgent: any): void;
  chat(request: ChatRequest): Promise<ChatResponse>;
  orchestrate(
    prompt: string,
    context: any,
  ): Promise<{
    plan: never[];
    reasoning: any;
  }>;
}
export declare const agentRuntime: AgentRuntime;
//# sourceMappingURL=runtime.d.ts.map
