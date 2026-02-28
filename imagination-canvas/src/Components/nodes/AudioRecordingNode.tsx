import {
  Handle,
  Position,
  NodeResizer,
  type NodeProps,
  type Node,
  useReactFlow,
} from "@xyflow/react";
import React, { useCallback } from "react";
import { Mic, Square } from "lucide-react";
import { useAudioRecorder } from "../../hooks/useAudioRecorder";
import type { BlockData } from "../../canvas/types/blockTypes";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * AudioRecordingNode.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Updated to follow the standardized BlockData<"audio"> schema.
 * Supports:
 *  1. Live voice recording via MediaRecorder hook.
 *  2. Schema-compliant metadata and content management.
 *  3. Node resizing with invisible handles.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type AudioRecordingNodeData = BlockData<"audio">;
export type AudioRecordingNodeType = Node<AudioRecordingNodeData, "audio">;

export function AudioRecordingNode({
  id,
  data,
  selected,
}: NodeProps<AudioRecordingNodeType>) {
  const { updateNodeData } = useReactFlow();

  // Custom hook for all audio recording logic
  const {
    recording,
    audioURL,
    startRecording,
    stopRecording,
  } = useAudioRecorder();

  // ── Persistence Logic ───────────────────────────────────────────
  
  // Update parent when recording finishes
  React.useEffect(() => {
    if (audioURL && audioURL !== data.content.audioUrl) {
      updateNodeData(id, {
        ...data,
        content: {
          ...data.content,
          audioUrl: audioURL,
        },
        metadata: {
          ...data.metadata,
          lastModifiedAt: new Date().toISOString(),
          version: data.metadata.version + 1,
        },
      });
    }
  }, [audioURL, id, data, updateNodeData]);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateNodeData(id, {
        ...data,
        metadata: {
          ...data.metadata,
          title: e.target.value,
        },
      });
    },
    [id, data, updateNodeData],
  );

  const handleRemoveRecording = useCallback(() => {
    updateNodeData(id, {
      ...data,
      content: {
        ...data.content,
        audioUrl: "",
      },
      metadata: {
        ...data.metadata,
        lastModifiedAt: new Date().toISOString(),
        version: data.metadata.version + 1,
      },
    });
  }, [id, data, updateNodeData]);

  const currentAudioUrl = data.content.audioUrl || audioURL;

  return (
    <div className={`flex flex-col min-w-[280px] min-h-[160px] h-full bg-white/[0.03] backdrop-blur-3xl rounded-2xl border transition-all duration-300 relative group overflow-hidden ${
      selected ? "border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.15)] scale-[1.01]" : "border-white/5 shadow-2xl"
    }`}>
      <NodeResizer
        isVisible={selected}
        minWidth={280}
        minHeight={160}
        lineClassName="!border-rose-500/50 !border-none"
        handleClassName="!bg-transparent !border-none !w-5 !h-5"
      />

      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-rose-500 border border-white/20 z-10"
      />

      {/* Header */}
      <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Mic className={`w-3.5 h-3.5 ${recording ? "text-rose-600 animate-pulse shadow-[0_0_10px_rgba(225,29,72,0.5)]" : "text-rose-500"}`} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6B7A99]">
            Voice Recorder
          </span>
        </div>
        {recording && (
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
            <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Live</span>
          </div>
        )}
        {currentAudioUrl && !recording && (
          <button 
           onClick={handleRemoveRecording}
           className="p-1.5 hover:bg-rose-500/10 rounded-lg transition-colors group/trash"
           title="Remove"
         >
           <Mic className="w-3 h-3 text-[#6B7A99] group-hover/trash:text-rose-500" />
         </button>
        )}
      </div>

      <div className="flex-1 flex flex-col p-4 gap-4">
        {/* Title Input */}
        <input
          type="text"
          value={data.metadata.title}
          onChange={handleTitleChange}
          placeholder="Recording Name..."
          className="text-sm font-black text-white outline-none w-full bg-transparent nodrag nopan uppercase tracking-tight"
        />

        <div className="flex-1 flex flex-col gap-4 justify-center">
          {!recording ? (
            <button
              onClick={startRecording}
              className="flex items-center justify-center gap-3 py-4 px-6 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-rose-500/20 active:scale-95 group nodrag"
            >
              <Mic className="w-4 h-4 transition-transform group-hover:scale-110" />
              {currentAudioUrl ? "New Take" : "Begin Recording"}
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center justify-center gap-3 py-4 px-6 bg-white text-[#0A0A0F] rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 nodrag"
            >
              <Square className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
              Stop Session
            </button>
          )}

          {currentAudioUrl && (
            <div className="mt-2 flex flex-col gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden">
               <audio
                src={currentAudioUrl}
                controls
                className="w-full h-8 brightness-90 contrast-125"
              />
              <div className="flex justify-center">
                <a
                  href={currentAudioUrl}
                  download={`${data.metadata.title || "recording"}.webm`}
                  className="text-[9px] font-black text-[#6B7A99] hover:text-rose-500 transition-colors tracking-[0.2em] uppercase"
                >
                  Export Archive
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-rose-500 border border-white/20"
      />
    </div>
  );
}

