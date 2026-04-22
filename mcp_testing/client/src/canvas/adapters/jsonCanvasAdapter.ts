/**
 * jsonCanvas.adapter.ts — Bidirectional adapter between CanvasDocument and JSON Canvas v1.0.
 *
 * JSON Canvas (https://jsoncanvas.org) is an open file format from Obsidian for
 * storing infinite canvas data. It supports four node types: text, file, link, group.
 *
 * This adapter handles two directions:
 *   Export: CanvasDocument → JsonCanvasFile  (for .canvas file download / sharing)
 *   Import: JsonCanvasFile → CanvasDocument  (for opening .canvas files)
 *
 * Design decisions:
 *   - JSON Canvas is a lowest-common-denominator format. Rich fields (agentContext,
 *     permissions, execution state) are silently dropped on export.
 *   - Imported nodes get sensible defaults since they were not AI-generated.
 *   - Type mappings use const Record maps (not switch) for easy extension.
 */

import type {
  BlockType,
  BlockDataMap,
  CanvasBlockNode,
  CanvasEdge,
  CanvasDocument,
  ContentBlockData,
  CodeBlockData,
  ImageBlockData,
  VideoBlockData,
  ChatBlockData,
  BrowserBlockData,
  AudioBlockData,
  GroupBlockData,
} from "../types/blockTypes";

// ─── JSON Canvas v1.0 Spec Types (local definitions) ────────────────
// Defined here to avoid an external dependency on the spec.

type JsonCanvasNodeType = "text" | "file" | "link" | "group";
type JsonCanvasSide = "top" | "right" | "bottom" | "left";
type JsonCanvasEnd = "none" | "arrow";

interface JsonCanvasNode {
  id: string;
  type: JsonCanvasNodeType;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  text?: string;           // for type: "text"
  file?: string;           // for type: "file"
  url?: string;            // for type: "link"
  label?: string;          // for type: "group"
}

interface JsonCanvasEdge {
  id: string;
  fromNode: string;
  toNode: string;
  fromSide?: JsonCanvasSide;
  toSide?: JsonCanvasSide;
  fromEnd?: JsonCanvasEnd;
  toEnd?: JsonCanvasEnd;
  color?: string;
  label?: string;
}

interface JsonCanvasFile {
  nodes: JsonCanvasNode[];
  edges: JsonCanvasEdge[];
}

// ─── Type Mapping Tables ────────────────────────────────────────────

/**
 * Maps internal BlockType to the closest JSON Canvas node type.
 * Types without a direct equivalent fall back to "text" so data is not lost.
 */
const BLOCK_TYPE_TO_JC: Record<BlockType, JsonCanvasNodeType> = {
  content:      "text",
  code:         "text",
  chat:         "text",
  listicle:     "text",
  aigenerative: "text",
  image:        "file",
  video:        "file",
  browser:      "link",
  group:        "group",
  sandbox:      "text",
  product:      "text",
  datatable:    "text",
  audio:        "file",
};

/**
 * Maps JSON Canvas node types back to internal BlockType on import.
 * Each JC type gets the most semantically appropriate block type.
 */
const JC_TYPE_TO_BLOCK: Record<JsonCanvasNodeType, BlockType> = {
  text:  "content",
  file:  "image",
  link:  "browser",
  group: "group",
};

// ─── Export: CanvasDocument → JSON Canvas ───────────────────────────

/**
 * Converts a single CanvasBlockNode to a JSON Canvas node.
 * Position and size come from React Flow's measured values.
 * Rich content is serialised to the closest JSON Canvas field;
 * fields with no equivalent are silently dropped (JSON Canvas is a
 * lowest-common-denominator export format, not a full backup format).
 */
export function exportNodeToJsonCanvas(node: CanvasBlockNode): JsonCanvasNode {
  const base: JsonCanvasNode = {
    id:     node.id,
    type:   BLOCK_TYPE_TO_JC[node.type as BlockType],
    x:      node.position.x,
    y:      node.position.y,
    width:  node.measured?.width  ?? 400,
    height: node.measured?.height ?? 300,
    color:  node.data.meta.color,
  };

  switch (node.type as BlockType) {
    case "content":
    case "code":
    case "chat":
    case "listicle":
    case "sandbox":
    case "product":
    case "datatable":
    case "aigenerative":
      return { ...base, text: serializeContentToText(node) };

    case "image":
    case "video":
    case "audio": {
      const content = node.data.state.data as ImageBlockData | VideoBlockData | AudioBlockData;
      let fileUrl = "";
      if ("imageUrl" in content) fileUrl = content.imageUrl;
      else if ("videoUrl" in content) fileUrl = content.videoUrl || "";
      else if ("audioUrl" in content) fileUrl = content.audioUrl || "";
      
      return { ...base, file: fileUrl };
    }

    case "browser": {
      const content = node.data.state.data as BrowserBlockData;
      return { ...base, url: content.url };
    }

    case "group": {
      const content = node.data.state.data as GroupBlockData;
      return { ...base, label: content.label };
    }

    default:
      return base;
  }
}

/**
 * Converts a CanvasEdge to a JSON Canvas edge.
 * React Flow's sourceHandle / targetHandle map directly to JSON Canvas's
 * fromSide / toSide (both use cardinal direction strings).
 */
