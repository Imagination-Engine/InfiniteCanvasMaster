import { create } from "zustand";
import { Node, Edge } from "@xyflow/react";
import { Session } from "@supabase/supabase-js";

export type Message = { role: "user" | "agent"; content: string };
export type Artifact = { name: string; content: string; type: string };
export type AppNodeData = {
  label: string;
  instruction: string;
  input?: string;
  output?: string;
  status: "idle" | "running" | "success" | "failed";
};

export type AppType = "WEB" | "DESKTOP" | "CLI" | "UNKNOWN";

interface WorkflowState {
  // Auth
  session: Session | null;
  setSession: (session: Session | null) => void;

  // Goal Chat
  goalMessages: Message[];
  addGoalMessage: (msg: Message) => void;
  goal: string;
  setGoal: (goal: string) => void;
  appType: AppType;
  setAppType: (type: AppType) => void;

  // Workflow Graph
  nodes: Node<AppNodeData>[];
  edges: Edge[];
  setNodes: (nodes: Node<AppNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateNodeData: (nodeId: string, data: Partial<AppNodeData>) => void;

  // Refinement
  refineMessages: Message[];
  addRefineMessage: (msg: Message) => void;
  modifications: string;
  setModifications: (mods: string) => void;

  // Artifacts
  artifacts: Artifact[];
  addArtifact: (artifact: Artifact) => void;
  clearArtifacts: () => void;

  // Projects
  currentProjectId: string | null;
  setCurrentProjectId: (id: string | null) => void;
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
  session: null,
  setSession: (session) => set({ session }),

  goalMessages: [
    {
      role: "agent",
      content: "What kind of application or script do you want to build today?",
    },
  ],
  addGoalMessage: (msg) =>
    set((state) => ({ goalMessages: [...state.goalMessages, msg] })),
  goal: "",
  setGoal: (goal) => set({ goal }),
  appType: "UNKNOWN",
  setAppType: (appType) => set({ appType }),

  nodes: [],
  edges: [],
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  updateNodeData: (nodeId, data) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n,
      ),
    })),

  refineMessages: [
    {
      role: "agent",
      content: "Here is the workflow. Want to add or change any steps?",
    },
  ],
  addRefineMessage: (msg) =>
    set((state) => ({ refineMessages: [...state.refineMessages, msg] })),
  modifications: "",
  setModifications: (mods) =>
    set((state) => ({ modifications: state.modifications + " " + mods })),

  artifacts: [],
  addArtifact: (artifact) =>
    set((state) => ({ artifacts: [...state.artifacts, artifact] })),
  clearArtifacts: () => set({ artifacts: [] }),

  currentProjectId: null,
  setCurrentProjectId: (currentProjectId) => set({ currentProjectId }),
}));
