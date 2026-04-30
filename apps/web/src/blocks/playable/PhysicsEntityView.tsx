import React from "react";
import type { BlockViewProps } from "@iem/core";
import { Weight, ArrowDown, Wind, Zap } from "lucide-react";

interface PhysicsInput {
  mass: number;
  gravityScale: number;
  friction: number;
  restitution: number;
  isStatic: boolean;
}

interface PhysicsOutput {
  entityId: string;
  velocity: { x: number; y: number };
  acceleration: { x: number; y: number };
  appliedForces: Array<{ label: string; vector: { x: number; y: number } }>;
}

export const PhysicsEntityView: React.FC<
  BlockViewProps<PhysicsInput, PhysicsOutput>
> = ({ data = {}, onParamsChange }) => {
  const { input = {} as any, output = {} as any } = data;
  const mass = input?.mass ?? 1;
  const gravityScale = input?.gravityScale ?? 1;
  const friction = input?.friction ?? 0.1;
  const restitution = input?.restitution ?? 0.5;

  return (
    <div className="flex flex-col gap-4">
      {/* Mass & Gravity Section */}
      <div className="grid grid-cols-1 gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted flex items-center gap-1.5">
              <Weight size={12} className="text-brand-cyan" /> Mass (kg)
            </label>
            <span className="text-[10px] font-bold text-white bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
              {mass.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="100"
            step="0.1"
            value={mass}
            onChange={(e) =>
              onParamsChange({ mass: parseFloat(e.target.value) })
            }
            className="w-full accent-brand-cyan bg-white/5 rounded-lg h-1.5 appearance-none cursor-pointer"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted flex items-center gap-1.5">
              <ArrowDown size={12} className="text-brand-cyan" /> Gravity Scale
            </label>
            <span className="text-[10px] font-bold text-white bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
              {gravityScale.toFixed(2)}x
            </span>
          </div>
          <input
            type="range"
            min="-2"
            max="5"
            step="0.1"
            value={gravityScale}
            onChange={(e) =>
              onParamsChange({ gravityScale: parseFloat(e.target.value) })
            }
            className="w-full accent-brand-cyan bg-white/5 rounded-lg h-1.5 appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Friction & Bounciness */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted flex items-center gap-1.5">
            <Wind size={10} /> Friction
          </label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.01"
            value={friction}
            onChange={(e) =>
              onParamsChange({ friction: parseFloat(e.target.value) })
            }
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-cyan/50"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted flex items-center gap-1.5">
            <Zap size={10} /> Bounciness
          </label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.01"
            value={restitution}
            onChange={(e) =>
              onParamsChange({ restitution: parseFloat(e.target.value) })
            }
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-cyan/50"
          />
        </div>
      </div>

      {/* Physics Monitor Preview */}
      <div className="mt-2 p-4 bg-black/60 border border-white/5 rounded-2xl relative overflow-hidden">
        <div className="absolute top-2 left-2 flex items-center gap-2 opacity-50">
          <Zap size={12} className="text-brand-cyan" />
          <span className="text-[8px] font-bold uppercase tracking-widest text-brand-cyan">
            Vector Monitor
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {/* Velocity Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-black text-brand-text-muted uppercase">
              <span>Velocity</span>
              <span className="text-brand-cyan">
                {(
                  Math.abs(output?.velocity?.x || 0) +
                  Math.abs(output?.velocity?.y || 0)
                ).toFixed(1)}{" "}
                u/s
              </span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-cyan transition-all duration-300"
                style={{
                  width: `${Math.min((Math.abs(output?.velocity?.x || 0) + Math.abs(output?.velocity?.y || 0)) * 10, 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Forces List */}
          <div className="grid grid-cols-2 gap-2">
            {(output?.appliedForces || []).map((force, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/5 rounded-lg p-2 flex flex-col gap-1"
              >
                <span className="text-[8px] font-black text-brand-text-muted uppercase tracking-tighter">
                  {force.label}
                </span>
                <span className="text-[10px] font-bold text-white tabular-nums">
                  {force.vector.x.toFixed(1)}, {force.vector.y.toFixed(1)}
                </span>
              </div>
            ))}
            {(!output?.appliedForces || output.appliedForces.length === 0) && (
              <div className="col-span-2 text-center py-2 text-[9px] font-medium text-brand-text-muted opacity-40 italic">
                No active forces
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mode Toggle */}
      <div
        className="flex items-center justify-between px-3 py-2 bg-brand-cyan/5 border border-brand-cyan/10 rounded-xl cursor-pointer hover:bg-brand-cyan/10 transition-all"
        onClick={() => onParamsChange({ isStatic: !input?.isStatic })}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-1.5 h-1.5 rounded-full ${input?.isStatic ? "bg-orange-400" : "bg-brand-cyan animate-pulse"}`}
          />
          <span className="text-[9px] font-black uppercase text-brand-text-muted">
            Body Type
          </span>
        </div>
        <span
          className={`text-[10px] font-black uppercase ${input?.isStatic ? "text-orange-400" : "text-brand-cyan"}`}
        >
          {input?.isStatic ? "STATIC" : "DYNAMIC"}
        </span>
      </div>
    </div>
  );
};
