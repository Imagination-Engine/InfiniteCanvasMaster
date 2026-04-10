import { Handle, Position, NodeResizer, type NodeProps, useReactFlow } from "@xyflow/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { NODE_CATALOG } from "./nodeCatalog";
import type { BaseNodeData } from "./types";
import type { UnifiedCanvasEdge, UnifiedCanvasNode } from "./canvasTypes";
import { runCreativeNode } from "../services/ai/creativeNodeService";
import { runIntegrationNode, runTriggerNode } from "../services/integrations/workflowService";
import { getNodeIcon } from "./nodeVisuals";
import { getNodeInputs } from "./workflow/inputResolution";
import { getRuntimeState, setRuntimeNodeInputs, setRuntimeNodeOutputs } from "./workflow/runtimeState";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../lib/api";

const toText = (value: unknown) => (typeof value === "string" ? value : JSON.stringify(value ?? ""));
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
  if (nodeType === "gmail.sendEmail" && key === "to") return "recipient@example.com";
  if (nodeType === "gmail.sendEmail" && key === "subject") return "Weekly update";
  if (nodeType === "gmail.sendEmail" && key === "body") return "Leave blank to use upstream text output";
  if (nodeType === "gmail.retrieveEmail" && key === "query") return "Same Gmail syntax, e.g. from:alex newer_than:7d";
  if (nodeType === "gmail.retrieveEmail" && key === "maxResults") return "10";
  if (nodeType === "gmail.retrieveEmail" && key === "includeSpamTrash") return "false";
  return "";
};

export default function BaseNode({ id, data, selected }: NodeProps) {
  const { accessToken } = useAuth();
  const { updateNodeData, getNodes, getEdges } = useReactFlow();
  const [running, setRunning] = useState(false);
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
    setSlackTeamName(typeof status.teamName === "string" ? status.teamName : "");
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
        Object.entries(nodeData.inputs).filter(([key]) => key !== "source" && key !== "sources"),
      );
      const executionInputs = mergeInputsPreferManual(upstreamInputs, manualInputsWithoutSource);

      setRuntimeNodeInputs(id, upstreamInputs);

      if (definition.category === "creative") {
        const output = await runCreativeNode(nodeData.type, executionInputs, nodeData.config ?? {}, accessToken);
        updateData({ outputs: output });
        setRuntimeNodeOutputs(id, output);
      } else if (definition.role === "trigger") {
        const output = await runTriggerNode(nodeData.type, nodeData.config ?? {}, executionInputs);
        updateData({ outputs: output });
        setRuntimeNodeOutputs(id, output);
      } else {
        try {
          const output = await runIntegrationNode(nodeData.type, executionInputs, nodeData.config ?? {}, accessToken);
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
          const message = error instanceof Error ? error.message : "Integration node failed.";
          const output = { error: message, text: message };
          updateData({ outputs: output });
          setRuntimeNodeOutputs(id, output);

          if (isSlackNode && message.toLowerCase().includes("slack not connected")) {
            window.open("/api/slack/connect", "_blank", "noopener,noreferrer");
          }
          if (isGmailNode && message.toLowerCase().includes("gmail not connected")) {
            window.open("/api/gmail/connect", "_blank", "noopener,noreferrer");
          }
        }
      }
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className={`flex h-full w-full min-h-[220px] min-w-[300px] flex-col rounded-[24px] border bg-brand-bg-surface/90 backdrop-blur-2xl p-4 text-brand-text-body shadow-2xl transition-all duration-300 ${selected ? "border-brand-purple shadow-[0_0_30px_-5px_rgba(123,92,234,0.3)]" : "border-brand-purple/40 shadow-inner"}`}>
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
        <span className="shrink-0 rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
          {definition.category}
        </span>
      </div>

      {nodeData.description ? (
        <p className="mb-4 text-[11px] font-medium leading-relaxed text-brand-text-muted">{nodeData.description}</p>
      ) : null}

      {isSlackNode ? (
        <div className="mb-3 rounded-xl border border-white/5 bg-brand-bg-page/50 px-3 py-2.5 text-[10px] text-brand-text-body">
          <div className="flex items-center justify-between gap-3">
            <span className="font-bold uppercase tracking-wider">
              Slack:{" "}
              <span className={slackConnected ? "text-emerald-400" : "text-brand-text-muted"}>
                {slackConnected === null ? "Checking..." : slackConnected ? `Connected${slackTeamName ? ` (${slackTeamName})` : ""}` : "Not connected"}
              </span>
            </span>
            <button
              type="button"
              onClick={async () => {
                window.open("/api/slack/connect", "_blank", "noopener,noreferrer");
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
              <span className={gmailConnected ? "text-emerald-400" : "text-brand-text-muted"}>
                {gmailConnected === null ? "Checking..." : gmailConnected ? `Connected${gmailAccountEmail ? ` (${gmailAccountEmail})` : ""}` : "Not connected"}
              </span>
            </span>
            <button
              type="button"
              onClick={async () => {
                window.open("/api/gmail/connect", "_blank", "noopener,noreferrer");
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
        {Object.keys(definition.inputSchema).filter((key) => key !== "source" && key !== "payload").map((key) => (
          <label key={key} className="block space-y-1.5">
            <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted px-0.5">{key}</span>
            <div className="relative group/input">
              <input
                value={toText(nodeData.inputs[key] ?? "")}
                onChange={(event) => updateData({ inputs: { [key]: event.target.value } })}
                onKeyDown={(event) => event.stopPropagation()}
                placeholder={getInputPlaceholder(nodeData.type, key)}
                className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-[11px] font-medium outline-none focus:border-brand-purple/50 focus:bg-white/[0.05] transition-all text-white placeholder:text-brand-text-muted/30"
              />
            </div>
          </label>
        ))}

        {Object.keys(nodeData.config ?? {}).map((key) => (
          <label key={key} className="block space-y-1.5">
            <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted px-0.5">{key}</span>
            <div className="relative group/input">
              <textarea
                value={toText(nodeData.config?.[key] ?? "")}
                onChange={(event) => updateData({ config: { [key]: event.target.value } })}
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
            {running ? "Synchronising..." : definition.role === "trigger" ? "Emit Trigger" : "Run Node"}
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
          <pre className="nodrag nowheel max-h-40 overflow-auto rounded-xl border border-white/5 bg-brand-bg-page/80 p-3 text-[10px] font-medium leading-relaxed text-brand-text-body custom-scrollbar">{JSON.stringify(nodeData.outputs ?? {}, null, 2)}</pre>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-transparent to-brand-bg-page/20 pointer-events-none" />
        </div>
      </details>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!h-2.5 !w-2.5 !border-2 !border-brand-bg-page !bg-brand-cyan transition-all ring-offset-brand-bg-page hover:!ring-4 hover:!ring-brand-cyan/30 group-hover:!scale-110" 
      />
    </div>
  );
}
