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
export type BlockStatus = "idle" | "loading" | "complete" | "error";

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

// ─── Generic Metadata ───────────────────────────────────────────────

/** Stable metadata shared by every block regardless of type. */
export interface BlockMetadata {
  title: string;
  createdAt: string;           // ISO 8601
  lastModifiedAt: string;      // ISO 8601
  createdBy: string;           // agent ID or user ID
  version: number;             // increment on every mutation
  tags: string[];
  color?: string;              // hex — also used by JSON Canvas
}

// ─── Agent Context ──────────────────────────────────────────────────

/** Populated by AI agents; null for user-created blocks. */
export interface AgentContext {
  generatingAgent: string;     // e.g. "BusinessStrategistAgent"
  skillId: string;             // e.g. "business-plan-writer-v1"
  inputsConsumed: string[];    // block IDs this was derived from
  confidenceScore: number;     // 0.0 – 1.0
}

// ─── Permissions ────────────────────────────────────────────────────

export interface BlockPermissions {
  ownerId: string;
  sharedWith: string[];
  readOnly: boolean;
}

// ─── Per-Type Content Shapes ────────────────────────────────────────
// Each content interface is defined separately so block types can
// evolve independently without affecting each other.

export interface ContentBlockContent {
  document: string;
  format: "markdown" | "plaintext" | "html";
  wordCount?: number;
  readabilityScore?: number;
}

export interface CodeBlockContent {
  source: string;
  language: string;
  entrypoint?: string;
  dependencies: string[];
  execution?: {
    status: BlockStatus;
    sandboxId?: string;
    output?: string;
    runtimeMs?: number;
    memoryMb?: number;
  };
}

export interface ImageBlockContent {
  imageUrl: string;
  format: "png" | "jpg" | "webp" | "svg";
  dimensions?: string;         // e.g. "1920x1080"
  altText?: string;
  generationModel?: string;
  sourcePrompt?: string;
}

export interface VideoBlockContent {
  videoUrl?: string;
  sourcePrompt?: string;
  script?: string;
  duration?: string;
  format?: "mp4" | "webm";
  resolution?: string;
}

export interface AudioBlockContent {
  audioUrl?: string;
  duration?: string;      // e.g. "0:45"
  transcript?: string;
  format?: "mp3" | "wav" | "webm" | "m4a";
}

export interface ChatBlockContent {
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: string;
    agent?: string;
  }>;
  context?: {
    accessibleBlocks: string[];
  };
}

export interface SandboxBlockContent {
  repository?: string;
  branch?: string;
  environmentVars: Record<string, string>;
  previewUrl?: string;
  logs?: string[];
}

export interface BrowserBlockContent {
  url: string;
  screenshotUrl?: string;
  scrapedText?: string;
}

export interface ProductBlockContent {
  name: string;
  description?: string;
  priceUsd?: number;
  billingPeriod?: "monthly" | "yearly" | "one-time";
  stripeProductId?: string;
  checkoutUrl?: string;
}

export interface DataTableBlockContent {
  columns: string[];
  rows: unknown[][];
  sourceQuery?: string;
}

export interface ListicleBlockContent {
  items: Array<{
    title: string;
    description?: string;
    rank?: number;
  }>;
}

export interface AIGenerativeBlockContent {
  prompt: string;
  outputType: "text" | "image" | "code";
  output?: string;
  model?: string;
}

export interface GroupBlockContent {
  label?: string;
}

// ─── Content Type Map ───────────────────────────────────────────────

/**
 * Maps each BlockType to its corresponding content shape.
 * This is the single source of truth for content typing — the factory,
 * adapter, and runtime all derive their content types from this map.
 */
export interface BlockContentMap {
  content:      ContentBlockContent;
  code:         CodeBlockContent;
  image:        ImageBlockContent;
  video:        VideoBlockContent;
  chat:         ChatBlockContent;
  sandbox:      SandboxBlockContent;
  browser:      BrowserBlockContent;
  product:      ProductBlockContent;
  datatable:    DataTableBlockContent;
  listicle:     ListicleBlockContent;
  aigenerative: AIGenerativeBlockContent;
  audio:        AudioBlockContent;
  group:        GroupBlockContent;
}

// ─── Core Block Data (React Flow `data` field) ──────────────────────

/** The payload stored inside React Flow's `data` field for every block. */
export interface BlockData<T extends BlockType = BlockType> {
  // Index signature required by @xyflow/react's Node<T extends Record<string, unknown>>
  [key: string]: unknown;
  status: BlockStatus;
  metadata: BlockMetadata;
  content: BlockContentMap[T];
  agentContext: AgentContext | null;
  permissions: BlockPermissions;
}

// ─── React Flow Node & Edge Wrappers ────────────────────────────────

/** A fully-typed React Flow node carrying BlockData in its `data` field. */
export type CanvasBlockNode<T extends BlockType = BlockType> = Node<BlockData<T>, T>;

/** Edge metadata specific to the Imagination Canvas. */
export interface CanvasEdgeData {
  // Index signature required by @xyflow/react's Edge<T extends Record<string, unknown>>
  [key: string]: unknown;
  connectionType: "dataflow" | "dependency" | "context" | "reference";
  color?: string;
  directionality?: "arrow" | "none";
}

export type CanvasEdge = Edge<CanvasEdgeData>;

// ─── Canvas Document ────────────────────────────────────────────────

/** The complete canvas state — what gets saved to and restored from the backend. */
export interface CanvasDocument {
  nodes: CanvasBlockNode[];
  edges: CanvasEdge[];
  viewport: { x: number; y: number; zoom: number };
}
