import {
  Handle,
  Position,
  NodeResizer,
  type NodeProps,
  type Node,
  useReactFlow,
} from "@xyflow/react";
import React, { useCallback } from "react";
import { Mic, Square, Trash2 } from "lucide-react";
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
    <div className="flex flex-col min-w-[280px] min-h-[160px] h-full bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all hover:shadow-md relative">
      <NodeResizer
        isVisible={selected}
        minWidth={280}
        minHeight={160}
        lineClassName="!border-rose-400 !border-none"
        handleClassName="!bg-transparent !border-none !w-5 !h-5"
      />

      <Handle
        type="target"
        position={Position.Top}
        className="w-2.5 h-2.5 bg-rose-500 border border-white z-10"
      />

      {/* Header */}
      <div className="px-3.5 py-2 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-1.5">
          <Mic className={`w-3.5 h-3.5 ${recording ? "text-rose-600 animate-pulse" : "text-rose-500"}`} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Voice Recorder
          </span>
        </div>
        {recording && (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
            <span className="text-[9px] font-bold text-rose-500 uppercase">REC</span>
          </div>
        )}
        {currentAudioUrl && !recording && (
           <button 
           onClick={handleRemoveRecording}
           className="p-1 hover:bg-red-50 rounded transition-colors group/trash"
           title="Remove Recording"
         >
           <Trash2 className="w-3 h-3 text-slate-400 group-hover/trash:text-red-500" />
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
          className="text-sm font-semibold text-slate-800 outline-none w-full bg-transparent nodrag nopan"
        />

        <div className="flex-1 flex flex-col gap-3 justify-center">
          {!recording ? (
            <button
              onClick={startRecording}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95 group nodrag"
            >
              <Mic className="w-4 h-4 transition-transform group-hover:scale-110" />
              {currentAudioUrl ? "Record New" : "Start Recording"}
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95 nodrag"
            >
              <Square className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
              Stop Recording
            </button>
          )}

          {currentAudioUrl && (
            <div className="mt-2 flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
               <audio
                src={currentAudioUrl}
                controls
                className="w-full h-8 scale-90 origin-left"
              />
              <a
                href={currentAudioUrl}
                download={`${data.metadata.title || "recording"}.webm`}
                className="text-[9px] text-center font-bold text-slate-400 hover:text-rose-500 transition-colors tracking-widest uppercase"
              >
                Download Recording
              </a>
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2.5 h-2.5 bg-rose-500 border border-white"
      />
    </div>
  );
}

