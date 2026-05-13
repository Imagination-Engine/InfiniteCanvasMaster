import { create } from "zustand";
import { Node, Edge } from "@xyflow/react";

export type Message = { role: "user" | "agent"; content: string };
export type Artifact = { name: string; content: string; type: string };
export type AppNodeData = {
  label: string;
  instruction: string;
  output?: string;
};

interface WorkflowState {
  // Goal Chat
  goalMessages: Message[];
  addGoalMessage: (msg: Message) => void;
  goal: string;
  setGoal: (goal: string) => void;

  // Workflow Graph
  nodes: Node<AppNodeData>[];
  edges: Edge[];
  setNodes: (nodes: Node<AppNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateNodeOutput: (nodeId: string, output: string) => void;

  // Refinement
  refineMessages: Message[];
  addRefineMessage: (msg: Message) => void;
  modifications: string;
  setModifications: (mods: string) => void;

  // Artifacts
  artifacts: Artifact[];
  addArtifact: (artifact: Artifact) => void;
  clearArtifacts: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
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

  nodes: [],
  edges: [],
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  updateNodeOutput: (nodeId, output) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, output } } : n,
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
}));
