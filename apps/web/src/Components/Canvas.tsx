import { Tldraw, createShapeId, type Editor } from "tldraw";
import "tldraw/tldraw.css";
import IntentcastingBar from "./IntentcastingBar";
import { useCallback, useState } from "react";
import { NODE_CATALOG } from "../nodes/nodeCatalog";
import { useAuth } from "../auth/AuthContext";
import { useParams } from "react-router-dom";
import { useYjsStore } from "../hooks/useYjsStore";
import { NodeInspector } from "./NodeInspector";
import { OrchestratorDrawer } from "./OrchestratorDrawer";
import { exportWorkflowGraphFromShapes } from "../canvas/workflow/exportGraph";

export default function Canvas() {
  const { accessToken } = useAuth();
  const { projectId } = useParams();
  const [isCasting, setIsCasting] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [runStatus, setRunStatus] = useState<
    | { status: "idle" }
    | { status: "running" }
    | { status: "success"; runId: string; results: any }
    | { status: "error"; message: string }
  >({ status: "idle" });

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
        const lines = chunk.split("\n").filter(Boolean);

        for (const line of lines) {
          if (line.startsWith("9:")) {
            try {
              const toolData = JSON.parse(line.slice(2));
              if (toolData.toolName === "generate_canvas_blueprint") {
                const { nodes, edges } = toolData.args;

                // Push new shapes to Tldraw
                const nodeIdToShapeId = new Map<string, string>();
                const newShapes: any[] = nodes.map((n: any, idx: number) => {
                  const catalogEntry = NODE_CATALOG[n.type];
                  const nodeId = String(n.id || `node-${Date.now()}-${idx}`);
                  const shapeId = createShapeId();
                  nodeIdToShapeId.set(nodeId, shapeId);
                  return {
                    id: shapeId,
                    type: "iem-block",
                    x: 100 + (idx % 3) * 340,
                    y: 100 + Math.floor(idx / 3) * 260,
                    props: {
                      w: 320,
                      h: 240,
                      blockId: n.type,
                      label:
                        n.title ||
                        n.label ||
                        catalogEntry?.defaultData.label ||
                        n.type,
                      inputs:
                        n.recommended_params ||
                        n.inputs ||
                        catalogEntry?.defaultData.inputs ||
                        {},
                      outputs:
                        n.outputs || catalogEntry?.defaultData.outputs || {},
                    },
                    meta: { iem: { nodeId } },
                  };
                });

                const edgeShapes: any[] = (edges || [])
                  .map((e: any) => {
                    const sourceNodeId = String(e.source);
                    const targetNodeId = String(e.target);
                    const sourceShapeId = nodeIdToShapeId.get(sourceNodeId);
                    const targetShapeId = nodeIdToShapeId.get(targetNodeId);
                    const sourceIdx = newShapes.findIndex(
                      (s) => s.id === sourceShapeId,
                    );
                    const targetIdx = newShapes.findIndex(
                      (s) => s.id === targetShapeId,
                    );

                    const sourceShape =
                      sourceIdx >= 0 ? newShapes[sourceIdx] : null;
                    const targetShape =
                      targetIdx >= 0 ? newShapes[targetIdx] : null;
                    if (!sourceShape || !targetShape) return null;

                    const sx =
                      sourceShape.x + (sourceShape.props?.w ?? 320) / 2;
                    const sy =
                      sourceShape.y + (sourceShape.props?.h ?? 240) / 2;
                    const tx =
                      targetShape.x + (targetShape.props?.w ?? 320) / 2;
                    const ty =
                      targetShape.y + (targetShape.props?.h ?? 240) / 2;

                    return {
                      id: createShapeId(),
                      type: "arrow",
                      x: sx,
                      y: sy,
                      props: {
                        start: { x: 0, y: 0 },
                        end: { x: tx - sx, y: ty - sy },
                      },
                      meta: {
                        iemEdge: {
                          sourceNodeId,
                          targetNodeId,
                          condition: e.condition,
                        },
                      },
                    };
                  })
                  .filter(Boolean);

                if (editor) {
                  if (newShapes.length > 0) editor.createShapes(newShapes);
                  if (edgeShapes.length > 0)
                    editor.createShapes(edgeShapes as any);
                } else if (newShapes.length > 0) {
                  (store as any).put([...newShapes, ...(edgeShapes as any[])]);
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
      const nodeId = `node-${crypto.randomUUID()}`;
      const shape = {
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
        meta: { iem: { nodeId } },
      } as any;

      if (editor) editor.createShapes([shape]);
      else (store as any).put([shape]);
    },
    [editor, store],
  );

  const handleConnectSelected = () => {
    if (!editor) return;
    const selected = editor
      .getSelectedShapes()
      .filter((s: any) => s.type === "iem-block") as any[];
    if (selected.length !== 2) return;
    const a = selected[0];
    const b = selected[1];
    const sourceNodeId = a.meta?.iem?.nodeId || a.id;
    const targetNodeId = b.meta?.iem?.nodeId || b.id;

    const ax = a.x + (a.props?.w ?? 320) / 2;
    const ay = a.y + (a.props?.h ?? 240) / 2;
    const bx = b.x + (b.props?.w ?? 320) / 2;
    const by = b.y + (b.props?.h ?? 240) / 2;

    editor.createShapes([
      {
        id: createShapeId(),
        type: "arrow",
        x: ax,
        y: ay,
        props: {
          start: { x: 0, y: 0 },
          end: { x: bx - ax, y: by - ay },
        },
        meta: { iemEdge: { sourceNodeId, targetNodeId } },
      } as any,
    ]);
  };

  const handleRunWorkflow = async () => {
    if (!editor || !accessToken || !projectId) return;
    setRunStatus({ status: "running" });
    try {
      const shapes = editor.getCurrentPageShapes() as any[];
      const graph = exportWorkflowGraphFromShapes(shapes);
      const res = await fetch(
        `http://localhost:3001/api/projects/${projectId}/execute`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ document: graph, triggerData: {} }),
        },
      );

      if (!res.ok) throw new Error("Workflow execution failed");
      const data = await res.json();
      setRunStatus({
        status: "success",
        runId: data.runId,
        results: data.results,
      });
    } catch (e: any) {
      setRunStatus({ status: "error", message: e?.message || "Unknown error" });
    }
  };

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
        <Tldraw store={store as any} onMount={setEditor as any} />
      </div>

      <NodeInspector />

      <OrchestratorDrawer
        editor={editor}
        accessToken={accessToken}
        projectId={projectId}
      />

      <div className="absolute left-4 bottom-20 z-[10011] pointer-events-auto flex gap-2">
        <button
          onClick={handleConnectSelected}
          disabled={!editor}
          className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-50 text-white text-[11px] font-black uppercase tracking-widest"
          title="Select 2 nodes then connect"
        >
          Connect
        </button>
        <button
          onClick={handleRunWorkflow}
          disabled={
            !editor ||
            !accessToken ||
            !projectId ||
            runStatus.status === "running"
          }
          className="px-3 py-2 rounded-xl bg-brand-cyan/20 hover:bg-brand-cyan/25 border border-brand-cyan/30 disabled:opacity-50 text-white text-[11px] font-black uppercase tracking-widest"
        >
          {runStatus.status === "running" ? "Running…" : "Run"}
        </button>
      </div>

      {runStatus.status === "success" && (
        <div className="absolute left-4 bottom-32 z-[10011] pointer-events-auto w-[360px] max-w-[90vw] rounded-2xl bg-black/40 border border-white/10 backdrop-blur-2xl text-white p-3">
          <div className="text-[10px] uppercase tracking-widest text-white/60">
            Workflow Run
          </div>
          <div className="text-xs mt-1 text-white/80">
            runId: {runStatus.runId}
          </div>
          <pre className="mt-2 text-[11px] overflow-auto max-h-32 whitespace-pre-wrap">
            {JSON.stringify(runStatus.results, null, 2)}
          </pre>
        </div>
      )}
      {runStatus.status === "error" && (
        <div className="absolute left-4 bottom-32 z-[10011] pointer-events-auto w-[360px] max-w-[90vw] rounded-2xl bg-rose-500/10 border border-rose-400/20 backdrop-blur-2xl text-rose-200 p-3 text-sm">
          {runStatus.message}
        </div>
      )}

      <div className="absolute bottom-0 w-full z-10">
        <IntentcastingBar onSubmit={handleIntentSubmit} isLoading={isCasting} />
      </div>
    </div>
  );
}
