/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useAgentTaskStore } from "../agentTaskStore";

describe("Agent Task Store", () => {
  beforeEach(() => {
    useAgentTaskStore.setState({ tasks: [] });
  });

  it("should add a new task with initial queued status", () => {
    const { addTask } = useAgentTaskStore.getState();
    const taskId = addTask({
      agentId: "agent-1",
      scope: { type: "selection", ids: ["obj-1"] },
      intent: "Summarize text",
    });

    const tasks = useAgentTaskStore.getState().tasks;
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe(taskId);
    expect(tasks[0].status).toBe("queued");
    expect(tasks[0].scope.type).toBe("selection");
  });

  it("should update task status", () => {
    const { addTask, updateTaskStatus } = useAgentTaskStore.getState();
    const taskId = addTask({
      agentId: "agent-1",
      scope: { type: "global" },
      intent: "Auto-layout canvas",
    });

    updateTaskStatus(taskId, "running");

    let task = useAgentTaskStore.getState().tasks.find((t) => t.id === taskId);
    expect(task?.status).toBe("running");

    updateTaskStatus(taskId, "waiting-for-user");
    task = useAgentTaskStore.getState().tasks.find((t) => t.id === taskId);
    expect(task?.status).toBe("waiting-for-user");
  });

  it("should clear completed tasks", () => {
    const { addTask, updateTaskStatus, clearCompletedTasks } =
      useAgentTaskStore.getState();
    const id1 = addTask({
      agentId: "a1",
      scope: { type: "global" },
      intent: "task 1",
    });
    const id2 = addTask({
      agentId: "a2",
      scope: { type: "global" },
      intent: "task 2",
    });

    updateTaskStatus(id1, "completed");
    updateTaskStatus(id2, "running");

    clearCompletedTasks();

    const tasks = useAgentTaskStore.getState().tasks;
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe(id2);
  });

  describe("adversarial cases", () => {
    it("should handle updating a non-existent task safely", () => {
      const { updateTaskStatus } = useAgentTaskStore.getState();

      expect(() => {
        updateTaskStatus("ghost-task", "completed");
      }).not.toThrow();

      const tasks = useAgentTaskStore.getState().tasks;
      expect(tasks).toHaveLength(0);
    });

    it("should clear failed tasks as well as completed tasks", () => {
      const { addTask, updateTaskStatus, clearCompletedTasks } =
        useAgentTaskStore.getState();
      const id1 = addTask({
        agentId: "a1",
        scope: { type: "global" },
        intent: "task 1",
      });

      updateTaskStatus(id1, "failed");
      clearCompletedTasks();

      const tasks = useAgentTaskStore.getState().tasks;
      expect(tasks).toHaveLength(0);
    });
  });
});
