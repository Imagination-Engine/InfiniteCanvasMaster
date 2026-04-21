import type { UnifiedCanvasNode } from "../canvasTypes";
import type { BaseNodeData } from "../types";
import type { RuntimeNodeState, WorkflowRuntimeState } from "./types";

let runtimeState: WorkflowRuntimeState = {};

const toRecord = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};

export const getRuntimeState = (): WorkflowRuntimeState => runtimeState;

export const setRuntimeNodeState = (nodeId: string, patch: Partial<RuntimeNodeState>) => {
  const existing = runtimeState[nodeId] ?? { inputs: {}, outputs: {} };
  runtimeState[nodeId] = {
    inputs: patch.inputs ?? existing.inputs,
    outputs: patch.outputs ?? existing.outputs,
  };
};

export const setRuntimeNodeInputs = (nodeId: string, inputs: Record<string, unknown>) => {
  setRuntimeNodeState(nodeId, { inputs });
};

export const setRuntimeNodeOutputs = (nodeId: string, outputs: Record<string, unknown>) => {
  setRuntimeNodeState(nodeId, { outputs });
};

export const syncRuntimeOutputsFromNodes = (nodes: UnifiedCanvasNode[]) => {
  const nodeIds = new Set(nodes.map((node) => node.id));
  const next: WorkflowRuntimeState = {};

  for (const node of nodes) {
    const data = node.data as BaseNodeData;
    const previous = runtimeState[node.id];
    next[node.id] = {
      inputs: previous?.inputs ?? {},
      outputs: toRecord(data.outputs),
    };
  }

  for (const id of Object.keys(runtimeState)) {
    if (!nodeIds.has(id)) {
      continue;
    }
    if (!next[id]) {
      next[id] = runtimeState[id];
    }
  }

  runtimeState = next;
};
