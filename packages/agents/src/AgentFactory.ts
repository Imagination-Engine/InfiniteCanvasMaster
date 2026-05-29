// @ts-nocheck
import { Agent } from "@mastra/core/agent";
import { google } from "@ai-sdk/google";
import { Memory } from "@mastra/memory";
import { BlockDefinition, createMastraToolFromBlock } from "@iem/core";
import {
  read_canvas_context,
  mutate_self,
  send_fabric_message,
} from "./tools/block.js";

export interface AgentFactoryOptions {
  storage?: any;
  model?: any;
}

/**
 * The AgentFactory is responsible for dynamically instantiating Mastra agents
 * that are specialized for a particular block's persona and role.
 */
export class AgentFactory {
  private storage: any;
  private defaultModel: any;

  constructor(options: AgentFactoryOptions = {}) {
    this.storage = options.storage;
    this.defaultModel = options.model || google("gemini-2.5-flash");
  }

  /**
   * Creates a specialized agent for a given block definition.
   */
  async createAgentForBlock(block: BlockDefinition<any, any>) {
    const persona = block.persona || {};

    // Construct instructions based on block definition and optional persona override
    const identity = persona.name || `${block.name} Agent`;
    const objective = block.description;
    const capabilities =
      block.capabilities?.join(", ") || "General block processing";

    const instructions =
      persona.instructions ||
      `
      You are the ${identity}. 
      
      CORE OBJECTIVE:
      ${objective}
      
      YOUR CAPABILITIES:
      ${capabilities}
      
      CONTEXT:
      You are a sovereign agent bound to a specific block on the Imagination Canvas. 
      You have access to the block's internal parameters and its neighboring context.
      Your goal is to assist the user in manipulating this specific block's state and outputs.
    `;

    // Tool binding
    const tools: Record<string, any> = {
      read_canvas_context,
      mutate_self,
      send_fabric_message,
    };

    // 1. Primary Block Tool
    tools[block.id.replace(/\./g, "_")] =
      await createMastraToolFromBlock(block);

    // 2. Add specialized tools from persona if any
    if (persona.tools) {
      // In a real implementation, we would resolve these tool IDs from a registry
      // For now, we assume the primary block tool is the main "hand"
    }

    return new Agent({
      id: `agent-${block.id}`,
      name: identity,
      instructions: instructions.trim(),
      model: this.defaultModel,
      tools,
      memory: this.storage ? new Memory({ storage: this.storage }) : undefined,
    });
  }
}
