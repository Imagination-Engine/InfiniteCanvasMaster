import type { ChatRequest, ChatResponse } from './provider';
declare class AgentRuntime {
    chat(request: ChatRequest): Promise<ChatResponse>;
    orchestrate(prompt: string, context: any): Promise<{
        plan: never[];
        reasoning: string;
    }>;
}
export declare const agentRuntime: AgentRuntime;
export {};
//# sourceMappingURL=runtime.d.ts.map