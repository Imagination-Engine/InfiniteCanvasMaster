import {
  Handle,
  Position,
  NodeResizer,
  type NodeProps,
  useReactFlow,
} from "@xyflow/react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { NODE_CATALOG } from "./nodeCatalog";
import type { BaseNodeData } from "./types";
import type { UnifiedCanvasEdge, UnifiedCanvasNode } from "./canvasTypes";
import { runCreativeNode } from "../services/ai/creativeNodeService";
import {
  runIntegrationNode,
  runTriggerNode,
} from "../services/integrations/workflowService";
import { getNodeIcon } from "./nodeVisuals";
import { getNodeInputs } from "./workflow/inputResolution";
import {
  getRuntimeState,
  setRuntimeNodeInputs,
  setRuntimeNodeOutputs,
} from "./workflow/runtimeState";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../lib/api";
import { Maximize2, Minimize2, Zap, Settings, Lock } from "lucide-react";

const toText = (value: unknown) =>
  typeof value === "string" ? value : JSON.stringify(value ?? "");
const hasMeaningfulValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
};

const mergeInputsPreferManual = (
  upstreamInputs: Record<string, unknown>,
  manualInputs: Record<string, unknown>,
) => {
  const merged: Record<string, unknown> = {
    ...upstreamInputs,
  };

  for (const [key, value] of Object.entries(manualInputs)) {
    if (hasMeaningfulValue(value) || !(key in merged)) {
      merged[key] = value;
    }
  }

  return merged;
};

const getInputPlaceholder = (nodeType: string, key: string): string => {
  if (key === "payload") return "";
  if (nodeType === "gmail.sendEmail" && key === "to")
    return "recipient@example.com";
  if (nodeType === "gmail.sendEmail" && key === "subject")
    return "Weekly update";
  if (nodeType === "gmail.sendEmail" && key === "body")
    return "Leave blank to use upstream text output";
  if (nodeType === "gmail.retrieveEmail" && key === "query")
    return "Same Gmail syntax, e.g. from:alex newer_than:7d";
  if (nodeType === "gmail.retrieveEmail" && key === "maxResults") return "10";
  if (nodeType === "gmail.retrieveEmail" && key === "includeSpamTrash")
    return "false";
  return "";
};

