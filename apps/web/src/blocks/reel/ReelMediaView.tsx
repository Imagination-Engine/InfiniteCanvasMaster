import React, { useState } from "react";
import type { BlockViewProps } from "@iem/core";
import {
  Image as ImageIcon,
  Play,
  Film,
  Loader2,
  Download,
  RefreshCw,
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
        {/* Image Preview */}
        <div className="relative bg-black/60 border border-white/5 rounded-xl overflow-hidden">
          <div className="absolute top-1.5 left-1.5 flex items-center gap-1.5 opacity-60 z-10">
            <Film size={10} className="text-brand-purple" />
            <span className="text-[7px] font-bold uppercase tracking-widest text-brand-purple">
              Media
            </span>
          </div>

          {imageUrl ? (
            <img
              src={imageUrl}
              alt={object?.metadata?.label || "Generated media"}
              className="w-full h-[140px] object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-1.5 h-[100px] text-brand-text-muted">
              <ImageIcon size={20} className="opacity-20" />
              <span className="text-[9px] uppercase tracking-tighter font-medium opacity-40">
                No Visual
              </span>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="text-[9px] text-rose-400 bg-rose-400/10 border border-rose-400/20 rounded-lg px-2 py-1.5 truncate">
            {error}
          </div>
        )}

        {/* Generate / Regenerate button */}
        {isGenerating ? (
          <div className="flex items-center justify-center gap-1.5 py-1.5">
            <Loader2 size={12} className="text-brand-cyan animate-spin" />
            <span className="text-[9px] font-bold text-brand-cyan uppercase tracking-widest">
              Generating...
            </span>
          </div>
        ) : (
          onParamsChange && (
            <button
              onClick={handleGenerate}
              className="w-full px-3 py-1.5 bg-brand-purple/20 hover:bg-brand-purple/40 text-brand-purple font-bold border border-brand-purple/30 rounded-lg text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
            >
              {imageUrl ? (
                <>
                  <RefreshCw size={10} /> Regenerate
                </>
              ) : (
                <>Generate Media</>
              )}
            </button>
          )
        )}
      </div>
    );
  }

  // ─── Fullscreen / Expanded View ───
  return (
    <div className="flex flex-col h-full w-full p-6 gap-6">
      {/* Hero Image Area */}
      <div className="flex-1 relative bg-black/40 border border-white/5 rounded-2xl overflow-hidden flex items-center justify-center min-h-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={object?.metadata?.label || "Generated media"}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-4 text-brand-text-muted">
            <ImageIcon size={48} className="opacity-15" />
            <span className="text-sm uppercase tracking-widest font-medium opacity-30">
              No Visual Generated
            </span>
          </div>
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
      <div className="flex items-center gap-3 shrink-0">
        {isGenerating ? (
          <div className="flex items-center gap-2 px-6 py-3 bg-brand-cyan/10 border border-brand-cyan/30 rounded-xl">
            <Loader2 size={16} className="text-brand-cyan animate-spin" />
            <span className="text-xs font-bold text-brand-cyan uppercase tracking-widest">
              Generating Image...
            </span>
          </div>
        ) : (
          onParamsChange && (
            <button
              onClick={handleGenerate}
              className="px-6 py-3 bg-brand-purple/20 hover:bg-brand-purple/40 text-brand-purple font-bold border border-brand-purple/50 rounded-xl text-xs uppercase tracking-widest transition-all flex items-center gap-2"
            >
              {imageUrl ? (
                <>
                  <RefreshCw size={14} /> Regenerate
                </>
              ) : (
                <>Generate Media</>
              )}
            </button>
          )
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
    </div>
  );
};
