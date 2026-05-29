/**
 * Bridge between server UnifiedCanvasDocument and imagination-canvas-kit stores.
 */

import type { CanvasObject } from "../contracts/index";
import type { Connection } from "../state/connectionStore";

export type UnifiedCanvasNodeLike = {
  id: string;
  type?: string;
  position?: { x?: number; y?: number };
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  data?: Record<string, unknown>;
};

export type UnifiedCanvasEdgeLike = {
  id: string;
  source: string;
  target: string;
  label?: string;
  data?: Record<string, unknown>;
};

export type UnifiedCanvasDocumentLike = {
  nodes?: UnifiedCanvasNodeLike[];
  edges?: UnifiedCanvasEdgeLike[];
  viewport?: { x?: number; y?: number; zoom?: number };
};

function mergeMetadata(
  serverData: Record<string, unknown> | undefined,
  localMeta: Record<string, unknown> | undefined,
): Record<string, unknown> {
  const server = serverData ?? {};
  const local = localMeta ?? {};
  const serverInputs = (server.inputs as Record<string, unknown>) ?? {};
  const localInputs = (local.inputs as Record<string, unknown>) ?? {};
  const serverOutputs = (server.outputs as Record<string, unknown>) ?? {};
  const localOutputs = (local.outputs as Record<string, unknown>) ?? {};

  return {
    ...server,
    ...local,
    inputs: { ...serverInputs, ...localInputs },
    outputs: { ...serverOutputs, ...localOutputs },
    studioPayload: local.studioPayload ?? server.studioPayload,
    // Prefer local generated media URLs over empty server fields
    imageUrl:
      local.imageUrl ??
      localInputs.imageUrl ??
      localOutputs.imageUrl ??
      server.imageUrl,
  };
}

/**
 * Merge server document nodes into existing canvas objects without dropping
 * locally generated images / forge state.
 */
export function mergeDocumentIntoCanvasObjects(
  currentObjects: Record<string, CanvasObject>,
  document: UnifiedCanvasDocumentLike,
): Record<string, CanvasObject> {
  const serverNodes = document.nodes ?? [];
  const isColdStart = Object.keys(currentObjects).length === 0;
  const merged: Record<string, CanvasObject> = isColdStart
    ? {}
    : { ...currentObjects };

  for (const node of serverNodes) {
    const existing = currentObjects[node.id];
    const localMeta = existing?.metadata;
    const serverData = (node.data ?? {}) as Record<string, unknown>;
    const blockType = node.type || existing?.type || "note";

    merged[node.id] = {
      id: node.id,
      type: blockType,
      blockKind: blockType,
      x: node.position?.x ?? node.x ?? existing?.x ?? 0,
      y: node.position?.y ?? node.y ?? existing?.y ?? 0,
      width: node.width ?? existing?.width ?? 320,
      height: node.height ?? existing?.height ?? 240,
      zIndex: existing?.zIndex ?? 1,
      status: existing?.status ?? "idle",
      metadata: mergeMetadata(serverData, localMeta),
    } as CanvasObject;
  }

  if (isColdStart) {
    return merged;
  }

  // Drop stale objects that no longer exist on server (optional hygiene)
  const serverIds = new Set(serverNodes.map((n) => n.id));
  for (const id of Object.keys(merged)) {
    if (!serverIds.has(id)) {
      delete merged[id];
    }
  }

  return merged;
}

export function documentEdgesToConnections(
  document: UnifiedCanvasDocumentLike,
): Record<string, Connection> {
  const out: Record<string, Connection> = {};
  for (const edge of document.edges ?? []) {
    out[edge.id] = {
      id: edge.id,
      fromId: edge.source,
      toId: edge.target,
      label: edge.label ?? (edge.data?.label as string | undefined),
    };
  }
  return out;
}

export function exportCanvasToDocument(
  objects: Record<string, CanvasObject>,
  connections: Record<string, Connection>,
  viewport?: { x?: number; y?: number; zoom?: number },
): UnifiedCanvasDocumentLike {
  return {
    nodes: Object.values(objects).map((obj) => ({
      id: obj.id,
      type: (obj as { blockKind?: string }).blockKind ?? obj.type,
      position: { x: obj.x, y: obj.y },
      width: obj.width,
      height: obj.height,
      data: {
        ...(obj.metadata ?? {}),
        label: obj.metadata?.label,
        description: obj.metadata?.description,
        inputs: obj.metadata?.inputs,
        outputs: obj.metadata?.outputs,
        studioPayload: obj.metadata?.studioPayload,
      },
    })),
    edges: Object.values(connections).map((c) => ({
      id: c.id,
      source: c.fromId,
      target: c.toId,
      label: c.label,
    })),
    viewport: viewport ?? { x: 0, y: 0, zoom: 1 },
  };
}
