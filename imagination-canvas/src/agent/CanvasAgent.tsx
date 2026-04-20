import { useMemo, useState } from "react";
import { Sparkles, X, Brain } from "lucide-react";
import { AgentRuntime } from "./AgentRuntime";
import { parseAgentGraph } from "./agentParser";
import type { ParsedAgentGraph } from "./agentParser";
import { NODE_REGISTRY } from "../nodes/NodeRegistry";
import type { IntegrationProposal, MissingCapability } from "./schemas";

type CanvasAgentProps = {
  onApplyGraph: (graph: ParsedAgentGraph) => void;
};

type IntegrationUserInput = {
  exampleApiRequest: string;
  exampleApiResponse: string;
  authenticationType: string;
};

export default function CanvasAgent({ onApplyGraph }: CanvasAgentProps) {
  const runtime = useMemo(() => new AgentRuntime(), []);

  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [missingCapabilities, setMissingCapabilities] = useState<MissingCapability[]>([]);
  const [integrationProposals, setIntegrationProposals] = useState<IntegrationProposal[]>([]);
  const [integrationInputs, setIntegrationInputs] = useState<Record<string, IntegrationUserInput>>({});

  const submit = async () => {
    if (!prompt.trim()) return;

    const text = prompt.trim();
    setPrompt("");
    setMessages((current) => [...current, { role: "user", text }]);
    setLoading(true);

    try {
      const result = await runtime.generateWorkflow(text, NODE_REGISTRY);

      if (result.missingCapabilities.length > 0) {
        setMissingCapabilities(result.missingCapabilities);
        setIntegrationProposals(result.integrationProposals);
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            text: "This workflow requires additional integration.",
          },
        ]);
        return;
      }

      setMissingCapabilities([]);
      setIntegrationProposals([]);
      setIntegrationInputs({});

      const parsed = parseAgentGraph(result.graph);
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

  const updateIntegrationInput = (
    key: string,
    patch: Partial<IntegrationUserInput>,
  ) => {
    setIntegrationInputs((current) => ({
      ...current,
      [key]: {
        exampleApiRequest: current[key]?.exampleApiRequest ?? "",
        exampleApiResponse: current[key]?.exampleApiResponse ?? "",
        authenticationType: current[key]?.authenticationType ?? "",
        ...patch,
      },
    }));
  };

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50">
      {open ? (
        <div className="pointer-events-auto h-[600px] w-[400px] flex flex-col rounded-3xl border border-white/10 bg-brand-bg-surface/90 backdrop-blur-3xl shadow-[0_20px_50px_-10px_rgba(123,92,234,0.3)] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.03] px-5 py-4">
            <div className="flex items-center gap-2.5">
              <Sparkles size={16} className="text-brand-purple animate-pulse" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Canvas Agent</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="text-brand-text-muted hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-5 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <Brain size={40} className="text-brand-text-muted mb-4" />
                <p className="text-[11px] font-bold uppercase tracking-widest text-brand-text-muted">Describe a flow and I will plan validated nodes/edges.</p>
              </div>
            ) : messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`rounded-2xl px-4 py-3 text-[11px] font-medium leading-relaxed shadow-sm ${message.role === "user" ? "ml-8 bg-brand-purple/20 text-white border border-brand-purple/20" : "mr-8 bg-white/5 text-brand-text-body border border-white/5"}`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <div className="space-y-4 border-t border-white/5 bg-white/[0.01] p-5">
            <div className="relative group">
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Build a workflow..."
                rows={3}
                className="w-full resize-none rounded-2xl bg-white/[0.03] border border-white/10 px-4 py-3 text-[11px] font-medium text-white outline-none focus:border-brand-purple/50 focus:bg-white/[0.05] transition-all placeholder:text-brand-text-muted/30"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-brand-purple/10 to-brand-cyan/10 opacity-0 group-focus-within:opacity-100 blur transition-opacity pointer-events-none" />
            </div>
            <button
              type="button"
              onClick={() => void submit()}
              disabled={loading}
              className="group/btn relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan px-4 py-3.5 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-[0_4px_15px_-3px_rgba(123,92,234,0.4)] transition-all hover:shadow-[0_8px_25px_-3px_rgba(0,194,255,0.5)] hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <span className="relative z-10">{loading ? "Synchronising..." : "Generate Flow"}</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
            </button>
          </div>

          {missingCapabilities.length > 0 ? (
            <div className="border-t border-white/5 p-5 bg-amber-500/[0.02]">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-amber-300/80">
                  <Sparkles size={12} />
                  <p className="text-[10px] font-black uppercase tracking-widest">Additional integration required</p>
                </div>
                {missingCapabilities.map((capability, index) => {
                  const key = `${capability.name}-${index}`;
                  const input = integrationInputs[key] ?? {
                    exampleApiRequest: "",
                    exampleApiResponse: "",
                    authenticationType: "",
                  };
                  const proposal = integrationProposals[index];

                  return (
                    <div key={key} className="space-y-3 rounded-2xl border border-white/5 bg-brand-bg-page/40 p-4 shadow-sm group/cap">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white group-hover/cap:text-brand-cyan transition-colors">{capability.name}</p>
                        <p className="text-[10px] leading-relaxed text-brand-text-muted">{capability.description}</p>
                      </div>
                      
                      {proposal ? (
                        <div className="rounded-lg bg-white/[0.03] px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-brand-text-muted border border-white/5">
                          Requires: {proposal.requiredFromUser.join(", ")}
                        </div>
                      ) : null}

                      <div className="space-y-2 pt-1">
                        <textarea
                          value={input.exampleApiRequest}
                          onChange={(event) => updateIntegrationInput(key, { exampleApiRequest: event.target.value })}
                          rows={2}
                          placeholder="Example API request"
                          className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-[10px] font-medium text-white outline-none focus:border-brand-purple/50 focus:bg-white/[0.05] transition-all placeholder:text-brand-text-muted/30 resize-none"
                        />
                        <textarea
                          value={input.exampleApiResponse}
                          onChange={(event) => updateIntegrationInput(key, { exampleApiResponse: event.target.value })}
                          rows={2}
                          placeholder="Example API response"
                          className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-[10px] font-medium text-white outline-none focus:border-brand-purple/50 focus:bg-white/[0.05] transition-all placeholder:text-brand-text-muted/30 resize-none"
                        />
                        <input
                          value={input.authenticationType}
                          onChange={(event) => updateIntegrationInput(key, { authenticationType: event.target.value })}
                          placeholder="Authentication type"
                          className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-[10px] font-medium text-white outline-none focus:border-brand-purple/50 focus:bg-white/[0.05] transition-all placeholder:text-brand-text-muted/30"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="pointer-events-auto group relative flex items-center gap-3 rounded-full bg-gradient-to-r from-brand-purple to-brand-cyan px-7 py-4 text-[11px] font-black uppercase tracking-[0.25em] text-white shadow-[0_10px_30px_-5px_rgba(123,92,234,0.5)] hover:shadow-[0_15px_40px_-5px_rgba(0,194,255,0.6)] hover:-translate-y-1 active:scale-95 transition-all duration-300 overflow-hidden"
        >
          <Sparkles size={14} className="relative z-10 animate-pulse" />
          <span className="relative z-10">Unleash Agent</span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </button>
      )}
    </div>
  );
}
