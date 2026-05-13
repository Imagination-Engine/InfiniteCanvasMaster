import { create } from "zustand";
import { Node, Edge } from "@xyflow/react";

type Message = { role: "user" | "agent"; content: string };
type Artifact = { name: string; content: string; type: string };

interface WorkflowState {
  // Goal Chat (Page 1)
  goalMessages: Message[];
  addGoalMessage: (msg: Message) => void;
  goal: string;
  setGoal: (goal: string) => void;

  // Workflow (Page 2)
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;

  // Refinement Chat (Page 2 Left)
  refineMessages: Message[];
  addRefineMessage: (msg: Message) => void;

  // Artifacts (Page 2 Right)
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

  refineMessages: [
    {
      role: "agent",
      content:
        "Here is your initial workflow. Would you like me to make any changes before we run it?",
    },
  ],
  addRefineMessage: (msg) =>
    set((state) => ({ refineMessages: [...state.refineMessages, msg] })),

  artifacts: [],
  addArtifact: (artifact) =>
    set((state) => ({ artifacts: [...state.artifacts, artifact] })),
  clearArtifacts: () => set({ artifacts: [] }),
}));
