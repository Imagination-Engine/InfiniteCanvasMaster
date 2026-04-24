import {
  Tldraw,
  createTLStore,
  defaultShapeUtils,
  createShapeId,
} from "tldraw";
import type { TLStore } from "tldraw";
import "tldraw/tldraw.css";
import { IemBlockShapeUtil } from "../canvas/IemBlockShape";
import IntentcastingBar from "./IntentcastingBar";
import { useCallback, useState, useEffect } from "react";
import { NODE_CATALOG } from "../nodes/nodeCatalog";

const shapeUtils = [...defaultShapeUtils, IemBlockShapeUtil];

export default function Canvas() {
  const [store] = useState<TLStore>(() => createTLStore({ shapeUtils }));

  // Example of syncing to backend on change
  useEffect(() => {
    const unsubscribe = store.listen((history) => {
      // In production, this debounces and sends to our Postgres DB
      // or syncs via Liveblocks/Yjs depending on the multiplayer setup.
      // console.log("Tldraw State Changed:", history.changes);
    });
    return () => unsubscribe();
  }, [store]);

  const handleIntentSubmit = async (prompt: string) => {
    console.log("Intent submitted to Tldraw Canvas:", prompt);
    // In a full implementation, this hits the backend, generates a block layout,
    // and pushes shapes onto the Tldraw canvas via `store.put([ ... ])`
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();

      // Parse the dropped block ID from the UI palette
      const blockId = e.dataTransfer.getData("application/reactflow");
      if (!blockId || !NODE_CATALOG[blockId]) return;

      const catalogEntry = NODE_CATALOG[blockId];

      // Create the custom IemBlockShape on the Tldraw canvas
      const newShapeId = createShapeId();
      store.put([
        {
          id: newShapeId,
          type: "iem-block",
          x: e.clientX, // Simplified screen-to-canvas coordinate mapping
          y: e.clientY,
          props: {
            w: 240,
            h: 120,
            blockId: blockId,
            label: catalogEntry.defaultData.label,
            inputs: catalogEntry.defaultData.inputs,
            outputs: catalogEntry.defaultData.outputs,
          },
        } as any,
      ]);
    },
    [store],
  );

  return (
    <div
      className="relative flex-1 bg-brand-bg-page overflow-hidden"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Cinematic Background Glows */}
      <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-brand-purple/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-cyan/5 rounded-full blur-[120px] pointer-events-none" />

      {/* The Tldraw spatial renderer */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        <Tldraw store={store} shapeUtils={shapeUtils} />
      </div>

      <div className="absolute bottom-0 w-full z-10">
        <IntentcastingBar onSubmit={handleIntentSubmit} isLoading={false} />
      </div>
    </div>
  );
}
