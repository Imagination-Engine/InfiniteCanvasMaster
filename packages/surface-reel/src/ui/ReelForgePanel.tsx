// @ts-nocheck
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildVideoProjectArtifact,
  collectReelReferences,
  type VideoForgeState,
  type VideoReferenceAsset,
  VEO_MAX_REFERENCE_IMAGES,
} from "@iem/core";
import { Film, Loader2, Sparkles, AlertTriangle, Download } from "lucide-react";

export type ReelForgeConnection = {
  id?: string;
  sourceId?: string;
  targetId?: string;
  fromId?: string;
  toId?: string;
};

export type ReelForgeObject = {
  id: string;
  x?: number;
  y?: number;
  type?: string;
  blockKind?: string;
  metadata?: Record<string, unknown>;
};

export type VideoStudioPayload = {
  title: string;
  scenes: Array<{ id: string; label: string; durationSec: number }>;
  status?: "draft" | "editing" | "ready";
  references?: VideoReferenceAsset[];
  forge?: VideoForgeState;
};

export type ReelForgePanelProps = {
  forgeObjectId: string;
  payload: VideoStudioPayload;
  connections: ReelForgeConnection[];
  objects: Record<string, ReelForgeObject>;
  onPayloadChange: (next: VideoStudioPayload) => void;
  apiBase?: string;
  compact?: boolean;
};

const defaultForge = (): VideoForgeState => ({
  prompt: "",
  status: "idle",
});

async function pollVideoJob(
  apiBase: string,
  operationId: string,
  onProgress: (status: string) => void,
): Promise<{ clipUrl?: string; error?: string }> {
  const maxAttempts = 120;
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `${apiBase}/api/reel/generate-video/${operationId}`,
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { error: err.error || `Poll failed (${res.status})` };
    }
    const data = await res.json();
    onProgress(data.status);

    if (data.status === "done") {
      return { clipUrl: data.clipUrl };
    }
    if (data.status === "error") {
      return { error: data.error || "Video generation failed" };
    }

    await new Promise((r) => setTimeout(r, 3000));
  }
  return { error: "Timed out waiting for video generation" };
}

