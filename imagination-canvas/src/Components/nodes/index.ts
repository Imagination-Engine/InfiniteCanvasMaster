/**
 * Node Registry — single source of truth for all custom node types.
 *
 * To add a new node type:
 *   1. Create a new component in this folder (e.g. OutputNode.tsx)
 *   2. Export it from this barrel file
 *   3. Register it in NODE_TYPES below
 *
 * React Flow uses this map to look up which component to render for each node's `type` field.
 */

export { TriggerNode } from "./TriggerNode";
export { ActionNode } from "./ActionNode";
export { FilterNode } from "./FilterNode";

// Re-export data types so the Canvas can reference them
export type {
  TriggerNodeData,
  TriggerNodeType,
} from "./TriggerNode";
export type {
  ActionNodeData,
  ActionNodeType,
} from "./ActionNode";
export type {
  FilterNodeData,
  FilterNodeType,
} from "./FilterNode";

import { type NodeTypes } from "@xyflow/react";
import { TriggerNode } from "./TriggerNode";
import { ActionNode } from "./ActionNode";
import { FilterNode } from "./FilterNode";

/**
 * NODE_TYPES — maps the string type id → React component.
 *
 * IMPORTANT: This object must be defined OUTSIDE of any component
 * to prevent React Flow from re-mounting nodes on every render.
 */
export const NODE_TYPES: NodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  filter: FilterNode,
};
