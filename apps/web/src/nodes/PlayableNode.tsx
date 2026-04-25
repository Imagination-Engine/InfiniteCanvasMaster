import {
  Handle,
  Position,
  NodeResizer,
  type NodeProps,
  useReactFlow,
} from "@xyflow/react";
import { useState } from "react";
import {
  Gamepad2,
  Target,
  Trophy,
  Zap,
  Timer,
  Cpu,
  ArrowRight,
} from "lucide-react";
import type { BaseNodeData } from "./types";

const PLAYABLE_META: Record<
  string,
  {
    icon: React.ElementType;
    color: string;
    accentBorder: string;
    label: string;
  }
> = {
  "playable.joystick": {
    icon: Gamepad2,
    color: "text-lime-400",
    accentBorder: "border-lime-500/40",
    label: "Joystick",
  },
  "playable.collider": {
    icon: Target,
    color: "text-orange-400",
    accentBorder: "border-orange-500/40",
    label: "Collider",
  },
  "playable.score": {
    icon: Trophy,
    color: "text-yellow-400",
    accentBorder: "border-yellow-500/40",
    label: "Score",
  },
  "playable.spawner": {
    icon: Zap,
    color: "text-red-400",
    accentBorder: "border-red-500/40",
    label: "Spawner",
  },
  "playable.timer": {
    icon: Timer,
    color: "text-sky-400",
    accentBorder: "border-sky-500/40",
    label: "Timer",
  },
  "playable.sprite": {
    icon: Cpu,
    color: "text-purple-400",
    accentBorder: "border-purple-500/40",
    label: "Sprite",
  },
  "playable.physicsEntity": {
    icon: Cpu,
    color: "text-brand-cyan",
    accentBorder: "border-brand-cyan/40",
    label: "Physics Entity",
  },
};

// Animated D-Pad component for joystick
const DPad = ({ direction }: { direction: string }) => {
  const dirs: Record<string, boolean> = {
    up: direction === "up",
    down: direction === "down",
    left: direction === "left",
    right: direction === "right",
  };
  return (
    <div className="flex flex-col items-center gap-0.5 my-2">
      <div
        className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-black transition-all ${dirs.up ? "bg-lime-400 text-black" : "bg-white/5 text-brand-text-muted"}`}
      >
        ▲
      </div>
      <div className="flex gap-0.5">
        <div
          className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-black transition-all ${dirs.left ? "bg-lime-400 text-black" : "bg-white/5 text-brand-text-muted"}`}
        >
          ◀
        </div>
        <div className="w-7 h-7 rounded-md bg-white/5" />
        <div
          className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-black transition-all ${dirs.right ? "bg-lime-400 text-black" : "bg-white/5 text-brand-text-muted"}`}
        >
          ▶
        </div>
      </div>
      <div
        className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-black transition-all ${dirs.down ? "bg-lime-400 text-black" : "bg-white/5 text-brand-text-muted"}`}
      >
        ▼
      </div>
    </div>
  );
};

