import type { NodeTypes } from "@xyflow/react";
import BaseNode from "./BaseNode";
import TranslatorNode from "./TranslatorNode";
import { NODE_CATALOG } from "./nodeCatalog";
import type { NodeRegistry } from "./types";

export const NODE_REGISTRY: NodeRegistry = Object.fromEntries(
  Object.entries(NODE_CATALOG).map(([nodeType, definition]) => [
    nodeType,
    {
      ...definition,
      component: nodeType === "translator" ? TranslatorNode : BaseNode,
    },
  ]),
);

export type NodeRegistryType = typeof NODE_REGISTRY;

export const REACT_FLOW_NODE_TYPES: NodeTypes = Object.fromEntries(
  Object.keys(NODE_REGISTRY).map((nodeType) => [
    nodeType,
    nodeType === "translator" ? TranslatorNode : BaseNode,
  ]),
);

export const getNodeDefinition = (nodeType: string) => NODE_REGISTRY[nodeType];
