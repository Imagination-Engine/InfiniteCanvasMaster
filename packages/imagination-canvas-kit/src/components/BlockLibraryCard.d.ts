import React from "react";
import type { BlockDefinition } from "@iem/core";
interface BlockLibraryCardProps {
  block: BlockDefinition<any, any>;
}
export declare const getRuntimeBadgeColor: (
  runtime?: string,
) =>
  | "bg-brand-purple/20 text-brand-purple border-brand-purple/30"
  | "bg-brand-cyan/20 text-brand-cyan border-brand-cyan/30"
  | "bg-amber-500/20 text-amber-500 border-amber-500/30"
  | "bg-rose-500/20 text-rose-500 border-rose-500/30"
  | "bg-white/5 text-white/40 border-white/10"
  | "bg-white/10 text-white/50 border-white/20";
export declare const BlockLibraryCard: React.FC<BlockLibraryCardProps>;
export {};
//# sourceMappingURL=BlockLibraryCard.d.ts.map
