import { create } from "zustand";

export type CanvasTool =
  | "select"
  | "hand"
  | "note"
  | "shape"
  | "agent"
  | "artifact"
  | "connection";

interface ToolState {
  activeTool: CanvasTool;
  creationPayload: any | null;

  setTool: (tool: CanvasTool) => void;
  setCreationMode: (tool: CanvasTool, payload: any) => void;
}

export const useToolStore = create<ToolState>((set) => ({
  activeTool: "select",
  creationPayload: null,

  setTool: (tool) =>
    set({
      activeTool: tool,
      creationPayload: null, // Clear payload when switching tools generically
    }),

  setCreationMode: (tool, payload) =>
    set({
      activeTool: tool,
      creationPayload: payload,
    }),
}));
