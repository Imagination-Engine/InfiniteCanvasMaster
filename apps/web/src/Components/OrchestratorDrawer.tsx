import { useEffect, useRef, useState } from "react";
import { createShapeId, type Editor } from "tldraw";

type ChatMessage = { id: string; role: "user" | "assistant"; content: string };

function getCanvasContext(editor: Editor) {
  const shapes = editor.getCurrentPageShapes() as any[];
  const nodes = shapes
    .filter((s) => s.type === "iem-block")
    .map((s) => ({
      id: s.meta?.iem?.nodeId || s.id,
      type: s.props?.blockId,
      label: s.props?.label,
    }));
  const edges = shapes
    .filter((s) => s.type === "arrow" && s.meta?.iemEdge)
    .map((s) => ({
      source: s.meta.iemEdge.sourceNodeId,
      target: s.meta.iemEdge.targetNodeId,
      condition: s.meta.iemEdge.condition,
    }));
  return { nodes, edges };
}

function findShapeIdByNodeId(editor: Editor, nodeId: string) {
  const shapes = editor.getCurrentPageShapes() as any[];
  const match = shapes.find(
    (s) => s.type === "iem-block" && (s.meta?.iem?.nodeId || s.id) === nodeId,
  );
  return match?.id as string | undefined;
}

function getNodeCenter(editor: Editor, nodeId: string) {
  const shapeId = findShapeIdByNodeId(editor, nodeId);
  if (!shapeId) return null;
  const shape = editor.getShape(shapeId) as any;
  const w = Number(shape.props?.w ?? 320);
  const h = Number(shape.props?.h ?? 240);
  return { x: Number(shape.x) + w / 2, y: Number(shape.y) + h / 2 };
}

function createEdgeArrow(
  editor: Editor,
  sourceNodeId: string,
  targetNodeId: string,
  condition?: string,
) {
  const start = getNodeCenter(editor, sourceNodeId);
  const end = getNodeCenter(editor, targetNodeId);
  if (!start || !end) return;

  const id = createShapeId();
  editor.createShapes([
    {
      id,
      type: "arrow",
      x: start.x,
      y: start.y,
      props: {
        start: { x: 0, y: 0 },
        end: { x: end.x - start.x, y: end.y - start.y },
      },
      meta: {
        iemEdge: { sourceNodeId, targetNodeId, condition },
      },
    } as any,
  ]);
}

function upsertNodeShape(editor: Editor, node: any) {
  const existingShapeId = findShapeIdByNodeId(editor, node.id);
  const shapeId = existingShapeId || createShapeId();

  if (!existingShapeId) {
    editor.createShapes([
      {
        id: shapeId,
        type: "iem-block",
        x: 120 + Math.random() * 120,
        y: 120 + Math.random() * 120,
        props: {
          w: 320,
          h: 240,
          blockId: node.type,
          label: node.title,
          inputs: node.recommended_params || {},
          outputs: {},
        },
        meta: {
          iem: { nodeId: node.id },
        },
      } as any,
    ]);
    return;
  }

  const existing = editor.getShape(shapeId) as any;
  editor.updateShapes([
    {
      id: shapeId,
      type: existing.type,
      props: {
        ...existing.props,
        blockId: node.type ?? existing.props?.blockId,
        label: node.title ?? existing.props?.label,
        inputs: {
          ...(existing.props?.inputs || {}),
          ...(node.recommended_params || {}),
        },
      },
      meta: {
        ...(existing.meta || {}),
        iem: { ...(existing.meta?.iem || {}), nodeId: node.id },
      },
    } as any,
  ]);
}

export function OrchestratorDrawer({
  editor,
  accessToken,
  projectId,
}: {
  editor: Editor | null;
  accessToken: string | null;
  projectId: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "hello",
      role: "assistant",
      content:
        "Tell me what to change in your workflow (add nodes, connect nodes, update node params).",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isOpen]);

  const canSend = !!editor && !!accessToken && !!projectId && !isLoading;

  const handleSubmit = async () => {
    if (!canSend) return;
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: input,
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const canvasContext = getCanvasContext(editor!);
      const res = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          sessionId: projectId,
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          canvasContext,
        }),
      });

      if (!res.ok) throw new Error("Chat request failed");
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");
      const decoder = new TextDecoder();

      const aiId = `a-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: aiId, role: "assistant", content: "" },
      ]);

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;

          if (line.startsWith("0:")) {
            const chunk = JSON.parse(line.slice(2));
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiId
                  ? { ...m, content: m.content + String(chunk) }
                  : m,
              ),
            );
          }

          if (!line.startsWith("9:")) continue;
          const toolData = JSON.parse(line.slice(2));

          const toolName = toolData.toolName;
          const args = toolData.args;

          if (toolName === "generate_canvas_blueprint") {
            const nodes = args?.nodes || [];
            const edges = args?.edges || [];
            for (const node of nodes) upsertNodeShape(editor!, node);
            for (const edge of edges)
              createEdgeArrow(
                editor!,
                edge.source,
                edge.target,
                edge.condition,
              );
          }

          if (toolName === "add_block") upsertNodeShape(editor!, args);
          if (toolName === "connect_blocks")
            createEdgeArrow(editor!, args.source, args.target, args.condition);
          if (toolName === "update_block") {
            const shapeId = findShapeIdByNodeId(editor!, args.id);
            if (shapeId) {
              const existing = editor!.getShape(shapeId) as any;
              editor!.updateShapes([
                {
                  id: shapeId,
                  type: existing.type,
                  props: {
                    ...existing.props,
                    label: args.title ?? existing.props?.label,
                    inputs: {
                      ...(existing.props?.inputs || {}),
                      ...(args.params || {}),
                    },
                  },
                } as any,
              ]);
            }
          }
        }
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: `Error: ${e?.message || "Unknown error"}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          className="absolute right-4 top-4 z-[10011] px-3 py-2 rounded-xl bg-brand-bg-surface/80 backdrop-blur-xl border border-white/10 text-white text-[11px] font-black uppercase tracking-widest pointer-events-auto hover:border-brand-cyan/40"
          onClick={() => setIsOpen(true)}
        >
          Orchestrator
        </button>
      )}

      {isOpen && (
        <div className="absolute right-0 top-0 bottom-0 z-[10011] w-[420px] max-w-[92vw] bg-brand-bg-page/95 backdrop-blur-3xl border-l border-white/10 text-white flex flex-col pointer-events-auto">
          <div className="h-14 px-4 flex items-center justify-between border-b border-white/10">
            <div className="text-xs font-black uppercase tracking-widest">
              Orchestrator
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] font-black uppercase tracking-widest"
            >
              Close
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-auto p-4 space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.role === "user"
                    ? "ml-10 rounded-xl bg-white/10 px-3 py-2 text-sm"
                    : "mr-10 rounded-xl bg-black/30 px-3 py-2 text-sm"
                }
              >
                <div className="text-[10px] uppercase tracking-widest opacity-60 mb-1">
                  {m.role}
                </div>
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-white/10">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-20 px-3 py-2 rounded-xl bg-black/30 border border-white/10 outline-none focus:border-brand-cyan/40 text-sm"
              placeholder={
                canSend
                  ? "e.g. Add a webhook trigger then summarize and post to Slack"
                  : "Sign in + open a project to use orchestrator"
              }
              disabled={!canSend}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSubmit}
                disabled={!canSend || !input.trim()}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-50 text-[11px] font-black uppercase tracking-widest"
              >
                {isLoading ? "Thinking…" : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
