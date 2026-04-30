import {
  Handle,
  Position,
  NodeResizer,
  type NodeProps,
  useReactFlow,
} from "@xyflow/react";
import { useState } from "react";
import { Hammer, Palette, Wrench, TestTube, ArrowRight } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { NODE_CATALOG } from "./nodeCatalog";
import type { BaseNodeData } from "./types";
import type { UnifiedCanvasEdge, UnifiedCanvasNode } from "./canvasTypes";
import { runCreativeNode } from "../services/ai/creativeNodeService";
import { getNodeInputs } from "./workflow/inputResolution";
import {
  getRuntimeState,
  setRuntimeNodeInputs,
  setRuntimeNodeOutputs,
} from "./workflow/runtimeState";

const FORGE_META: Record<
  string,
  { icon: React.ElementType; color: string; label: string }
> = {
  "forge.architect": {
    icon: Wrench,
    color: "text-sky-400",
    label: "Architect",
  },
  "forge.designer": {
    icon: Palette,
    color: "text-pink-400",
    label: "Designer",
  },
  "forge.builder": { icon: Hammer, color: "text-orange-400", label: "Builder" },
  "forge.tester": {
    icon: TestTube,
    color: "text-emerald-400",
    label: "Tester",
  },
};

// Very lightweight syntax highlighting using pre-existing highlight.js
// We just apply CSS classes for keywords manually — no import needed for display
const CodeBlock = ({ code, language }: { code: string; language?: string }) => (
  <div className="rounded-xl border border-white/5 bg-black/60 overflow-hidden">
    <div className="px-3 py-1.5 border-b border-white/5 flex items-center justify-between">
      <span className="text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
        {language ?? "output"}
      </span>
      <div className="flex gap-1">
        {["bg-rose-500", "bg-amber-500", "bg-emerald-500"].map((c, i) => (
          <div key={i} className={`w-2 h-2 rounded-full ${c}/60`} />
        ))}
      </div>
    </div>
    <pre className="p-4 text-[10px] font-mono text-emerald-300/80 overflow-auto max-h-40 custom-scrollbar leading-relaxed whitespace-pre-wrap break-words">
      {code}
    </pre>
  </div>
);

// Test result row
const TestRow = ({ name, passed }: { name: string; passed: boolean }) => (
  <div
    className={`flex items-center justify-between px-3 py-2 rounded-lg ${
      passed
        ? "bg-emerald-500/10 border border-emerald-500/20"
        : "bg-rose-500/10 border border-rose-500/20"
    }`}
  >
    <span className="text-[10px] font-medium text-brand-text-body truncate">
      {name}
    </span>
    <span
      className={`text-[9px] font-black uppercase tracking-widest shrink-0 ml-2 ${
        passed ? "text-emerald-400" : "text-rose-400"
      }`}
    >
      {passed ? "PASS" : "FAIL"}
    </span>
  </div>
);

