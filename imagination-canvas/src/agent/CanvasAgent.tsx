import { useState } from "react";
import { requestAgentGraph } from "../services/ai/agentService";
import { parseAgentGraph } from "./agentParser";
import type { ParsedAgentGraph } from "./agentParser";

type CanvasAgentProps = {
  onApplyGraph: (graph: ParsedAgentGraph) => void;
};

export default function CanvasAgent({ onApplyGraph }: CanvasAgentProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([]);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!prompt.trim()) return;

    const text = prompt.trim();
    setPrompt("");
    setMessages((current) => [...current, { role: "user", text }]);
    setLoading(true);

    try {
      const agentResponse = await requestAgentGraph(text);
      const parsed = parseAgentGraph(agentResponse);
      onApplyGraph(parsed);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: `Added ${parsed.nodes.length} node(s) and ${parsed.edges.length} edge(s) to canvas.`,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: `Failed to generate graph: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50">
      {open ? (
        <div className="pointer-events-auto h-[420px] w-[340px] rounded-xl border border-slate-700 bg-slate-900/95 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-700 px-3 py-2 text-sm text-slate-100">
            <span>Canvas Agent</span>
            <button type="button" onClick={() => setOpen(false)} className="text-xs text-slate-400 hover:text-white">
              Close
            </button>
          </div>

          <div className="h-[300px] space-y-2 overflow-y-auto p-3">
            {messages.length === 0 ? (
              <p className="text-xs text-slate-400">Describe a flow and I will scaffold nodes/edges.</p>
            ) : messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`rounded-lg px-2 py-1.5 text-xs ${message.role === "user" ? "bg-sky-500/20 text-sky-100" : "bg-slate-800 text-slate-200"}`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t border-slate-700 p-3">
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Build a workflow..."
              rows={3}
              className="w-full resize-none rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100 outline-none focus:border-sky-500"
            />
            <button
              type="button"
              onClick={() => void submit()}
              disabled={loading}
              className="w-full rounded bg-sky-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-sky-500 disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Flow"}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="pointer-events-auto rounded-full border border-sky-500/40 bg-sky-500/20 px-4 py-2 text-xs font-medium text-sky-100 shadow-lg"
        >
          Open AI Agent
        </button>
      )}
    </div>
  );
}
