import { z } from "zod";
import type { BlockPortDefinition } from "./BlockPorts";
import type { AgenticPersona, MCPToolBinding } from "../../../block/protocol";

/**
 * Interface representing the complete block specification contract.
 */
export interface BalnceBlockSpec {
  id: string;
  version: string;
  kind: string;
  title: string;
  description: string;
  schema: z.ZodObject<any, any>;
  inputPorts: Record<string, BlockPortDefinition>;
  outputPorts: Record<string, BlockPortDefinition>;
  agentConfiguration?: AgenticPersona;
  toolBindings?: MCPToolBinding[];
  memoryPolicy?: {
    ttlMs?: number;
    persistKeys?: string[];
    governanceClass?: "user-locked" | "session-only" | "shared-workspace";
    [key: string]: unknown;
  };
  artifactPermissions?: string[];
  visualMetadata?: {
    icon?: string;
    accentColor?: string;
    defaultWidth?: number;
    defaultHeight?: number;
    [key: string]: unknown;
  };
}

/**
 * Dynamic schema validator for BalnceBlockSpec verification.
 */
export const BalnceBlockSpecSchema = z.object({
  id: z.string(),
  version: z.string().default("0.1.0"),
  kind: z.string(),
  title: z.string(),
  description: z.string(),
  schema: z.instanceof(z.ZodObject),
  inputPorts: z.record(z.any()),
  outputPorts: z.record(z.any()),
  agentConfiguration: z.any().optional(),
  toolBindings: z.array(z.any()).optional(),
  memoryPolicy: z.any().optional(),
  artifactPermissions: z.array(z.string()).optional(),
  visualMetadata: z.any().optional(),
});
