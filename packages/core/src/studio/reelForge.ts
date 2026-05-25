/**
 * Reel reference collector — gathers upstream image assets for Veo forge.
 *
 * @module @iem/core/studio/reelForge
 */

import type { VideoReferenceAsset } from "./artifacts.js";
import { normalizeCanvasBlockId } from "../block/blockIdAliases.js";

export const VEO_MAX_REFERENCE_IMAGES = 3;

export interface ForgeConnectionLike {
  id?: string;
  sourceId?: string;
  targetId?: string;
  fromId?: string;
  toId?: string;
}

export interface ForgeCanvasObjectLike {
  id: string;
  x?: number;
  y?: number;
  type?: string;
  blockKind?: string;
  metadata?: Record<string, unknown>;
}

function connectionSource(conn: ForgeConnectionLike): string | undefined {
  return conn.sourceId ?? conn.fromId;
}

function connectionTarget(conn: ForgeConnectionLike): string | undefined {
  return conn.targetId ?? conn.toId;
}

function blockIdOf(obj: ForgeCanvasObjectLike): string {
  const kind = obj.blockKind ?? obj.type;
  return typeof kind === "string" ? kind : "unknown";
}

function labelOf(obj: ForgeCanvasObjectLike): string | undefined {
  const meta = obj.metadata ?? {};
  const label = meta.label ?? meta.title ?? meta.name;
  return typeof label === "string" && label.trim() ? label.trim() : undefined;
}

function isResolvableImageUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  if (url.startsWith("http://") || url.startsWith("https://")) return true;
  if (url.startsWith("/generated-media/")) return true;
  if (url.startsWith("data:image/")) return true;
  return false;
}

function extractImageUrl(
  metadata: Record<string, unknown>,
): string | undefined {
  const inputs = metadata.inputs as Record<string, unknown> | undefined;
  const outputsTop = metadata.outputs as Record<string, unknown> | undefined;
  const directOutput =
    typeof outputsTop?.imageUrl === "string"
      ? outputsTop.imageUrl
      : typeof outputsTop?.thumbnailUrl === "string"
        ? outputsTop.thumbnailUrl
        : undefined;

  const direct =
    metadata.imageUrl ??
    metadata.thumbnailUrl ??
    directOutput ??
    inputs?.imageUrl ??
    inputs?.thumbnailUrl;
  if (typeof direct === "string" && isResolvableImageUrl(direct)) {
    return direct;
  }

  const outputs = metadata.outputs;
  if (outputs && typeof outputs === "object") {
    for (const value of Object.values(outputs as Record<string, unknown>)) {
      if (!value || typeof value !== "object") continue;
      const artifact = value as { data?: Record<string, unknown> };
      const data = artifact.data;
      if (!data) continue;
      const fromData = data.imageUrl ?? data.thumbnailUrl ?? data.clipUrl;
      if (typeof fromData === "string" && isResolvableImageUrl(fromData)) {
        return fromData;
      }
    }
  }

  const studioPayload = metadata.studioPayload;
  if (studioPayload && typeof studioPayload === "object") {
    const sp = studioPayload as Record<string, unknown>;
    const fromPayload = sp.imageUrl ?? sp.thumbnailUrl;
    if (typeof fromPayload === "string" && isResolvableImageUrl(fromPayload)) {
      return fromPayload;
    }
  }

  return undefined;
}

/** Neighbour node id when an edge touches the forge (either direction). */
export function forgeNeighbourId(
  forgeObjectId: string,
  conn: ForgeConnectionLike,
): string | undefined {
  const source = connectionSource(conn);
  const target = connectionTarget(conn);
  if (target === forgeObjectId && source) return source;
  if (source === forgeObjectId && target) return target;
  return undefined;
}

/**
 * Normalize infinite-canvas / React Flow objects for reference collection.
 */
export function normalizeForgeCanvasObjects(
  objects: Record<string, ForgeCanvasObjectLike>,
): Record<string, ForgeCanvasObjectLike> {
  return Object.fromEntries(
    Object.entries(objects).map(([id, obj]) => {
      const meta = { ...(obj.metadata ?? {}) };
      const inputs = {
        ...((meta.inputs as Record<string, unknown>) ?? {}),
      };
      const outputs = {
        ...((meta.outputs as Record<string, unknown>) ?? {}),
      };
      const imageUrl =
        (typeof inputs.imageUrl === "string" && inputs.imageUrl) ||
        (typeof outputs.imageUrl === "string" && outputs.imageUrl) ||
        (typeof meta.imageUrl === "string" && meta.imageUrl) ||
        undefined;

      if (imageUrl && !inputs.imageUrl) {
        inputs.imageUrl = imageUrl;
      }
      if (imageUrl && !outputs.imageUrl) {
        outputs.imageUrl = imageUrl;
      }

      return [
        id,
        {
          id: obj.id ?? id,
          x: obj.x,
          blockKind: obj.blockKind ?? obj.type,
          metadata: {
            ...meta,
            inputs,
            outputs,
            ...(imageUrl ? { imageUrl } : {}),
          },
        },
      ];
    }),
  );
}

export function mergeForgeConnections(
  ...lists: ForgeConnectionLike[][]
): ForgeConnectionLike[] {
  const seen = new Set<string>();
  const merged: ForgeConnectionLike[] = [];
  for (const list of lists) {
    for (const conn of list) {
      const source = connectionSource(conn);
      const target = connectionTarget(conn);
      const key = conn.id ?? `${source ?? "?"}->${target ?? "?"}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(conn);
    }
  }
  return merged;
}

export interface CollectReelReferencesResult {
  references: VideoReferenceAsset[];
  totalConnected: number;
  ignoredCount: number;
}

/**
 * Collect up to {@link VEO_MAX_REFERENCE_IMAGES} image references from nodes
 * connected into the forge block (incoming edges).
 */
export function collectReelReferences(
  forgeObjectId: string,
  connections: ForgeConnectionLike[],
  objects: Record<string, ForgeCanvasObjectLike>,
): CollectReelReferencesResult {
  const normalized = normalizeForgeCanvasObjects(objects);

  const touching = connections.filter(
    (c) => forgeNeighbourId(forgeObjectId, c) != null,
  );

  const candidates: VideoReferenceAsset[] = [];

  for (const conn of touching) {
    const sourceId = forgeNeighbourId(forgeObjectId, conn);
    if (!sourceId) continue;
    const obj = normalized[sourceId];
    if (!obj) continue;

    const imageUrl = extractImageUrl(obj.metadata ?? {});
    if (!imageUrl) continue;

    candidates.push({
      objectId: sourceId,
      blockId: normalizeCanvasBlockId(blockIdOf(obj)),
      imageUrl,
      label: labelOf(obj),
    });
  }

  candidates.sort((a, b) => {
    const ax = normalized[a.objectId]?.x ?? 0;
    const bx = normalized[b.objectId]?.x ?? 0;
    return ax - bx;
  });

  const references = candidates.slice(0, VEO_MAX_REFERENCE_IMAGES);

  return {
    references,
    totalConnected: touching.length,
    ignoredCount: Math.max(0, candidates.length - references.length),
  };
}
