// @ts-nocheck
import { useState, useCallback } from "react";
import { useCanvasStore } from "../state/canvasStore";
import { OpenClawOutput } from "../contracts/openclaw";
import { BalnceBlockKind, CanvasObject } from "../contracts";

/**
 * Hook to convert OpenClaw task outputs into tangible blocks on the Imagination Canvas.
 * Outputs are mapped to their corresponding BalnceBlockKinds (e.g. artifact, note, workflow).
 */
export function useOpenClawOutputConversion(blockId: string) {
  const getObject = useCanvasStore((s) => s.objects[blockId]);
  const addObject = useCanvasStore((s) => s.addObject);

  const [isConverting, setIsConverting] = useState(false);

  const convertToCanvasBlock = useCallback(
    async (output: OpenClawOutput) => {
      setIsConverting(true);
      try {
        const sourceObj = getObject;
        if (!sourceObj) throw new Error("Source block not found.");

        // Determine mapping
        let targetKind: BalnceBlockKind = "artifact";
        let blockLabel = output.title || "Output Artifact";

        switch (output.kind) {
          case "text":
          case "summary":
          case "log":
          case "message_draft":
            targetKind = "note" as BalnceBlockKind; // Assuming 'note' maps to your text block types
            break;
          case "artifact":
          case "file":
            targetKind = "artifact";
            break;
          case "workflow_result":
            targetKind = "workflow";
            break;
          case "canvas_object":
            targetKind = "openclaw-block" as BalnceBlockKind;
            break;
        }

        // Compute spawn position (slightly offset from the generating block)
        const spawnX = sourceObj.x + sourceObj.width + 40;
        const spawnY = sourceObj.y;

        const newObject: CanvasObject = {
          id: `obj-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          type: targetKind, // In your registry, type often equals kind for basic blocks
          kind: targetKind,
          x: spawnX,
          y: spawnY,
          width: 300,
          height: 250,
          rotation: 0,
          zIndex: Date.now() % 10000,
          status: "idle",
          metadata: {
            label: blockLabel,
            summary: output.summary,
            contentRef: output.contentRef,
            // Provenance Injection
            provenance: {
              sourceBlockId: blockId,
              outputId: output.outputId,
              provenanceId: output.provenanceId,
              generatedAt: output.createdAt,
            },
          },
        };

        addObject(newObject);

        // We could optionally update the OpenClaw block state to mark this output as "extracted"
        return newObject.id;
      } catch (err) {
        console.error("Failed to convert output to canvas block:", err);
        throw err;
      } finally {
        setIsConverting(false);
      }
    },
    [blockId, getObject, addObject],
  );

  return {
    convertToCanvasBlock,
    isConverting,
  };
}
