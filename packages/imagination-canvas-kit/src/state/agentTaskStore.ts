import { create } from "zustand";

export type TaskStatus =
  | "queued"
  | "running"
  | "waiting-for-user"
  | "completed"
  | "failed";

export type TaskScope =
  | { type: "global" }
  | { type: "selection"; ids: string[] }
  | { type: "object"; id: string }
  | {
      type: "region";
      rect: { x: number; y: number; width: number; height: number };
    };

export interface AgentCanvasTask {
  id: string;
  agentId: string;
  scope: TaskScope;
  intent: string;
  status: TaskStatus;
  createdAt: number;
}

interface AgentTaskState {
  tasks: AgentCanvasTask[];

  addTask: (
    taskConfig: Omit<AgentCanvasTask, "id" | "status" | "createdAt">,
  ) => string;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  clearCompletedTasks: () => void;
}

export const useAgentTaskStore = create<AgentTaskState>((set) => ({
  tasks: [],

  addTask: (config) => {
    const id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newTask: AgentCanvasTask = {
      ...config,
      id,
      status: "queued",
      createdAt: Date.now(),
    };

    set((state) => ({ tasks: [...state.tasks, newTask] }));
    return id;
  },

  updateTaskStatus: (id, status) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, status } : task,
      ),
    })),

  clearCompletedTasks: () =>
    set((state) => ({
      tasks: state.tasks.filter(
        (task) => task.status !== "completed" && task.status !== "failed",
      ),
    })),
}));
