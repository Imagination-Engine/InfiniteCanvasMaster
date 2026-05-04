// @ts-nocheck
import { generateText, streamText } from "ai";
import { google } from "@ai-sdk/google";
import type { ChatRequest, ChatResponse } from "./provider";

export class AgentRuntime {
  private defaultModel = google("gemini-2.5-pro");
  private mastraOrchestrator: any = null; // Injected at server boot

  // Allow the server app to inject the Mastra Agent
  setOrchestrator(mastraAgent: any) {
    this.mastraOrchestrator = mastraAgent;
    console.log("[Core] Mastra Orchestrator Agent injected into AgentRuntime.");
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      const { text, usage } = await generateText({
        model: request.model ? google(request.model) : this.defaultModel,
        messages: request.messages as any,
        temperature: request.temperature,
        maxTokens: request.maxTokens,
      } as any);

      const usageAny = usage as any;
      return {
        content: text,
        usage: {
          inputTokens: usageAny.promptTokens ?? usageAny.inputTokens ?? 0,
          outputTokens: usageAny.completionTokens ?? usageAny.outputTokens ?? 0,
        },
        latencyMs: 0, // Placeholder
      };
    } catch (error) {
      throw new Error(
        `Agent runtime chat failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async orchestrate(prompt: string, context: any) {
    // If Mastra is injected, use its superior ReACT and Tool Calling memory loop!
    if (this.mastraOrchestrator) {
      console.log("[Core] Delegating orchestration to Mastra...");
      const response = await this.mastraOrchestrator.generate([
        {
          role: "user",
          content: `Prompt: ${prompt}\nContext: ${JSON.stringify(context)}`,
        },
      ]);
      return {
        plan: [], // Mastra might auto-execute or we parse its response
        reasoning: response.text || "Mastra handled the orchestration.",
      };
    }

    // Fallback to basic AI SDK
    const systemPrompt = `You are the Imagination Orchestrator. 
    Analyze the user prompt and context to synthesize an imagination path.
    Return a DAG plan of blocks to execute.`;

    try {
      const { text } = await generateText({
        model: this.defaultModel,
        system: systemPrompt,
        prompt: `User Prompt: ${prompt}\nContext: ${JSON.stringify(context)}`,
      });

      return {
        plan: [],
        reasoning: text,
      };
    } catch (e) {
      return {
        plan: [],
        reasoning: "Failed to synthesize plan, falling back to ambient mode.",
      };
    }
  }
}

export const agentRuntime = new AgentRuntime();
