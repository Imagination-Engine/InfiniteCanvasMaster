// @ts-nocheck
import React, { useCallback, useMemo, useState, useEffect } from "react";
import type { BlockComponentProps } from "../../../contracts/BlockRegistry";
import { useCanvasStore } from "../../../state/canvasStore";
import { useConnectionStore } from "../../../state/connectionStore";
import { mergeForgeConnections, normalizeForgeCanvasObjects } from "@iem/core";
import {
  ReelForgePanel,
  videoPayloadFromMetadata,
  persistVideoStudioPayload,
  type VideoStudioPayload,
} from "@iem/surface-reel";

const DEFAULT_PAYLOAD: VideoStudioPayload = {
  title: "Untitled Reel",
  scenes: [],
  references: [],
  forge: { prompt: "", status: "idle" },
};

export const VideoStudioBlock: React.FC<BlockComponentProps> = ({
  object,
  mode = "compact",
}) => {
  const updateObject = useCanvasStore((s) => s.updateObject);
  const objects = useCanvasStore((s) => s.objects);
  const canvasConnections = useCanvasStore((s) => s.connections);
  const connectionStore = useConnectionStore((s) => s.connections);

  const isImmersive = mode === "fullscreen" || mode === "side-panel";

  const [payload, setPayload] = useState<VideoStudioPayload>(() =>
    videoPayloadFromMetadata(object.metadata, {
      ...DEFAULT_PAYLOAD,
      title: String(object.metadata?.title ?? DEFAULT_PAYLOAD.title),
    }),
  );

  const studioPayloadKey = JSON.stringify(
    object.metadata?.studioPayload ?? null,
  );

  useEffect(() => {
    setPayload(
      videoPayloadFromMetadata(object.metadata, {
        ...DEFAULT_PAYLOAD,
        title: String(object.metadata?.title ?? DEFAULT_PAYLOAD.title),
      }),
    );
  }, [object.id, studioPayloadKey]);

  const connectionList = useMemo(
    () =>
      mergeForgeConnections(
        Object.values(connectionStore),
        (canvasConnections || []).map((c) => ({
          id: c.id,
          sourceId: c.sourceId,
          targetId: c.targetId,
        })),
      ),
    [connectionStore, canvasConnections],
  );

  const forgeObjects = useMemo(
    () => normalizeForgeCanvasObjects(objects as Record<string, any>),
    [objects],
  );

  const persist = useCallback(
    (next: VideoStudioPayload) => {
      setPayload(next);
      const currentMeta =
        useCanvasStore.getState().objects[object.id]?.metadata ??
        object.metadata;
      updateObject(object.id, {
        metadata: persistVideoStudioPayload(
          "iem.studio.video",
          object.id,
          currentMeta,
          next,
        ),
      });
    },
    [object.id, object.metadata, updateObject],
  );

  if (!isImmersive) {
    return (
      <ReelForgePanel
        compact
        forgeObjectId={object.id}
        payload={payload}
        connections={connectionList}
        objects={forgeObjects}
        onPayloadChange={persist}
      />
    );
  }

  return (
    <ReelForgePanel
      forgeObjectId={object.id}
      payload={payload}
      connections={connectionList}
      objects={forgeObjects}
      onPayloadChange={persist}
    />
  );
};
