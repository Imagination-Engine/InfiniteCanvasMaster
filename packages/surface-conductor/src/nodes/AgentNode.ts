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

export class AgentNodeExecutor implements ConductorNodeExecutor {
  async execute(input: {
    node: ConductorNode;
    state: ConductorRuntimeState;
    incoming: ConductorEnvelope[];
  }): Promise<NodeExecutionResult> {
    const config = input.node.config as any;

    // 1. Resolve Explicit Prompt State
    // Rather than blindly inheriting text, we construct or update a PromptState
    const promptTemplate = config.userPromptTemplate || "";

    // Resolve mappings for variables
    const variables = config.inputMapping
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
    const allowedTools = input.node.runtime.allowedTools || [];
    if (allowedTools.length === 0 && config.requiresTools) {
      throw new Error(
        `Agent node requires tools but allowedTools list is empty. Execution blocked for safety.`,
      );
    }

    // 3. Mock Agent Execution (In reality, this would invoke Mastra or local LLM context)
    // Here we'd map `promptState.rendered` into the agent LLM call.
    // For this implementation, we return a mock success agent_message.

    // Simulate Agent Delay
    await new Promise((res) => setTimeout(res, 500));

    const simulatedAgentResponse =
      "Simulated response from agent based on: " + renderedPrompt;

    // 4. Construct Output Envelope
    const outputEnvelope: ConductorEnvelope = {
      id: crypto.randomUUID(),
      runId: input.state.runId,
      graphId: input.state.graphId,
      sourceNodeId: input.node.id,
      type: "agent_message",
      payload: {
        text: simulatedAgentResponse,
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
          message: "Agent execution completed",
          promptId: promptState.promptId,
          toolsExposed: allowedTools.length,
        },
      ],
    };
  }
}
