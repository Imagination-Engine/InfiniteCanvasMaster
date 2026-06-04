// @ts-nocheck
import React from "react";
import { ImageOff } from "lucide-react";
import type { BlockComponentProps } from "../../contracts/BlockRegistry";

/**
 * Renders an uploaded reference image on the canvas. Used for non-generated
 * stills attached in chat that are dropped onto the canvas and (optionally)
 * wired into a reel-forge (iem.studio.video) node for Veo.
 */
export const ReferenceImageBlock: React.FC<BlockComponentProps> = ({
  object,
}) => {
  const meta = object.metadata ?? {};
  const inputs = (meta.inputs as Record<string, unknown>) ?? {};
  const outputs = (meta.outputs as Record<string, unknown>) ?? {};
  const imageUrl =
    (typeof meta.imageUrl === "string" && meta.imageUrl) ||
    (typeof inputs.imageUrl === "string" && inputs.imageUrl) ||
    (typeof outputs.imageUrl === "string" && outputs.imageUrl) ||
    "";

  const label =
    (typeof meta.label === "string" && meta.label) || "Reference image";

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="relative flex-1 min-h-0 rounded-xl overflow-hidden border border-white/10 bg-black/30">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={label}
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/30">
            <ImageOff size={20} />
            <span className="text-[10px]">No image</span>
          </div>
        )}
      </div>
      <span className="text-[10px] text-white/50 truncate shrink-0">
        {label}
      </span>
    </div>
  );
};
