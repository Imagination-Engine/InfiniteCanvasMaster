import React, { useState } from "react";
import type { BlockViewProps } from "@iem/core";
import {
  Image as ImageIcon,
  Play,
  Film,
  Loader2,
  Download,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export const ReelMediaView: React.FC<
  BlockViewProps<any, any> & {
    onParamsChange?: (p: any) => void;
    object?: any;
    mode?: string;
  }
> = ({ data, onParamsChange, object, mode }) => {
  const { input = {}, output = {}, status } = data;
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFullscreen = mode === "fullscreen" || mode === "side-panel";

  // Look for image in output or input
  const imageUrl = output?.imageUrl || output?.thumbnailUrl || input?.imageUrl;
  // Look for audio in output
  const audioUrl = output?.audioUrl;

  const handleGenerate = async () => {
    if (!onParamsChange) return;
    setIsGenerating(true);
    setError(null);

    try {
      const inputs = (data?.input ?? object?.metadata?.inputs ?? {}) as Record<
        string,
        unknown
      >;
      const prompt = String(
        inputs.prompt ??
          object?.metadata?.description ??
          data?.params?.prompt ??
          object?.metadata?.label ??
          "",
      ).trim();

      if (!prompt) {
        throw new Error(
          "Add a prompt in the block description or inputs first.",
        );
      }

      const res = await fetch(`/api/reel/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const errData = await res
          .json()
          .catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(errData.error || `Server error ${res.status}`);
      }

      const result = await res.json();
      if (result.imageUrl) {
        onParamsChange({
          prompt,
          imageUrl: result.imageUrl,
        });
      } else {
        throw new Error("No image returned from API");
      }
    } catch (err: any) {
      console.error("[ReelMediaView] Generation failed:", err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Compact Canvas View ───
  if (!isFullscreen) {
    return (
      <div className="flex flex-col gap-2 w-full">
        {imageUrl ? (
          <div className="relative bg-black/60 border border-white/5 rounded-xl overflow-hidden group">
            <div className="absolute top-1.5 left-1.5 flex items-center gap-1.5 opacity-60 z-10">
              <Film size={10} className="text-brand-purple" />
              <span className="text-[7px] font-bold uppercase tracking-widest text-brand-purple">
                Media
              </span>
            </div>

            <img
              src={imageUrl}
              alt={object?.metadata?.label || "Generated media"}
              className="w-full h-[140px] object-cover transition-transform group-hover:scale-105"
            />

            {/* Hover overlay for regeneration */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="p-2 bg-brand-purple text-white rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform"
              >
                {isGenerating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full min-h-[140px]">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <Loader2 size={32} className="text-brand-cyan animate-spin" />
                <span className="text-[10px] font-black text-brand-cyan uppercase tracking-[0.2em] animate-pulse">
                  Forging Image...
                </span>
              </div>
            ) : (
              <button
                onClick={handleGenerate}
                className="group relative flex flex-col items-center justify-center gap-3 w-full h-[140px] bg-brand-purple/10 hover:bg-brand-purple/20 border-2 border-dashed border-brand-purple/30 hover:border-brand-purple/50 rounded-2xl transition-all duration-300"
              >
                <div className="p-3 bg-brand-purple/20 rounded-full group-hover:scale-110 transition-transform">
                  <Sparkles size={24} className="text-brand-purple" />
                </div>
                <span className="text-[11px] font-black text-brand-purple uppercase tracking-[0.2em]">
                  Generate Media
                </span>
              </button>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-[9px] text-rose-400 bg-rose-400/10 border border-rose-400/20 rounded-lg px-2 py-1.5 break-words">
            {error}
          </div>
        )}
      </div>
    );
  }

  // ─── Fullscreen / Expanded View ───
  return (
    <div className="flex flex-col h-full w-full p-6 gap-6 overflow-y-auto custom-scrollbar">
      {/* Hero Image Area */}
      <div className="flex-1 relative bg-black/40 border border-white/5 rounded-2xl overflow-hidden flex items-center justify-center min-h-[300px]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={object?.metadata?.label || "Generated media"}
            className="max-w-full max-h-full object-contain"
          />
        ) : isGenerating ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={48} className="text-brand-cyan animate-spin" />
            <span className="text-sm font-black text-brand-cyan uppercase tracking-widest">
              Synthesizing Visual...
            </span>
          </div>
        ) : (
          <button
            onClick={handleGenerate}
            className="group flex flex-col items-center gap-4 text-brand-text-muted hover:text-brand-purple transition-colors"
          >
            <div className="p-8 bg-white/5 group-hover:bg-brand-purple/10 rounded-full border border-white/5 group-hover:border-brand-purple/20 transition-all">
              <Sparkles
                size={48}
                className="opacity-40 group-hover:opacity-100"
              />
            </div>
            <span className="text-sm uppercase tracking-[0.3em] font-black">
              Generate Media
            </span>
          </button>
        )}
      </div>

      {/* Audio Player (if available) */}
      {audioUrl && (
        <div className="flex items-center gap-3 px-4 py-3 bg-brand-purple/10 border border-brand-purple/20 rounded-xl">
          <Play size={16} className="text-brand-purple shrink-0" />
          <span className="text-xs font-bold text-white whitespace-nowrap">
            Audio
          </span>
          <audio src={audioUrl} controls className="h-8 w-full ml-2" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-xs text-rose-400 bg-rose-400/10 border border-rose-400/20 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Actions Bar */}
      {(imageUrl || isGenerating) && (
        <div className="flex items-center gap-3 shrink-0">
          {isGenerating ? (
            <div className="flex items-center gap-2 px-6 py-3 bg-brand-cyan/10 border border-brand-cyan/30 rounded-xl">
              <Loader2 size={16} className="text-brand-cyan animate-spin" />
              <span className="text-xs font-bold text-brand-cyan uppercase tracking-widest">
                Generating...
              </span>
            </div>
          ) : (
            <button
              onClick={handleGenerate}
              className="px-6 py-3 bg-brand-purple/20 hover:bg-brand-purple/40 text-brand-purple font-bold border border-brand-purple/50 rounded-xl text-xs uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <RefreshCw size={14} /> Regenerate
            </button>
          )}

          {imageUrl && (
            <a
              href={imageUrl}
              download={`${object?.metadata?.label || "generated"}.png`}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-bold border border-white/10 rounded-xl text-xs uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <Download size={14} /> Download
            </a>
          )}
        </div>
      )}
    </div>
  );
};
