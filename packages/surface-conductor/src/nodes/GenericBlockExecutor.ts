import type {
  ConductorNodeExecutor,
  NodeExecutionResult,
} from "../runtime/executor.js";
import type {
  ConductorNode,
  ConductorRuntimeState,
  ConductorEnvelope,
} from "../types/runtime.js";
import {
  ifBlock,
  loopBlock,
  webhookTriggerBlock,
  webhookCallBlock,
  scheduleTriggerBlock,
  saasBlock,
  agentBlock,
  routerBlock,
  delayBlock,
  stateBlock,
  errorBoundaryBlock,
  subGraphBlock,
  webFetchBlock,
  slackPostBlock,
  notionCreateBlock,
  functionBlock,
  functionCallBlock,
  codeBlock,
} from "../blocks/orchestrationBlocks.js";
import type { BlockDefinition } from "@iem/core";

/**
 * Registry mapping block IDs to their definitions.
 * Used by GenericBlockExecutor to look up the invoke function for any block kind.
 */
const BLOCK_DEFINITIONS: Record<string, BlockDefinition<any, any>> = {
  "iem.conductor.if": ifBlock,
  "iem.conductor.loop": loopBlock,
  "iem.conductor.webhook": webhookTriggerBlock,
  "iem.conductor.webhookCall": webhookCallBlock,
  "iem.conductor.schedule": scheduleTriggerBlock,
  "iem.conductor.saas": saasBlock,
  "iem.conductor.agent": agentBlock,
  "iem.conductor.router": routerBlock,
  "iem.conductor.delay": delayBlock,
  "iem.conductor.state": stateBlock,
  "iem.conductor.errorBoundary": errorBoundaryBlock,
  "iem.conductor.subGraph": subGraphBlock,
  "iem.conductor.webFetch": webFetchBlock,
  "iem.conductor.slackPost": slackPostBlock,
  "iem.conductor.notionCreate": notionCreateBlock,
  "iem.conductor.function": functionBlock,
  "iem.conductor.functionCall": functionCallBlock,
  "iem.conductor.code": codeBlock,
};

/**
 * Maps ConductorNode.kind values to block definition IDs.
 * The node `kind` enum uses short names, while block definitions use full IDs.
 */
const KIND_TO_BLOCK_ID: Record<string, string> = {
  trigger: "iem.conductor.webhook",
  webhook: "iem.conductor.webhook",
  webhookCall: "iem.conductor.webhookCall",
  condition: "iem.conductor.if",
  loop: "iem.conductor.loop",
  transform: "iem.conductor.state",
  merge: "iem.conductor.state",
  output: "iem.conductor.state",
  artifact: "iem.conductor.state",
  prompt: "iem.conductor.agent",
  tool: "iem.conductor.saas",
  function: "iem.conductor.function",
  functionCall: "iem.conductor.functionCall",
  code: "iem.conductor.code",
};

/**
 * GenericBlockExecutor — A flexible executor that delegates to the block
 * definition's `agent.invoke()` function. This single executor covers all
 * block kinds that don't have a dedicated executor implementation, by
 * looking up the block definition from the orchestrationBlocks registry
 * and calling its invoke function with the node's config as input.
 *
 * For certain block kinds, we provide enhanced real implementations:
 * - `webFetch`: Actual HTTP fetch using the global fetch API
 * - `delay`: Real setTimeout-based delay
 * - `webhook`/`trigger`: Pass-through that forwards incoming envelope payloads
 */
