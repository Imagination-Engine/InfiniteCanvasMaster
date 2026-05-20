import {
  ConductorNodeExecutor,
  NodeExecutionResult,
} from "../runtime/executor.js";
import {
  ConductorEnvelope,
  ConductorNode,
  ConductorRuntimeState,
  PromptState,
} from "../types/runtime.js";
import { resolveTemplate, resolveMappings } from "../runtime/mapping.js";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export class AgentNodeExecutor implements ConductorNodeExecutor {
  async execute(input: {
    node: ConductorNode;
    state: ConductorRuntimeState;
    incoming: ConductorEnvelope[];
  }): Promise<NodeExecutionResult> {
    const config = input.node.config as any;

    // 1. Resolve Explicit Prompt State
    // Support extracting instructions robustly from multiple fields to guarantee UI synchronicity
    let promptTemplate = "";
    if (config) {
      if (typeof config.instructions === "string" && config.instructions) {
        promptTemplate = config.instructions;
      } else if (
        typeof config.userPromptTemplate === "string" &&
        config.userPromptTemplate
      ) {
        promptTemplate = config.userPromptTemplate;
      } else if (
        config.inputs &&
        typeof config.inputs.instructions === "string" &&
        config.inputs.instructions
      ) {
        promptTemplate = config.inputs.instructions;
      }
    }
    if (!promptTemplate && input.node) {
      const nodeAny = input.node as any;
      if (
        nodeAny.inputs &&
        typeof nodeAny.inputs.instructions === "string" &&
        nodeAny.inputs.instructions
      ) {
        promptTemplate = nodeAny.inputs.instructions;
      }
    }

    // Resolve mappings for variables
    const variables =
      config && config.inputMapping
        ? resolveMappings(config.inputMapping, input.state, input.incoming)
        : {};

    const renderedPrompt = resolveTemplate(promptTemplate, {
      ...input.state.variables,
      ...variables,
    });

    const promptState: PromptState = {
      promptId: crypto.randomUUID(),
      sourceNodeId: input.node.id,
      template: promptTemplate,
      variables,
      rendered: renderedPrompt,
    };

    // 2. Resolve Allowed Tools
    const allowedTools = input.node.runtime?.allowedTools || [];
    if (allowedTools.length === 0 && config && config.requiresTools) {
      throw new Error(
        `Agent node requires tools but allowedTools list is empty. Execution blocked for safety.`,
      );
    }

    // 3. Dynamic Upstream Context Aggregation
    let upstreamContext = "";
    if (input.incoming && input.incoming.length > 0) {
      const contexts: string[] = [];
      for (const envelope of input.incoming) {
        let payloadStr = "";
        const payload = envelope.payload;
        if (payload !== undefined && payload !== null) {
          if (typeof payload === "string") {
            payloadStr = payload;
          } else if (typeof payload === "object") {
            const pAny = payload as any;
            if (typeof pAny.text === "string") {
              payloadStr = pAny.text;
            } else if (typeof pAny.output === "string") {
              payloadStr = pAny.output;
            } else if (pAny.body !== undefined) {
              payloadStr =
                typeof pAny.body === "string"
                  ? pAny.body
                  : JSON.stringify(pAny.body, null, 2);
            } else {
              payloadStr = JSON.stringify(payload, null, 2);
            }
          } else {
            payloadStr = String(payload);
          }
        }

        if (payloadStr) {
          contexts.push(
            `[Upstream Context from Node ${envelope.sourceNodeId} (Type: ${envelope.type})]:\n${payloadStr}`,
          );
        }
      }
      if (contexts.length > 0) {
        upstreamContext =
          "\n\n### Upstream Context Data\n" + contexts.join("\n\n");
      }
    }

    // 4. Real LLM Execution & Graceful Fallback
    let agentResponseText = "";
    let isFallbackUsed = false;
    let fallbackReason = "";

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      isFallbackUsed = true;
      fallbackReason = "GOOGLE_GENERATIVE_AI_API_KEY is not set";
    }

    if (!isFallbackUsed) {
      try {
        const finalPrompt = renderedPrompt + upstreamContext;
        const response = await generateText({
          model: google("gemini-2.5-pro"),
          prompt: finalPrompt,
        });
        agentResponseText = response.text;
      } catch (err: any) {
        isFallbackUsed = true;
        fallbackReason = err?.message || String(err);
      }
    }

    if (isFallbackUsed) {
      // Simulate Agent Delay for realistic feel during fallback/mock run
      await new Promise((res) => setTimeout(res, 50));

      agentResponseText =
        "Simulated response from agent based on: " + renderedPrompt;
      if (upstreamContext) {
        agentResponseText += `\nUpstream Context:\n${upstreamContext}`;
      }
    }

    // 5. Construct Output Envelope
    const outputEnvelope: ConductorEnvelope = {
      id: crypto.randomUUID(),
      runId: input.state.runId,
      graphId: input.state.graphId,
      sourceNodeId: input.node.id,
      type: "agent_message",
      payload: {
        text: agentResponseText,
      },
      trace: {
        previousEnvelopeIds: input.incoming.map((e) => e.id),
        attempt: 1,
        spanId: crypto.randomUUID(),
        completedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
    };

    return {
      outputs: [outputEnvelope],
      logs: [
        {
          message: isFallbackUsed
            ? "Agent execution completed (simulation fallback)"
            : "Agent execution completed (real LLM)",
          promptId: promptState.promptId,
          toolsExposed: allowedTools.length,
          fallbackReason: isFallbackUsed ? fallbackReason : undefined,
        },
      ],
    };
  }
}
