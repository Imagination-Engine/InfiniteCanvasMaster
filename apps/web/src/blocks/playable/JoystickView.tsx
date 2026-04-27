import React, { useState, useRef, useEffect } from "react";
import type { BlockViewProps } from "@iem/core";
import { Gamepad2, MoveUp, MoveDown, MoveLeft, MoveRight } from "lucide-react";

interface JoystickInput {
  target_entity?: string;
  control_scheme?: "d-pad" | "analog" | "wasd";
}

interface JoystickOutput {
  x: number;
  y: number;
  active: boolean;
  jumpPressed: boolean;
}

export const JoystickView: React.FC<
  BlockViewProps<JoystickInput, JoystickOutput>
> = ({ id, data = {}, onParamsChange }) => {
  const { input = {} as any, output = {} as any } = data;
  const scheme = input?.control_scheme || "d-pad";

  // Local interaction state for the UI preview
  const [activeDir, setActiveDir] = useState<string | null>(null);

  // In a real game engine, this component would mount global event listeners
  // and pipe data via `onParamsChange` to emit state down the DAG edge.

  const handlePress = (dir: string) => {
    setActiveDir(dir);
  };

  const handleRelease = () => {
    setActiveDir(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Parameter Configuration */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted">
          Control Scheme
        </label>
        <select
          value={scheme}
          onChange={(e) => onParamsChange({ control_scheme: e.target.value })}
          className="bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-purple/50"
        >
          <option value="d-pad">D-Pad</option>
          <option value="analog">Analog Stick</option>
          <option value="wasd">WASD / Keyboard</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted">
          Target Entity ID
        </label>
        <input
          type="text"
          placeholder="e.g. physics-knight"
          value={input?.target_entity || ""}
          onChange={(e) => onParamsChange({ target_entity: e.target.value })}
          className="bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-purple/50 placeholder:text-white/20"
        />
      </div>

      {/* Visual Preview of the Controller */}
      <div className="mt-4 flex flex-col items-center justify-center p-6 bg-black/40 border border-white/5 rounded-2xl relative overflow-hidden">
        <div className="absolute top-2 left-2 flex items-center gap-2 opacity-50">
          <Gamepad2 size={12} className="text-brand-cyan" />
          <span className="text-[8px] font-bold uppercase tracking-widest text-brand-cyan">
            Live Input Preview
          </span>
        </div>

        {scheme === "d-pad" || scheme === "wasd" ? (
          <div className="grid grid-cols-3 grid-rows-3 gap-2 mt-4">
            <div />
            <button
              onMouseDown={() => handlePress("up")}
              onMouseUp={handleRelease}
              onMouseLeave={handleRelease}
              className={`w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center transition-all ${activeDir === "up" ? "bg-brand-cyan shadow-[0_0_15px_rgba(0,194,255,0.4)] text-black" : "text-white"}`}
            >
              <MoveUp size={16} />
            </button>
            <div />
            <button
              onMouseDown={() => handlePress("left")}
              onMouseUp={handleRelease}
              onMouseLeave={handleRelease}
              className={`w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center transition-all ${activeDir === "left" ? "bg-brand-cyan shadow-[0_0_15px_rgba(0,194,255,0.4)] text-black" : "text-white"}`}
            >
              <MoveLeft size={16} />
            </button>
            <button
              onMouseDown={() => handlePress("down")}
              onMouseUp={handleRelease}
              onMouseLeave={handleRelease}
              className={`w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center transition-all ${activeDir === "down" ? "bg-brand-cyan shadow-[0_0_15px_rgba(0,194,255,0.4)] text-black" : "text-white"}`}
            >
              <MoveDown size={16} />
            </button>
            <button
              onMouseDown={() => handlePress("right")}
              onMouseUp={handleRelease}
              onMouseLeave={handleRelease}
              className={`w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center transition-all ${activeDir === "right" ? "bg-brand-cyan shadow-[0_0_15px_rgba(0,194,255,0.4)] text-black" : "text-white"}`}
            >
              <MoveRight size={16} />
            </button>
          </div>
        ) : (
          <div className="mt-4 w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative">
            <div className="w-10 h-10 rounded-full bg-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)] cursor-pointer hover:bg-brand-cyan hover:shadow-[0_0_30px_rgba(0,194,255,0.5)] transition-all" />
          </div>
        )}
      </div>
    </div>
  );
};
