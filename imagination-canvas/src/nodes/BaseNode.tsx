import { Handle, Position, type NodeProps, useReactFlow } from "@xyflow/react";
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
      <div className="min-w-[260px] rounded-lg border border-rose-500/60 bg-slate-900 p-3 text-xs text-rose-300">
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
        Object.entries(nodeData.inputs).filter(([key]) => key !== "source"),
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
    <div className={`flex min-w-[280px] max-w-[360px] flex-col rounded-xl border bg-slate-900/95 p-3 text-slate-100 shadow-lg ${selected ? "border-sky-500" : "border-slate-700"}`}>
      {canReceiveInput ? (
        <Handle type="target" position={Position.Top} className="h-2 w-2 border border-slate-400 bg-slate-100" />
      ) : null}

      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex w-full items-center gap-2">
          <NodeIcon className="h-4 w-4 text-sky-300" />
          <input
            value={nodeData.label}
            onChange={(event) => updateData({ label: event.target.value })}
            onKeyDown={(event) => event.stopPropagation()}
            className="w-full bg-transparent text-sm font-semibold outline-none"
          />
        </div>
        <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
          {definition.category}
        </span>
      </div>

      {nodeData.description ? (
        <p className="mb-3 text-xs text-slate-400">{nodeData.description}</p>
      ) : null}

      {isSlackNode ? (
        <div className="mb-2 rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-[11px] text-slate-300">
          <div className="flex items-center justify-between gap-2">
            <span>
              Slack:{" "}
              {slackConnected === null ? "Checking..." : slackConnected ? `Connected${slackTeamName ? ` (${slackTeamName})` : ""}` : "Not connected"}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={async () => {
                  window.open("/api/slack/connect", "_blank", "noopener,noreferrer");
                  // Polling is already running; also do an immediate status check.
                  await fetchSlackStatus().catch(() => false);
                }}
                className="rounded border border-emerald-500/50 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-200 hover:bg-emerald-500/20"
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {isGmailNode ? (
        <div className="mb-2 rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-[11px] text-slate-300">
          <div className="flex items-center justify-between gap-2">
            <span>
              Gmail:{" "}
              {gmailConnected === null ? "Checking..." : gmailConnected ? `Connected${gmailAccountEmail ? ` (${gmailAccountEmail})` : ""}` : "Not connected"}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={async () => {
                  window.open("/api/gmail/connect", "_blank", "noopener,noreferrer");
                  await fetchGmailStatus().catch(() => false);
                }}
                className="rounded border border-emerald-500/50 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-200 hover:bg-emerald-500/20"
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="nodrag nowheel max-h-[400px] space-y-2 overflow-auto custom-scrollbar">
        {Object.keys(definition.inputSchema).filter((key) => key !== "source" && key !== "payload").map((key) => (
          <label key={key} className="block text-xs">
            <span className="mb-1 block text-slate-400">{key}</span>
            <input
              value={toText(nodeData.inputs[key] ?? "")}
              onChange={(event) => updateData({ inputs: { [key]: event.target.value } })}
              onKeyDown={(event) => event.stopPropagation()}
              placeholder={getInputPlaceholder(nodeData.type, key)}
              className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs outline-none focus:border-sky-500"
            />
          </label>
        ))}

        {Object.keys(nodeData.config ?? {}).map((key) => (
          <label key={key} className="block text-xs">
            <span className="mb-1 block text-slate-400">{key}</span>
            <textarea
              value={toText(nodeData.config?.[key] ?? "")}
              onChange={(event) => updateData({ config: { [key]: event.target.value } })}
              onKeyDown={(event) => event.stopPropagation()}
              rows={key === "additionalInstructions" ? 3 : 2}
              className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs outline-none focus:border-sky-500"
            />
          </label>
        ))}
      </div>

      {canExecute ? (
        <button
          type="button"
          onClick={() => void runNode()}
          disabled={running}
          className="mt-3 w-full rounded border border-sky-500/50 bg-sky-500/10 px-2 py-1.5 text-xs font-medium text-sky-200 hover:bg-sky-500/20 disabled:opacity-50"
        >
          {running ? "Running..." : definition.role === "trigger" ? "Emit Trigger" : "Run Node"}
        </button>
      ) : (
        <div className="mt-3 rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-slate-400">
          Static upload node
        </div>
      )}

      <details className="mt-2 text-xs text-slate-400">
        <summary className="cursor-pointer">Outputs</summary>
        <pre className="nodrag nowheel mt-2 max-h-40 overflow-auto rounded bg-slate-950 p-2 text-[11px] text-slate-300 scrollbar-gutter-stable custom-scrollbar">{JSON.stringify(nodeData.outputs ?? {}, null, 2)}</pre>
      </details>

      <Handle type="source" position={Position.Bottom} className="h-2 w-2 border border-sky-400 bg-sky-500" />
    </div>
  );
}
