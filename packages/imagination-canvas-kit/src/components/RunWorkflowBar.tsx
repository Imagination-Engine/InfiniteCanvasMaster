// @ts-nocheck
import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Loader2, CheckCircle2, XCircle, Zap, RotateCcw } from "lucide-react";
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
        return t.includes("trigger") || t.includes("webhook");
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
      setLogs(["No trigger node found on canvas. Add a webhook or schedule trigger."]);
      setStatus("failed");
      setTimeout(() => { setStatus("idle"); setCurrentNodeLabel(null); }, 4000);
      return;
    }

    const adj = buildAdjacency();

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
      const incomingConns = Object.values(connections || {}).filter(
        (conn) => (conn.toId || (conn as any).targetId) === nodeId
      );
      if (incomingConns.length === 0) return {};
      
      let mergedOutputs = {};
      for (const conn of incomingConns) {
        const fromId = conn.fromId || (conn as any).sourceId;
        const fromObj = objects[fromId];
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

    try {
      while (queue.length > 0) {
        if (abortRef.current) break;

        const nodeId = queue.shift()!;
        if (visited.has(nodeId)) continue;
        visited.add(nodeId);

        const obj = objects[nodeId];
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
          return String(config[key] ?? inputs[key] ?? obj.metadata?.[key] ?? def);
        };

        let validationError: string | null = null;
        let executionOutputs: any = {};
        let verificationError: string | null = null;

        // 1. RUN PRE-EXECUTION VALIDATION CHECKS
        try {
          const type = (obj.type || "").toLowerCase();
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
            const model = getVal("model");
            if (!role || role.trim() === "") {
              throw new Error("Agent Role is required and not configured.");
            }
            if (!instructions || instructions.trim().length < 5) {
              throw new Error("System instructions must be configured with at least 5 characters.");
            }
            if (!model || model.trim() === "") {
              throw new Error("Gemini reasoning model must be selected.");
            }
          } else if (type.includes("webfetch")) {
            const url = getVal("url");
            const method = getVal("method");
            if (!url || url.trim() === "") {
              throw new Error("Fetch Target URL is not configured.");
            }
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
              throw new Error("Fetch Target URL must start with 'http://' or 'https://'.");
            }
            if (!method || method.trim() === "") {
              throw new Error("HTTP Method must be configured.");
            }
          } else if (type.includes("slack") || type.includes("discord")) {
            const message = getVal("message");
            if (!message || message.trim().length < 5) {
              throw new Error("Message Content Template must contain at least 5 characters.");
            }
            if (type.includes("discord")) {
              const webhookUrl = getVal("webhookUrl");
              if (!webhookUrl || webhookUrl.trim() === "") {
                throw new Error("Discord Webhook URL is not configured.");
              }
              if (!webhookUrl.startsWith("https://discord.com/api/webhooks/")) {
                throw new Error("Discord Webhook URL must start with https://discord.com/api/webhooks/");
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
              throw new Error("Gmail Recipient Email ('To') is not configured.");
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
              throw new Error("Conditional JS Decision Expression is not configured.");
            }
          } else if (type.includes("delay")) {
            const ms = getVal("ms");
            const delayVal = Number(ms);
            if (isNaN(delayVal) || delayVal <= 0) {
              throw new Error("Delay length (ms) must be configured as a positive number.");
            }
          } else if (type.includes("foreach")) {
            const collection = getVal("collection");
            if (!collection || collection.trim() === "") {
              throw new Error("Loop Collection Path is not configured.");
            }
          }
        } catch (e: any) {
          validationError = e.message;
        }

        // Handle pre-execution validation failure
        if (validationError) {
          updateObject(nodeId, { status: "error" });
          setLogs((prev) => [...prev, `✗ Validation Failed: ${label} - ${validationError}`]);

          const continueOnFail = config.continueOnFail === true;
          if (continueOnFail) {
            setLogs((prev) => [...prev, `⚠ Continuing branch due to 'Continue on Fail' config.`]);
            // Queue downstream nodes to continue this branch
            const downstream = adj[nodeId] || [];
            for (const nextId of downstream) {
              if (!visited.has(nextId)) queue.push(nextId);
            }
            continue;
          } else {
            // Stop entire workflow execution immediately
            throw new Error(`Node validation failed on "${label}": ${validationError}`);
          }
        }

        // Set running status on the canvas block (triggers cyan scanner glow)
        updateObject(nodeId, { status: "running" });
        setLogs((prev) => [...prev, `▶ Executing: ${label}`]);

        // 2. SOVEREIGN EXECUTION & OUTPUT SYNTHESIS
        try {
          const type = (obj.type || "").toLowerCase();
          
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
                score: 99
              }
            };
            await new Promise((r) => setTimeout(r, 600));
          } else if (type.includes("schedule") || type.includes("time")) {
            executionOutputs = {
              triggered: true,
              cron: getVal("cron"),
              timezone: getVal("timezone", "America/Los_Angeles"),
              timestamp: new Date().toISOString(),
              payload: {
                title: `Cron Event trigger for execution at ${new Date().toLocaleTimeString()}`,
                time: new Date().toISOString()
              }
            };
            await new Promise((r) => setTimeout(r, 600));
          } else if (type.includes("agent")) {
            const compiledInstructions = resolveTemplates(getVal("instructions"), upstreamOutputs);
            executionOutputs = {
              role: getVal("role"),
              model: getVal("model"),
              instructionsEvaluated: compiledInstructions,
              content: `[Autonomous Agent: ${getVal("role")}] Sovereign swarm successfully executed. Processed upstream data: "${upstreamOutputs?.payload?.title || upstreamOutputs?.title || "No direct inputs"}". Core decision committed to vector vault.`,
              timestamp: new Date().toISOString()
            };
            await new Promise((r) => setTimeout(r, 1000)); // AI thinking time simulation
          } else if (type.includes("webfetch")) {
            executionOutputs = {
              status: 200,
              statusText: "OK",
              url: getVal("url"),
              method: getVal("method"),
              headers: { "content-type": "application/json" },
              data: {
                records: [
                  { id: 44, value: "Verified secure telemetry ledger record" }
                ],
                fetchedAt: new Date().toISOString(),
                source: "Balnce AI Local Engine Simulator"
              }
            };
            await new Promise((r) => setTimeout(r, 800));
          } else if (type.includes("slack") || type.includes("discord")) {
            const compiledMessage = resolveTemplates(getVal("message"), upstreamOutputs);
            executionOutputs = {
              success: true,
              deliveredAt: new Date().toISOString(),
              messageSent: compiledMessage,
              channel: getVal("channel", "discord-webhook")
            };
            await new Promise((r) => setTimeout(r, 500));
          } else if (type.includes("gmail")) {
            const compiledSubject = resolveTemplates(getVal("subject"), upstreamOutputs);
            const compiledBody = resolveTemplates(getVal("body"), upstreamOutputs);
            executionOutputs = {
              sent: true,
              to: getVal("to"),
              subject: compiledSubject,
              body: compiledBody,
              messageId: "gmail_msg_" + Math.random().toString(36).substr(2, 9),
              deliveredAt: new Date().toISOString()
            };
            await new Promise((r) => setTimeout(r, 700));
          } else if (type.includes("sheets")) {
            executionOutputs = {
              success: true,
              spreadsheetId: getVal("spreadsheetId"),
              range: getVal("range"),
              rowsAppended: 1,
              committedAt: new Date().toISOString()
            };
            await new Promise((r) => setTimeout(r, 750));
          } else if (type.includes("if") || type.includes("router")) {
            const condition = getVal("condition");
            let match = true;
            try {
              const fn = new Function("data", `return !!(${condition})`);
              match = fn(upstreamOutputs?.payload || upstreamOutputs);
            } catch (e: any) {
              throw new Error(`Condition expression evaluation crashed: ${e.message}`);
            }
            executionOutputs = {
              conditionEvaluated: condition,
              outcome: match ? "true" : "false",
              match: match
            };
            await new Promise((r) => setTimeout(r, 500));
          } else if (type.includes("delay")) {
            const duration = Number(getVal("ms", "800"));
            await new Promise((r) => setTimeout(r, duration));
            executionOutputs = {
              sleptMs: duration,
              completedAt: new Date().toISOString()
            };
          } else if (type.includes("foreach")) {
            executionOutputs = {
              iterated: true,
              collection: getVal("collection"),
              itemsProcessedCount: 2,
              itemsProcessed: ["simulated_row_1", "simulated_row_2"]
            };
            await new Promise((r) => setTimeout(r, 600));
          } else {
            // General process simulation
            executionOutputs = {
              executed: true,
              nodeId: nodeId,
              timestamp: new Date().toISOString(),
              inputRef: upstreamOutputs
            };
            await new Promise((r) => setTimeout(r, 800));
          }
        } catch (e: any) {
          verificationError = `Execution error: ${e.message}`;
        }

        // 3. POST-EXECUTION VERIFICATION CHECKS
        if (!verificationError) {
          try {
            const type = (obj.type || "").toLowerCase();
            if (type.includes("webhook") && (!executionOutputs.success || !executionOutputs.payload)) {
              throw new Error("Webhook trigger output validation check failed. Missing capture packet.");
            } else if ((type.includes("schedule") || type.includes("time")) && !executionOutputs.triggered) {
              throw new Error("Scheduler calendar tick verification check failed.");
            } else if (type.includes("agent") && (!executionOutputs.content || executionOutputs.content.trim().length === 0)) {
              throw new Error("Agent failed to synthesize dynamic response content payload.");
            } else if (type.includes("webfetch") && executionOutputs.status !== 200) {
              throw new Error(`Telemetry verify failed: API target URL returned status ${executionOutputs.status}.`);
            } else if ((type.includes("slack") || type.includes("discord")) && (!executionOutputs.success || !executionOutputs.messageSent)) {
              throw new Error("Push notifications delivery verification receipt was empty.");
            } else if (type.includes("gmail") && !executionOutputs.sent) {
              throw new Error("SMTP notification transfer transaction confirmation is missing.");
            } else if (type.includes("sheets") && !executionOutputs.success) {
              throw new Error("Database transaction verification write failed to lock.");
            } else if ((type.includes("if") || type.includes("router")) && (executionOutputs.outcome !== "true" && executionOutputs.outcome !== "false")) {
              throw new Error("Branch outcome failed to resolve to a verified boolean value.");
            } else if (type.includes("delay") && typeof executionOutputs.sleptMs !== "number") {
              throw new Error("Telemetry tracking failed to verify execution sleep cycle.");
            } else if (type.includes("foreach") && !executionOutputs.iterated) {
              throw new Error("Array loop generator failed verification check.");
            } else if (!type.includes("webhook") && !type.includes("schedule") && !type.includes("time") && 
                       !type.includes("agent") && !type.includes("webfetch") && !type.includes("slack") && 
                       !type.includes("discord") && !type.includes("gmail") && !type.includes("sheets") && 
                       !type.includes("if") && !type.includes("router") && !type.includes("delay") && 
                       !type.includes("foreach") && !executionOutputs.executed) {
              throw new Error("Task transaction verification check failed to commit output.");
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
          setLogs((prev) => [...prev, `✗ Execution Failed: ${label} - ${verificationError}`]);

          const continueOnFail = config.continueOnFail === true;
          if (continueOnFail) {
            setLogs((prev) => [...prev, `⚠ Continuing branch due to 'Continue on Fail' config.`]);
            // Queue downstream nodes to continue this branch
            const downstream = adj[nodeId] || [];
            for (const nextId of downstream) {
              if (!visited.has(nextId)) queue.push(nextId);
            }
            continue;
          } else {
            // Stop entire workflow execution immediately
            throw new Error(`Node execution failed on "${label}": ${verificationError}`);
          }
        }

        // Mark as successfully completed (status: complete, outputs saved)
        updateObject(nodeId, {
          status: "complete",
          metadata: {
            ...obj.metadata,
            outputs: executionOutputs
          }
        });
        setLogs((prev) => [...prev, `✓ Completed: ${label}`]);

        // Queue downstream nodes
        const downstream = adj[nodeId] || [];
        for (const nextId of downstream) {
          if (!visited.has(nextId)) {
            queue.push(nextId);
          }
        }
      }

      if (!abortRef.current) {
        setStatus("completed");
        setCurrentNodeLabel(null);
        setLogs((prev) => [...prev, `✓ Workflow completed successfully (${visited.size} blocks executed)`]);
      } else {
        setStatus("idle");
        setLogs((prev) => [...prev, `⏹ Workflow stopped by user`]);
      }
    } catch (err: any) {
      setStatus("failed");
      setCurrentNodeLabel(null);
      setLogs((prev) => [...prev, `✗ Workflow failed: ${err.message || String(err)}`]);
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
    running: { dot: "bg-brand-cyan animate-pulse", text: currentNodeLabel ? `Running: ${currentNodeLabel}` : "Executing...", textColor: "text-brand-cyan" },
    completed: { dot: "bg-emerald-500", text: "Completed", textColor: "text-emerald-400" },
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
          <div className={`w-2 h-2 rounded-full shrink-0 ${currentStatus.dot}`} />
          <span className={`text-[10px] font-black uppercase tracking-widest truncate ${currentStatus.textColor}`}>
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
            <ButtonIcon size={14} className={status === "running" ? "animate-spin" : "group-hover:scale-110 transition-transform"} />
            {status === "idle" ? "Run Workflow" : status === "completed" ? "Done" : "Failed"}
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
                <p key={i} className="text-[10px] text-white/60 font-mono leading-relaxed">
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
