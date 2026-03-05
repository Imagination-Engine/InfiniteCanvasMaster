import type { XYPosition } from "@xyflow/react";
import { NODE_CATALOG } from "./nodeCatalog";
import type { BaseNodeData } from "./types";
import type { UnifiedCanvasNode } from "./canvasTypes";

let nodeIdCounter = 0;

export const createNodeId = () => `node-${Date.now()}-${nodeIdCounter++}`;

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const createNodeFromType = (nodeType: string, position: XYPosition): UnifiedCanvasNode => {
  const definition = NODE_CATALOG[nodeType];

  if (!definition) {
    throw new Error(`Unknown node type: ${nodeType}`);
  }

  const id = createNodeId();
  const defaultData = clone(definition.defaultData) as BaseNodeData;

  return {
    id,
    type: nodeType,
    position,
    data: {
      ...defaultData,
      id,
      type: nodeType,
    },
  };
};
