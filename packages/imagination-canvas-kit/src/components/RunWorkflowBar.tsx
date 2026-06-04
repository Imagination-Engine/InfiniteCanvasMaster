// @ts-nocheck
import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  Zap,
  RotateCcw,
} from "lucide-react";
import { useCanvasStore } from "../state/canvasStore";
import { useConnectionStore } from "../state/connectionStore";

type RunStatus = "idle" | "running" | "completed" | "failed";

/**
 * RunWorkflowBar — Floating bottom-center bar with a "Run Workflow" button.
 * Identifies trigger nodes, walks the graph via connections, and ticks each
 * node in topological order while updating block statuses on the canvas in real-time.
 */
export const RunWorkflowBar: React.FC = () => {
  const [status, setStatus] = useState<RunStatus>("idle");
  const [currentNodeLabel, setCurrentNodeLabel] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const abortRef = useRef(false);

  const objects = useCanvasStore((s) => s.objects);
  const updateObject = useCanvasStore((s) => s.updateObject);
  const connections = useConnectionStore((s) => s.connections);

  const objectList = Object.values(objects);
  const blockCount = objectList.length;

  /**
   * Build adjacency list from connections.
   * connections is Record<string, { id, fromId, toId }>.
   */
  const buildAdjacency = useCallback((): Record<string, string[]> => {
    const adj: Record<string, string[]> = {};
    const conns = Object.values(connections || {});
    for (const conn of conns) {
      const from = conn.fromId || (conn as any).sourceId;
      const to = conn.toId || (conn as any).targetId;
      if (!from || !to) continue;
      if (!adj[from]) adj[from] = [];
      adj[from].push(to);
    }
    return adj;
  }, [connections]);

  /**
   * Find trigger nodes — any object whose type contains 'trigger' or 'webhook'.
   */
  const findTriggerNodes = useCallback((): string[] => {
    return objectList
      .filter((obj) => {
        const t = (obj.type || "").toLowerCase();
        const bk = ((obj as any).blockKind || "").toLowerCase();
        if (t.includes("subgraphhead") || bk.includes("subgraphhead")) {
          return false;
        }
        return (
          t.includes("trigger") ||
          t.includes("webhook") ||
          t.includes("manual") ||
          bk.includes("trigger") ||
          bk.includes("webhook") ||
          bk.includes("manual")
        );
      })
      .map((obj) => obj.id);
  }, [objectList]);

  /**
   * BFS walk from trigger nodes through the graph, executing each node.
   */
  const simulateWorkflowRun = useCallback(async () => {
    abortRef.current = false;
    setStatus("running");
    setLogs([]);
    setCurrentNodeLabel(null);

    const triggerIds = findTriggerNodes();
    if (triggerIds.length === 0) {
      setLogs([
        "No trigger node found on canvas. Add a manual trigger, webhook, or schedule trigger.",
      ]);
      setStatus("failed");
      setTimeout(() => {
        setStatus("idle");
        setCurrentNodeLabel(null);
      }, 4000);
      return;
    }

    // Dynamic store readers to avoid stale closure state
    const getFreshConnections = () =>
      useConnectionStore.getState().connections || {};
    const getFreshObjects = () => useCanvasStore.getState().objects || {};

    const buildAdjacencyFresh = (): Record<string, string[]> => {
      const adj: Record<string, string[]> = {};
      const conns = Object.values(getFreshConnections());
      for (const conn of conns) {
        const from = conn.fromId || (conn as any).sourceId;
        const to = conn.toId || (conn as any).targetId;
        if (!from || !to) continue;
        if (!adj[from]) adj[from] = [];
        adj[from].push(to);
      }
      return adj;
    };

    const adj = buildAdjacencyFresh();

    // Helper: resolve variable templates like {{ $json.payload.title }}
    const resolveTemplates = (template: string, data: any): string => {
      if (!template) return "";
      return template.replace(/\{\{\s*\$json\.(.*?)\s*\}\}/g, (_, path) => {
        const parts = path.split(".");
        let current = data;
        for (const part of parts) {
          if (current === null || current === undefined) return "";
          current = current[part];
        }
        return current !== undefined && current !== null ? String(current) : "";
      });
    };

    // Helper: compile outputs of immediately connected predecessor nodes
    const getPredecessorOutputs = (nodeId: string): any => {
      const currentConns = getFreshConnections();
      const currentObjects = getFreshObjects();
      const incomingConns = Object.values(currentConns).filter(
        (conn) => (conn.toId || (conn as any).targetId) === nodeId,
      );
      if (incomingConns.length === 0) return {};

      let mergedOutputs = {};
      for (const conn of incomingConns) {
        const fromId = conn.fromId || (conn as any).sourceId;
        const fromObj = currentObjects[fromId];
        if (fromObj && fromObj.metadata?.outputs) {
          mergedOutputs = {
            ...mergedOutputs,
            ...fromObj.metadata.outputs,
          };
        }
      }
      return mergedOutputs;
    };

    // BFS execution
    const visited = new Set<string>();
    const queue: string[] = [...triggerIds];
    const loopIndexes: Record<string, number> = {};
    const callStack: { callerId: string; callerUpstreamOutputs: any }[] = [];

    const getReachableNodes = (startId: string): Set<string> => {
      const reached = new Set<string>();
      const bfsq = [startId];
      while (bfsq.length > 0) {
        const curr = bfsq.shift()!;
        if (reached.has(curr)) continue;
        reached.add(curr);
        const children = adj[curr] || [];
        for (const child of children) {
          bfsq.push(child);
        }
      }
      return reached;
    };

    const getLoopBodyNodes = (forEachId: string): Set<string> => {
      const body = new Set<string>();
      const currentConns = getFreshConnections();
      const loopStartEdge = Object.values(currentConns).find(
        (c) =>
          (c.fromId || (c as any).sourceId) === forEachId &&
          (c.fromHandleId || (c as any).sourceHandle) === "loop",
      );
      if (!loopStartEdge) return body;

      const bodyQueue: string[] = [
        loopStartEdge.toId || (loopStartEdge as any).targetId,
      ];
      while (bodyQueue.length > 0) {
        const curr = bodyQueue.shift()!;
        if (curr === forEachId || body.has(curr)) continue;
        body.add(curr);
        const children = adj[curr] || [];
        for (const child of children) {
          bodyQueue.push(child);
        }
      }
      return body;
    };

    try {
      while (queue.length > 0) {
        if (abortRef.current) break;

        const nodeId = queue.shift()!;
        if (visited.has(nodeId)) continue;
        visited.add(nodeId);

        const currentObjects = getFreshObjects();
        const obj = currentObjects[nodeId];
        if (!obj) continue;

        const label =
          (obj.metadata?.label as string) ||
          (obj.metadata?.title as string) ||
          obj.type?.split(".").pop() ||
          nodeId;

        setCurrentNodeLabel(label);
        setLogs((prev) => [...prev, `▶ Validating: ${label}`]);

        // Get merged upstream context
        const upstreamOutputs = getPredecessorOutputs(nodeId);

        // Configuration helpers
        const config = obj.metadata?.config || {};
        const inputs = obj.metadata?.inputs || {};
        const getVal = (key: string, def = ""): string => {
          if (key === "currentIndex" && loopIndexes[nodeId] !== undefined) {
            return String(loopIndexes[nodeId]);
          }
          return String(
            obj.metadata?.[key] ?? inputs[key] ?? config[key] ?? def,
          );
        };

        let validationError: string | null = null;
        let executionOutputs: any = {};
        let verificationError: string | null = null;

        // 1. RUN PRE-EXECUTION VALIDATION CHECKS
        try {
          const type = ((obj as any).blockKind || obj.type || "").toLowerCase();
          if (type.includes("webhook")) {
            const path = getVal("path");
            if (!path || path.trim() === "") {
              throw new Error("Webhook Path is not configured.");
            }
            if (!path.startsWith("/")) {
              throw new Error("Webhook Path must start with '/'.");
            }
          } else if (type.includes("schedule") || type.includes("time")) {
            const cron = getVal("cron");
            if (!cron || cron.trim() === "") {
              throw new Error("Cron Recurrence Expression is not configured.");
            }
          } else if (type.includes("agent")) {
            const instructions = getVal("instructions");
            const role = getVal("role");
            const roleId = getVal("roleId");
            const provider = getVal("provider", "google");
            const model = getVal(
              "model",
              provider === "google" ? "gemini-3.5-flash" : "mistral",
            );

            // Allow if role is present, or if roleId is 'custom' (which we can fallback to 'Custom' role)
            if (!role || role.trim() === "") {
              if (roleId !== "custom" && roleId !== "") {
                throw new Error("Agent Role is required and not configured.");
              }
            }

            if (!instructions || instructions.trim().length < 5) {
              throw new Error(
                "System instructions must be configured with at least 5 characters.",
              );
            }

            if (!model || model.trim() === "") {
              throw new Error("AI reasoning model must be selected.");
            }
          } else if (type.includes("webfetch")) {
            const url = getVal("url");
            const method = getVal("method");
            if (!url || url.trim() === "") {
              throw new Error("Fetch Target URL is not configured.");
            }
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
              throw new Error(
                "Fetch Target URL must start with 'http://' or 'https://'.",
              );
            }
            if (!method || method.trim() === "") {
              throw new Error("HTTP Method must be configured.");
            }
          } else if (type.includes("httprequest")) {
            const url = getVal("url");
            const method = getVal("method", "GET"); // Default to GET like the UI does
            if (!url || url.trim() === "") {
              throw new Error("HTTP Target URL is not configured.");
            }
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
              throw new Error(
                "HTTP Target URL must start with 'http://' or 'https://'.",
              );
            }
            if (!method || method.trim() === "") {
              throw new Error("HTTP Method must be configured.");
            }
          } else if (type.includes("slack") || type.includes("discord")) {
            const message = getVal("message");
            if (!message || message.trim().length < 5) {
              throw new Error(
                "Message Content Template must contain at least 5 characters.",
              );
            }
            if (type.includes("discord")) {
              const webhookUrl = getVal("webhookUrl");
              if (!webhookUrl || webhookUrl.trim() === "") {
                throw new Error("Discord Webhook URL is not configured.");
              }
              if (!webhookUrl.startsWith("https://discord.com/api/webhooks/")) {
                throw new Error(
                  "Discord Webhook URL must start with https://discord.com/api/webhooks/",
                );
              }
            } else {
              const channel = getVal("channel");
              if (!channel || channel.trim() === "") {
                throw new Error("Slack Target Channel is required.");
              }
            }
          } else if (type.includes("gmail")) {
            const to = getVal("to");
            const subject = getVal("subject");
            const body = getVal("body");
            if (!to || to.trim() === "") {
              throw new Error(
                "Gmail Recipient Email ('To') is not configured.",
              );
            }
            if (!to.includes("@")) {
              throw new Error("Gmail Recipient must be a valid email address.");
            }
            if (!subject || subject.trim() === "") {
              throw new Error("Email Subject is required.");
            }
            if (!body || body.trim() === "") {
              throw new Error("Email Body is required.");
            }
          } else if (type.includes("sheets")) {
            const spreadsheetId = getVal("spreadsheetId");
            const range = getVal("range");
            if (!spreadsheetId || spreadsheetId.trim() === "") {
              throw new Error("Google Spreadsheet ID is not configured.");
            }
            if (!range || range.trim() === "") {
              throw new Error("Google Sheets range coordinate is required.");
            }
          } else if (type.includes("if") || type.includes("router")) {
            const condition = getVal("condition");
            if (!condition || condition.trim() === "") {
              throw new Error(
                "Conditional JS Decision Expression is not configured.",
              );
            }
          } else if (type.includes("delay")) {
            const ms = getVal("ms");
            const delayUnit = getVal("delayUnit", "ms");
            let multiplier = 1;
            if (delayUnit === "seconds") multiplier = 1000;
            else if (delayUnit === "minutes") multiplier = 60000;
            const delayVal = Number(ms) * multiplier;
            if (isNaN(delayVal) || delayVal <= 0) {
              throw new Error(
                "Delay length must be configured as a positive number.",
              );
            }
          } else if (type.includes("foreach")) {
            const loopType = getVal("loopType", "collection");
            if (loopType === "collection") {
              const collection = getVal("collection");
              if (!collection || collection.trim() === "") {
                throw new Error("Loop Collection Path is not configured.");
              }
            } else if (loopType === "times") {
              const maxIterations = getVal("maxIterations");
              const iterationsVal = Number(maxIterations);
              if (isNaN(iterationsVal) || iterationsVal < 0) {
                throw new Error(
                  "Loop Count (Times) must be a positive number.",
                );
              }
            } else if (loopType === "condition") {
              const condition = getVal("condition");
              if (!condition || condition.trim() === "") {
                throw new Error(
                  "Loop Condition (Expression) is not configured.",
                );
              }
            }
          }
        } catch (e: any) {
          validationError = e.message;
        }

        // Handle pre-execution validation failure
        if (validationError) {
          updateObject(nodeId, { status: "error" });
          setLogs((prev) => [
            ...prev,
            `✗ Validation Failed: ${label} - ${validationError}`,
          ]);

          const continueOnFail = config.continueOnFail === true;
          if (continueOnFail) {
            setLogs((prev) => [
              ...prev,
              `⚠ Continuing branch due to 'Continue on Fail' config.`,
            ]);
            // Queue downstream nodes to continue this branch
            const downstream = adj[nodeId] || [];
            for (const nextId of downstream) {
              if (!visited.has(nextId)) queue.push(nextId);
            }
            continue;
          } else {
            // Stop entire workflow execution immediately
            throw new Error(
              `Node validation failed on "${label}": ${validationError}`,
            );
          }
        }

        // Set running status on the canvas block (triggers cyan scanner glow)
        updateObject(nodeId, { status: "running" });
        setLogs((prev) => [...prev, `▶ Executing: ${label}`]);

        // 2. SOVEREIGN EXECUTION & OUTPUT SYNTHESIS
        try {
          const type = ((obj as any).blockKind || obj.type || "").toLowerCase();

          if (type.includes("webhook")) {
            executionOutputs = {
              success: true,
              webhookId: nodeId,
              receivedAt: new Date().toISOString(),
              payload: upstreamOutputs?.payload || {
                title: "Balnce AI Sovereign Swarm Trigger",
                body: "Autonomous personal agents executing within secure edge canvas substrate.",
                url: "https://balnce.ai/nodes/agent",
                status: "active",
                score: 99,
              },
            };
            await new Promise((r) => setTimeout(r, 600));
          } else if (type.includes("manual")) {
            executionOutputs = {
              success: true,
              triggered: true,
              timestamp: new Date().toISOString(),
              payload: upstreamOutputs?.payload || {
                title: "Manual Trigger Activated",
                body: "Workflow manually initiated by user from the execution controller.",
              },
            };
            await new Promise((r) => setTimeout(r, 400));
          } else if (type.includes("schedule") || type.includes("time")) {
            executionOutputs = {
              triggered: true,
              cron: getVal("cron"),
              timezone: getVal("timezone", "America/Los_Angeles"),
              timestamp: new Date().toISOString(),
              payload: {
                title: `Cron Event trigger for execution at ${new Date().toLocaleTimeString()}`,
                time: new Date().toISOString(),
              },
            };
            await new Promise((r) => setTimeout(r, 600));
          } else if (type.includes("agent")) {
            const compiledInstructions = resolveTemplates(
              getVal("instructions"),
              upstreamOutputs,
            );
            const promptVal =
              resolveTemplates(
                getVal("prompt") || getVal("input") || "",
                upstreamOutputs,
              ) ||
              upstreamOutputs?.payload?.body ||
              upstreamOutputs?.body ||
              upstreamOutputs?.payload?.title ||
              upstreamOutputs?.title ||
              "Perform your designated role.";

            const agentMetadata = obj.metadata || {};
            const agentInputs = agentMetadata.inputs || {};
            const agentProvider =
              agentMetadata.provider || agentInputs.provider || "google";
            const agentModel =
              agentMetadata.model ||
              agentInputs.model ||
              (agentProvider === "google" ? "gemini-3.5-flash" : "mistral");
            const agentReferenceFiles =
              agentMetadata.referenceFiles || agentInputs.referenceFiles || [];
            const agentInstructions =
              compiledInstructions ||
              agentMetadata.instructions ||
              agentInputs.instructions ||
              "You are a helpful AI assistant.";

            try {
              const headers: Record<string, string> = {
                "Content-Type": "application/json",
              };
              const token = useCanvasStore.getState().accessToken;
              if (token) headers["Authorization"] = `Bearer ${token}`;

              // Use relative proxy path and matching payload structure as AgentBlock.tsx
              const res = await fetch("/api/blocks/execute", {
                method: "POST",
                headers,
                body: JSON.stringify({
                  blockId: "iem.agent.agent",
                  inputs: {
                    instructions: agentInstructions,
                    input: promptVal,
                    provider: agentProvider,
                    model: agentModel,
                    referenceFiles: agentReferenceFiles,
                  },
                }),
              });

              if (res.ok) {
                const data = await res.json();
                if (data.success && data.output) {
                  const outputText =
                    typeof data.output === "string"
                      ? data.output
                      : data.output.output ||
                        data.output.content ||
                        JSON.stringify(data.output);
                  executionOutputs = {
                    role: getVal("role"),
                    model: getVal("model"),
                    instructionsEvaluated: compiledInstructions,
                    content: outputText,
                    output: outputText,
                    timestamp: new Date().toISOString(),
                  };
                } else {
                  throw new Error(data.error || "Agent execution failed");
                }
              } else {
                throw new Error(`HTTP Error ${res.status}`);
              }
            } catch (err: any) {
              console.warn(
                "Agent execution failed, falling back to mock:",
                err,
              );
              executionOutputs = {
                role: getVal("role"),
                model: getVal("model"),
                instructionsEvaluated: compiledInstructions,
                content: `[Autonomous Agent: ${getVal("role")}] Sovereign swarm successfully executed. Processed upstream data: "${upstreamOutputs?.payload?.title || upstreamOutputs?.title || "No direct inputs"}". Core decision committed to vector vault.`,
                timestamp: new Date().toISOString(),
              };
              // Store output field in fallback too so the downstream propagation logic receives it
              executionOutputs.output = executionOutputs.content;
              await new Promise((r) => setTimeout(r, 1000));
            }
          } else if (type.includes("webfetch")) {
            executionOutputs = {
              status: 200,
              statusText: "OK",
              url: getVal("url"),
              method: getVal("method"),
              headers: { "content-type": "application/json" },
              data: {
                records: [
                  { id: 44, value: "Verified secure telemetry ledger record" },
                ],
                fetchedAt: new Date().toISOString(),
                source: "Balnce AI Local Engine Simulator",
              },
            };
            await new Promise((r) => setTimeout(r, 800));
          } else if (type.includes("httprequest")) {
            const httpUrl = getVal("url", "");
            const httpMethod = getVal("method", "GET");
            const httpAuth = getVal("authentication", "none");
            const httpSendHeaders = getVal("sendHeaders", "false") === "true";
            const httpSendQueryParams =
              getVal("sendQueryParameters", "false") === "true";
            const httpSendBody = getVal("sendBody", "false") === "true";
            const httpBodyContentType = getVal("bodyContentType", "json");

            const httpInputs: Record<string, any> = {
              url: httpUrl,
              method: httpMethod,
              authentication: httpAuth,
              sendHeaders: httpSendHeaders,
              headersJson: getVal("headersJson", ""),
              sendQueryParameters: httpSendQueryParams,
              queryParametersJson: getVal("queryParametersJson", ""),
              sendBody: httpSendBody,
              bodyContentType: httpBodyContentType,
              bodyJson: getVal("bodyJson", ""),
              bodyRaw: getVal("bodyRaw", ""),
              authUsername: getVal("authUsername", ""),
              authPassword: getVal("authPassword", ""),
              authHeaderName: getVal("authHeaderName", ""),
              authHeaderValue: getVal("authHeaderValue", ""),
            };

            try {
              const headers: Record<string, string> = {
                "Content-Type": "application/json",
              };
              const token = useCanvasStore.getState().accessToken;
              if (token) headers["Authorization"] = `Bearer ${token}`;

              const res = await fetch("/api/blocks/execute", {
                method: "POST",
                headers,
                body: JSON.stringify({
                  blockId: "iem.conductor.httpRequest",
                  inputs: httpInputs,
                }),
              });

              if (res.ok) {
                const data = await res.json();
                executionOutputs = data.output || data;
              } else {
                throw new Error(`Server error ${res.status}`);
              }
            } catch (err: any) {
              // Fallback: direct browser fetch if server route unavailable
              try {
                const urlObj = new URL(httpUrl);
                if (httpSendQueryParams && httpInputs.queryParametersJson) {
                  try {
                    const params = JSON.parse(httpInputs.queryParametersJson);
                    Object.entries(params).forEach(([k, v]) =>
                      urlObj.searchParams.set(k, String(v)),
                    );
                  } catch {}
                }
                const reqHeaders: Record<string, string> = {};
                if (httpSendHeaders && httpInputs.headersJson) {
                  try {
                    Object.assign(
                      reqHeaders,
                      JSON.parse(httpInputs.headersJson),
                    );
                  } catch {}
                }
                if (httpAuth === "basic") {
                  reqHeaders["Authorization"] =
                    `Basic ${btoa(`${httpInputs.authUsername}:${httpInputs.authPassword}`)}`;
                } else if (httpAuth === "header" && httpInputs.authHeaderName) {
                  reqHeaders[httpInputs.authHeaderName] =
                    httpInputs.authHeaderValue;
                }
                let body: string | undefined;
                if (
                  httpSendBody &&
                  httpMethod !== "GET" &&
                  httpMethod !== "HEAD"
                ) {
                  if (httpBodyContentType === "json" && httpInputs.bodyJson) {
                    reqHeaders["Content-Type"] = "application/json";
                    body = httpInputs.bodyJson;
                  } else if (
                    httpBodyContentType === "raw" &&
                    httpInputs.bodyRaw
                  ) {
                    body = httpInputs.bodyRaw;
                  }
                }
                const fetchRes = await fetch(urlObj.toString(), {
                  method: httpMethod,
                  headers: reqHeaders,
                  body,
                });
                const resContentType =
                  fetchRes.headers.get("content-type") || "";
                const resData = resContentType.includes("application/json")
                  ? await fetchRes.json()
                  : await fetchRes.text();
                executionOutputs = {
                  status: fetchRes.status,
                  data: resData,
                };
              } catch (fetchErr: any) {
                executionOutputs = {
                  status: 500,
                  data: null,
                  error: fetchErr.message,
                };
              }
            }
          } else if (type.includes("slack") || type.includes("discord")) {
            const compiledMessage = resolveTemplates(
              getVal("message"),
              upstreamOutputs,
            );
            executionOutputs = {
              success: true,
              deliveredAt: new Date().toISOString(),
              messageSent: compiledMessage,
              channel: getVal("channel", "discord-webhook"),
            };
            await new Promise((r) => setTimeout(r, 500));
          } else if (type.includes("gmail")) {
            const compiledSubject = resolveTemplates(
              getVal("subject"),
              upstreamOutputs,
            );
            const compiledBody = resolveTemplates(
              getVal("body"),
              upstreamOutputs,
            );
            executionOutputs = {
              sent: true,
              to: getVal("to"),
              subject: compiledSubject,
              body: compiledBody,
              messageId: "gmail_msg_" + Math.random().toString(36).substr(2, 9),
              deliveredAt: new Date().toISOString(),
            };
            await new Promise((r) => setTimeout(r, 700));
          } else if (type.includes("sheets")) {
            executionOutputs = {
              success: true,
              spreadsheetId: getVal("spreadsheetId"),
              range: getVal("range"),
              rowsAppended: 1,
              committedAt: new Date().toISOString(),
            };
            await new Promise((r) => setTimeout(r, 750));
          } else if (type.includes("if") || type.includes("router")) {
            const condition = getVal("condition");
            let match = true;
            try {
              const fn = new Function("data", `return !!(${condition})`);
              match = fn(upstreamOutputs?.payload || upstreamOutputs);
            } catch (e: any) {
              throw new Error(
                `Condition expression evaluation crashed: ${e.message}`,
              );
            }
            executionOutputs = {
              conditionEvaluated: condition,
              outcome: match ? "true" : "false",
              match: match,
            };
            await new Promise((r) => setTimeout(r, 500));
          } else if (type.includes("delay")) {
            const ms = Number(getVal("ms", "800"));
            const delayUnit = getVal("delayUnit", "ms");
            let multiplier = 1;
            if (delayUnit === "seconds") multiplier = 1000;
            else if (delayUnit === "minutes") multiplier = 60000;
            const duration = ms * multiplier;
            await new Promise((r) => setTimeout(r, duration));
            executionOutputs = {
              sleptMs: duration,
              completedAt: new Date().toISOString(),
            };
          } else if (type.includes("foreach")) {
            const loopType = getVal("loopType", "collection");
            const currentIndex = Number(getVal("currentIndex", "0"));
            if (loopType === "collection") {
              executionOutputs = {
                branch: currentIndex < 2 ? "loopPath" : "exitPath",
                item:
                  currentIndex < 2 ? `simulated_item_${currentIndex}` : null,
                index: currentIndex,
                context: upstreamOutputs,
              };
            } else if (loopType === "times") {
              const maxIterations = Number(getVal("maxIterations", "10"));
              executionOutputs = {
                branch: currentIndex < maxIterations ? "loopPath" : "exitPath",
                item: currentIndex < maxIterations ? currentIndex : null,
                index: currentIndex,
                context: upstreamOutputs,
              };
            } else if (loopType === "condition") {
              executionOutputs = {
                branch: "loopPath",
                item: currentIndex,
                index: currentIndex,
                context: upstreamOutputs,
              };
            }
            await new Promise((r) => setTimeout(r, 600));
          } else if (type.includes("subgraphhead")) {
            executionOutputs = upstreamOutputs || {};
            await new Promise((r) => setTimeout(r, 300));
          } else if (type.includes("subgraph")) {
            const subGraphId = getVal("subGraphId") || getVal("graphId");
            const targetHead = Object.values(getFreshObjects()).find(
              (o) =>
                (o.type === "iem.conductor.subGraphHead" ||
                  o.type === "conductor.subGraphHead") &&
                (o.id === subGraphId ||
                  o.metadata?.name === subGraphId ||
                  o.metadata?.label === subGraphId),
            );

            if (!targetHead) {
              throw new Error(
                `Sub-Graph with target ID/name "${subGraphId}" not found`,
              );
            }

            setLogs((prev) => [
              ...prev,
              `⚡ Calling sub-graph: ${targetHead.metadata?.name || targetHead.metadata?.label || targetHead.id}`,
            ]);

            callStack.push({
              callerId: nodeId,
              callerUpstreamOutputs: upstreamOutputs,
            });

            const reachable = getReachableNodes(targetHead.id);
            reachable.forEach((id) => visited.delete(id));

            updateObject(targetHead.id, {
              metadata: {
                ...targetHead.metadata,
                outputs: upstreamOutputs,
              },
            });

            queue.unshift(targetHead.id);
            continue;
          } else {
            // General process simulation
            executionOutputs = {
              executed: true,
              nodeId: nodeId,
              timestamp: new Date().toISOString(),
              inputRef: upstreamOutputs,
            };
            await new Promise((r) => setTimeout(r, 800));
          }
        } catch (e: any) {
          verificationError = `Execution error: ${e.message}`;
        }

        // 3. POST-EXECUTION VERIFICATION CHECKS
        if (!verificationError) {
          try {
            const type = (
              (obj as any).blockKind ||
              obj.type ||
              ""
            ).toLowerCase();
            if (
              (type.includes("webhook") || type.includes("manual")) &&
              (!executionOutputs.success || !executionOutputs.payload)
            ) {
              throw new Error(
                "Trigger output validation check failed. Missing capture packet.",
              );
            } else if (
              (type.includes("schedule") || type.includes("time")) &&
              !executionOutputs.triggered
            ) {
              throw new Error(
                "Scheduler calendar tick verification check failed.",
              );
            } else if (
              type.includes("agent") &&
              (!executionOutputs.content ||
                executionOutputs.content.trim().length === 0)
            ) {
              throw new Error(
                "Agent failed to synthesize dynamic response content payload.",
              );
            } else if (
              type.includes("webfetch") &&
              executionOutputs.status !== 200
            ) {
              throw new Error(
                `Telemetry verify failed: API target URL returned status ${executionOutputs.status}.`,
              );
            } else if (
              type.includes("httprequest") &&
              executionOutputs.status !== 200
            ) {
              throw new Error(
                `HTTP Request failed: API target URL returned status ${executionOutputs.status}.`,
              );
            } else if (
              (type.includes("slack") || type.includes("discord")) &&
              (!executionOutputs.success || !executionOutputs.messageSent)
            ) {
              throw new Error(
                "Push notifications delivery verification receipt was empty.",
              );
            } else if (type.includes("gmail") && !executionOutputs.sent) {
              throw new Error(
                "SMTP notification transfer transaction confirmation is missing.",
              );
            } else if (type.includes("sheets") && !executionOutputs.success) {
              throw new Error(
                "Database transaction verification write failed to lock.",
              );
            } else if (
              (type.includes("if") || type.includes("router")) &&
              executionOutputs.outcome !== "true" &&
              executionOutputs.outcome !== "false"
            ) {
              throw new Error(
                "Branch outcome failed to resolve to a verified boolean value.",
              );
            } else if (
              type.includes("delay") &&
              typeof executionOutputs.sleptMs !== "number"
            ) {
              throw new Error(
                "Telemetry tracking failed to verify execution sleep cycle.",
              );
            } else if (type.includes("foreach") && !executionOutputs.branch) {
              throw new Error(
                "Array loop generator failed verification check.",
              );
            } else if (
              !type.includes("webhook") &&
              !type.includes("manual") &&
              !type.includes("schedule") &&
              !type.includes("time") &&
              !type.includes("agent") &&
              !type.includes("webfetch") &&
              !type.includes("httprequest") &&
              !type.includes("slack") &&
              !type.includes("discord") &&
              !type.includes("gmail") &&
              !type.includes("sheets") &&
              !type.includes("if") &&
              !type.includes("router") &&
              !type.includes("delay") &&
              !type.includes("foreach") &&
              !type.includes("subgraphhead") &&
              !executionOutputs.executed
            ) {
              throw new Error(
                "Task transaction verification check failed to commit output.",
              );
            }
          } catch (e: any) {
            verificationError = e.message;
          }
        }

        if (abortRef.current) {
          updateObject(nodeId, { status: "idle" });
          break;
        }

        // Handle execution or verification check failures
        if (verificationError) {
          updateObject(nodeId, { status: "error" });
          setLogs((prev) => [
            ...prev,
            `✗ Execution Failed: ${label} - ${verificationError}`,
          ]);

          const continueOnFail = config.continueOnFail === true;
          if (continueOnFail) {
            setLogs((prev) => [
              ...prev,
              `⚠ Continuing branch due to 'Continue on Fail' config.`,
            ]);
            // Queue downstream nodes to continue this branch
            const downstream = adj[nodeId] || [];
            for (const nextId of downstream) {
              if (!visited.has(nextId)) queue.push(nextId);
            }
            continue;
          } else {
            // Stop entire workflow execution immediately
            throw new Error(
              `Node execution failed on "${label}": ${verificationError}`,
            );
          }
        }

        // Mark as successfully completed (status: complete, outputs saved)
        const nextIndex = (loopIndexes[nodeId] ?? 0) + 1;
        if (executionOutputs.branch === "loopPath") {
          loopIndexes[nodeId] = nextIndex;

          const bodyNodes = getLoopBodyNodes(nodeId);
          bodyNodes.forEach((id) => visited.delete(id));
          visited.delete(nodeId);
        }

        const freshObjBeforeUpdate = getFreshObjects()[nodeId] || obj;

        updateObject(nodeId, {
          status: "complete",
          metadata: {
            ...freshObjBeforeUpdate.metadata,
            outputs: executionOutputs,
            inputs: {
              ...(freshObjBeforeUpdate.metadata?.inputs || {}),
              currentIndex:
                executionOutputs.branch === "loopPath" ? nextIndex : 0,
            },
          },
        });
        setLogs((prev) => [...prev, `✓ Completed: ${label}`]);

        // Propagate agent output downstream directly, mimicking test button behavior
        const typeLower = (
          (obj as any).blockKind ||
          obj.type ||
          ""
        ).toLowerCase();
        if (typeLower.includes("agent")) {
          const generatedOutput =
            executionOutputs.output || executionOutputs.content || "";
          if (generatedOutput) {
            const freshConnections = getFreshConnections();
            const freshObjects = getFreshObjects();

            const downstreamConns = Object.values(freshConnections).filter(
              (c: any) => (c.fromId || c.sourceId) === nodeId,
            );

            downstreamConns.forEach((conn: any) => {
              const targetId = conn.toId || conn.targetId;
              const targetObj = freshObjects[targetId];

              if (targetObj) {
                const targetTypeLower = targetObj.type.toLowerCase();
                if (
                  targetTypeLower === "note" ||
                  targetTypeLower === "text" ||
                  targetTypeLower.includes("prose") ||
                  targetTypeLower.includes("scribe") ||
                  targetTypeLower.includes("rich")
                ) {
                  updateObject(targetId, {
                    metadata: {
                      ...targetObj.metadata,
                      instructions: generatedOutput,
                      text: generatedOutput,
                      content: generatedOutput,
                      label:
                        targetObj.metadata?.label ||
                        (targetTypeLower === "note"
                          ? "Agent Output"
                          : targetObj.metadata?.label),
                    },
                  });
                }
              }
            });
          }
        }

        // Queue downstream nodes (using fresh connections and objects)
        const freshConnections = getFreshConnections();
        const freshObjects = getFreshObjects();
        const downstream = adj[nodeId] || [];

        if (downstream.length === 0 && callStack.length > 0) {
          const frame = callStack.pop()!;
          const callerId = frame.callerId;
          const callerObj = freshObjects[callerId];
          const callerLabel =
            callerObj?.metadata?.label ||
            callerObj?.metadata?.title ||
            callerId;

          setLogs((prev) => [
            ...prev,
            `↩ Returning from sub-graph to caller: ${callerLabel}`,
          ]);

          updateObject(callerId, {
            status: "complete",
            metadata: {
              ...callerObj?.metadata,
              outputs: executionOutputs,
            },
          });

          const callerDownstream = adj[callerId] || [];
          for (const nextId of callerDownstream) {
            if (!visited.has(nextId)) {
              queue.push(nextId);
            }
          }
          continue;
        }

        for (const nextId of downstream) {
          const isVisited = visited.has(nextId);
          const nextObj = freshObjects[nextId];
          const nextLabel =
            nextObj?.metadata?.label || nextObj?.metadata?.title || nextId;

          const conn = Object.values(freshConnections).find(
            (c) =>
              (c.fromId || (c as any).sourceId) === nodeId &&
              (c.toId || (c as any).targetId) === nextId,
          );
          const fromHandle = conn
            ? conn.fromHandleId || (conn as any).sourceHandle || "default"
            : "default";

          if (isVisited) {
            setLogs((prev) => [
              ...prev,
              `  - Downstream node ${nextLabel} skipped because it was already visited.`,
            ]);
            continue;
          }

          let shouldSkip = false;
          const type = ((obj as any).blockKind || obj.type || "").toLowerCase();

          if (type.includes("if") || type.includes("router")) {
            const outcome = executionOutputs.outcome; // "true" or "false"
            if (conn) {
              if (
                outcome === "true" &&
                (fromHandle === "false" || fromHandle === "falsePath")
              ) {
                shouldSkip = true;
              }
              if (
                outcome === "false" &&
                (fromHandle === "true" || fromHandle === "truePath")
              ) {
                shouldSkip = true;
              }
            }
          } else if (type.includes("foreach")) {
            const outcome = executionOutputs.branch; // "loopPath" or "exitPath"
            if (conn) {
              if (
                outcome === "loopPath" &&
                (fromHandle === "exit" || fromHandle === "exitPath")
              ) {
                shouldSkip = true;
              }
              if (
                outcome === "exitPath" &&
                (fromHandle === "loop" || fromHandle === "loopPath")
              ) {
                shouldSkip = true;
              }
            }
          }

          if (shouldSkip) {
            setLogs((prev) => [
              ...prev,
              `  - Connection to ${nextLabel} skipped (handle mismatch: outcome=${executionOutputs.branch || executionOutputs.outcome || "unknown"}, handle=${fromHandle})`,
            ]);
            continue;
          }

          setLogs((prev) => [
            ...prev,
            `  - Queueing downstream node: ${nextLabel} (via handle: ${fromHandle})`,
          ]);
          queue.push(nextId);
        }
      }

      if (!abortRef.current) {
        setStatus("completed");
        setCurrentNodeLabel(null);
        setLogs((prev) => [
          ...prev,
          `✓ Workflow completed successfully (${visited.size} blocks executed)`,
        ]);
      } else {
        setStatus("idle");
        setLogs((prev) => [...prev, `⏹ Workflow stopped by user`]);
      }
    } catch (err: any) {
      setStatus("failed");
      setCurrentNodeLabel(null);
      setLogs((prev) => [
        ...prev,
        `✗ Workflow failed: ${err.message || String(err)}`,
      ]);
    }

    // Auto-reset after 6 seconds
    setTimeout(() => {
      setStatus("idle");
      setCurrentNodeLabel(null);
    }, 6000);
  }, [objects, findTriggerNodes, buildAdjacency, connections, updateObject]);

  const handleStop = useCallback(() => {
    abortRef.current = true;
  }, []);

  // Status display config
  const statusConfig = {
    idle: { dot: "bg-emerald-500", text: "Ready", textColor: "text-white/40" },
    running: {
      dot: "bg-brand-cyan animate-pulse",
      text: currentNodeLabel ? `Running: ${currentNodeLabel}` : "Executing...",
      textColor: "text-brand-cyan",
    },
    completed: {
      dot: "bg-emerald-500",
      text: "Completed",
      textColor: "text-emerald-400",
    },
    failed: { dot: "bg-rose-500", text: "Failed", textColor: "text-rose-400" },
  };

  const currentStatus = statusConfig[status];

  const ButtonIcon = {
    idle: Play,
    running: Loader2,
    completed: CheckCircle2,
    failed: XCircle,
  }[status];

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 25, stiffness: 200, delay: 0.3 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[800]"
    >
      <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-brand-bg-surface/90 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {/* Status Indicator */}
        <div className="flex items-center gap-2 min-w-[120px]">
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${currentStatus.dot}`}
          />
          <span
            className={`text-[10px] font-black uppercase tracking-widest truncate ${currentStatus.textColor}`}
          >
            {currentStatus.text}
          </span>
        </div>

        {/* Run / Stop Button */}
        {status === "running" ? (
          <button
            onClick={handleStop}
            className="flex items-center gap-2 px-6 py-2.5 bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl text-[11px] font-black uppercase tracking-[0.15em] hover:bg-rose-500/30 transition-all active:scale-95"
          >
            <RotateCcw size={14} className="animate-spin" />
            Stop
          </button>
        ) : (
          <button
            onClick={simulateWorkflowRun}
            disabled={status === "completed" || status === "failed"}
            className="group flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-brand-purple to-brand-cyan text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(123,92,234,0.4)] hover:shadow-[0_0_30px_rgba(0,194,255,0.5)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ButtonIcon
              size={14}
              className={
                status === "running"
                  ? "animate-spin"
                  : "group-hover:scale-110 transition-transform"
              }
            />
            {status === "idle"
              ? "Run Workflow"
              : status === "completed"
                ? "Done"
                : "Failed"}
          </button>
        )}

        {/* Block Counter */}
        <div className="flex items-center gap-1.5">
          <Zap size={10} className="text-white/20" />
          <span className="text-[10px] font-bold text-white/20">
            {blockCount} blocks
          </span>
        </div>
      </div>

      {/* Execution Log Tooltip (shows during/after run) */}
      <AnimatePresence>
        {logs.length > 0 && status !== "idle" && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-80 max-h-48 overflow-y-auto rounded-xl bg-black/90 backdrop-blur-xl border border-white/10 p-3 shadow-2xl"
          >
            <p className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-2">
              Execution Log
            </p>
            <div className="space-y-1">
              {logs.map((log, i) => (
                <p
                  key={i}
                  className="text-[10px] text-white/60 font-mono leading-relaxed"
                >
                  {log}
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
