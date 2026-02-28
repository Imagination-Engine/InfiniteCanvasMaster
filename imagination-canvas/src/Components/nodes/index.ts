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
export { ContentNode } from "./ContentNode";
export { TriggerNode } from "./TriggerNode";
export { ActionNode } from "./ActionNode";
export { FilterNode } from "./FilterNode";
export { LinkNode } from "./LinkNode";
export { AudioRecordingNode } from "./AudioRecordingNode";

// ─── Type Exports ───────────────────────────────────────────────────
export type {
  ContentNodeData,
  ContentNodeType,
} from "./ContentNode";
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
export type {
  AudioRecordingNodeData,
  AudioRecordingNodeType,
} from "./AudioRecordingNode";

// ─── Node Type Registry ────────────────────────────────────────────
// IMPORTANT: defined outside components to prevent re-mounting on render.
// This map tells React Flow: "when a node has type='content', render ContentNode"
import { type NodeTypes } from "@xyflow/react";
import { ContentNode } from "./ContentNode";
import { TriggerNode } from "./TriggerNode";
import { ActionNode } from "./ActionNode";
import { FilterNode } from "./FilterNode";
import { LinkNode } from "./LinkNode";
import { AudioRecordingNode } from "./AudioRecordingNode";

export const NODE_TYPES: NodeTypes = {
  content: ContentNode,
  trigger: TriggerNode,
  action: ActionNode,
  filter: FilterNode,
  link: LinkNode,
  audioRecording: AudioRecordingNode,
};
