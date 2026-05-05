// @ts-nocheck
import React from "react";
import {
  Bot,
  FileCode,
  Play,
  Database,
  Video,
  ShoppingCart,
  Info,
} from "lucide-react";
import { BlockRegistry } from "../contracts/BlockRegistry";

interface AgnosticRenderShellProps {
  object: any;
  mode: "fullscreen" | "side-panel";
}

/**
 * Universal content wrapper for the right panel of the immersive modal.
 * Orchestrates studio-specific specialized runtimes.
 */
export const AgnosticRenderShell: React.FC<AgnosticRenderShellProps> = ({
  object,
  mode,
}) => {
  const Component =
    BlockRegistry.resolve((object as any).blockKind) ||
    BlockRegistry.resolve(object.type) ||
    null;

  if (!Component) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center text-white/20 h-full">
        <div className="text-center">
          <Bot size={48} className="mx-auto mb-4 opacity-50" />
          <h2 className="text-lg font-bold tracking-widest uppercase mb-2">
            No Surface Runtime Found
          </h2>
          <p className="text-xs max-w-md mx-auto leading-relaxed">
            This block type ({object.type}) does not have a specialized
            immersive view registered.
          </p>
        </div>
      </div>
    );
  }

  // Determine studio icon for the background/placeholder
  const getStudioIcon = () => {
    const studio = (object as any).studio || object.type.split(".")[0];
    switch (studio) {
      case "scribe":
        return <Info size={120} className="text-white/[0.02]" />;
      case "playable":
        return <Play size={120} className="text-white/[0.02]" />;
      case "forge":
        return <FileCode size={120} className="text-white/[0.02]" />;
      case "atlas":
        return <Database size={120} className="text-white/[0.02]" />;
      case "reel":
        return <Video size={120} className="text-white/[0.02]" />;
      case "commerce":
        return <ShoppingCart size={120} className="text-white/[0.02]" />;
      default:
        return <Bot size={120} className="text-white/[0.02]" />;
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col">
      {/* Background Studio Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {getStudioIcon()}
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar relative z-10">
        <Component
          object={object}
          mode={mode}
          data={{
            input: object.metadata?.inputs || object.metadata || {},
            output: object.metadata?.outputs || {},
          }}
        />
      </div>
    </div>
  );
};
