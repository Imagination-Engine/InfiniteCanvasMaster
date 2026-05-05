// @ts-nocheck
import React from "react";
import type { BlockComponentProps } from "../../contracts/BlockRegistry";

export const CommonBlockView: React.FC<BlockComponentProps> = ({ object }) => {
  const description = object.metadata.description
    ? String(object.metadata.description)
    : "No description provided.";

  return (
    <div className="flex flex-col gap-3 h-full">
      <p className="text-[11px] text-white/60 leading-relaxed font-medium mb-3">
        {String(description)}
      </p>

      {/* Render simple metadata values if present */}
      <div className="space-y-2">
        {Object.entries(object.metadata).map(([key, val]) => {
          if (
            [
              "label",
              "description",
              "category",
              "role",
              "runtime",
              "capabilities",
            ].includes(key)
          )
            return null;
          if (typeof val === "object") return null;
          return (
            <div key={key} className="flex flex-col gap-1">
              <span className="text-[8px] font-black text-white/20 uppercase tracking-tighter">
                {key}
              </span>
              <span className="text-[10px] text-white/80 font-mono truncate">
                {String(val)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
