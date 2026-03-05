import { useMemo, useState } from "react";
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
        <div className="pointer-events-auto h-[560px] w-[380px] rounded-xl border border-slate-700 bg-slate-900/95 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-700 px-3 py-2 text-sm text-slate-100">
            <span>Canvas Agent</span>
            <button type="button" onClick={() => setOpen(false)} className="text-xs text-slate-400 hover:text-white">
              Close
            </button>
          </div>

          <div className="h-[220px] space-y-2 overflow-y-auto border-b border-slate-700 p-3">
            {messages.length === 0 ? (
              <p className="text-xs text-slate-400">Describe a flow and I will plan validated nodes/edges.</p>
            ) : messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`rounded-lg px-2 py-1.5 text-xs ${message.role === "user" ? "bg-sky-500/20 text-sky-100" : "bg-slate-800 text-slate-200"}`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <div className="space-y-2 border-b border-slate-700 p-3">
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

          <div className="h-[230px] overflow-y-auto p-3">
            {missingCapabilities.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-amber-300">This workflow requires additional integration.</p>
                {missingCapabilities.map((capability, index) => {
                  const key = `${capability.name}-${index}`;
                  const input = integrationInputs[key] ?? {
                    exampleApiRequest: "",
                    exampleApiResponse: "",
                    authenticationType: "",
                  };
                  const proposal = integrationProposals[index];

                  return (
                    <div key={key} className="space-y-2 rounded-lg border border-slate-700 bg-slate-950/70 p-2">
                      <p className="text-xs font-semibold text-slate-100">{capability.name}</p>
                      <p className="text-[11px] text-slate-400">{capability.description}</p>
                      <p className="text-[11px] text-slate-500">Reason: {capability.reason}</p>
                      {proposal ? (
                        <p className="text-[11px] text-slate-500">
                          Required from user: {proposal.requiredFromUser.join(", ")}
                        </p>
                      ) : null}

                      <textarea
                        value={input.exampleApiRequest}
                        onChange={(event) => updateIntegrationInput(key, { exampleApiRequest: event.target.value })}
                        rows={2}
                        placeholder="Example API request"
                        className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 outline-none focus:border-sky-500"
                      />
                      <textarea
                        value={input.exampleApiResponse}
                        onChange={(event) => updateIntegrationInput(key, { exampleApiResponse: event.target.value })}
                        rows={2}
                        placeholder="Example API response"
                        className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 outline-none focus:border-sky-500"
                      />
                      <input
                        value={input.authenticationType}
                        onChange={(event) => updateIntegrationInput(key, { authenticationType: event.target.value })}
                        placeholder="Authentication type"
                        className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 outline-none focus:border-sky-500"
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No missing capability requests.</p>
            )}
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
