import React from "react";
import type { BlockViewProps } from "@iem/core";
import { Image as ImageIcon, Maximize, Move } from "lucide-react";

interface SpriteInput {
  url: string;
  width: number;
  height: number;
  x?: number;
  y?: number;
  alpha?: number;
  tint?: string;
}

interface SpriteOutput {
  entityId: string;
  rendered: boolean;
  currentBounds: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

const PRESET_SPRITES = [
  {
    name: "Knight",
    url: "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/knight.png",
  },
  {
    name: "Slime",
    url: "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/slime.png",
  },
  {
    name: "Mushroom",
    url: "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/mushroom.png",
  },
  {
    name: "Dragon",
    url: "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/dragon.png",
  },
];

export const SpriteView: React.FC<
  BlockViewProps<SpriteInput, SpriteOutput>
> = ({ data, onParamsChange }) => {
  const { input, output } = data;
  const url = input?.url || "";
  const width = input?.width || 64;
  const height = input?.height || 64;

  return (
    <div className="flex flex-col gap-4">
      {/* Asset Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted">
          Asset URL
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="https://..."
            value={url}
            onChange={(e) => onParamsChange({ url: e.target.value })}
            className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-purple/50 placeholder:text-white/20"
          />
        </div>
      </div>

      {/* Preset Gallery */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted">
          Quick Presets
        </label>
        <div className="grid grid-cols-4 gap-2">
          {PRESET_SPRITES.map((sprite) => (
            <button
              key={sprite.name}
              onClick={() => onParamsChange({ url: sprite.url })}
              className={`group relative aspect-square rounded-lg border bg-black/40 p-1 transition-all hover:border-brand-purple/50 ${url === sprite.url ? "border-brand-purple" : "border-white/5"}`}
              title={sprite.name}
            >
              <img
                src={sprite.url}
                alt={sprite.name}
                className="h-full w-full object-contain"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Dimensions */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted flex items-center gap-1">
            <Maximize size={10} /> Width
          </label>
          <input
            type="number"
            value={width}
            onChange={(e) =>
              onParamsChange({ width: parseInt(e.target.value) || 0 })
            }
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-purple/50"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted flex items-center gap-1">
            <Maximize size={10} /> Height
          </label>
          <input
            type="number"
            value={height}
            onChange={(e) =>
              onParamsChange({ height: parseInt(e.target.value) || 0 })
            }
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-purple/50"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="mt-2 flex flex-col items-center justify-center p-8 bg-black/60 border border-white/5 rounded-2xl relative overflow-hidden min-h-[160px]">
        <div className="absolute top-2 left-2 flex items-center gap-2 opacity-50">
          <ImageIcon size={12} className="text-brand-purple" />
          <span className="text-[8px] font-bold uppercase tracking-widest text-brand-purple">
            Visual Preview
          </span>
        </div>

        {url ? (
          <div
            className="relative transition-all duration-300"
            style={{
              width: `${Math.min(width, 120)}px`,
              height: `${Math.min(height, 120)}px`,
              opacity: input?.alpha ?? 1,
            }}
          >
            <img
              src={url}
              alt="Preview"
              className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]"
            />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-black text-brand-purple/60">
              {width}×{height} UNITS
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-brand-text-muted">
            <ImageIcon size={24} className="opacity-20" />
            <span className="text-[10px] uppercase tracking-tighter font-medium opacity-40">
              No Asset Selected
            </span>
          </div>
        )}
      </div>

      {/* State Badge */}
      <div className="mt-2 flex items-center justify-between px-3 py-2 bg-brand-purple/5 border border-brand-purple/10 rounded-xl">
        <div className="flex items-center gap-2">
          <div
            className={`w-1.5 h-1.5 rounded-full ${output?.rendered ? "bg-green-400 animate-pulse" : "bg-white/20"}`}
          />
          <span className="text-[9px] font-black uppercase text-brand-text-muted">
            Entity Status
          </span>
        </div>
        <span className="text-[10px] font-bold text-white tabular-nums">
          {output?.entityId || "IDLE"}
        </span>
      </div>
    </div>
  );
};