export const ReelForgePanel: React.FC<ReelForgePanelProps> = ({
  forgeObjectId,
  payload,
  connections,
  objects,
  onPayloadChange,
  apiBase = "",
  compact = false,
}) => {
  const forge = payload.forge ?? defaultForge();
  const [localPrompt, setLocalPrompt] = useState(forge.prompt);
  const [isForging, setIsForging] = useState(false);
  const [pollStatus, setPollStatus] = useState<string | null>(null);

  useEffect(() => {
    setLocalPrompt(forge.prompt);
  }, [forge.prompt]);

  const objectImageFingerprint = useMemo(
    () =>
      Object.entries(objects)
        .map(([id, obj]) => {
          const meta = obj.metadata ?? {};
          const inputs = meta.inputs as Record<string, unknown> | undefined;
          const outputs = meta.outputs as Record<string, unknown> | undefined;
          const url =
            meta.imageUrl ?? inputs?.imageUrl ?? outputs?.imageUrl ?? "";
          return `${id}:${url}`;
        })
        .join("|"),
    [objects],
  );

  const collected = useMemo(
    () => collectReelReferences(forgeObjectId, connections, objects),
    [forgeObjectId, connections, objects, objectImageFingerprint],
  );

  const references = payload.references?.length
    ? payload.references
    : collected.references;

  const persist = useCallback(
    (next: VideoStudioPayload) => {
      onPayloadChange(next);
    },
    [onPayloadChange],
  );

  const handleForge = async () => {
    const prompt = localPrompt.trim();
    if (!prompt) return;

    setIsForging(true);
    setPollStatus("pending");

    const nextForge: VideoForgeState = {
      prompt,
      status: "generating",
    };

    persist({
      ...payload,
      references: collected.references,
      forge: nextForge,
    });

    try {
      const res = await fetch(`${apiBase}/api/reel/generate-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          referenceImages: collected.references.map((r) => ({
            url: r.imageUrl,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }

      const { operationId } = await res.json();
      const result = await pollVideoJob(apiBase, operationId, setPollStatus);

      if (result.error) {
        persist({
          ...payload,
          references: collected.references,
          forge: {
            prompt,
            status: "error",
            veoOperationId: operationId,
            error: result.error,
          },
        });
        return;
      }

      persist({
        ...payload,
        status: "ready",
        references: collected.references,
        forge: {
          prompt,
          status: "ready",
          clipUrl: result.clipUrl,
          veoOperationId: operationId,
        },
      });
    } catch (err) {
      persist({
        ...payload,
        references: collected.references,
        forge: {
          prompt,
          status: "error",
          error: err instanceof Error ? err.message : "Forge failed",
        },
      });
    } finally {
      setIsForging(false);
      setPollStatus(null);
    }
  };

  const clipUrl = forge.clipUrl;

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-brand-purple/80">
          <Film size={10} />
          Reel Forge
        </div>
        <div className="flex gap-1">
          {references.slice(0, 3).map((r) => (
            <img
              key={r.objectId}
              src={r.imageUrl}
              alt=""
              className="w-10 h-10 rounded object-cover border border-white/10"
            />
          ))}
          {references.length === 0 && (
            <span className="text-[10px] text-white/40">
              Connect image nodes
            </span>
          )}
        </div>
        <div className="text-[10px] text-white/50 truncate">
          {forge.status === "ready"
            ? "Video ready"
            : forge.status === "generating"
              ? "Forging…"
              : payload.title}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 max-w-4xl mx-auto w-full p-8">
      <div>
        <h2 className="text-xl font-black uppercase tracking-widest text-white border-b border-white/10 pb-4">
          Video Studio — Reel Forge
        </h2>
        <p className="text-sm text-white/50 mt-2">
          Connect up to {VEO_MAX_REFERENCE_IMAGES} image nodes, describe motion,
          then forge a clip with Google Veo.
        </p>
      </div>

      {collected.totalConnected > 0 && references.length === 0 && (
        <div className="flex items-start gap-2 text-rose-200/90 text-xs bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          {collected.totalConnected} block
          {collected.totalConnected === 1 ? " is" : "s are"} connected but no
          generated image was found. Open each Text to Image node and click
          Generate still, then try again.
        </div>
      )}

      {collected.ignoredCount > 0 && (
        <div className="flex items-start gap-2 text-amber-200/90 text-xs bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          Veo uses {VEO_MAX_REFERENCE_IMAGES} references;{" "}
          {collected.ignoredCount} connected image
          {collected.ignoredCount === 1 ? "" : "s"} ignored (left-to-right
          order).
        </div>
      )}

      <section>
        <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
          Reference tray ({references.length}/{VEO_MAX_REFERENCE_IMAGES})
        </div>
        <div className="flex flex-wrap gap-3">
          {references.length === 0 ? (
            <div className="text-sm text-white/40 border border-dashed border-white/10 rounded-xl px-4 py-8 w-full text-center">
              Drop or connect nodes that output images (Text to Image,
              Character, Scene, etc.)
            </div>
          ) : (
            references.map((r) => (
              <div
                key={r.objectId}
                className="relative w-36 rounded-xl overflow-hidden border border-white/10 bg-black/40"
              >
                <img
                  src={r.imageUrl}
                  alt={r.label || r.blockId}
                  className="w-full h-24 object-cover"
                />
                <div className="px-2 py-1 text-[9px] text-white/60 truncate">
                  {r.label || r.blockId.split(".").pop()}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">
          Motion prompt
        </label>
        <textarea
          className="min-h-[120px] w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[15px] text-white/90 leading-relaxed resize-none focus:outline-none focus:border-brand-purple/50"
          value={localPrompt}
          onChange={(e) => setLocalPrompt(e.target.value)}
          placeholder="Slow cinematic dolly forward, soft lighting, characters stay consistent with references…"
        />
      </section>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={isForging || !localPrompt.trim()}
          onClick={handleForge}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-purple text-white text-sm font-bold uppercase tracking-wider disabled:opacity-40 hover:bg-brand-purple/90 transition-colors"
        >
          {isForging ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Sparkles size={16} />
          )}
          {isForging ? "Forging…" : "Forge video"}
        </button>
        {pollStatus && (
          <span className="text-xs text-white/50 uppercase tracking-widest">
            {pollStatus}
          </span>
        )}
        {forge.status === "error" && forge.error && (
          <span className="text-xs text-red-400">{forge.error}</span>
        )}
      </div>

      {clipUrl && forge.status === "ready" && (
        <section className="flex-1 min-h-0 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/40">
              Playback
            </div>
            <a
              href={clipUrl}
              download={`${payload.title || "reel"}.mp4`}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest transition-all"
            >
              <Download size={14} /> Download MP4
            </a>
          </div>
          <video
            key={clipUrl}
            src={clipUrl}
            controls
            className="w-full max-h-[420px] rounded-2xl border border-white/10 bg-black shadow-2xl"
          />
        </section>
      )}
    </div>
  );
};

export function videoPayloadFromMetadata(
  metadata: Record<string, unknown> | undefined,
  defaults: VideoStudioPayload,
): VideoStudioPayload {
  const stored = metadata?.studioPayload;
  if (stored && typeof stored === "object") {
    return { ...defaults, ...(stored as VideoStudioPayload) };
  }
  return { ...defaults };
}

export function persistVideoStudioPayload(
  blockId: string,
  objectId: string,
  metadata: Record<string, unknown> | undefined,
  payload: VideoStudioPayload,
): Record<string, unknown> {
  const artifact = buildVideoProjectArtifact(blockId, {
    title: payload.title,
    scenes: payload.scenes ?? [],
    status: payload.status ?? (payload.forge?.clipUrl ? "ready" : "draft"),
    references: payload.references,
    forge: payload.forge,
  });
  return {
    ...metadata,
    studioPayload: payload,
    outputs: {
      ...(typeof metadata?.outputs === "object"
        ? (metadata.outputs as Record<string, unknown>)
        : {}),
      "video-project": artifact,
    },
  };
}
