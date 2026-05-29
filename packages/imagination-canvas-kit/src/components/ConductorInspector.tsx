// File: packages/imagination-canvas-kit/src/components/ConductorInspector.tsx

import React, { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Settings,
  Zap,
  Globe,
  Bot,
  Clock,
  GitBranch,
  Database,
  AlertTriangle,
  Repeat,
  Router,
  Send,
  FileText,
  Mail,
  Sheet,
} from "lucide-react";
import { useSelectionStore } from "../state/selectionStore";
import { useCanvasStore } from "../state/canvasStore";
import { BlockAssistantPanel } from "./BlockAssistantPanel"; // New import
import { buildManuscriptArtifact } from "@iem/core";

// --- Field Definition Types ---
type FieldType = "text" | "textarea" | "number" | "select";

interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
}

// --- Block Type → Fields Mapping ---
const CONDUCTOR_FIELDS: Record<string, FieldDef[]> = {
  "trigger.manual": [
    {
      key: "description",
      label: "Trigger Description",
      type: "text",
      placeholder: "Trigger this workflow execution manually.",
    },
  ],
  "conductor.manualTrigger": [
    {
      key: "description",
      label: "Trigger Description",
      type: "text",
      placeholder: "Trigger this workflow execution manually.",
    },
  ],
  note: [
    {
      key: "text",
      label: "Note Content",
      type: "textarea",
      placeholder: "Type a note...",
    },
  ],
  "conductor.webhook": [
    {
      key: "path",
      label: "Webhook Path",
      type: "text",
      placeholder: "/hooks/my-trigger",
    },
  ],
  "trigger.webhook": [
    {
      key: "path",
      label: "Webhook Path",
      type: "text",
      placeholder: "/hooks/my-trigger",
    },
  ],
  "conductor.schedule": [
    {
      key: "cron",
      label: "Cron Expression",
      type: "text",
      placeholder: "0 9 * * *",
    },
    {
      key: "timezone",
      label: "Timezone",
      type: "text",
      placeholder: "America/Los_Angeles",
    },
  ],
  "trigger.time": [
    {
      key: "cron",
      label: "Cron Expression",
      type: "text",
      placeholder: "0 9 * * *",
    },
    {
      key: "timezone",
      label: "Timezone",
      type: "text",
      placeholder: "America/Los_Angeles",
    },
  ],
  "conductor.agent": [
    {
      key: "instructions",
      label: "Agent Instructions",
      type: "textarea",
      placeholder: "Describe what this agent should do...",
    },
    {
      key: "model",
      label: "Model",
      type: "select",
      options: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash"],
    },
  ],
  "conductor.saas": [
    {
      key: "provider",
      label: "Provider",
      type: "select",
      options: ["slack", "notion", "gmail", "discord", "sheets"],
    },
    {
      key: "action",
      label: "Action",
      type: "text",
      placeholder: "sendMessage",
    },
    {
      key: "params",
      label: "Parameters (JSON)",
      type: "textarea",
      placeholder: '{"channel": "#general"}',
    },
  ],
  "conductor.webFetch": [
    {
      key: "url",
      label: "URL",
      type: "text",
      placeholder: "https://api.example.com/data",
    },
    {
      key: "method",
      label: "Method",
      type: "select",
      options: ["GET", "POST", "PUT", "DELETE"],
    },
    {
      key: "body",
      label: "Request Body",
      type: "textarea",
      placeholder: "Optional JSON body",
    },
  ],
  "conductor.slackPost": [
    { key: "channel", label: "Channel", type: "text", placeholder: "#general" },
    {
      key: "message",
      label: "Message Template",
      type: "textarea",
      placeholder: "Hello from the workflow!",
    },
  ],
  "conductor.notionCreate": [
    {
      key: "databaseId",
      label: "Database ID",
      type: "text",
      placeholder: "abc123...",
    },
    {
      key: "properties",
      label: "Properties (JSON)",
      type: "textarea",
      placeholder: '{"Name": {"title": [{"text": {"content": "New Page"}}]}}',
    },
  ],
  "conductor.if": [
    {
      key: "condition",
      label: "Condition",
      type: "text",
      placeholder: 'data.status === "active"',
    },
  ],
  "conductor.router": [
    {
      key: "condition",
      label: "Routing Rule",
      type: "text",
      placeholder: 'data.status === "active"',
    },
  ],
  "conductor.forEach": [
    {
      key: "collection",
      label: "Collection Path",
      type: "text",
      placeholder: "$previous.items",
    },
    {
      key: "loopTarget",
      label: "Loop Target",
      type: "text",
      placeholder: "processItem",
    },
  ],
  "conductor.delay": [
    { key: "ms", label: "Delay (ms)", type: "number", placeholder: "1000" },
  ],
  "conductor.state": [
    { key: "key", label: "State Key", type: "text", placeholder: "myVariable" },
    {
      key: "value",
      label: "Value",
      type: "text",
      placeholder: "default value",
    },
  ],
  "conductor.errorBoundary": [
    {
      key: "node",
      label: "Target Node ID",
      type: "text",
      placeholder: "node-to-protect",
    },
  ],
  "conductor.subGraph": [
    {
      key: "graphId",
      label: "Sub-Graph ID",
      type: "text",
      placeholder: "graph-abc123",
    },
  ],
};