export default function PlayableNode({ id, data, selected }: NodeProps) {
  const { updateNodeData } = useReactFlow();
  const nodeData = data as BaseNodeData;

  const meta = PLAYABLE_META[nodeData.type] ?? {
    icon: Gamepad2,
    color: "text-lime-400",
    accentBorder: "border-lime-500/40",
    label: "Game Block",
  };
  const NodeIcon = meta.icon;

  const updateData = (patch: Partial<BaseNodeData>) => {
    updateNodeData(id, {
      ...nodeData,
      ...patch,
      inputs: { ...nodeData.inputs, ...(patch.inputs ?? {}) },
      outputs: { ...nodeData.outputs, ...(patch.outputs ?? {}) },
    });
  };

  const score = Number(nodeData.outputs?.currentScore ?? 0);
  const direction = String(nodeData.outputs?.direction ?? "");

  return (
    <div
      className={`flex h-full w-full min-h-[220px] min-w-[300px] flex-col rounded-[24px] border bg-brand-bg-surface/90 backdrop-blur-2xl p-4 text-brand-text-body shadow-2xl transition-all duration-300 ${
        selected
          ? `${meta.accentBorder} shadow-[0_0_30px_-5px_rgba(132,204,22,0.15)]`
          : `${meta.accentBorder} shadow-inner`
      }`}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={300}
        minHeight={220}
        handleClassName="!h-6 !w-6 !bg-transparent !border-none !shadow-none"
        lineClassName="!border-lime-500/30"
      />
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !border-2 !border-brand-bg-page !bg-lime-500 transition-all hover:!ring-4 hover:!ring-lime-500/30"
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
          Playable
        </span>
      </div>

      {nodeData.description && (
        <p className="mb-3 text-[11px] font-medium text-brand-text-muted">
          {nodeData.description}
        </p>
      )}

      {/* Surface-specific controls */}
      <div className="nodrag nowheel space-y-3 flex-1 overflow-auto custom-scrollbar">
        {/* Joystick */}
        {nodeData.type === "playable.joystick" && (
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-brand-text-muted mb-1">
              Direction Output
            </span>
            <DPad direction={direction} />
            {direction && (
              <div className="flex items-center gap-1.5 text-[10px] font-black text-lime-400 mt-1">
                <ArrowRight size={10} />
                {direction.toUpperCase()}
              </div>
            )}
          </div>
        )}

        {/* Score */}
        {nodeData.type === "playable.score" && (
          <div className="flex flex-col items-center py-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-brand-text-muted mb-2">
              Current Score
            </span>
            <div className="text-5xl font-black text-yellow-400 tabular-nums">
              {score.toLocaleString()}
            </div>
            <label className="mt-4 block w-full space-y-1.5">
              <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
                Add Points
              </span>
              <input
                value={String(nodeData.inputs?.points ?? "")}
                onChange={(e) =>
                  updateData({ inputs: { points: e.target.value } })
                }
                onKeyDown={(e) => e.stopPropagation()}
                type="number"
                placeholder="100"
                className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-[11px] font-medium outline-none focus:border-yellow-500/50 transition-all text-white"
              />
            </label>
          </div>
        )}

        {/* Timer */}
        {nodeData.type === "playable.timer" && (
          <div className="flex flex-col items-center py-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-brand-text-muted mb-2">
              Duration (ms)
            </span>
            <label className="block w-full space-y-1.5">
              <input
                value={String(nodeData.inputs?.duration ?? "")}
                onChange={(e) =>
                  updateData({ inputs: { duration: e.target.value } })
                }
                onKeyDown={(e) => e.stopPropagation()}
                type="number"
                placeholder="5000"
                className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-[11px] font-medium outline-none focus:border-sky-500/50 transition-all text-white"
              />
            </label>
            <div className="mt-3 w-20 h-20 rounded-full border-4 border-sky-500/20 flex items-center justify-center relative">
              <div
                className="absolute inset-0 rounded-full border-4 border-sky-400 border-t-transparent animate-spin"
                style={{
                  animationDuration: `${Number(nodeData.inputs?.duration ?? 5000) / 1000}s`,
                  animationIterationCount: "infinite",
                }}
              />
              <Timer size={20} className="text-sky-400" />
            </div>
          </div>
        )}

        {/* Spawner */}
        {nodeData.type === "playable.spawner" && (
          <>
            <label className="block space-y-1.5">
              <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
                Entity Type
              </span>
              <select
                value={String(nodeData.inputs?.entityType ?? "enemy")}
                onChange={(e) =>
                  updateData({ inputs: { entityType: e.target.value } })
                }
                className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-[11px] font-medium outline-none focus:border-red-500/50 transition-all text-white appearance-none cursor-pointer"
              >
                {["enemy", "projectile", "pickup", "npc", "obstacle"].map(
                  (t) => (
                    <option key={t} value={t} className="bg-brand-bg-surface">
                      {t}
                    </option>
                  ),
                )}
              </select>
            </label>
            <label className="block space-y-1.5">
              <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
                Spawn Rate (per second)
              </span>
              <input
                value={String(nodeData.inputs?.rate ?? "")}
                onChange={(e) =>
                  updateData({ inputs: { rate: e.target.value } })
                }
                onKeyDown={(e) => e.stopPropagation()}
                type="number"
                placeholder="2"
                className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-[11px] font-medium outline-none focus:border-red-500/50 transition-all text-white"
              />
            </label>
          </>
        )}

        {/* Sprite / Physics / Collider — generic config */}
        {[
          "playable.sprite",
          "playable.physicsEntity",
          "playable.collider",
        ].includes(nodeData.type) && (
          <div className="space-y-3">
            {nodeData.type === "playable.sprite" && (
              <label className="block space-y-1.5">
                <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
                  Asset URL
                </span>
                <input
                  value={String(nodeData.inputs?.asset ?? "")}
                  onChange={(e) =>
                    updateData({ inputs: { asset: e.target.value } })
                  }
                  onKeyDown={(e) => e.stopPropagation()}
                  placeholder="https://example.com/sprite.png"
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-[11px] font-medium outline-none focus:border-purple-500/50 transition-all text-white placeholder:text-brand-text-muted/30"
                />
              </label>
            )}
            {nodeData.type === "playable.physicsEntity" && (
              <label className="block space-y-1.5">
                <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
                  Mass (kg)
                </span>
                <input
                  value={String(nodeData.inputs?.mass ?? "")}
                  onChange={(e) =>
                    updateData({ inputs: { mass: e.target.value } })
                  }
                  onKeyDown={(e) => e.stopPropagation()}
                  type="number"
                  placeholder="1.0"
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-[11px] font-medium outline-none focus:border-brand-cyan/50 transition-all text-white"
                />
              </label>
            )}
            {/* Live state display */}
            <div className="rounded-xl border border-white/5 bg-brand-bg-page/50 p-3">
              <span className="block text-[9px] font-black uppercase tracking-widest text-brand-text-muted mb-2">
                Physics State
              </span>
              <div className="grid grid-cols-2 gap-2">
                {["x", "y", "vx", "vy"].map((axis) => (
                  <div
                    key={axis}
                    className="flex items-center justify-between rounded-lg bg-white/5 px-2 py-1"
                  >
                    <span className="text-[9px] font-bold text-brand-text-muted uppercase">
                      {axis}
                    </span>
                    <span className="text-[10px] font-black text-brand-cyan tabular-nums">
                      {(nodeData.outputs?.state as Record<string, number>)?.[
                        axis
                      ] ?? "0"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Game HUD Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest text-lime-400/70">
            Surface A
          </span>
        </div>
        <span className="text-[9px] font-medium text-brand-text-muted">
          {meta.label}
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2.5 !w-2.5 !border-2 !border-brand-bg-page !bg-lime-500 transition-all hover:!ring-4 hover:!ring-lime-500/30"
      />
    </div>
  );
}
