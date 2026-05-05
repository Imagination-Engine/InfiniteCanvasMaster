// @ts-nocheck
import { useCallback } from "react";
import { useCanvasStore } from "../state/canvasStore";
import { useViewportStore } from "../state/viewportStore";
import { getCenterOfViewport, findEmptySpace } from "../utils/placement";
import { ProvenanceDescriptor } from "../contracts";

export const useAgentInsertion = () => {
  const insertBatch = useCallback(
    (
      payloads: Array<{
        type: string;
        data: any;
        width?: number;
        height?: number;
      }>,
      provenance: ProvenanceDescriptor,
    ) => {
      const viewport = useViewportStore.getState();
      const center = getCenterOfViewport(viewport);

      // We need to keep track of objects as we add them to avoid collisions within the batch
      const addedObjects: any[] = [];

      payloads.forEach((payload, index) => {
        const width = payload.width || 250;
        const height = payload.height || 150;

        const currentObjects = [
          ...Object.values(useCanvasStore.getState().objects),
          ...addedObjects,
        ];
        const pos = findEmptySpace(
          center.x,
          center.y,
          width,
          height,
          currentObjects,
        );

        const newObject = {
          id: `${provenance.agentId}-${Date.now()}-${index}`,
          type: "block",
          blockKind: payload.type,
          x: pos.x,
          y: pos.y,
          width,
          height,
          data: payload.data,
          status: "idle",
          provenance,
        };

        addedObjects.push(newObject);
        useCanvasStore.getState().addObject(newObject as any);
      });
    },
    [],
  );

  return { insertBatch };
};