export class GenericBlockExecutor implements ConductorNodeExecutor {
  async execute(input: {
    node: ConductorNode;
    state: ConductorRuntimeState;
    incoming: ConductorEnvelope[];
  }): Promise<NodeExecutionResult> {
    const { node, state, incoming } = input;

    // Merge config and any incoming envelope payloads as the invocation input
    const incomingPayload =
      incoming.length > 0
        ? (incoming[incoming.length - 1].payload as Record<string, unknown>) ||
          {}
        : {};

    const invokeInput = {
      ...incomingPayload,
      ...(node.config || {}),
    };

    // --- Enhanced real implementations for specific kinds ---

    // WEBHOOK / TRIGGER: Simply pass through incoming data
    if (node.kind === "webhook" || node.kind === "trigger") {
      return {
        outputs: [
          this.createEnvelope(node, state, "data", {
            payload: incomingPayload,
            triggeredAt: new Date().toISOString(),
          }),
        ],
        logs: [
          {
            message: `Trigger node ${node.label} fired`,
            timestamp: new Date().toISOString(),
          },
        ],
      };
    }

    // WEB FETCH: Real HTTP request
    if (node.kind === "transform" && node.config?.url) {
      return this.executeWebFetch(node, state, invokeInput);
    }

    // DELAY: Real async delay
    if (node.config?.ms !== undefined && typeof node.config.ms === "number") {
      const blockId = this.resolveBlockId(node.kind);
      if (blockId === "iem.conductor.delay") {
        const ms = node.config.ms as number;
        if (ms < 0) {
          throw new Error("Delay duration cannot be negative");
        }
        const cappedMs = Math.min(ms, 30000); // Cap at 30s
        await new Promise((resolve) => setTimeout(resolve, cappedMs));
        return {
          outputs: [
            this.createEnvelope(node, state, "data", {
              resumed: true,
              delayMs: cappedMs,
            }),
          ],
          logs: [
            {
              message: `Delayed ${cappedMs}ms`,
              timestamp: new Date().toISOString(),
            },
          ],
        };
      }
    }

    // --- Default: Delegate to block definition's agent.invoke() ---
    const blockId = this.resolveBlockId(node.kind);
    const blockDef = BLOCK_DEFINITIONS[blockId];

    if (!blockDef) {
      // Graceful fallback — return the input as output so the chain continues
      return {
        outputs: [
          this.createEnvelope(node, state, "data", {
            passthrough: true,
            input: invokeInput,
            message: `No block definition found for kind "${node.kind}", passing data through.`,
          }),
        ],
        logs: [
          {
            message: `No block def for kind "${node.kind}", passing through`,
            timestamp: new Date().toISOString(),
          },
        ],
      };
    }

    try {
      const result = await blockDef.agent.invoke(invokeInput);
      return {
        outputs: [this.createEnvelope(node, state, "data", result)],
        logs: [
          {
            message: `Block ${blockDef.name} executed successfully`,
            timestamp: new Date().toISOString(),
          },
        ],
      };
    } catch (error: any) {
      return {
        outputs: [
          this.createEnvelope(node, state, "error", {
            error: error.message || String(error),
            blockId,
          }),
        ],
        logs: [
          {
            message: `Block ${blockDef.name} failed: ${error.message}`,
            timestamp: new Date().toISOString(),
          },
        ],
      };
    }
  }

  /**
   * Real HTTP fetch implementation for webFetch nodes.
   */
  private async executeWebFetch(
    node: ConductorNode,
    state: ConductorRuntimeState,
    config: Record<string, unknown>,
  ): Promise<NodeExecutionResult> {
    const url = String(config.url || "");
    const method = String(config.method || "GET").toUpperCase();
    const body = config.body ? JSON.stringify(config.body) : undefined;

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method !== "GET" ? body : undefined,
      });

      let data: unknown;
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      return {
        outputs: [
          this.createEnvelope(node, state, "data", {
            status: response.status,
            ok: response.ok,
            data,
          }),
        ],
        logs: [
          {
            message: `Fetched ${url} → ${response.status}`,
            timestamp: new Date().toISOString(),
          },
        ],
      };
    } catch (error: any) {
      return {
        outputs: [
          this.createEnvelope(node, state, "error", {
            error: error.message || String(error),
            url,
          }),
        ],
        logs: [
          {
            message: `Fetch failed for ${url}: ${error.message}`,
            timestamp: new Date().toISOString(),
          },
        ],
      };
    }
  }

  /**
   * Resolves a ConductorNode.kind to a full block definition ID.
   */
  private resolveBlockId(kind: string): string {
    return KIND_TO_BLOCK_ID[kind] || `iem.conductor.${kind}`;
  }

  /**
   * Creates a typed ConductorEnvelope from node execution output.
   */
  private createEnvelope(
    node: ConductorNode,
    state: ConductorRuntimeState,
    type: ConductorEnvelope["type"],
    payload: unknown,
  ): ConductorEnvelope {
    return {
      id: `env-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      runId: state.runId,
      graphId: state.graphId,
      sourceNodeId: node.id,
      type,
      payload,
      trace: {
        previousEnvelopeIds: [],
        attempt: 1,
        spanId: `span-${Date.now()}`,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
    };
  }
}
