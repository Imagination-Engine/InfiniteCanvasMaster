import { Tldraw, createShapeId } from "tldraw";
import "tldraw/tldraw.css";
import IntentcastingBar from "./IntentcastingBar";
import { useCallback, useState } from "react";
import { NODE_CATALOG } from "../nodes/nodeCatalog";
import { useAuth } from "../auth/AuthContext";
import { useParams } from "react-router-dom";
import { useYjsStore } from "../hooks/useYjsStore";

export default function Canvas() {
  const { accessToken } = useAuth();
  const { projectId } = useParams();
  const [isCasting, setIsCasting] = useState(false);

  // Initialize the Yjs-synced store
  const { store, status } = useYjsStore({
    roomId: projectId || "default-room",
  });

  const handleIntentSubmit = async (prompt: string) => {
    if (!prompt.trim() || !accessToken || !projectId) return;
    setIsCasting(true);

    try {
      // Create an ad-hoc session to generate a blueprint
      const res = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          sessionId: projectId,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!res.ok) throw new Error("Failed to cast intent");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\\n").filter(Boolean);

        for (const line of lines) {
          if (line.startsWith("9:")) {
            try {
              const toolData = JSON.parse(line.slice(2));
              if (toolData.toolName === "generate_canvas_blueprint") {
                const { nodes, edges } = toolData.args;

                // Push new shapes to Tldraw
                const newShapes: any[] = nodes.map((n: any, idx: number) => {
                  const catalogEntry = NODE_CATALOG[n.type];
                  return {
                    id: createShapeId(n.id || `node-${Date.now()}-${idx}`),
                    type: "iem-block",
                    x: 100 + (idx % 3) * 340,
                    y: 100 + Math.floor(idx / 3) * 260,
                    props: {
                      w: 320,
                      h: 240,
                      blockId: n.type,
                      label:
                        n.label || catalogEntry?.defaultData.label || n.type,
                      inputs:
                        n.inputs || catalogEntry?.defaultData.inputs || {},
                      outputs:
                        n.outputs || catalogEntry?.defaultData.outputs || {},
                    },
                  };
                });

                if (newShapes.length > 0) {
                  store.put(newShapes);
                }
              }
            } catch (e) {
              console.error("Failed to parse tool data", e);
            }
          }
        }
      }
    } catch (e) {
      console.error("Intent cast failed", e);
    } finally {
      setIsCasting(false);
    }
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
            w: 320,
            h: 240,
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

      {status === "loading" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-brand-bg-page/80 backdrop-blur-sm">
          <p className="text-white font-mono animate-pulse">
            Syncing canvas...
          </p>
        </div>
      )}

      {/* The Tldraw spatial renderer */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        <Tldraw store={store} />
      </div>

      <div className="absolute bottom-0 w-full z-10">
        <IntentcastingBar onSubmit={handleIntentSubmit} isLoading={isCasting} />
      </div>
    </div>
  );
}
