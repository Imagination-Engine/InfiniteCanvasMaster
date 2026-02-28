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
 *   - Imported nodes get `agentContext: null` and `createdBy: "import"` since they
 *     were not AI-generated.
 *   - Type mappings use const Record maps (not switch) for easy extension.
 */

import type {
  BlockType,
  BlockContentMap,
  CanvasBlockNode,
  CanvasEdge,
  CanvasDocument,
  ContentBlockContent,
  CodeBlockContent,
  ImageBlockContent,
  VideoBlockContent,
  ChatBlockContent,
  BrowserBlockContent,
  GroupBlockContent,
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
    color:  node.data.metadata.color,
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
    case "video": {
      const content = node.data.content as ImageBlockContent | VideoBlockContent;
      const fileUrl = "imageUrl" in content ? content.imageUrl : content.videoUrl;
      return { ...base, file: fileUrl };
    }

    case "browser": {
      const content = node.data.content as BrowserBlockContent;
      return { ...base, url: content.url };
    }

    case "group": {
      const content = node.data.content as GroupBlockContent;
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
    fromSide: (edge.sourceHandle as JsonCanvasSide) ?? "right",
    toSide:   (edge.targetHandle as JsonCanvasSide) ?? "left",
    fromEnd:  "none",
    toEnd:    edge.data?.directionality === "none" ? "none" : "arrow",
    color:    edge.data?.color,
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

  return {
    id:       jcNode.id,
    type:     blockType,
    position: { x: jcNode.x, y: jcNode.y },
    data: {
      status: "idle",
      metadata: {
        title:          jcNode.label ?? "",
        createdAt:      now,
        lastModifiedAt: now,
        createdBy:      "import",
        version:        1,
        tags:           [],
        color:          jcNode.color,
      },
      content: buildContentFromJsonCanvas(blockType, jcNode),
      agentContext: null,
      permissions: {
        ownerId:    "",
        sharedWith: [],
        readOnly:   false,
      },
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
    sourceHandle: jcEdge.fromSide ?? "right",
    targetHandle: jcEdge.toSide   ?? "left",
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
  const content = data.content;

  switch (type as BlockType) {
    case "content":
      return (content as ContentBlockContent).document;
    case "code":
      return (content as CodeBlockContent).source;
    case "chat": {
      const chatContent = content as ChatBlockContent;
      return chatContent.messages
        .map((m) => `[${m.role}] ${m.content}`)
        .join("\n");
    }
    default:
      return data.metadata.title;
  }
}

/**
 * Builds the appropriate `content` object for a given BlockType
 * from the available JSON Canvas fields.
 */
function buildContentFromJsonCanvas(
  blockType: BlockType,
  jcNode: JsonCanvasNode,
): BlockContentMap[BlockType] {
  switch (blockType) {
    case "content":
      return { document: jcNode.text ?? "", format: "markdown" } satisfies ContentBlockContent;
    case "image":
      return { imageUrl: jcNode.file ?? "", format: "png" } satisfies ImageBlockContent;
    case "browser":
      return { url: jcNode.url ?? "" } satisfies BrowserBlockContent;
    case "group":
      return { label: jcNode.label } satisfies GroupBlockContent;
    default:
      return { document: jcNode.text ?? "", format: "markdown" } satisfies ContentBlockContent;
  }
}
