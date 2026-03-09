import type { XYPosition } from "@xyflow/react";

export type WorkflowNode = {
  id: string;
  type: string;
  position: XYPosition;
  config: Record<string, unknown>;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  metadata?: {
    label?: string;
    description?: string;
  };
};

export type WorkflowEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
};

export type RuntimeNodeState = {
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
};

export type WorkflowRuntimeState = Record<string, RuntimeNodeState>;
