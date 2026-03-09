import type { UnifiedCanvasEdge, UnifiedCanvasNode } from "../canvasTypes";
import type { BaseNodeData } from "../types";
import type { NodeValueType, Schema, SchemaField } from "../types";
import { NODE_CATALOG } from "../nodeCatalog";
import type { WorkflowNode, WorkflowRuntimeState } from "./types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toTypeList = (field: SchemaField | undefined): NodeValueType[] => {
  if (!field) return [];
  return Array.isArray(field) ? field : [field];
};

const schemaTypeMatches = (targetTypes: NodeValueType[], sourceType: NodeValueType | undefined) => {
  if (!sourceType || targetTypes.length === 0) return false;
  if (targetTypes.includes("any") || sourceType === "any") return true;
  return targetTypes.includes(sourceType);
};

const inferOutputTypeFromKey = (key: string): NodeValueType | undefined => {
  const lowered = key.toLowerCase();
  if (lowered.includes("text") || lowered.includes("summary") || lowered.includes("result") || lowered.includes("message")) return "text";
  if (lowered.includes("image")) return "image";
  if (lowered.includes("audio")) return "audio";
  if (lowered.includes("json") || lowered.includes("payload")) return "json";
  if (lowered.includes("file")) return "file";
  if (lowered.includes("code")) return "code";
  if (lowered.includes("email")) return "email";
  return undefined;
};

const inferOutputTypeFromValue = (value: unknown): NodeValueType | undefined => {
  if (typeof value === "string") return "text";
  if (isRecord(value) || Array.isArray(value)) return "json";
  return undefined;
};

const pickBestOutputValue = (
  targetKey: string,
  targetSchema: Schema,
  sourceOutputs: Record<string, unknown>,
  sourceSchema?: Schema,
): unknown => {
  if (targetKey in sourceOutputs) {
    return sourceOutputs[targetKey];
  }

  const targetTypes = toTypeList(targetSchema[targetKey]);
  if (targetTypes.length === 0) {
    return undefined;
  }

  for (const targetType of targetTypes) {
    for (const [sourceKey, sourceValue] of Object.entries(sourceOutputs)) {
      const sourceTypeFromSchema = toTypeList(sourceSchema?.[sourceKey])[0];
      const sourceType = sourceTypeFromSchema ?? inferOutputTypeFromKey(sourceKey) ?? inferOutputTypeFromValue(sourceValue);
      if (schemaTypeMatches([targetType], sourceType)) {
        return sourceValue;
      }
    }
  }

  return undefined;
};

const getSourceOutputs = (
  sourceNodeId: string,
  nodes: UnifiedCanvasNode[],
  runtimeState: WorkflowRuntimeState,
): Record<string, unknown> => {
  const runtimeOutputs = runtimeState[sourceNodeId]?.outputs;
  if (isRecord(runtimeOutputs)) {
    return runtimeOutputs;
  }

  const sourceNode = nodes.find((node) => node.id === sourceNodeId);
  const sourceData = sourceNode?.data as BaseNodeData | undefined;
  return isRecord(sourceData?.outputs) ? sourceData.outputs : {};
};

export const getNodeInputs = (
  nodeId: string,
  nodes: UnifiedCanvasNode[],
  edges: UnifiedCanvasEdge[],
  runtimeState: WorkflowRuntimeState,
): Record<string, unknown> => {
  const incomingEdges = edges.filter((edge) => edge.target === nodeId);
  const targetNode = nodes.find((node) => node.id === nodeId);
  const targetData = targetNode?.data as BaseNodeData | undefined;
  const targetDefinition = targetNode ? NODE_CATALOG[targetNode.type ?? ""] : undefined;
  const targetInputSchema = targetDefinition?.inputSchema ?? {};
  const targetInputKeys = new Set(Object.keys(targetData?.inputs ?? {}));
  const resolvedInputs: Record<string, unknown> = {};

  for (const edge of incomingEdges) {
    const sourceOutputs = getSourceOutputs(edge.source, nodes, runtimeState);
    const sourceNode = nodes.find((node) => node.id === edge.source);
    const sourceDefinition = sourceNode ? NODE_CATALOG[sourceNode.type ?? ""] : undefined;
    const sourceOutputSchema = sourceDefinition?.outputSchema;

    if (edge.targetHandle && edge.sourceHandle && edge.sourceHandle in sourceOutputs) {
      resolvedInputs[edge.targetHandle] = sourceOutputs[edge.sourceHandle];
      continue;
    }

    if (edge.targetHandle) {
      resolvedInputs[edge.targetHandle] = sourceOutputs;
      continue;
    }

    for (const key of targetInputKeys) {
      if (key in resolvedInputs) {
        continue;
      }
      const value = pickBestOutputValue(key, targetInputSchema, sourceOutputs, sourceOutputSchema);
      if (value !== undefined) {
        resolvedInputs[key] = value;
      }
    }
  }

  return resolvedInputs;
};

export const toWorkflowNodeJson = (node: UnifiedCanvasNode): WorkflowNode => {
  const data = node.data as BaseNodeData;

  return {
    id: node.id,
    type: node.type ?? data.type,
    position: node.position,
    config: isRecord(data.config) ? data.config : {},
    inputs: isRecord(data.inputs) ? data.inputs : {},
    outputs: isRecord(data.outputs) ? data.outputs : {},
    metadata: {
      label: data.label,
      description: data.description,
    },
  };
};
