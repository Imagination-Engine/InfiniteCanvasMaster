import {
  Handle,
  Position,
  type NodeProps,
  type Node,
  useReactFlow,
} from "@xyflow/react";
import React, { useCallback } from "react";
import { Mic, Square } from "lucide-react";
import { useAudioRecorder } from "../../hooks/useAudioRecorder";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * AudioRecordingNode.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * A specialized React Flow node that enables voice recording directly
 * from the canvas.
 *
 * This component uses:
 * 1. `@xyflow/react`: For node handles and state updates.
 * 2. `useAudioRecorder`: A custom hook encapsulating MediaRecorder logic.
 * 3. `lucide-react`: For high-quality, scalable icons.
 * 4. `Tailwind CSS`: For a premium glassmorphism aesthetic.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type AudioRecordingNodeData = {
  label: string;
};

export type AudioRecordingNodeType = Node<
  AudioRecordingNodeData,
  "audioRecording"
>;

/**
 * AudioRecordingNode Component
 *
 * @param id - Unique node identifier provided by React Flow.
 * @param data - The persistent data for this node (label).
 */
export function AudioRecordingNode({
  id,
  data,
}: NodeProps<AudioRecordingNodeType>) {
  // Access React Flow's API to update node data globally
  const { updateNodeData } = useReactFlow();

  // Custom hook for all audio recording logic
  const {
    recording,
    audioURL,
    startRecording,
    stopRecording,
  } = useAudioRecorder();

  /**
   * Persists the text label as the user types.
   */
  const handleLabelChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateNodeData(id, {
        label: e.target.value,
      });
    },
    [id, updateNodeData],
  );

  return (
    <div className="flex flex-col min-w-[240px] bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden transition-all duration-300 hover:shadow-2xl">
      {/* 
          TARGET HANDLE (INPUT)
          Allows data/events to flow into this node from the left.
      */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-rose-400 border-2 border-white"
      />

      {/* 
          HEADER ACCENT BAR
          Animates when recording to provide immediate visual feedback.
      */}
      <div
        className={`h-1.5 w-full transition-colors duration-500 ${
          recording
            ? "bg-rose-500 animate-pulse"
            : "bg-rose-400"
        }`}
      />

      <div className="p-4 flex flex-col gap-4">
        {/* HEADER: Title and Editable Label */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <Mic className="w-3 h-3 text-rose-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Voice Recorder
              </span>
            </div>
            <input
              type="text"
              value={data.label}
              onChange={handleLabelChange}
              // Prevent dragging the node when interacting with the input
              onKeyDown={(e) =>
                e.stopPropagation()
              }
              className="text-sm font-semibold text-slate-800 bg-transparent outline-none focus:text-rose-600 transition-colors nowheel nodrag nopan"
              placeholder="Recording Name..."
            />
          </div>

          {/* Pulsing REC Indicator */}
          {recording && ( 
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
              <span className="text-[10px] font-bold text-rose-500">
                REC
              </span>
            </div>
          )}
        </div>

        {/* RECORDER CONTROLS: Dynamic button based on recording state */}
        <div className="flex flex-col gap-3">
          {!recording ? (
            <button
              onClick={startRecording}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition-all shadow-md active:scale-95 group"
            >
              <Mic className="w-4 h-4 transition-transform group-hover:scale-110" />
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium transition-all shadow-md active:scale-95"
            >
              <Square className="w-3 h-3 fill-rose-500 text-rose-500 animate-pulse" />
              Stop Recording
            </button>
          )}

          {/* AUDIO PLAYER: Displayed only after a recording is finished */}
          {audioURL && (
            <div className="flex flex-col gap-2 mt-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <audio
                src={audioURL}
                controls
                className="w-full h-8"
              />
              <a
                href={audioURL}
                download={`${data.label || "recording"}.webm`}
                className="text-[10px] text-center font-bold text-slate-400 hover:text-rose-500 transition-colors tracking-wide uppercase"
              >
                Download Recording
              </a>
            </div>
          )}
        </div>
      </div>

      {/* 
          SOURCE HANDLE (OUTPUT)
          Allows connection to downstream nodes from the right.
      */}
      <Handle
        type="source"
        position={Position.Right}
        id="audio"
        className="w-3 h-3 bg-rose-400 border-2 border-white"
      />
    </div>
  );
}