// Prefix-based matching for SaaS integration blocks
const PREFIX_FIELDS: Record<string, FieldDef[]> = {
  "discord.": [
    {
      key: "webhookUrl",
      label: "Discord Webhook URL",
      type: "text",
      placeholder: "https://discord.com/api/webhooks/...",
    },
    {
      key: "message",
      label: "Message",
      type: "textarea",
      placeholder: "Hello Discord!",
    },
  ],
  "slack.": [
    { key: "channel", label: "Channel", type: "text", placeholder: "#general" },
    {
      key: "message",
      label: "Message",
      type: "textarea",
      placeholder: "Hello Slack!",
    },
  ],
  "gmail.": [
    {
      key: "to",
      label: "To Email",
      type: "text",
      placeholder: "user@example.com",
    },
    {
      key: "subject",
      label: "Subject",
      type: "text",
      placeholder: "Workflow notification",
    },
    {
      key: "body",
      label: "Body",
      type: "textarea",
      placeholder: "Email content...",
    },
  ],
  "sheets.": [
    {
      key: "spreadsheetId",
      label: "Spreadsheet ID",
      type: "text",
      placeholder: "1BxiMVs0...",
    },
    {
      key: "range",
      label: "Range",
      type: "text",
      placeholder: "Sheet1!A1:C10",
    },
  ],
  "trello.": [
    {
      key: "boardId",
      label: "Board ID",
      type: "text",
      placeholder: "board-id",
    },
    { key: "listId", label: "List ID", type: "text", placeholder: "list-id" },
    {
      key: "cardName",
      label: "Card Name",
      type: "text",
      placeholder: "New Task",
    },
  ],
  "zoom.": [
    {
      key: "topic",
      label: "Meeting Topic",
      type: "text",
      placeholder: "Weekly Sync",
    },
    {
      key: "when",
      label: "When",
      type: "text",
      placeholder: "next Tuesday 2pm",
    },
  ],
  "calendly.": [
    {
      key: "eventType",
      label: "Event Type",
      type: "text",
      placeholder: "30-min-intro",
    },
  ],
};

// Icon map for block categories
const TYPE_ICONS: Record<string, any> = {
  "trigger.manual": Zap,
  "conductor.manualTrigger": Zap,
  "conductor.webhook": Zap,
  "trigger.webhook": Zap,
  "conductor.schedule": Clock,
  "trigger.time": Clock,
  "conductor.agent": Bot,
  "conductor.webFetch": Globe,
  "conductor.slackPost": Send,
  "conductor.notionCreate": FileText,
  "conductor.if": GitBranch,
  "conductor.router": Router,
  "conductor.forEach": Repeat,
  "conductor.delay": Clock,
  "conductor.state": Database,
  "conductor.errorBoundary": AlertTriangle,
  "conductor.saas": Globe,
};

function resolveIcon(type: string) {
  if (TYPE_ICONS[type]) return TYPE_ICONS[type];
  for (const prefix of Object.keys(PREFIX_FIELDS)) {
    if (type.startsWith(prefix)) {
      if (prefix === "discord.") return Send;
      if (prefix === "slack.") return Send;
      if (prefix === "gmail.") return Mail;
      if (prefix === "sheets.") return Sheet;
      return Globe;
    }
  }
  return Settings;
}

function resolveFields(type: string): FieldDef[] {
  if (CONDUCTOR_FIELDS[type]) return CONDUCTOR_FIELDS[type];
  for (const [prefix, fields] of Object.entries(PREFIX_FIELDS)) {
    if (type.startsWith(prefix)) return fields;
  }
  return [];
}

