import type { ComponentType } from "react";
import type { NodeProps } from "@xyflow/react";

export type NodeValueType =
  | "text"
  | "audio"
  | "image"
  | "json"
  | "file"
  | "code"
  | "language"
  | "meeting"
  | "message"
  | "email"
  | "sheet"
  | "trigger"
  | "any";

export type SchemaField = NodeValueType | NodeValueType[];
export type Schema = Record<string, SchemaField>;

export type BaseNodeData = {
  id: string;
  type: string;
  label: string;
  description?: string;
  inputs: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  config?: Record<string, unknown>;
  metadata?: {
    category: "creative" | "workflow";
  };
};

export type NodeCatalogEntry = {
  defaultData: BaseNodeData;
  inputSchema: Schema;
  outputSchema: Schema;
  category: "creative" | "workflow";
  role?: "trigger" | "action" | "tool";
};

export type NodeRegistryEntry = NodeCatalogEntry & {
  component: ComponentType<NodeProps>;
};

export type NodeCatalog = Record<string, NodeCatalogEntry>;
export type NodeRegistry = Record<string, NodeRegistryEntry>;

export const toSchemaTypes = (schema: Schema): Set<NodeValueType> => {
  const values = Object.values(schema);
  const flattened = values.flatMap((value) => (Array.isArray(value) ? value : [value]));
  return new Set(flattened);
};

export const hasCompatibleSchemaTypes = (outputSchema: Schema, inputSchema: Schema): boolean => {
  const sourceTypes = toSchemaTypes(outputSchema);
  const targetTypes = toSchemaTypes(inputSchema);

  if (sourceTypes.size === 0 || targetTypes.size === 0) {
    return false;
  }

  if (sourceTypes.has("any") || targetTypes.has("any")) {
    return true;
  }

  for (const type of sourceTypes) {
    if (targetTypes.has(type)) {
      return true;
    }
  }

  return false;
};
