/**
 * Node Registry — single source of truth for all custom node types.
 *
 * To add a new node type:
 *   1. Create a new component in this folder (e.g. OutputNode.tsx)
 *   2. Export it from this barrel file
 *   3. Register it in NODE_TYPES below
 *
 * React Flow uses this map to look up which component to render
 * for each node's `type` field.
 */

// ─── Component Exports ──────────────────────────────────────────────
export { TriggerNode } from "./TriggerNode";
export { ActionNode } from "./ActionNode";
export { FilterNode } from "./FilterNode";
export { LinkNode } from "./LinkNode";

// ─── Type Exports ───────────────────────────────────────────────────
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
export type {
  LinkNodeData,
  LinkNodeType,
} from "./LinkNode";

// ─── Node Type Registry ────────────────────────────────────────────
// IMPORTANT: defined outside components to prevent re-mounting on render.
import { type NodeTypes } from "@xyflow/react";
import { TriggerNode } from "./TriggerNode";
import { ActionNode } from "./ActionNode";
import { FilterNode } from "./FilterNode";
import { LinkNode } from "./LinkNode";

export const NODE_TYPES: NodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  filter: FilterNode,
  link: LinkNode,
};