export default function ForgeNode({ id, data, selected }: NodeProps) {
  const { updateNodeData, getNodes, getEdges } = useReactFlow();
  const [running, setRunning] = useState(false);
  const { accessToken } = useAuth();

  const nodeData = data as BaseNodeData;
  const definition = NODE_CATALOG[nodeData.type];
  const meta = FORGE_META[nodeData.type] ?? {
    icon: Hammer,
    color: "text-orange-400",
    label: "Forge Block",
  };
  const NodeIcon = meta.icon;

  if (!definition) return null;

  const updateData = (patch: Partial<BaseNodeData>) => {
    updateNodeData(id, {
      ...nodeData,
      ...patch,
      inputs: { ...nodeData.inputs, ...(patch.inputs ?? {}) },
      outputs: { ...nodeData.outputs, ...(patch.outputs ?? {}) },
    });
  };

  const runNode = async () => {
    setRunning(true);
    try {
      const upstreamInputs = getNodeInputs(
        id,
        getNodes() as UnifiedCanvasNode[],
        getEdges() as UnifiedCanvasEdge[],
        getRuntimeState(),
      );
      const executionInputs = { ...nodeData.inputs, ...upstreamInputs };
      setRuntimeNodeInputs(id, upstreamInputs);
      const output = await runCreativeNode(
        nodeData.type,
        executionInputs,
        nodeData.config ?? {},
        accessToken,
      );
      updateData({ outputs: output });
      setRuntimeNodeOutputs(id, output);
    } finally {
      setRunning(false);
    }
  };

  const generatedCode = nodeData.outputs?.code as string | undefined;
  const specs = nodeData.outputs?.specs;
  const assets = nodeData.outputs?.assets;
  const testResults = Array.isArray((nodeData.outputs?.results as any)?.tests)
    ? ((nodeData.outputs?.results as any).tests as Array<{
        name: string;
        passed: boolean;
      }>)
    : [];
  const passCount = testResults.filter((t) => t.passed).length;

  return (
    <div
      className={`flex h-full w-full min-h-[240px] min-w-[320px] flex-col rounded-[24px] border bg-brand-bg-surface/90 backdrop-blur-2xl p-4 text-brand-text-body shadow-2xl transition-all duration-300 ${
        selected
          ? "border-orange-500/50 shadow-[0_0_30px_-5px_rgba(249,115,22,0.15)]"
          : "border-orange-500/20 shadow-inner"
      }`}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={320}
        minHeight={240}
        handleClassName="!h-6 !w-6 !bg-transparent !border-none !shadow-none"
        lineClassName="!border-orange-500/30"
      />
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !border-2 !border-brand-bg-page !bg-orange-500 transition-all hover:!ring-4 hover:!ring-orange-500/30"
      />

      {/* Header */}
      <div className="mb-3 flex items-center gap-2.5">
        <div className={`p-1.5 rounded-lg bg-white/5 ${meta.color}`}>
          <NodeIcon size={14} />
        </div>
        <input
          value={nodeData.label}
          onChange={(e) => updateData({ label: e.target.value })}
          onKeyDown={(e) => e.stopPropagation()}
          className="w-full bg-transparent text-[13px] font-black uppercase tracking-widest text-white outline-none"
        />
        <span className="shrink-0 rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
          Forge
        </span>
      </div>

      {nodeData.description && (
        <p className="mb-3 text-[11px] font-medium text-brand-text-muted">
          {nodeData.description}
        </p>
      )}

      <div className="nodrag nowheel space-y-3 flex-1 overflow-auto custom-scrollbar">
        {/* Architect — goal input + specs output */}
        {nodeData.type === "forge.architect" && (
          <>
            <label className="block space-y-1.5">
              <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
                Goal
              </span>
              <textarea
                value={String(nodeData.inputs?.goal ?? "")}
                onChange={(e) =>
                  updateData({ inputs: { goal: e.target.value } })
                }
                onKeyDown={(e) => e.stopPropagation()}
                rows={2}
                placeholder="Build a real-time chat application with auth..."
                className="w-full resize-none rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-[11px] font-medium outline-none focus:border-sky-500/50 transition-all text-white placeholder:text-brand-text-muted/30"
              />
            </label>
            {specs && (
              <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3">
                <span className="block text-[9px] font-black uppercase tracking-widest text-sky-400 mb-1">
                  Architecture Specs
                </span>
                <pre className="text-[9px] font-mono text-sky-300/70 overflow-auto max-h-20 custom-scrollbar">
                  {JSON.stringify(specs, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}

        {/* Designer — requirements + assets */}
        {nodeData.type === "forge.designer" && (
          <>
            <label className="block space-y-1.5">
              <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
                Requirements
              </span>
              <textarea
                value={String(nodeData.inputs?.requirements ?? "")}
                onChange={(e) =>
                  updateData({ inputs: { requirements: e.target.value } })
                }
                onKeyDown={(e) => e.stopPropagation()}
                rows={2}
                placeholder="Dark mode, purple accent, mobile-first..."
                className="w-full resize-none rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-[11px] font-medium outline-none focus:border-pink-500/50 transition-all text-white placeholder:text-brand-text-muted/30"
              />
            </label>
            {assets && (
              <div className="rounded-xl border border-pink-500/20 bg-pink-500/5 p-3">
                <span className="block text-[9px] font-black uppercase tracking-widest text-pink-400 mb-1">
                  Design Assets
                </span>
                <pre className="text-[9px] font-mono text-pink-300/70 overflow-auto max-h-20 custom-scrollbar">
                  {JSON.stringify(assets, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}

        {/* Builder — specs input + generated code */}
        {nodeData.type === "forge.builder" && (
          <>
            <div className="rounded-xl border border-white/5 bg-brand-bg-page/50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-brand-text-muted italic text-center">
              Specs resolved from upstream
            </div>
            {generatedCode ? (
              <CodeBlock code={generatedCode} language="typescript" />
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 p-4 text-center">
                <Hammer size={20} className="text-orange-400/40 mx-auto mb-1" />
                <span className="text-[9px] font-bold text-brand-text-muted">
                  No code generated yet
                </span>
              </div>
            )}
          </>
        )}

        {/* Tester — code input + test results */}
        {nodeData.type === "forge.tester" && (
          <>
            <div className="rounded-xl border border-white/5 bg-brand-bg-page/50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-brand-text-muted italic text-center">
              Code resolved from upstream
            </div>
            {testResults.length > 0 ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
                    Test Results
                  </span>
                  <span
                    className={`text-[10px] font-black ${
                      passCount === testResults.length
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {passCount}/{testResults.length} passed
                  </span>
                </div>
                <div className="space-y-1 max-h-32 overflow-auto custom-scrollbar">
                  {testResults.map((t, i) => (
                    <TestRow key={i} name={t.name} passed={t.passed} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 p-4 text-center">
                <TestTube
                  size={20}
                  className="text-emerald-400/40 mx-auto mb-1"
                />
                <span className="text-[9px] font-bold text-brand-text-muted">
                  Awaiting code to test
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Run Button */}
      <button
        type="button"
        onClick={() => void runNode()}
        disabled={running}
        className="group/btn relative mt-4 flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-[0_4px_15px_-3px_rgba(249,115,22,0.3)] transition-all hover:shadow-[0_8px_25px_-3px_rgba(249,115,22,0.5)] hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
      >
        <span className="relative z-10">
          {running
            ? "Forging..."
            : nodeData.type === "forge.tester"
              ? "Run Tests"
              : "Build"}
        </span>
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
      </button>

      {/* Output link for builder */}
      {nodeData.type !== "forge.builder" && generatedCode && (
        <div className="mt-3 flex items-center gap-2 px-2">
          <ArrowRight size={10} className="text-orange-400" />
          <span className="text-[9px] font-black uppercase tracking-widest text-orange-400">
            Code ready — connect to Tester
          </span>
        </div>
      )}

      {/* Surface tag */}
      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest text-orange-400/70">
            Surface D
          </span>
        </div>
        <span className="text-[9px] font-medium text-brand-text-muted">
          {meta.label}
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2.5 !w-2.5 !border-2 !border-brand-bg-page !bg-orange-500 transition-all hover:!ring-4 hover:!ring-orange-500/30"
      />
    </div>
  );
}
