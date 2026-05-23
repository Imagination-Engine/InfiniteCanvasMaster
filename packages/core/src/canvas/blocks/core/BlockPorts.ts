import { z } from "zod";

/**
 * Valid data types representing port connection boundaries.
 */
export type PortDataType =
  | "text"
  | "image"
  | "audio"
  | "json"
  | "file"
  | "code"
  | "any";

/**
 * Schema for a single block port definition.
 */
export interface BlockPortDefinition {
  name: string;
  description: string;
  type: PortDataType;
  schema: z.ZodTypeAny;
  required?: boolean;
}

/**
 * Creates a helper definition for an Input Port.
 */
export function createInputPort(params: {
  name: string;
  description: string;
  type: PortDataType;
  schema?: z.ZodTypeAny;
  required?: boolean;
}): BlockPortDefinition {
  return {
    name: params.name,
    description: params.description,
    type: params.type,
    schema: params.schema || z.any(),
    required: params.required !== false,
  };
}

/**
 * Creates a helper definition for an Output Port.
 */
export function createOutputPort(params: {
  name: string;
  description: string;
  type: PortDataType;
  schema?: z.ZodTypeAny;
}): BlockPortDefinition {
  return {
    name: params.name,
    description: params.description,
    type: params.type,
    schema: params.schema || z.any(),
    required: false,
  };
}