export function exportEdgeToJsonCanvas(edge: CanvasEdge): JsonCanvasEdge {
  return {
    id:       edge.id,
    fromNode: edge.source,
    toNode:   edge.target,
    fromSide: (edge.sourceHandle as JsonCanvasSide) ?? "bottom",
    toSide:   (edge.targetHandle as JsonCanvasSide) ?? "top",
    fromEnd:  "none",
    toEnd:    edge.data?.directionality === "none" ? "none" : "arrow",
    color:    (edge.data?.color as string) || undefined,
    label:    edge.label as string | undefined,
  };
}

/**
 * Exports a full CanvasDocument to the JSON Canvas file format.
 * Viewport is not part of the JSON Canvas spec and is omitted.
 */
export function exportCanvasToJsonCanvas(canvas: CanvasDocument): JsonCanvasFile {
  return {
    nodes: canvas.nodes.map(exportNodeToJsonCanvas),
    edges: canvas.edges.map(exportEdgeToJsonCanvas),
  };
}

// ─── Import: JSON Canvas → CanvasDocument ───────────────────────────

/**
 * Converts a JSON Canvas node into a CanvasBlockNode.
 * agentContext is null because imported nodes were not AI-generated.
 * version starts at 1; createdBy is set to "import" for traceability.
 */
export function importNodeFromJsonCanvas(jcNode: JsonCanvasNode): CanvasBlockNode {
  const blockType = JC_TYPE_TO_BLOCK[jcNode.type];
  const now = new Date().toISOString();

  // Create default capabilities and config (simplified for import)
  // Ideally this should use blockFactory but for pure data transformation we can construct it manually
  // providing we match the schema.

  return {
    id:       jcNode.id,
    type:     blockType,
    position: { x: jcNode.x, y: jcNode.y },
    data: {
      version: "1.0.0",
      meta: {
        label:          jcNode.label ?? (jcNode.text ? jcNode.text.substring(0, 20) : "Imported Block"),
        created_at:     now,
        updated_at:     now,
        created_by:     "import",
        author:         "import",
        version:        1,
        tags:           [],
        color:          jcNode.color,
      },
      capabilities: {
          inputs: [],
          outputs: [],
          supported_triggers: [],
          execution_mode: "sync",
          llm_routing: "none"
      },
      state: {
          status: "idle",
          data: buildContentFromJsonCanvas(blockType, jcNode),
          last_run: null
      },
      extensions: {
          config: {}
      }
    },
  };
}

/**
 * Converts a JSON Canvas edge to a CanvasEdge.
 * connectionType defaults to "dataflow" since JSON Canvas has no equivalent concept.
 */
export function importEdgeFromJsonCanvas(jcEdge: JsonCanvasEdge): CanvasEdge {
  return {
    id:           jcEdge.id,
    source:       jcEdge.fromNode,
    target:       jcEdge.toNode,
    sourceHandle: jcEdge.fromSide ?? "bottom",
    targetHandle: jcEdge.toSide   ?? "top",
    type:         "smoothstep",
    animated:     false,
    label:        jcEdge.label,
    data: {
      connectionType: "dataflow",
      color:          jcEdge.color,
      directionality: jcEdge.toEnd === "none" ? "none" : "arrow",
    },
  };
}

/**
 * Imports a full JSON Canvas file into a CanvasDocument.
 * Viewport defaults to origin / 1x zoom since JSON Canvas does not store it.
 */
export function importCanvasFromJsonCanvas(jcFile: JsonCanvasFile): CanvasDocument {
  return {
    nodes:    jcFile.nodes.map(importNodeFromJsonCanvas),
    edges:    jcFile.edges.map(importEdgeFromJsonCanvas),
    viewport: { x: 0, y: 0, zoom: 1 },
  };
}

// ─── Internal Helpers ───────────────────────────────────────────────

/**
 * Extracts the most human-readable text representation from any block
 * for use as the `text` field in JSON Canvas text nodes.
 */
function serializeContentToText(node: CanvasBlockNode): string {
  const { type, data } = node;
  const content = data.state.data;

  switch (type as BlockType) {
    case "content":
      return (content as ContentBlockData).document;
    case "code":
      return (content as CodeBlockData).source;
    case "chat": {
      const chatContent = content as ChatBlockData;
      return chatContent.messages
        .map((m) => `[${m.role}] ${m.content}`)
        .join("\n");
    }
    default:
      return data.meta.label;
  }
}

/**
 * Builds the appropriate `state.data` object for a given BlockType
 * from the available JSON Canvas fields.
 */
function buildContentFromJsonCanvas(
  blockType: BlockType,
  jcNode: JsonCanvasNode,
): BlockDataMap[BlockType] {
  switch (blockType) {
    case "content":
      return { document: jcNode.text ?? "", format: "markdown" } as ContentBlockData;
    case "image":
      return { imageUrl: jcNode.file ?? "", format: "png" } as ImageBlockData;
    case "browser":
      return { url: jcNode.url ?? "" } as BrowserBlockData;
    case "group":
      return { label: jcNode.label } as GroupBlockData;
    default:
      // Fallback to ContentBlockData structure for safety, though type casting handles the TS check.
      // In a real app we might want strict validation here.
      return { document: jcNode.text ?? "", format: "markdown" } as unknown as BlockDataMap[BlockType];
  }
}
