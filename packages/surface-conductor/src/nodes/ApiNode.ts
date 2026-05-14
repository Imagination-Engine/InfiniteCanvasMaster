import {
  ConductorNodeExecutor,
  NodeExecutionResult,
} from "../runtime/executor.js";
import {
  ConductorEnvelope,
  ConductorNode,
  ConductorRuntimeState,
  MappingExpression,
} from "../types/runtime.js";
import { resolveMappings, resolveTemplate } from "../runtime/mapping.js";

type ApiNodeConfig = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  urlTemplate: string;
  headers?: Record<string, string>;
  query?: Record<string, string>;
  body?: unknown;
  authRef?: string;
  inputMapping?: MappingExpression[];
  outputMapping?: MappingExpression[];
};

export class ApiNodeExecutor implements ConductorNodeExecutor {
  async execute(input: {
    node: ConductorNode;
    state: ConductorRuntimeState;
    incoming: ConductorEnvelope[];
  }): Promise<NodeExecutionResult> {
    const config = input.node.config as ApiNodeConfig;

    // 1. Resolve Mappings
    // Determine mapped input data (e.g. from previous envelope's payload)
    const mappedInput = config.inputMapping
      ? resolveMappings(config.inputMapping, input.state, input.incoming)
      : {};

    // 2. Resolve URL and properties
    // Variables for template resolution include state variables and mapped input
    const templateContext = { ...input.state.variables, ...mappedInput };
    const resolvedUrl = resolveTemplate(config.urlTemplate, templateContext);

    const resolvedHeaders: Record<string, string> = {};
    if (config.headers) {
      for (const [k, v] of Object.entries(config.headers)) {
        resolvedHeaders[k] = resolveTemplate(v, templateContext);
      }
    }

    let resolvedBody = config.body;
    if (config.method !== "GET" && config.method !== "DELETE") {
      // If a body template or mapping is used, resolve it here.
      // For simplicity, we assume `mappedInput` acts as the body if no specific body config exists,
      // or we merge them.
      if (!resolvedBody && Object.keys(mappedInput).length > 0) {
        resolvedBody = mappedInput;
      }
    }

    // 3. Execute Fetch
    const response = await fetch(resolvedUrl, {
      method: config.method,
      headers: resolvedHeaders,
      body: resolvedBody ? JSON.stringify(resolvedBody) : undefined,
    });

    const responseText = await response.text();
    let parsedBody: unknown;

    try {
      parsedBody = JSON.parse(responseText);
    } catch {
      parsedBody = responseText;
    }

    const responsePayload = {
      status: response.status,
      ok: response.ok,
      body: parsedBody,
      headers: Object.fromEntries(response.headers.entries()),
    };

    // 4. Resolve Output Mapping (Optional)
    let finalPayload = responsePayload;
    if (config.outputMapping) {
      // Apply mapping to the payload itself
      // In a full implementation, this might map into state patches or transform the payload shape.
      // For now, we pass the raw response.
    }

    // 5. Construct Output Envelope
    const outputEnvelope: ConductorEnvelope = {
      id: crypto.randomUUID(),
      runId: input.state.runId,
      graphId: input.state.graphId,
      sourceNodeId: input.node.id,
      type: "data",
      payload: finalPayload,
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
          message: `Executed API Call to ${resolvedUrl}`,
          status: response.status,
        },
      ],
    };
  }
}