// --- Main Component ---
export const ConductorInspector: React.FC = () => {
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const clearSelection = useSelectionStore((s) => s.clearSelection);
  const objects = useCanvasStore((s) => s.objects);
  const updateObject = useCanvasStore((s) => s.updateObject);

  const selectedId = selectedIds.length === 1 ? selectedIds[0] : null;
  const object = selectedId ? objects[selectedId] : null;

  const handleFieldChange = useCallback(
    (fieldKey: string, value: string | number | boolean) => {
      if (!selectedId || !object) return;
      const objType = (object as any).type;
      if (objType === "note" && fieldKey === "text") {
        const textVal = String(value);
        const artifact = buildManuscriptArtifact(selectedId, {
          title: ((object as any).metadata?.label as string) || "Note",
          body: textVal,
          format: "plain",
        });
        updateObject(selectedId, {
          metadata: {
            ...(object as any).metadata,
            text: textVal,
            outputs: {
              ...((object as any).metadata?.outputs || {}),
              manuscript: artifact,
            },
          },
        });
        return;
      }
      updateObject(selectedId, {
        metadata: {
          ...(object as any).metadata,
          config: {
            ...((object as any).metadata?.config || {}),
            [fieldKey]: value,
          },
          inputs: {
            ...((object as any).metadata?.inputs || {}),
            [fieldKey]: value,
          },
        },
      });
    },
    [selectedId, object, updateObject],
  );

  const getFieldValue = useCallback(
    (fieldKey: string): string => {
      if (!object) return "";
      const objType = (object as any).type;
      if (objType === "note" && fieldKey === "text") {
        return String((object as any).metadata?.text ?? "");
      }
      const config = (object as any).metadata?.config as
        | Record<string, unknown>
        | undefined;
      const inputs = (object as any).metadata?.inputs as
        | Record<string, unknown>
        | undefined;
      const meta = (object as any).metadata as
        | Record<string, unknown>
        | undefined;
      const val =
        config?.[fieldKey] ?? inputs?.[fieldKey] ?? meta?.[fieldKey] ?? "";
      return String(val);
    },
    [object],
  );

  const blockType = (object as any)?.type || "";
  const fields = resolveFields(blockType);
  const IconComponent = resolveIcon(blockType);
  const displayLabel =
    (object?.metadata?.label as string) ||
    (object?.metadata?.title as string) ||
    blockType.split(".").pop() ||
    "Block";

  const [activeTab, setActiveTab] = React.useState<"configure" | "assistant">(
    "configure",
  );

  return (
    <AnimatePresence>
      {object && (
        <motion.div
          key="conductor-inspector"
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 220 }}
          className="absolute right-4 top-4 bottom-24 w-80 z-[900] rounded-3xl bg-brand-bg-surface/95 backdrop-blur-2xl border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
        >
          {/* Gradient top edge */}
          <div className="h-[2px] w-full bg-gradient-to-r from-brand-purple via-brand-cyan to-brand-purple shrink-0" />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center shrink-0">
                <IconComponent size={16} className="text-brand-purple" />
              </div>
              <div className="overflow-hidden">
                <h3 className="text-sm font-bold text-white truncate">
                  {displayLabel}
                </h3>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-brand-purple/10 text-brand-purple text-[9px] font-bold tracking-wide">
                  {blockType}
                </span>
              </div>
            </div>
            <button
              onClick={clearSelection}
              className="p-1.5 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* Premium Glassmorphic Tab Bar */}
          <div className="flex px-4 border-b border-white/5 bg-white/[0.02] shrink-0">
            <button
              onClick={() => setActiveTab("configure")}
              className={`flex-1 py-3 text-center text-[10px] font-black uppercase tracking-[0.2em] transition-all relative outline-none ${
                activeTab === "configure"
                  ? "text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              Configure
              {activeTab === "configure" && (
                <motion.div
                  layoutId="active-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-purple to-brand-cyan shadow-[0_0_8px_rgba(123,92,234,0.8)]"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("assistant")}
              className={`flex-1 py-3 text-center text-[10px] font-black uppercase tracking-[0.2em] transition-all relative outline-none flex items-center justify-center gap-1.5 ${
                activeTab === "assistant"
                  ? "text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              <Bot
                size={11}
                className={
                  activeTab === "assistant"
                    ? "text-brand-cyan"
                    : "text-white/40"
                }
              />
              Block AI
              {activeTab === "assistant" && (
                <motion.div
                  layoutId="active-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-purple to-brand-cyan shadow-[0_0_8px_rgba(123,92,234,0.8)]"
                />
              )}
            </button>
          </div>

          {activeTab === "configure" ? (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {fields.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-brand-purple">
                    Configuration
                  </p>
                  <div className="space-y-3.5">
                    {fields.map((field) => (
                      <div key={field.key} className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                          {field.label}
                        </label>
                        {field.type === "text" && (
                          <input
                            type="text"
                            value={getFieldValue(field.key)}
                            onChange={(e) =>
                              handleFieldChange(field.key, e.target.value)
                            }
                            placeholder={field.placeholder}
                            className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder:text-white/20 focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all"
                          />
                        )}
                        {field.type === "number" && (
                          <input
                            type="number"
                            value={getFieldValue(field.key)}
                            onChange={(e) =>
                              handleFieldChange(
                                field.key,
                                Number(e.target.value),
                              )
                            }
                            placeholder={field.placeholder}
                            className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder:text-white/20 focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all"
                          />
                        )}
                        {field.type === "textarea" && (
                          <textarea
                            value={getFieldValue(field.key)}
                            onChange={(e) =>
                              handleFieldChange(field.key, e.target.value)
                            }
                            placeholder={field.placeholder}
                            rows={3}
                            className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder:text-white/20 focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all resize-y min-h-[80px]"
                          />
                        )}
                        {field.type === "select" && (
                          <select
                            value={getFieldValue(field.key)}
                            onChange={(e) =>
                              handleFieldChange(field.key, e.target.value)
                            }
                            className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none appearance-none cursor-pointer"
                          >
                            <option value="" className="bg-[#111128]">
                              Select...
                            </option>
                            {(field.options || []).map((opt) => (
                              <option
                                key={opt}
                                value={opt}
                                className="bg-[#111128]"
                              >
                                {opt}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40">
                    Block Properties
                  </p>
                  <div className="space-y-3.5">
                    {object.metadata &&
                      Object.entries(object.metadata)
                        .filter(
                          ([key]) =>
                            ![
                              "label",
                              "description",
                              "category",
                              "role",
                              "runtime",
                              "capabilities",
                            ].includes(key),
                        )
                        .map(([key, val]) => {
                          if (typeof val === "object" && val !== null) {
                            return (
                              <div key={key} className="space-y-1.5">
                                <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                                  {key}
                                </label>
                                <textarea
                                  value={JSON.stringify(val, null, 2)}
                                  onChange={(e) => {
                                    try {
                                      handleFieldChange(key, e.target.value);
                                    } catch {}
                                  }}
                                  rows={3}
                                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white/60 font-mono focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all resize-y min-h-[60px]"
                                />
                              </div>
                            );
                          }
                          return (
                            <div key={key} className="space-y-1.5">
                              <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 block">
                                {key}
                              </label>
                              <input
                                type="text"
                                value={String(val ?? "")}
                                onChange={(e) =>
                                  handleFieldChange(key, e.target.value)
                                }
                                className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder:text-white/20 focus:border-brand-purple/50 focus:bg-white/[0.08] outline-none transition-all"
                              />
                            </div>
                          );
                        })}
                  </div>
                </div>
              )}

              {/* Error Handling Section */}
              <div className="pt-5 border-t border-white/5 space-y-3">
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-rose-400">
                  Error Handling
                </p>
                <div className="flex items-start justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-purple/30 transition-all gap-4">
                  <div className="space-y-1 pr-2">
                    <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white block">
                      Continue on Fail
                    </span>
                    <span className="text-[9px] text-white/40 leading-relaxed block">
                      Keep executing downstream nodes even if this node
                      encounters an error.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const current =
                        object.metadata?.config?.continueOnFail === true;
                      handleFieldChange("continueOnFail", !current);
                    }}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 outline-none shrink-0 mt-0.5 ${
                      object.metadata?.config?.continueOnFail === true
                        ? "bg-gradient-to-r from-brand-purple to-brand-cyan"
                        : "bg-white/10"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                        object.metadata?.config?.continueOnFail === true
                          ? "translate-x-4"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Description display */}
              {object.metadata?.description && (
                <div className="pt-5 border-t border-white/5 space-y-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40">
                    Description
                  </p>
                  <p className="text-[11px] text-white/50 leading-relaxed">
                    {String(object.metadata.description)}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <BlockAssistantPanel
              selectedId={selectedId!}
              object={object!}
              onClose={clearSelection}
            />
          )}

          {/* Footer */}
          <div className="px-5 py-3 border-t border-white/5 shrink-0">
            <p className="text-[8px] text-white/20 text-center font-bold uppercase tracking-[0.15em]">
              Changes save automatically
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
