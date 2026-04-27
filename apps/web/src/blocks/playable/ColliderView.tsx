import React from "react";
import type { BlockViewProps } from "@iem/core";
import { Target, Square, Circle, ShieldAlert, Zap } from "lucide-react";

interface ColliderInput {
  shape: "rectangle" | "circle" | "capsule";
  width: number;
  height: number;
  radius: number;
  isTrigger: boolean;
  sensorRange: number;
  collisionGroup: string;
}

interface ColliderOutput {
  entityId: string;
  isColliding: boolean;
  activeOverlaps: string[];
  lastCollision?: {
    otherId: string;
    impactForce: number;
    normal: { x: number; y: number };
  };
}

export const ColliderView: React.FC<
  BlockViewProps<ColliderInput, ColliderOutput>
> = ({ data = {}, onParamsChange }) => {
  const { input = {} as any, output = {} as any } = data;
  const shape = input?.shape || "rectangle";
  const isTrigger = input?.isTrigger || false;

  return (
    <div className="flex flex-col gap-4">
      {/* Shape Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted">
          Collider Shape
        </label>
        <div className="grid grid-cols-3 gap-2">
          {["rectangle", "circle", "capsule"].map((s) => (
            <button
              key={s}
              onClick={() => onParamsChange({ shape: s as any })}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${shape === s ? "bg-brand-orange/10 border-brand-orange text-white" : "bg-white/5 border-white/5 text-brand-text-muted hover:bg-white/10"}`}
            >
              {s === "rectangle" && <Square size={14} />}
              {s === "circle" && <Circle size={14} />}
              {s === "capsule" && <Target size={14} />}
              <span className="text-[8px] font-black uppercase">{s}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Hitbox Visualizer */}
      <div className="mt-2 flex flex-col items-center justify-center p-8 bg-black/60 border border-white/5 rounded-2xl relative overflow-hidden min-h-[160px]">
        <div className="absolute top-2 left-2 flex items-center gap-2 opacity-50">
          <Target size={12} className="text-brand-orange" />
          <span className="text-[8px] font-bold uppercase tracking-widest text-brand-orange">
            Hitbox Visualizer
          </span>
        </div>

        <div
          className={`
          relative border-2 transition-all duration-300
          ${
            output?.isColliding
              ? "border-red-500 bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
              : isTrigger
                ? "border-brand-orange/50 border-dashed bg-brand-orange/5"
                : "border-brand-orange bg-brand-orange/10"
          }
        `}
          style={{
            width: shape === "circle" ? "80px" : "100px",
            height: "80px",
            borderRadius:
              shape === "circle" ? "50%" : shape === "capsule" ? "40px" : "8px",
          }}
        >
          {isTrigger && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap size={20} className="text-brand-orange/30 animate-pulse" />
            </div>
          )}
        </div>

        <div className="absolute bottom-2 right-2 text-[8px] font-black text-brand-text-muted uppercase">
          {shape} {isTrigger ? "(Trigger)" : "(Physical)"}
        </div>
      </div>

      {/* Trigger Toggle */}
      <div
        className={`flex items-center justify-between px-3 py-3 rounded-xl border cursor-pointer transition-all ${isTrigger ? "bg-brand-orange/10 border-brand-orange/30" : "bg-white/5 border-white/10"}`}
        onClick={() => onParamsChange({ isTrigger: !isTrigger })}
      >
        <div className="flex items-center gap-2">
          <ShieldAlert
            size={14}
            className={
              isTrigger ? "text-brand-orange" : "text-brand-text-muted"
            }
          />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-white">
              Is Trigger
            </span>
            <span className="text-[8px] font-medium text-brand-text-muted">
              Overlaps without physics blocking
            </span>
          </div>
        </div>
        <div
          className={`w-8 h-4 rounded-full relative transition-all ${isTrigger ? "bg-brand-orange" : "bg-white/10"}`}
        >
          <div
            className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isTrigger ? "left-4.5" : "left-0.5"}`}
          />
        </div>
      </div>

      {/* Collision Monitor */}
      <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-brand-text-muted">
            Active Overlaps
          </span>
          <span className="text-[10px] font-bold text-brand-orange">
            {output?.activeOverlaps?.length || 0}
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {output?.activeOverlaps?.map((id: string) => (
            <span
              key={id}
              className="text-[8px] font-bold bg-brand-orange/20 text-brand-orange px-1.5 py-0.5 rounded border border-brand-orange/20"
            >
              {id}
            </span>
          ))}
          {(!output?.activeOverlaps || output.activeOverlaps.length === 0) && (
            <span className="text-[9px] font-medium text-brand-text-muted opacity-30 italic">
              No active collisions
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
