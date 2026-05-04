import { create } from "zustand";
import type { BalnceEnvelope } from "@iem/core";

export type BlockProjectionState = {
  status?:
    | "idle"
    | "running"
    | "streaming"
    | "waiting_for_approval"
    | "complete"
    | "error";
  phase?: string;
  textBuffer?: string;
  progress?: number;
  previewUrl?: string;
  error?: string;
  lastEventId?: string;
  updatedAt?: number;
};

interface CanvasProjectionStore {
  blockProjections: Record<string, BlockProjectionState>;
  applyEnvelope: (envelope: BalnceEnvelope) => void;
}

const EMPTY_BLOCK_PROJECTION: BlockProjectionState = {};

let pendingTextBuffers: Record<string, string> = {};
let flushTimeout: any = null;

export const useCanvasProjectionStore = create<CanvasProjectionStore>(
  (set, get) => ({
    blockProjections: {},
    applyEnvelope: (envelope) => {
      if (envelope.lane !== "ui_projection") return;
      if (envelope.source?.type !== "block" || !envelope.source.id) return;

      const blockId = envelope.source.id;
      const payload = envelope.payload as any;

      if (envelope.event.type === "text_delta") {
        // Coalesce text deltas
        pendingTextBuffers[blockId] =
          (pendingTextBuffers[blockId] || "") + (payload.text || "");

        if (!flushTimeout) {
          flushTimeout = setTimeout(() => {
            set((state) => {
              const nextProjections = { ...state.blockProjections };
              for (const [id, buffer] of Object.entries(pendingTextBuffers)) {
                const current = nextProjections[id] || {};
                nextProjections[id] = {
                  ...current,
                  textBuffer: (current.textBuffer || "") + buffer,
                  updatedAt: Date.now(),
                };
              }
              pendingTextBuffers = {};
              flushTimeout = null;
              return { blockProjections: nextProjections };
            });
          }, 32); // ~30fps flush rate for text rendering
        }
      } else {
        // Apply immediate status/progress events
        set((state) => {
          const current = state.blockProjections[blockId] || {};
          const nextState: BlockProjectionState = { ...current };

          if (envelope.event.type === "status_change")
            nextState.status = payload.status;
          if (payload.phase) nextState.phase = payload.phase;
          if (payload.progress !== undefined)
            nextState.progress = payload.progress;
          if (payload.previewUrl) nextState.previewUrl = payload.previewUrl;
          if (envelope.event.type === "error") {
            nextState.status = "error";
            nextState.error = payload.message;
          }

          nextState.updatedAt = Date.now();
          nextState.lastEventId = envelope.id;

          return {
            blockProjections: {
              ...state.blockProjections,
              [blockId]: nextState,
            },
          };
        });
      }
    },
  }),
);

export function useBlockProjection(blockId: string): BlockProjectionState {
  return useCanvasProjectionStore(
    (state) => state.blockProjections[blockId] ?? EMPTY_BLOCK_PROJECTION,
  );
}
