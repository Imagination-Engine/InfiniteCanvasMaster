/**
 * block.types.ts — Central type definitions for the Imagination Canvas block system.
 *
 * This file is the single source of truth for all block-related types used across
 * the frontend (React Flow), backend (PostgreSQL JSONB), and export (JSON Canvas).
 *
 * Architecture:
 *   React Flow's `data` field holds a `BlockData<T>` object.
 *   React Flow's top-level fields (`id`, `type`, `position`, etc.) are the geometry layer.
 *   Everything domain-specific lives inside `data`.
 *
 * To add a new block type, update: BlockType, its Content interface, and BlockContentMap.
 */

import type { Node, Edge } from "@xyflow/react";

// ─── Status & Type Enums ────────────────────────────────────────────

/** Lifecycle status of a block's content generation or execution. */
export type BlockStatus = "idle" | "running" | "completed" | "error";

/** All supported canvas block types. */
export type BlockType =
  | "content"
  | "image"
  | "video"
  | "code"
  | "chat"
  | "sandbox"
  | "product"
  | "browser"
  | "datatable"
  | "listicle"
  | "aigenerative"
  | "audio"
  | "group";

export type ExecutionMode = "sync" | "async" | "streaming";
export type LLMRouting = "local" | "external" | "prefer_local" | "none";
export type TriggerType = "manual" | "event" | "schedule" | "upstream";

// ─── Metadata ───────────────────────────────────────────────────────

/** Stable metadata shared by every block regardless of type. */
export interface BlockMeta {
  label: string;               // Display name (was title)
  description?: string;
  icon?: string;
  tags: string[];
  created_at: string;          // ISO 8601
  updated_at: string;          // ISO 8601
  created_by: string;          // agent ID or user ID
  author: string;              // user-id | system
  version: number;             // increment on every mutation
  color?: string;              // hex — also used by JSON Canvas
}

// ─── Capabilities (Inputs/Outputs) ──────────────────────────────────

export interface BlockPort {
  name: string;
  type: string;                // MIME-like: "text/plain", "image/*", "*/*"
  required: boolean;
  schema?: object | null;      // optional JSON Schema for the port's data
}

export interface BlockCapabilities {
  inputs: BlockPort[];
  outputs: BlockPort[];
  supported_triggers: TriggerType[];
  execution_mode: ExecutionMode;
  llm_routing: LLMRouting;
}

// ─── Per-Type Data Shapes (Runtime State) ───────────────────────────

export interface ContentBlockData {
  document: string;
  format: "markdown" | "plaintext" | "html";
}

export interface CodeBlockData {
  source: string;
  language: string;
  dependencies: string[];
  output?: string;
  logs?: string[];
}

export interface ImageBlockData {
  imageUrl: string;
  format: "png" | "jpg" | "webp" | "svg";
  altText?: string;
}

export interface VideoBlockData {
  videoUrl?: string;
  format?: "mp4" | "webm";
}

export interface AudioBlockData {
  audioUrl?: string;
  duration?: string;
  transcript?: string;
}

export interface ChatBlockData {
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>;
}

export interface SandboxBlockData {
  environmentVars: Record<string, string>;
  previewUrl?: string;
}

export interface BrowserBlockData {
  url: string;
  screenshotUrl?: string;
}

export interface ProductBlockData {
  name: string;
  priceUsd?: number;
}

export interface DataTableBlockData {
  columns: string[];
  rows: unknown[][];
}

export interface ListicleBlockData {
  items: Array<{
    title: string;
    description?: string;
  }>;
}

export interface AIGenerativeBlockData {
  prompt: string;
  outputType: "text" | "image" | "code";
  output?: string;
}

export interface GroupBlockData {
  label?: string;
}

// ─── Data Map ───────────────────────────────────────────────────────

/**
 * Maps each BlockType to its corresponding runtime state data shape.
 */
export interface BlockDataMap {
  content:      ContentBlockData;
  code:         CodeBlockData;
  image:        ImageBlockData;
  video:        VideoBlockData;
  chat:         ChatBlockData;
  sandbox:      SandboxBlockData;
  browser:      BrowserBlockData;
  product:      ProductBlockData;
  datatable:    DataTableBlockData;
  listicle:     ListicleBlockData;
  aigenerative: AIGenerativeBlockData;
  audio:        AudioBlockData;
  group:        GroupBlockData;
}

// ─── Block State ────────────────────────────────────────────────────

export interface BlockState<T extends BlockType = BlockType> {
  status: BlockStatus;
  data: BlockDataMap[T];       // Runtime state specific to the block type
  last_run: string | null;     // ISO 8601
  error?: string;
}

// ─── Core Block Data (React Flow `data` field) ──────────────────────

/** The payload stored inside React Flow's `data` field for every block. */
export interface BlockData<T extends BlockType = BlockType> {
  // Index signature required by @xyflow/react
  [key: string]: unknown;

  // Schema Version
  version: string;

  // Metadata
  meta: BlockMeta;

  // Capabilities (IO)
  capabilities: BlockCapabilities;

  // Runtime State
  state: BlockState<T>;

  // Configuration & Extensions
  extensions: {
    config: Record<string, unknown>;
    [key: string]: unknown;
  };
}

// ─── React Flow Node & Edge Wrappers ────────────────────────────────

/** A fully-typed React Flow node carrying BlockData in its `data` field. */
export type CanvasBlockNode<T extends BlockType = BlockType> = Node<BlockData<T>, T>;

/** Edge metadata specific to the Imagination Canvas. */
export interface CanvasEdgeData {
  [key: string]: unknown;
  connectionType: "dataflow" | "dependency" | "context" | "reference";
  label?: string;
}

export type CanvasEdge = Edge<CanvasEdgeData>;

// ─── Canvas Document ────────────────────────────────────────────────

/** The complete canvas state — what gets saved to and restored from the backend. */
export interface CanvasDocument {
  nodes: CanvasBlockNode[];
  edges: CanvasEdge[];
  viewport: { x: number; y: number; zoom: number };
}
