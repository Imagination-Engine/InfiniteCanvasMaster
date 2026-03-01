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
export { ImageNode } from "./ImageNode";
export { AudioRecordingNode } from "./AudioRecordingNode";

// ─── Type Exports ───────────────────────────────────────────────────
export type {
  ContentNodeData,
  ContentNodeType,
} from "./ContentNode";
export type {
  ImageNodeData,
  ImageNodeType,
} from "./ImageNode";
export type {
  AudioRecordingNodeData,
  AudioRecordingNodeType,
} from "./AudioRecordingNode";

// ─── Node Type Registry ────────────────────────────────────────────
// IMPORTANT: defined outside components to prevent re-mounting on render.
// This map tells React Flow: "when a node has type='content', render ContentNode"
import { type NodeTypes } from "@xyflow/react";
import { ContentNode } from "./ContentNode";
import { ImageNode } from "./ImageNode";
import { AudioRecordingNode } from "./AudioRecordingNode";

export const NODE_TYPES: NodeTypes = {
  content: ContentNode,
  image: ImageNode,
  audio: AudioRecordingNode,
};
