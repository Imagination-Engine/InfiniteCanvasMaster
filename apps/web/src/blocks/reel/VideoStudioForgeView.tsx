import React, { useCallback, useMemo, useState, useEffect } from "react";
import type { BlockViewProps } from "@iem/core";
import { mergeForgeConnections, normalizeForgeCanvasObjects } from "@iem/core";
import {
  useCanvasStore,
  useConnectionStore,
} from "@iem/imagination-canvas-kit";
import {
  ReelForgePanel,
  videoPayloadFromMetadata,
  persistVideoStudioPayload,
  type VideoStudioPayload,
  type ReelForgeConnection,
  type ReelForgeObject,
} from "@iem/surface-reel";

const DEFAULT_PAYLOAD: VideoStudioPayload = {
  title: "Untitled Reel",
  scenes: [],
  references: [],
  forge: { prompt: "", status: "idle" },
};

type ForgeViewProps = BlockViewProps<any, any> & {
  object?: {
    id: string;
    metadata?: Record<string, unknown>;
  };
  mode?: string;
  /** React Flow edges: { source, target } */
  edges?: Array<{ source: string; target: string; id?: string }>;
  /** All canvas nodes by id */
  nodesById?: Record<string, ReelForgeObject>;
  onParamsChange?: (params: Record<string, unknown>) => void;
};

export const VideoStudioForgeView: React.FC<ForgeViewProps> = ({
  object,
  mode,
  edges = [],
  nodesById = {},
  onParamsChange,
}) => {
  const forgeObjectId = object?.id ?? "forge-unknown";
  const isImmersive = mode === "fullscreen" || mode === "side-panel";

  const [payload, setPayload] = useState<VideoStudioPayload>(() =>
    videoPayloadFromMetadata(object?.metadata, {
      ...DEFAULT_PAYLOAD,
      title: String(object?.metadata?.title ?? DEFAULT_PAYLOAD.title),
    }),
  );

  const studioPayloadKey = JSON.stringify(
    object?.metadata?.studioPayload ?? null,
  );

  useEffect(() => {
    setPayload(
      videoPayloadFromMetadata(object?.metadata, {
        ...DEFAULT_PAYLOAD,
        title: String(object?.metadata?.title ?? DEFAULT_PAYLOAD.title),
      }),
    );
  }, [object?.id, studioPayloadKey]);

  const storeObjects = useCanvasStore((s) => s.objects);
  const canvasConnections = useCanvasStore((s) => s.connections);
  const connectionStoreMap = useConnectionStore((s) => s.connections);

  const connections: ReelForgeConnection[] = useMemo(() => {
    if (edges.length > 0) {
      return edges.map((e) => ({
        id: e.id,
        sourceId: e.source,
        targetId: e.target,
      }));
    }
    return mergeForgeConnections(
      Object.values(connectionStoreMap),
      (canvasConnections ?? []).map((c) => ({
        id: c.id,
        sourceId: c.sourceId,
        targetId: c.targetId,
      })),
    );
  }, [edges, connectionStoreMap, canvasConnections]);

  const forgeObjects = useMemo(() => {
    const hasExplicitNodes = Object.keys(nodesById).length > 0;
    const source = hasExplicitNodes
      ? nodesById
      : (storeObjects as Record<string, ReelForgeObject>);
    return normalizeForgeCanvasObjects(source);
  }, [nodesById, storeObjects]);

  const persist = useCallback(
    (next: VideoStudioPayload) => {
      setPayload(next);
      if (onParamsChange && object) {
        onParamsChange(
          persistVideoStudioPayload(
            "iem.studio.video",
            object.id,
            object.metadata,
            next,
          ) as unknown as Record<string, unknown>,
        );
      }
    },
    [object, onParamsChange],
  );

  return (
    <ReelForgePanel
      compact={!isImmersive}
      forgeObjectId={forgeObjectId}
      payload={payload}
      connections={connections}
      objects={forgeObjects}
      onPayloadChange={persist}
    />
  );
};
