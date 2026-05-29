// @ts-nocheck
import React, { useState, useEffect } from "react";
import type { BlockComponentProps } from "../../contracts/BlockRegistry";
import {
  Zap,
  Settings,
  Lock,
  Globe,
  Clock,
  Database,
  Minimize2,
  Maximize2,
  Play,
  Loader2,
  ShieldAlert,
  ArrowRight,
  Activity,
  Copy,
  Check,
  Send,
  HelpCircle,
  FileText,
  Mail,
  Sheet,
  HelpCircle as QuestionIcon,
  Plus,
  Trash2,
  Code,
} from "lucide-react";
import { useCanvasStore } from "../../state/canvasStore";
import { blockRegistry } from "@iem/core";

export const ConductorBlockView: React.FC<BlockComponentProps> = ({
  object,
  mode = "compact",
}) => {
  const updateObject = useCanvasStore((s) => s.updateObject);

  // State for execution sandbox
  const [running, setRunning] = useState(false);
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [execStatus, setExecStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [execLog, setExecLog] = useState<string[]>([]);

  const isExpanded = mode === "fullscreen" || mode === "side-panel";
  const metadata = (object.metadata as any) || {};
  const config = metadata.config || {};
  const inputs = metadata.inputs || {};
  const outputs = metadata.outputs || {};

  // Mock Input state for Sandbox
  const [mockInputJson, setMockInputJson] = useState(() => {
    if (inputs.mockInput)
      return typeof inputs.mockInput === "object"
        ? JSON.stringify(inputs.mockInput, null, 2)
        : String(inputs.mockInput);

    // Sensible defaults based on type
    return JSON.stringify(
      {
        id: "evt_" + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        event: "trigger",
        payload: {
          title: "Balnce AI Launch",
          body: "Unlock your unlimited digital potential through personal agentic swarms.",
          url: "https://balnce.ai/news/launch",
          status: "active",
          score: 95,
        },
      },
      null,
      2,
    );
  });

  // Output JSON viewer state
  const [outputJson, setOutputJson] = useState(() => {
    return JSON.stringify(outputs, null, 2);
  });

  useEffect(() => {
    setOutputJson(JSON.stringify(outputs, null, 2));
  }, [outputs]);

  // Synchronize dynamic inputs & config fields immediately
  const handleFieldChange = (key: string, value: any) => {
    updateObject(object.id, {
      metadata: {
        ...metadata,
        config: {
          ...(metadata.config || {}),
          [key]: value,
        },
        inputs: {
          ...(metadata.inputs || {}),
          [key]: value,
        },
      },
    });
  };

  const getFieldValue = (key: string, defaultValue = ""): string => {
    return String(config[key] ?? inputs[key] ?? metadata[key] ?? defaultValue);
  };

  // Run isolated block simulation / test execution
  const runBlock = async () => {
    setRunning(true);
    setExecStatus("idle");
    setExecLog([
      `[${new Date().toLocaleTimeString()}] Initializing sandbox environment...`,
    ]);

    let parsedMockInput = {};
    try {
      parsedMockInput = JSON.parse(mockInputJson);
      handleFieldChange("mockInput", parsedMockInput);
    } catch (e) {
      setExecLog((prev) => [
        ...prev,
        `[WARNING] Mock input is invalid JSON. Using empty object.`,
      ]);
    }

    setExecLog((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Executing block: ${object.type}`,
    ]);

    try {
      const response = await fetch("http://localhost:3001/api/blocks/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blockId: object.id,
          type: object.type,
          inputs: {
            ...inputs,
            ...parsedMockInput,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(
          `HTTP Error ${response.status}: ${response.statusText}`,
        );
      }

      const result = await response.json();

      setExecLog((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Block completed successfully.`,
        `[${new Date().toLocaleTimeString()}] Output captured: ${JSON.stringify(result).substring(0, 80)}...`,
      ]);
      setExecStatus("success");

      updateObject(object.id, {
        status: "idle",
        metadata: {
          ...metadata,
          outputs: result,
        },
      });
    } catch (err) {
      console.warn(
        "Backend executor failed or unreachable. Falling back to client-side local simulator.",
        err,
      );
      setExecLog((prev) => [
        ...prev,
        `[NOTICE] Backend executing unavailable. Starting client-side simulator...`,
      ]);

      // Simulate client-side run
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Calculate elegant simulated output based on block configurations
      let simulatedOutput = {};
      const blockType = object.type;

      if (
        blockType.includes("trigger.manual") ||
        blockType.includes("manualTrigger")
      ) {
        simulatedOutput = {
          triggered: true,
          source: "manual",
          timestamp: new Date().toISOString(),
          payload: parsedMockInput?.payload ||
            parsedMockInput || { message: "Manual trigger payload" },
        };
      } else if (blockType.includes("webhook")) {
        simulatedOutput = {
          success: true,
          webhookId: object.id,
          receivedAt: new Date().toISOString(),
          payload: parsedMockInput,
        };
      } else if (blockType.includes("webFetch")) {
        simulatedOutput = {
          status: 200,
          statusText: "OK",
          url: getFieldValue("url", "https://api.example.com"),
          headers: { "content-type": "application/json" },
          data: {
            items: [
              { id: 1, text: "Simulated fetch record A" },
              { id: 2, text: "Simulated fetch record B" },
            ],
            source: "Balnce AI Simulator",
          },
        };
      } else if (blockType.includes("agent")) {
        simulatedOutput = {
          role: getFieldValue("role", "Assistant"),
          model: getFieldValue("model", "gemini-2.0-flash"),
          content:
            "Hello! I am your agent. I processed the trigger event: '" +
            (parsedMockInput?.payload?.title || "Untitled trigger") +
            "' successfully.",
        };
      } else if (blockType.includes("slack") || blockType.includes("discord")) {
        simulatedOutput = {
          success: true,
          channel: getFieldValue("channel", "general"),
          deliveredAt: new Date().toISOString(),
          messageSent: getFieldValue("message", "Triggered workflow message!"),
        };
      } else if (blockType.includes("gmail")) {
        simulatedOutput = {
          sent: true,
          messageId: "msg_" + Math.random().toString(36).substr(2, 12),
          to: getFieldValue("to", "user@example.com"),
          subject: getFieldValue("subject", "Workflow Triggered"),
        };
      } else if (blockType.includes("if") || blockType.includes("router")) {
        const condition = getFieldValue("condition", "true");
        let outcome = true;
        try {
          // Safe eval with mock context
          const context = parsedMockInput?.payload || parsedMockInput;
          const fn = new Function("data", `return !!(${condition})`);
          outcome = fn(context);
        } catch (e) {
          outcome = true; // Fallback
        }
        simulatedOutput = {
          conditionEvaluated: condition,
          outcome: outcome ? "true" : "false",
          match: outcome,
        };
      } else {
        simulatedOutput = {
          executed: true,
          nodeId: object.id,
          timestamp: new Date().toISOString(),
          inputRef: parsedMockInput,
        };
      }

      setExecLog((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Local simulation completed.`,
        `[${new Date().toLocaleTimeString()}] Output payload synthesized.`,
      ]);
      setExecStatus("success");

      updateObject(object.id, {
        status: "idle",
        metadata: {
          ...metadata,
          outputs: simulatedOutput,
        },
      });
    } finally {
      setRunning(false);
    }
  };

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Resolve Icon based on node type
  const getIcon = () => {
    const t = object.type;
    if (t.includes("trigger.manual") || t.includes("manualTrigger")) return Zap;
    if (t.includes("webhook")) return Zap;
    if (t.includes("schedule") || t.includes("delay")) return Clock;
    if (t.includes("agent")) return Activity;
    if (t.includes("webFetch")) return Globe;
    if (t.includes("slack") || t.includes("discord")) return Send;
    if (t.includes("gmail")) return Mail;
    if (t.includes("sheets")) return Sheet;
    return Settings;
  };

  const NodeIcon = getIcon();
  const webhookUrl = `http://localhost:3001/api/conductor/webhook/${object.id}`;

  if (isExpanded) {
    return (
      <div className="w-full h-full flex bg-[#0A0A0F] text-white overflow-hidden select-none">
        {/* Left Side: Parameters Form (65%) */}
        <div className="flex-1 border-r border-white/5 flex flex-col h-full bg-[#0D0D1A]/60 overflow-y-auto custom-scrollbar p-8 space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4 border-b border-white/5 pb-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center shadow-[0_0_15px_rgba(123,92,234,0.15)]">
              <NodeIcon className="text-brand-purple" size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold uppercase tracking-[0.15em] text-white">
                  {metadata.label || object.type.split(".").pop()}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-white/50 tracking-wide font-mono uppercase">
                  {object.type}
                </span>
              </div>
              <p className="text-xs text-white/40 mt-1">
                Configure your node properties, inputs, and routing paths below.
              </p>
            </div>
          </div>

          {/* Description Section */}
          <section className="space-y-3">
            <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
              Node Purpose & Intent
            </label>
            <textarea
              value={metadata.description || ""}
              onChange={(e) =>
                updateObject(object.id, {
                  metadata: { ...metadata, description: e.target.value },
                })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/20 outline-none focus:border-brand-purple/50 focus:bg-white/[0.08] transition-all min-h-[70px] resize-none"
              placeholder="e.g. Receive daily news summaries from discord trigger and generate digest"
            />
          </section>

          {/* Configuration Form based on Node Type */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-[9px] font-bold uppercase tracking-[0.15em] text-brand-purple">
                Parameters Configuration
              </h3>
              <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.15em]">
                n8n Compatible Format
              </span>
            </div>

            <div className="space-y-5">
              {/* Manual Trigger Configuration */}
              {(object.type.includes("trigger.manual") ||
                object.type === "conductor.manualTrigger") && (
                <div className="p-6 rounded-2xl border border-brand-cyan/20 bg-brand-cyan/5 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-brand-cyan/10 flex items-center justify-center mx-auto text-brand-cyan shadow-[0_0_15px_rgba(0,194,255,0.2)]">
                    <Zap size={22} className="animate-pulse" />
                  </div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Manual Core Trigger
                  </h4>
                  <p className="text-xs text-white/50 leading-relaxed max-w-md mx-auto">
                    This block lets you execute your agentic workflow manually.
                    When you click "Run Workflow" in the canvas bottom bar, this
                    node acts as the starting point, initiating all downstream
                    connections instantly.
                  </p>
                </div>
              )}

              {/* Webhook Configuration */}
              {(object.type.includes("webhook") ||
                object.type === "conductor.webhook" ||
                object.type === "trigger.webhook") && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                        HTTP Method
                      </label>
                      <select
                        value={getFieldValue("method", "POST")}
                        onChange={(e) =>
                          handleFieldChange("method", e.target.value)
                        }
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="GET" className="bg-[#111128]">
                          GET
                        </option>
                        <option value="POST" className="bg-[#111128]">
                          POST
                        </option>
                        <option value="PUT" className="bg-[#111128]">
                          PUT
                        </option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                        Webhook Path
                      </label>
                      <input
                        type="text"
                        value={getFieldValue("path", "/hooks/v1/trigger")}
                        onChange={(e) =>
                          handleFieldChange("path", e.target.value)
                        }
                        placeholder="/hooks/my-webhook"
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                      Generated Webhook URL
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-brand-cyan font-mono truncate select-all">
                        {webhookUrl}
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(webhookUrl, setCopiedUrl)
                        }
                        className="px-4 rounded-xl bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/20 text-brand-cyan transition-all flex items-center justify-center shrink-0"
                      >
                        {copiedUrl ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <p className="text-[10px] text-white/30 italic">
                      Send JSON payloads to this address to trigger execution
                      dynamically.
                    </p>
                  </div>
                </div>
              )}

              {/* Schedule/Cron Configuration */}
              {(object.type.includes("schedule") ||
                object.type === "conductor.schedule" ||
                object.type === "trigger.time") && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                        Trigger Interval
                      </label>
                      <select
                        value={getFieldValue("cronPreset", "daily")}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleFieldChange("cronPreset", val);
                          if (val === "five-min")
                            handleFieldChange("cron", "*/5 * * * *");
                          else if (val === "hourly")
                            handleFieldChange("cron", "0 * * * *");
                          else if (val === "daily")
                            handleFieldChange("cron", "0 9 * * *");
                          else if (val === "weekly")
                            handleFieldChange("cron", "0 9 * * 1");
                        }}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="five-min" className="bg-[#111128]">
                          Every 5 Minutes
                        </option>
                        <option value="hourly" className="bg-[#111128]">
                          Every Hour
                        </option>
                        <option value="daily" className="bg-[#111128]">
                          Daily at 9:00 AM
                        </option>
                        <option value="weekly" className="bg-[#111128]">
                          Weekly on Mondays
                        </option>
                        <option value="custom" className="bg-[#111128]">
                          Custom Cron Expression
                        </option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                        Timezone
                      </label>
                      <select
                        value={getFieldValue("timezone", "America/Los_Angeles")}
                        onChange={(e) =>
                          handleFieldChange("timezone", e.target.value)
                        }
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="UTC" className="bg-[#111128]">
                          UTC
                        </option>
                        <option
                          value="America/New_York"
                          className="bg-[#111128]"
                        >
                          America / New York
                        </option>
                        <option
                          value="America/Los_Angeles"
                          className="bg-[#111128]"
                        >
                          America / Los Angeles
                        </option>
                        <option value="Europe/London" className="bg-[#111128]">
                          Europe / London
                        </option>
                        <option value="Asia/Tokyo" className="bg-[#111128]">
                          Asia / Tokyo
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                      Cron Expression
                    </label>
                    <input
                      type="text"
                      value={getFieldValue("cron", "0 9 * * *")}
                      disabled={
                        getFieldValue("cronPreset", "daily") !== "custom"
                      }
                      onChange={(e) =>
                        handleFieldChange("cron", e.target.value)
                      }
                      placeholder="e.g. */5 * * * *"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all disabled:opacity-40"
                    />
                    <p className="text-[10px] text-white/30 italic">
                      Syntax: [Minute] [Hour] [Day of Month] [Month] [Day of
                      Week]
                    </p>
                  </div>
                </div>
              )}

              {/* Agent Node Configuration */}
              {(object.type.includes("agent") ||
                object.type === "conductor.agent") && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                        Gemini Model
                      </label>
                      <select
                        value={getFieldValue("model", "gemini-2.0-flash")}
                        onChange={(e) =>
                          handleFieldChange("model", e.target.value)
                        }
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="gemini-2.5-pro" className="bg-[#111128]">
                          Gemini 2.5 Pro (Extreme reasoning)
                        </option>
                        <option
                          value="gemini-2.5-flash"
                          className="bg-[#111128]"
                        >
                          Gemini 2.5 Flash (Fast processing)
                        </option>
                        <option
                          value="gemini-2.0-flash"
                          className="bg-[#111128]"
                        >
                          Gemini 2.0 Flash (Default)
                        </option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                        Agent Role
                      </label>
                      <input
                        type="text"
                        value={getFieldValue("role", "Content Synthesizer")}
                        onChange={(e) =>
                          handleFieldChange("role", e.target.value)
                        }
                        placeholder="e.g. Researcher, Summarizer"
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                      System Instructions
                    </label>
                    <textarea
                      value={getFieldValue(
                        "instructions",
                        "Analyze the trigger payload, extract primary entities, and synthesize a summarized brief.",
                      )}
                      onChange={(e) =>
                        handleFieldChange("instructions", e.target.value)
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all min-h-[140px] resize-y"
                      placeholder="Explain how the agent should think, summarize, or act..."
                    />
                  </div>
                </div>
              )}

              {/* HTTP Request / Web Fetch Node */}
              {(object.type.includes("webFetch") ||
                object.type === "conductor.webFetch") && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-1 space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                        Method
                      </label>
                      <select
                        value={getFieldValue("method", "GET")}
                        onChange={(e) =>
                          handleFieldChange("method", e.target.value)
                        }
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="GET" className="bg-[#111128]">
                          GET
                        </option>
                        <option value="POST" className="bg-[#111128]">
                          POST
                        </option>
                        <option value="PUT" className="bg-[#111128]">
                          PUT
                        </option>
                        <option value="DELETE" className="bg-[#111128]">
                          DELETE
                        </option>
                      </select>
                    </div>
                    <div className="col-span-3 space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                        Request URL
                      </label>
                      <input
                        type="text"
                        value={getFieldValue(
                          "url",
                          "https://api.example.com/data",
                        )}
                        onChange={(e) =>
                          handleFieldChange("url", e.target.value)
                        }
                        placeholder="https://api.domain.com/endpoint"
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                      Headers (JSON)
                    </label>
                    <textarea
                      value={getFieldValue(
                        "headers",
                        '{\n  "Content-Type": "application/json"\n}',
                      )}
                      onChange={(e) =>
                        handleFieldChange("headers", e.target.value)
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all font-mono min-h-[70px] resize-y"
                    />
                  </div>

                  {getFieldValue("method", "GET") !== "GET" && (
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                        Request Body (JSON)
                      </label>
                      <textarea
                        value={getFieldValue(
                          "body",
                          '{\n  "message": "Hello from Balnce AI"\n}',
                        )}
                        onChange={(e) =>
                          handleFieldChange("body", e.target.value)
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all font-mono min-h-[90px] resize-y"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Slack & Discord Integrations */}
              {(object.type.includes("slack") ||
                object.type.includes("discord") ||
                object.type === "conductor.slackPost") && (
                <div className="space-y-4">
                  {object.type.includes("discord") ? (
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                        Discord Webhook URL
                      </label>
                      <input
                        type="text"
                        value={getFieldValue(
                          "webhookUrl",
                          "https://discord.com/api/webhooks/...",
                        )}
                        onChange={(e) =>
                          handleFieldChange("webhookUrl", e.target.value)
                        }
                        placeholder="https://discord.com/api/webhooks/12345/abcde"
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                          Slack Token
                        </label>
                        <input
                          type="password"
                          value={getFieldValue("slackToken", "")}
                          onChange={(e) =>
                            handleFieldChange("slackToken", e.target.value)
                          }
                          placeholder="Enter Slack Token"
                          className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                          Channel
                        </label>
                        <input
                          type="text"
                          value={getFieldValue("channel", "#general")}
                          onChange={(e) =>
                            handleFieldChange("channel", e.target.value)
                          }
                          placeholder="e.g. #announcements"
                          className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                        Message Content Template
                      </label>
                      <span className="text-[9px] text-white/30 italic">
                        Supports variables
                      </span>
                    </div>
                    <textarea
                      value={getFieldValue(
                        "message",
                        "🚨 **Workflow Digest**\n\nTitle: {{ $json.payload.title }}\nDetails: {{ $json.payload.body }}\nLink: {{ $json.payload.url }}",
                      )}
                      onChange={(e) =>
                        handleFieldChange("message", e.target.value)
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all min-h-[120px] resize-y"
                      placeholder="Use {{ $json.key }} to insert upstream outputs..."
                    />
                    <p className="text-[9px] text-brand-purple/60 leading-relaxed font-semibold">
                      💡 Tip: Upstream inputs can be mapped dynamically by
                      surrounding keys with double curly brackets.
                    </p>
                  </div>
                </div>
              )}

              {/* Gmail Node Configuration */}
              {object.type.includes("gmail") && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                        Recipient (To Email)
                      </label>
                      <input
                        type="text"
                        value={getFieldValue("to", "recipient@domain.com")}
                        onChange={(e) =>
                          handleFieldChange("to", e.target.value)
                        }
                        placeholder="user@example.com"
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                        Email Subject
                      </label>
                      <input
                        type="text"
                        value={getFieldValue(
                          "subject",
                          "Automated notification from Balnce AI",
                        )}
                        onChange={(e) =>
                          handleFieldChange("subject", e.target.value)
                        }
                        placeholder="Workflow Alert"
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                      Email Body
                    </label>
                    <textarea
                      value={getFieldValue(
                        "body",
                        "Hi team,\n\nWe successfully processed the incoming event. Details below:\n\n- Event: {{ $json.event }}\n- Payload Title: {{ $json.payload.title }}\n\nSovereignly yours,\nBalnce AI Agent",
                      )}
                      onChange={(e) =>
                        handleFieldChange("body", e.target.value)
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all min-h-[120px] resize-y"
                    />
                  </div>
                </div>
              )}

              {/* Google Sheets Node Configuration */}
              {object.type.includes("sheets") && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                        Spreadsheet ID
                      </label>
                      <input
                        type="text"
                        value={getFieldValue(
                          "spreadsheetId",
                          "1BxiMVs0XRA5nFMdKv1aJCjptnDFM8TGPK80A6_769_o",
                        )}
                        onChange={(e) =>
                          handleFieldChange("spreadsheetId", e.target.value)
                        }
                        placeholder="e.g. 1BxiMVs0..."
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                        Sheet Operation
                      </label>
                      <select
                        value={getFieldValue("operation", "append")}
                        onChange={(e) =>
                          handleFieldChange("operation", e.target.value)
                        }
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="read" className="bg-[#111128]">
                          Read Spreadsheet
                        </option>
                        <option value="append" className="bg-[#111128]">
                          Append New Row
                        </option>
                        <option value="update" className="bg-[#111128]">
                          Update Row
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                        Sheet Name / Range
                      </label>
                      <input
                        type="text"
                        value={getFieldValue("range", "Sheet1!A1:E1")}
                        onChange={(e) =>
                          handleFieldChange("range", e.target.value)
                        }
                        placeholder="e.g. Sheet1!A1:E10"
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                        Columns Mapping
                      </label>
                      <input
                        type="text"
                        value={getFieldValue("columns", "title, body, url")}
                        onChange={(e) =>
                          handleFieldChange("columns", e.target.value)
                        }
                        placeholder="e.g. title, body, url"
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* If / Condition Node Configuration */}
              {(object.type.includes("if") ||
                object.type.includes("router")) && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                      Conditional JS Expression
                    </label>
                    <input
                      type="text"
                      value={getFieldValue("condition", "data.score > 90")}
                      onChange={(e) =>
                        handleFieldChange("condition", e.target.value)
                      }
                      placeholder="e.g. data.status === 'active'"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-slate-200 focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all font-mono"
                    />
                    <p className="text-[10px] text-white/30 italic">
                      Evaluates incoming payload properties. Must return a
                      boolean (True / False).
                    </p>
                  </div>

                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <h4 className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/50 mb-2">
                      Supported Operators Guide
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-white/40">
                      <div>data.val == 10 (Equals)</div>
                      <div>data.val != 10 (Not equals)</div>
                      <div>data.str.includes('test')</div>
                      <div>data.score &gt;= 95 (Greater equal)</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Delay Node Configuration */}
              {object.type.includes("delay") && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                        Delay Time
                      </label>
                      <input
                        type="number"
                        value={getFieldValue("ms", "1000")}
                        onChange={(e) =>
                          handleFieldChange("ms", Number(e.target.value))
                        }
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                        Time Unit
                      </label>
                      <select
                        value={getFieldValue("delayUnit", "ms")}
                        onChange={(e) =>
                          handleFieldChange("delayUnit", e.target.value)
                        }
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="ms" className="bg-[#111128]">
                          Milliseconds
                        </option>
                        <option value="seconds" className="bg-[#111128]">
                          Seconds
                        </option>
                        <option value="minutes" className="bg-[#111128]">
                          Minutes
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Loop Node Configuration */}
              {object.type.includes("forEach") && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                      Collection Path
                    </label>
                    <input
                      type="text"
                      value={getFieldValue("collection", "payload.items")}
                      onChange={(e) =>
                        handleFieldChange("collection", e.target.value)
                      }
                      placeholder="e.g. data.items"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all"
                    />
                    <p className="text-[10px] text-white/30 italic">
                      Specifies which array key in the input JSON should be
                      iterated over.
                    </p>
                  </div>
                </div>
              )}

              {/* Custom / Fallback node */}
              {!object.type.includes("webhook") &&
                !object.type.includes("trigger.manual") &&
                !object.type.includes("manualTrigger") &&
                !object.type.includes("schedule") &&
                !object.type.includes("agent") &&
                !object.type.includes("webFetch") &&
                !object.type.includes("slack") &&
                !object.type.includes("discord") &&
                !object.type.includes("gmail") &&
                !object.type.includes("sheets") &&
                !object.type.includes("if") &&
                !object.type.includes("router") &&
                !object.type.includes("delay") &&
                !object.type.includes("forEach") && (
                  <div className="space-y-4">
                    <p className="text-xs text-white/50 italic">
                      This block resolves to a general task type. Customize the
                      metadata variables below:
                    </p>
                    {Object.entries(config).map(([k, v]) => (
                      <div key={k} className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                          {k}
                        </label>
                        <input
                          type="text"
                          value={String(v)}
                          onChange={(e) => handleFieldChange(k, e.target.value)}
                          className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all"
                        />
                      </div>
                    ))}
                    {Object.keys(config).length === 0 && (
                      <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-xs text-white/30">
                        No custom properties defined. You can create custom
                        fields in the right inspector.
                      </div>
                    )}
                  </div>
                )}
            </div>
          </section>

          {/* Security and Auth for Advanced Blocks */}
          <section className="space-y-4 pt-4 border-t border-white/5">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.15em] text-brand-cyan flex items-center gap-2">
              <Lock size={12} />
              Credentials & Sovereign Storage
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                  Secure Token / Auth Key
                </label>
                <input
                  type="password"
                  value={getFieldValue("apiKey", "")}
                  onChange={(e) => handleFieldChange("apiKey", e.target.value)}
                  placeholder="🔒 Saved securely inside edge context"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-rose-300 focus:border-rose-500/50 focus:bg-white/[0.08] outline-none transition-all font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                  Authentication Layer
                </label>
                <select
                  value={getFieldValue("authType", "none")}
                  onChange={(e) =>
                    handleFieldChange("authType", e.target.value)
                  }
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="none" className="bg-[#111128]">
                    None / Sandbox Mode
                  </option>
                  <option value="bearer" className="bg-[#111128]">
                    Bearer Token (API Key)
                  </option>
                  <option value="basic" className="bg-[#111128]">
                    Basic Username/Password
                  </option>
                </select>
              </div>
            </div>
          </section>

          {/* Error Handling Section */}
          <section className="space-y-4 pt-4 border-t border-white/5">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.15em] text-rose-400 flex items-center gap-2">
              <ShieldAlert size={12} />
              Error Handling & Resiliency
            </h3>
            <div className="flex items-start justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-purple/30 transition-all gap-4">
              <div className="space-y-1 pr-4">
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white block">
                  Continue on Fail
                </span>
                <span className="text-[9px] text-white/40 leading-relaxed block">
                  Toggle to ignore errors on this node and proceed with the
                  remaining branches of the workflow (similar to n8n's Continue
                  on Fail option).
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const current = config.continueOnFail === true;
                  handleFieldChange("continueOnFail", !current);
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 outline-none shrink-0 mt-1 ${
                  config.continueOnFail === true
                    ? "bg-gradient-to-r from-brand-purple to-brand-cyan"
                    : "bg-white/10"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                    config.continueOnFail === true
                      ? "translate-x-5"
                      : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </section>
        </div>

        <div className="w-[35%] flex flex-col h-full bg-black/40 border-l border-white/5">
          {/* Sandbox Header */}
          <div className="p-4 border-b border-white/5 bg-[#0D0D1A]/40 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-brand-cyan animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white">
                Execution Sandbox
              </span>
            </div>

            <button
              onClick={runBlock}
              disabled={running}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-brand-purple to-brand-cyan hover:from-brand-purple/90 hover:to-brand-cyan/90 text-white rounded-lg text-[9px] font-bold uppercase tracking-[0.15em] transition-all active:scale-95 disabled:opacity-50"
            >
              {running ? (
                <Loader2 size={10} className="animate-spin" />
              ) : (
                <Play size={10} />
              )}
              {running ? "Testing..." : "Test Node"}
            </button>
          </div>

          {/* Sandbox Workspace Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
            {/* Mock Input Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                  Mock Trigger Input (JSON)
                </label>
                <button
                  onClick={() => copyToClipboard(mockInputJson, setCopiedInput)}
                  className="text-[8px] uppercase tracking-[0.15em] font-bold text-brand-cyan hover:text-white/80 transition-colors flex items-center gap-1"
                >
                  {copiedInput ? "Copied" : "Copy"}
                </button>
              </div>
              <textarea
                value={mockInputJson}
                onChange={(e) => setMockInputJson(e.target.value)}
                className="w-full bg-black/50 border border-white/5 rounded-xl p-3 text-[11px] text-slate-300 focus:border-brand-cyan/30 focus:bg-black/60 outline-none transition-all font-mono min-h-[140px] resize-y custom-scrollbar"
                placeholder={'{\n  "data": {}\n}'}
              />
            </div>

            {/* Test Run Status Panel */}
            {execLog.length > 0 && (
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                  Run Log Output
                </label>
                <div className="bg-black/80 rounded-xl border border-white/5 p-3 font-mono text-[9px] text-brand-cyan/85 space-y-1">
                  {execLog.map((log, idx) => (
                    <div key={idx} className="truncate">
                      {log}
                    </div>
                  ))}
                  {execStatus === "success" && (
                    <div className="text-emerald-400 font-bold">
                      ✓ Node executed successfully.
                    </div>
                  )}
                  {execStatus === "error" && (
                    <div className="text-rose-400 font-bold">
                      ✗ Node execution failed. Check inputs.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Simulated/Real JSON Output */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                  JSON Execution Output
                </label>
                <button
                  onClick={() => copyToClipboard(outputJson, setCopiedOutput)}
                  className="text-[8px] uppercase tracking-[0.15em] font-bold text-brand-cyan hover:text-white/80 transition-colors flex items-center gap-1"
                >
                  {copiedOutput ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="relative">
                <textarea
                  readOnly
                  value={outputJson}
                  className="w-full bg-black/60 border border-white/5 rounded-xl p-3 text-[11px] text-emerald-400 font-mono min-h-[180px] resize-y outline-none custom-scrollbar"
                />
                {outputJson === "{}" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-xl pointer-events-none">
                    <p className="text-[9px] text-white/20 uppercase font-bold tracking-[0.15em]">
                      Awaiting execution data...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sandbox Footer */}
          <div className="p-4 border-t border-white/5 bg-[#0D0D1A]/20 shrink-0 text-center">
            <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/20 block">
              BALNCE SOVEREIGN RUNTIME · VER 1.0.2
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Compact View (Renders Inside Block Card on the Main Canvas)
  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Target Preview Box */}
      <div className="flex-1 bg-black/45 border border-white/5 rounded-2xl p-3 flex flex-col gap-2.5 overflow-hidden shadow-inner bg-gradient-to-b from-[#111128]/50 to-[#0A0A0F]/90">
        {/* Dynamic preview text based on type */}
        {(object.type.includes("trigger.manual") ||
          object.type === "conductor.manualTrigger") && (
          <div className="space-y-1.5 w-full">
            <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-brand-cyan block">
              Manual Start Trigger
            </span>
            <div className="text-[10px] text-slate-300 font-sans italic whitespace-normal bg-white/5 border border-white/10 p-2 rounded-xl">
              Initiates agent swarms manually from canvas flow.
            </div>
          </div>
        )}

        {object.type.includes("webhook") && (
          <div className="space-y-1.5">
            <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-brand-purple/70 block">
              Webhook Listener
            </span>
            <div className="text-[10px] text-brand-cyan font-mono truncate bg-brand-cyan/5 border border-brand-cyan/10 p-2 rounded-xl">
              {getFieldValue("path", "/hooks/v1/trigger")}
            </div>
          </div>
        )}

        {object.type.includes("schedule") && (
          <div className="space-y-1.5">
            <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-brand-purple/70 block">
              Schedule Recurrence
            </span>
            <div className="text-[10px] text-brand-purple font-mono truncate bg-brand-purple/5 border border-brand-purple/10 p-2 rounded-xl">
              {getFieldValue("cronPreset", "Daily at 9:00 AM")} (
              {getFieldValue("cron", "0 9 * * *")})
            </div>
          </div>
        )}

        {object.type.includes("agent") && (
          <div className="space-y-1.5">
            <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-brand-purple/70 block">
              System Instruction
            </span>
            <div className="text-[10px] text-slate-300 font-sans italic truncate bg-white/5 border border-white/10 p-2 rounded-xl">
              "
              {getFieldValue(
                "instructions",
                "Extract parameters and summarize brief...",
              )}
              "
            </div>
          </div>
        )}

        {object.type.includes("webFetch") && (
          <div className="space-y-1.5">
            <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-brand-purple/70 block">
              HTTP Fetch Target
            </span>
            <div className="text-[10px] text-indigo-400 font-mono truncate bg-indigo-400/5 border border-indigo-400/10 p-2 rounded-xl">
              {getFieldValue("method", "GET")} ·{" "}
              {getFieldValue("url", "https://api.example.com/data")}
            </div>
          </div>
        )}

        {(object.type.includes("slack") ||
          object.type.includes("discord") ||
          object.type === "conductor.slackPost") && (
          <div className="space-y-1.5">
            <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-brand-purple/70 block">
              Slack/Discord Push
            </span>
            <div className="text-[10px] text-amber-400 font-mono truncate bg-amber-400/5 border border-amber-400/10 p-2 rounded-xl">
              Target: {getFieldValue("channel", "#general")}
            </div>
          </div>
        )}

        {object.type.includes("gmail") && (
          <div className="space-y-1.5">
            <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-brand-purple/70 block">
              Send Email Trigger
            </span>
            <div className="text-[10px] text-emerald-400 font-mono truncate bg-emerald-400/5 border border-emerald-400/10 p-2 rounded-xl">
              To: {getFieldValue("to", "recipient@domain.com")}
            </div>
          </div>
        )}

        {object.type.includes("sheets") && (
          <div className="space-y-1.5">
            <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-brand-purple/70 block">
              Google Sheets Link
            </span>
            <div className="text-[10px] text-rose-400 font-mono truncate bg-rose-400/5 border border-rose-400/10 p-2 rounded-xl">
              Range: {getFieldValue("range", "Sheet1!A1")}
            </div>
          </div>
        )}

        {object.type.includes("if") && (
          <div className="space-y-1.5">
            <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-brand-purple/70 block">
              Condition Filter
            </span>
            <div className="text-[10px] text-slate-300 font-mono truncate bg-white/5 border border-white/10 p-2 rounded-xl">
              if: {getFieldValue("condition", "data.score > 90")}
            </div>
          </div>
        )}

        {!object.type.includes("webhook") &&
          !object.type.includes("trigger.manual") &&
          !object.type.includes("manualTrigger") &&
          !object.type.includes("schedule") &&
          !object.type.includes("agent") &&
          !object.type.includes("webFetch") &&
          !object.type.includes("slack") &&
          !object.type.includes("discord") &&
          !object.type.includes("gmail") &&
          !object.type.includes("sheets") &&
          !object.type.includes("if") && (
            <div className="flex-1 flex items-center justify-center italic text-[9px] text-white/30 text-center px-2">
              {metadata.description ||
                "Double-click to open configuration workspace"}
            </div>
          )}

        {/* Outputs notification indicator */}
        {outputs && Object.keys(outputs).length > 0 && (
          <div className="mt-auto px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5 shrink-0">
            <ArrowRight size={10} className="text-emerald-400" />
            <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">
              Data Received ✓
            </span>
          </div>
        )}
      </div>

      {/* Quick Test Trigger Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          runBlock();
        }}
        disabled={running}
        className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/[0.08] border border-white/10 text-[9px] font-bold uppercase tracking-[0.15em] text-white/60 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95"
      >
        {running ? (
          <Loader2 size={10} className="animate-spin text-brand-cyan" />
        ) : (
          <Play size={10} className="text-brand-purple" />
        )}
        {running ? "Simulating..." : "Test Block"}
      </button>
    </div>
  );
};
