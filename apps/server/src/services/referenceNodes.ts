import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import * as dbModule from "@iem/db";
import { normalizeCanvasBlockId } from "@iem/core";

const { db, canvases, nodes: nodesTable, edges: edgesTable } = dbModule as any;

const VIDEO_BLOCK_ID = "iem.studio.video";
export const REFERENCE_IMAGE_BLOCK_ID = "iem.reel.referenceImage";

export interface ReferenceImageInput {
  url: string;
  mimeType?: string;
  label?: string;
}

export interface InjectedBlueprintNode {
  id: string;
  canvasId: string;
  type: string;
  data: Record<string, unknown>;
  positionX: number;
  positionY: number;
}

export interface InjectedBlueprintEdge {
  id: string;
  canvasId: string;
  sourceId: string;
  targetId: string;
  data: Record<string, unknown>;
}

export interface InjectReferenceResult {
  nodes: InjectedBlueprintNode[];
  edges: InjectedBlueprintEdge[];
}

/**
 * Materialise uploaded reference images as canvas nodes on the workspace's
 * canvas. When an `iem.studio.video` (reel forge) node already exists on the
 * canvas, each reference is auto-wired into it (source → forge) so the Veo
 * pipeline picks them up. If no video node exists, the references are still
 * placed on the canvas but left unconnected.
 */
export async function injectReferenceImageNodes(opts: {
  workspaceId: string;
  references: ReferenceImageInput[];
}): Promise<InjectReferenceResult> {
  const { workspaceId, references } = opts;
  if (!references.length || !workspaceId) return { nodes: [], edges: [] };

  const [canvas] = await db
    .select()
    .from(canvases)
    .where(eq(canvases.workspaceId, workspaceId));
  if (!canvas) return { nodes: [], edges: [] };

  // Look for an existing reel-forge (video studio) node to wire into.
  const existingNodes = await db
    .select()
    .from(nodesTable)
    .where(eq(nodesTable.canvasId, canvas.id));
  const videoNode = existingNodes.find(
    (n: any) => normalizeCanvasBlockId(n.type) === VIDEO_BLOCK_ID,
  );

  // Stack references to the left of the forge (or near origin if none yet).
  const count = references.length;
  const baseX = videoNode ? (videoNode.positionX ?? 0) - 500 : 100;
  const baseY = videoNode
    ? (videoNode.positionY ?? 0) - ((count - 1) * 300) / 2
    : 100;

  const newNodes: InjectedBlueprintNode[] = references.map((ref, i) => ({
    id: crypto.randomUUID(),
    canvasId: canvas.id,
    type: REFERENCE_IMAGE_BLOCK_ID,
    data: {
      label: ref.label || `Reference ${i + 1}`,
      description: "Uploaded reference image",
      inputs: { imageUrl: ref.url },
      outputs: { imageUrl: ref.url },
      imageUrl: ref.url,
    },
    positionX: baseX,
    positionY: baseY + i * 300,
  }));

  if (newNodes.length > 0) {
    await db.insert(nodesTable).values(newNodes);
  }

  let newEdges: InjectedBlueprintEdge[] = [];
  if (videoNode) {
    newEdges = newNodes.map((n) => ({
      id: crypto.randomUUID(),
      canvasId: canvas.id,
      sourceId: n.id,
      targetId: videoNode.id,
      data: {},
    }));
    if (newEdges.length > 0) {
      await db.insert(edgesTable).values(newEdges);
    }
  }

  return { nodes: newNodes, edges: newEdges };
}
