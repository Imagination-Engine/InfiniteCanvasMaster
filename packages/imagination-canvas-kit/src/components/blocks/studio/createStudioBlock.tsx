// @ts-nocheck
import React, { useState, useEffect, useCallback } from "react";
import type { BlockComponentProps } from "../../../contracts/BlockRegistry";
import { useCanvasStore } from "../../../state/canvasStore";
import type { StudioArtifact } from "@iem/core";

export type StudioBlockConfig = {
  blockId: string;
  contractId: string;
  compactLabel: string;
  fullscreenTitle: string;
  placeholder: string;
  defaultPayload: Record<string, unknown>;
  buildArtifact: (
    blockId: string,
    payload: Record<string, unknown>,
  ) => StudioArtifact;
  renderSummary: (payload: Record<string, unknown>) => React.ReactNode;
};

function payloadFromMetadata(
  metadata: Record<string, unknown>,
): Record<string, unknown> {
  const stored = metadata.studioPayload;
  if (stored && typeof stored === "object") {
    return stored as Record<string, unknown>;
  }
  return {};
}

export function createStudioBlock(
  config: StudioBlockConfig,
): React.FC<BlockComponentProps> {
  return function StudioBlock({ object, mode = "compact" }) {
    const updateObject = useCanvasStore((s) => s.updateObject);
    const isImmersive = mode === "fullscreen" || mode === "side-panel";

    const [payload, setPayload] = useState<Record<string, unknown>>(() => ({
      ...config.defaultPayload,
      ...payloadFromMetadata(object.metadata || {}),
    }));

    useEffect(() => {
      setPayload({
        ...config.defaultPayload,
        ...payloadFromMetadata(object.metadata || {}),
      });
    }, [object.id, object.metadata?.studioPayload]);

    const persist = useCallback(
      (next: Record<string, unknown>) => {
        const artifact = config.buildArtifact(config.blockId, next);
        updateObject(object.id, {
          metadata: {
            ...object.metadata,
            studioPayload: next,
            outputs: { [config.contractId]: artifact },
          },
        });
      },
      [object.id, object.metadata, updateObject],
    );

    const onField =
      (key: string) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPayload((prev) => ({ ...prev, [key]: e.target.value }));
      };

    const onBlurField =
      (key: string) =>
      (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const next = { ...payload, [key]: e.target.value };
        setPayload(next);
        persist(next);
      };

    if (!isImmersive) {
      return (
        <div className="space-y-2">
          <div className="text-[9px] font-black uppercase tracking-widest text-brand-cyan/70">
            {config.compactLabel}
          </div>
          <div className="text-[11px] text-white/60 line-clamp-3">
            {config.renderSummary(payload)}
          </div>
        </div>
      );
    }

    const titleKey =
      "title" in payload
        ? "title"
        : "name" in payload
          ? "name"
          : "topic" in payload
            ? "topic"
            : null;
    const bodyKey =
      "body" in payload
        ? "body"
        : "summary" in payload
          ? "summary"
          : "systemPrompt" in payload
            ? "systemPrompt"
            : null;

    return (
      <div className="h-full flex flex-col p-8 max-w-4xl mx-auto w-full">
        <h2 className="text-xl font-black uppercase tracking-widest text-white mb-6 border-b border-white/10 pb-4">
          {config.fullscreenTitle}
        </h2>
        <div className="flex-1 min-h-0 flex flex-col gap-4">
          {titleKey && (
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg text-white focus:outline-none focus:border-brand-cyan/50"
              value={String(payload[titleKey] ?? "")}
              onChange={onField(titleKey)}
              onBlur={onBlurField(titleKey)}
              placeholder="Title"
            />
          )}
          {bodyKey ? (
            <textarea
              className="flex-1 min-h-[320px] w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[15px] text-white/90 leading-relaxed resize-none focus:outline-none focus:border-brand-cyan/50"
              value={String(payload[bodyKey] ?? "")}
              onChange={onField(bodyKey)}
              onBlur={onBlurField(bodyKey)}
              placeholder={config.placeholder}
            />
          ) : (
            <div className="flex-1 text-sm text-white/50">
              {config.renderSummary(payload)}
            </div>
          )}
          <div className="text-[10px] text-white/30 uppercase tracking-widest">
            Artifact auto-saves on blur
          </div>
        </div>
      </div>
    );
  };
}