export default function BaseNode({ id, data, selected }: NodeProps) {
  const { accessToken } = useAuth();
  const { updateNodeData, getNodes, getEdges } = useReactFlow();
  const [running, setRunning] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [slackConnected, setSlackConnected] = useState<boolean | null>(null);
  const [slackTeamName, setSlackTeamName] = useState<string>("");
  const [gmailConnected, setGmailConnected] = useState<boolean | null>(null);
  const [gmailAccountEmail, setGmailAccountEmail] = useState<string>("");

  const nodeData = data as BaseNodeData;
  const definition = NODE_CATALOG[nodeData.type];
  const NodeIcon = getNodeIcon(nodeData.type);
  const canExecute = nodeData.type !== "fileUpload";
  const isSlackNode = nodeData.type.startsWith("slack.");
  const isGmailNode = nodeData.type.startsWith("gmail.");

  const canReceiveInput = useMemo(
    () => Boolean(definition && Object.keys(definition.inputSchema).length > 0),
    [definition],
  );

  const slackPollTimer = useRef<number | null>(null);
  const gmailPollTimer = useRef<number | null>(null);

  const fetchSlackStatus = async (): Promise<boolean> => {
    const status = await apiRequest<{ connected: boolean; teamName?: string }>(
      "/api/slack/status",
      { method: "GET" },
    );
    setSlackConnected(Boolean(status.connected));
    setSlackTeamName(
      typeof status.teamName === "string" ? status.teamName : "",
    );
    return Boolean(status.connected);
  };

  const fetchGmailStatus = async (): Promise<boolean> => {
    const status = await apiRequest<{ connected: boolean; email?: string }>(
      "/api/gmail/status",
      { method: "GET" },
    );
    setGmailConnected(Boolean(status.connected));
    setGmailAccountEmail(typeof status.email === "string" ? status.email : "");
    return Boolean(status.connected);
  };

  useEffect(() => {
    if (!isSlackNode) {
      setSlackConnected(null);
      setSlackTeamName("");
      if (slackPollTimer.current) {
        window.clearInterval(slackPollTimer.current);
        slackPollTimer.current = null;
      }
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        if (cancelled) return;
        await fetchSlackStatus();
      } catch {
        if (cancelled) return;
        setSlackConnected(false);
        setSlackTeamName("");
      }
    })();

    // Auto-refresh slack connection status until connected.
    if (!slackPollTimer.current) {
      slackPollTimer.current = window.setInterval(() => {
        if (slackConnected) return;
        void fetchSlackStatus().catch(() => {
          setSlackConnected(false);
          setSlackTeamName("");
        });
      }, 2000);
    }

    return () => {
      cancelled = true;
      if (slackPollTimer.current) {
        window.clearInterval(slackPollTimer.current);
        slackPollTimer.current = null;
      }
    };
  }, [isSlackNode, slackConnected]);

  useEffect(() => {
    if (!isGmailNode) {
      setGmailConnected(null);
      setGmailAccountEmail("");
      if (gmailPollTimer.current) {
        window.clearInterval(gmailPollTimer.current);
        gmailPollTimer.current = null;
      }
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        if (cancelled) return;
        await fetchGmailStatus();
      } catch {
        if (cancelled) return;
        setGmailConnected(false);
        setGmailAccountEmail("");
      }
    })();

    if (!gmailPollTimer.current) {
      gmailPollTimer.current = window.setInterval(() => {
        if (gmailConnected) return;
        void fetchGmailStatus().catch(() => {
          setGmailConnected(false);
          setGmailAccountEmail("");
        });
      }, 2000);
    }

    return () => {
      cancelled = true;
      if (gmailPollTimer.current) {
        window.clearInterval(gmailPollTimer.current);
        gmailPollTimer.current = null;
      }
    };
  }, [isGmailNode, gmailConnected]);

  if (!definition) {
    return (
      <div className="min-w-[260px] rounded-2xl border border-rose-500/30 bg-brand-bg-surface/90 backdrop-blur-xl p-4 text-[11px] font-bold uppercase tracking-widest text-rose-300 shadow-2xl">
        Unknown node type: {nodeData.type}
      </div>
    );
  }

  const updateData = (patch: Partial<BaseNodeData>) => {
    updateNodeData(id, {
      ...nodeData,
      ...patch,
      inputs: {
        ...nodeData.inputs,
        ...(patch.inputs ?? {}),
      },
      config: {
        ...(nodeData.config ?? {}),
        ...(patch.config ?? {}),
      },
      outputs: {
        ...(nodeData.outputs ?? {}),
        ...(patch.outputs ?? {}),
      },
    });
  };

  const runNode = async () => {
    setRunning(true);
    try {
      if (isSlackNode) {
        const connected = await fetchSlackStatus().catch(() => false);
        if (!connected) {
          window.open("/api/slack/connect", "_blank", "noopener,noreferrer");
          updateData({
            outputs: {
              ...(nodeData.outputs ?? {}),
              text: "Slack not connected. Complete the OAuth flow in the opened tab, then run again.",
            },
          });
          return;
        }
      }
      if (isGmailNode) {
        const connected = await fetchGmailStatus().catch(() => false);
        if (!connected) {
          window.open("/api/gmail/connect", "_blank", "noopener,noreferrer");
          updateData({
            outputs: {
              ...(nodeData.outputs ?? {}),
              text: "Gmail not connected. Complete the OAuth flow in the opened tab, then run again.",
            },
          });
          return;
        }
      }

      const upstreamInputs = getNodeInputs(
        id,
        getNodes() as UnifiedCanvasNode[],
        getEdges() as UnifiedCanvasEdge[],
        getRuntimeState(),
      );
      const manualInputsWithoutSource = Object.fromEntries(
        Object.entries(nodeData.inputs).filter(
          ([key]) => key !== "source" && key !== "sources",
        ),
      );
      const executionInputs = mergeInputsPreferManual(
        upstreamInputs,
        manualInputsWithoutSource,
      );

      setRuntimeNodeInputs(id, upstreamInputs);

      if (definition.category === "creative") {
        const output = await runCreativeNode(
          nodeData.type,
          executionInputs,
          nodeData.config ?? {},
          accessToken,
        );
        updateData({ outputs: output });
        setRuntimeNodeOutputs(id, output);
      } else if (definition.role === "trigger") {
        const output = await runTriggerNode(
          nodeData.type,
          nodeData.config ?? {},
          executionInputs,
        );
        updateData({ outputs: output });
        setRuntimeNodeOutputs(id, output);
      } else {
        try {
          const output = await runIntegrationNode(
            nodeData.type,
            executionInputs,
            nodeData.config ?? {},
            accessToken,
          );
          updateData({ outputs: output });
          setRuntimeNodeOutputs(id, output);
          if (isSlackNode) {
            // If the node succeeded, keep status in sync.
            void fetchSlackStatus();
          }
          if (isGmailNode) {
            // If the node succeeded, keep status in sync.
            void fetchGmailStatus();
          }
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Integration node failed.";
          const output = { error: message, text: message };
          updateData({ outputs: output });
          setRuntimeNodeOutputs(id, output);

          if (
            isSlackNode &&
            message.toLowerCase().includes("slack not connected")
          ) {
            window.open("/api/slack/connect", "_blank", "noopener,noreferrer");
          }
          if (
            isGmailNode &&
            message.toLowerCase().includes("gmail not connected")
          ) {
            window.open("/api/gmail/connect", "_blank", "noopener,noreferrer");
          }
        }
      }
    } finally {
      setRunning(false);
    }
  };

  return (
    <>
      <div
        onDoubleClick={() => setIsExpanded(true)}
        className={`flex h-full w-full min-h-[220px] min-w-[300px] flex-col rounded-[24px] border bg-brand-bg-surface/90 backdrop-blur-2xl p-4 text-brand-text-body shadow-2xl transition-all duration-300 cursor-pointer ${selected ? "border-brand-purple shadow-[0_0_30px_-5px_rgba(123,92,234,0.3)]" : "border-brand-purple/40 shadow-inner"}`}
      >
        <NodeResizer
          isVisible={selected}
          minWidth={300}
          minHeight={220}
          handleClassName="!h-6 !w-6 !bg-transparent !border-none !shadow-none"
          lineClassName="!border-brand-purple/30"
        />
        {canReceiveInput ? (
          <Handle
            type="target"
            position={Position.Top}
            className="!h-2.5 !w-2.5 !border-2 !border-brand-bg-page !bg-brand-purple transition-all ring-offset-brand-bg-page hover:!ring-4 hover:!ring-brand-purple/30 group-hover:!scale-110"
          />
        ) : null}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex w-full items-center gap-2.5 group/label">
            <NodeIcon className="h-4 w-4 text-brand-purple group-hover/label:text-brand-cyan transition-colors" />
            <input
              value={nodeData.label}
              onChange={(event) => updateData({ label: event.target.value })}
              onKeyDown={(event) => event.stopPropagation()}
              className="w-full bg-transparent text-[13px] font-black uppercase tracking-widest text-white outline-none placeholder:text-brand-text-muted/50"
            />
          </div>
          <button
            onClick={() => setIsExpanded(true)}
            className="p-1.5 hover:bg-white/5 rounded-lg text-brand-text-muted hover:text-white transition-all"
          >
            <Maximize2 size={12} />
          </button>
        </div>

        {nodeData.description ? (
          <input
            value={nodeData.description}
            onChange={(event) =>
              updateData({ description: event.target.value })
            }
            onKeyDown={(event) => event.stopPropagation()}
            className="mb-4 bg-transparent text-[11px] font-medium leading-relaxed text-brand-text-muted outline-none w-full"
          />
        ) : null}

        {isSlackNode ? (
          <div className="mb-3 rounded-xl border border-white/5 bg-brand-bg-page/50 px-3 py-2.5 text-[10px] text-brand-text-body">
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold uppercase tracking-wider">
                Slack:{" "}
                <span
                  className={
                    slackConnected
                      ? "text-emerald-400"
                      : "text-brand-text-muted"
                  }
                >
                  {slackConnected === null
                    ? "Checking..."
                    : slackConnected
                      ? `Connected${slackTeamName ? ` (${slackTeamName})` : ""}`
                      : "Not connected"}
                </span>
              </span>
              <button
                type="button"
                onClick={async () => {
                  window.open(
                    "/api/slack/connect",
                    "_blank",
                    "noopener,noreferrer",
                  );
                  await fetchSlackStatus().catch(() => false);
                }}
                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-300 hover:bg-emerald-500/20 transition-all"
              >
                Connect
              </button>
            </div>
          </div>
        ) : null}
        {isGmailNode ? (
          <div className="mb-3 rounded-xl border border-white/5 bg-brand-bg-page/50 px-3 py-2.5 text-[10px] text-brand-text-body">
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold uppercase tracking-wider">
                Gmail:{" "}
                <span
                  className={
                    gmailConnected
                      ? "text-emerald-400"
                      : "text-brand-text-muted"
                  }
                >
                  {gmailConnected === null
                    ? "Checking..."
                    : gmailConnected
                      ? `Connected${gmailAccountEmail ? ` (${gmailAccountEmail})` : ""}`
                      : "Not connected"}
                </span>
              </span>
              <button
                type="button"
                onClick={async () => {
                  window.open(
                    "/api/gmail/connect",
                    "_blank",
                    "noopener,noreferrer",
                  );
                  await fetchGmailStatus().catch(() => false);
                }}
                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-300 hover:bg-emerald-500/20 transition-all"
              >
                Connect
              </button>
            </div>
          </div>
        ) : null}

        <div className="nodrag nowheel max-h-[300px] space-y-4 overflow-auto custom-scrollbar pr-1">
          {Object.keys(definition.inputSchema)
            .filter((key) => key !== "source" && key !== "payload")
            .map((key) => (
              <label key={key} className="block space-y-1.5">
                <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted px-0.5">
                  {key}
                </span>
                <div className="relative group/input">
                  <input
                    value={toText(nodeData.inputs[key] ?? "")}
                    onChange={(event) =>
                      updateData({ inputs: { [key]: event.target.value } })
                    }
                    onKeyDown={(event) => event.stopPropagation()}
                    placeholder={getInputPlaceholder(nodeData.type, key)}
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-[11px] font-medium outline-none focus:border-brand-purple/50 focus:bg-white/[0.05] transition-all text-white placeholder:text-brand-text-muted/30"
                  />
                </div>
              </label>
            ))}

          {Object.keys(nodeData.config ?? {}).map((key) => (
            <label key={key} className="block space-y-1.5">
              <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted px-0.5">
                {key}
              </span>
              <div className="relative group/input">
                <textarea
                  value={toText(nodeData.config?.[key] ?? "")}
                  onChange={(event) =>
                    updateData({ config: { [key]: event.target.value } })
                  }
                  onKeyDown={(event) => event.stopPropagation()}
                  rows={key === "additionalInstructions" ? 3 : 2}
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-[11px] font-medium outline-none focus:border-brand-purple/50 focus:bg-white/[0.05] transition-all text-white placeholder:text-brand-text-muted/30 resize-none"
                />
              </div>
            </label>
          ))}
        </div>

        {canExecute ? (
          <button
            type="button"
            onClick={() => void runNode()}
            disabled={running}
            className="group/btn relative mt-5 flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-[0_4px_15px_-3px_rgba(123,92,234,0.4)] transition-all hover:shadow-[0_8px_25px_-3px_rgba(0,194,255,0.5)] hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <span className="relative z-10">
              {running
                ? "Synchronising..."
                : definition.role === "trigger"
                  ? "Emit Trigger"
                  : "Run Node"}
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
          </button>
        ) : (
          <div className="mt-5 rounded-xl border border-white/5 bg-brand-bg-page/50 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-text-muted text-center italic">
            Static upload node
          </div>
        )}

        <details className="group/outputs mt-4">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-text-muted hover:text-white transition-colors">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-purple group-open/outputs:bg-brand-cyan transition-colors" />
            Outputs
          </summary>
          <div className="relative mt-3">
            <pre className="nodrag nowheel max-h-40 overflow-auto rounded-xl border border-white/5 bg-brand-bg-page/80 p-3 text-[10px] font-medium leading-relaxed text-brand-text-body custom-scrollbar">
              {JSON.stringify(nodeData.outputs ?? {}, null, 2)}
            </pre>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-transparent to-brand-bg-page/20 pointer-events-none" />
          </div>
        </details>

        <Handle
          type="source"
          position={Position.Bottom}
          className="!h-2.5 !w-2.5 !border-2 !border-brand-bg-page !bg-brand-cyan transition-all ring-offset-brand-bg-page hover:!ring-4 hover:!ring-brand-cyan/30 group-hover:!scale-110"
        />
      </div>

      {/* Immersive Expansion Modal (tldraw/OS-style) */}
      {isExpanded && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-12 backdrop-blur-xl bg-black/60 animate-in fade-in zoom-in duration-300">
          <div className="relative w-full max-w-6xl h-full bg-brand-bg-surface border border-white/10 rounded-[40px] shadow-[0_0_150px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-10 border-b border-white/5 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center text-brand-purple shadow-2xl">
                  <NodeIcon size={32} />
                </div>
                <div>
                  <input
                    value={nodeData.label}
                    onChange={(e) => updateData({ label: e.target.value })}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="text-3xl font-black uppercase tracking-tighter text-white bg-transparent outline-none w-full"
                  />
                  <div className="flex items-center gap-3 mt-1">
                    <span className="px-2 py-0.5 rounded bg-brand-purple text-[10px] font-black uppercase tracking-widest text-white">
                      {definition.category}
                    </span>
                    <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">
                      {id}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-4 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 rounded-2xl transition-all text-brand-text-muted flex items-center gap-3"
              >
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Collapse to Canvas
                </span>
                <Minimize2 size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left: Configuration */}
              <div className="flex-1 p-12 overflow-y-auto custom-scrollbar border-r border-white/5">
                <div className="max-w-2xl space-y-12">
                  <section>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-brand-cyan mb-6">
                      Intent & Description
                    </h3>
                    <textarea
                      value={nodeData.description}
                      onChange={(e) =>
                        updateData({ description: e.target.value })
                      }
                      onKeyDown={(e) => e.stopPropagation()}
                      className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-lg text-slate-300 outline-none focus:border-brand-cyan/50 transition-all min-h-[120px] resize-none font-medium"
                    />
                  </section>

                  <>
                    <section>
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-brand-purple mb-6 flex items-center gap-2">
                        <Settings size={14} />
                        Configuration
                      </h3>
                      <div className="space-y-6">
                        {Object.keys(definition.inputSchema)
                          .filter(
                            (k) =>
                              ![
                                "source",
                                "payload",
                                "apiKey",
                                "clientSecret",
                              ].includes(k),
                          )
                          .map((key) => (
                            <div key={key} className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted px-1">
                                {key}
                              </label>
                              <input
                                value={toText(nodeData.inputs?.[key] ?? "")}
                                placeholder={getInputPlaceholder(
                                  nodeData.type,
                                  key,
                                )}
                                onChange={(e) =>
                                  updateData({
                                    inputs: { [key]: e.target.value },
                                  })
                                }
                                onKeyDown={(e) => e.stopPropagation()}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-brand-purple/50 transition-all"
                              />
                            </div>
                          ))}
                      </div>
                    </section>

                    {/* Security Section (Conditional) */}
                    {(definition.inputSchema.apiKey ||
                      definition.inputSchema.clientSecret) && (
                      <section>
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-rose-400 mb-6 flex items-center gap-2">
                          <Lock size={14} />
                          Security & Authentication
                        </h3>
                        <div className="space-y-6">
                          {["apiKey", "clientSecret"].map((key) => {
                            if (!definition.inputSchema[key]) return null;
                            return (
                              <div key={key} className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted px-1">
                                  {key === "apiKey"
                                    ? "API Key / Token"
                                    : "Client Secret"}
                                </label>
                                <input
                                  type="password"
                                  value={toText(nodeData.inputs?.[key] ?? "")}
                                  onChange={(e) =>
                                    updateData({
                                      inputs: { [key]: e.target.value },
                                    })
                                  }
                                  onKeyDown={(e) => e.stopPropagation()}
                                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-rose-300 outline-none focus:border-rose-500/50 transition-all font-mono"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    )}
                  </>

                  <section>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400 mb-6">
                      Advanced Logic
                    </h3>
                    <div className="space-y-6">
                      {Object.keys(nodeData.config ?? {}).map((key) => (
                        <div key={key} className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted px-1">
                            {key}
                          </label>
                          <textarea
                            value={toText(nodeData.config?.[key] ?? "")}
                            onChange={(e) =>
                              updateData({ config: { [key]: e.target.value } })
                            }
                            onKeyDown={(e) => e.stopPropagation()}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-mono text-emerald-300/80 outline-none focus:border-emerald-500/50 transition-all min-h-[100px]"
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>

              {/* Right: Output & Telemetry */}
              <div className="w-[450px] bg-black/40 p-12 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white">
                      Live Output
                    </h3>
                    <div
                      className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${running ? "bg-amber-500/20 text-amber-400 animate-pulse" : "bg-emerald-500/20 text-emerald-400"}`}
                    >
                      {running ? "Processing" : "Idle"}
                    </div>
                  </div>
                  <pre className="w-full bg-black/60 border border-white/5 rounded-3xl p-6 text-xs font-mono text-brand-cyan/80 min-h-[200px] overflow-auto custom-scrollbar leading-relaxed">
                    {JSON.stringify(nodeData.outputs ?? {}, null, 2)}
                  </pre>
                </section>

                <button
                  onClick={() => void runNode()}
                  disabled={running}
                  className="w-full py-6 bg-gradient-to-r from-brand-purple to-brand-cyan text-white rounded-3xl text-sm font-black uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 group/run"
                >
                  <Zap
                    className={`group-hover/run:scale-125 transition-transform ${running ? "animate-bounce" : ""}`}
                  />
                  {running ? "Synchronising Engine..." : "Execute Sequence"}
                </button>

                <section className="flex-1 border-t border-white/5 pt-8">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-brand-text-muted mb-6">
                    Engine Telemetry
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: "Latency", value: "42ms" },
                      { label: "Tokens", value: "1,240" },
                      { label: "Substrate", value: "Active" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/5"
                      >
                        <span className="text-[9px] font-bold text-brand-text-muted uppercase tracking-widest">
                          {stat.label}
                        </span>
                        <span className="text-[10px] font-black text-white">
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
