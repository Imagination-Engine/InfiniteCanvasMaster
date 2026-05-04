/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { AgentCanvasBlock } from "../AgentCanvasBlock";
import { useAgentTaskStore } from "../../state/agentTaskStore";

describe("AgentCanvasBlock", () => {
  const mockBlock = {
    id: "agent-1",
    type: "block",
    blockKind: "agent",
    x: 10,
    y: 10,
    width: 200,
    height: 200,
    status: "idle",
    data: { role: "Researcher" },
  };

  beforeEach(() => {
    useAgentTaskStore.setState({ tasks: [] });
    document.body.innerHTML = "";
  });

  it("should render the agent role", () => {
    const { getByText } = render(<AgentCanvasBlock block={mockBlock as any} />);
    expect(getByText("Researcher")).toBeDefined();
  });

  it("should render a running status indicator when active", () => {
    useAgentTaskStore.getState().addTask({
      agentId: "agent-1",
      intent: "Search web",
      scope: { type: "global" },
    });

    // Set to running
    const taskId = useAgentTaskStore.getState().tasks[0].id;
    useAgentTaskStore.getState().updateTaskStatus(taskId, "running");

    const { getAllByText } = render(
      <AgentCanvasBlock block={mockBlock as any} />,
    );
    expect(getAllByText("Status: running").length).toBeGreaterThan(0);
  });

  it("should render an approval gate UI when waiting-for-user", () => {
    useAgentTaskStore.getState().addTask({
      agentId: "agent-1",
      intent: "Delete blocks",
      scope: { type: "global" },
    });

    const taskId = useAgentTaskStore.getState().tasks[0].id;
    useAgentTaskStore.getState().updateTaskStatus(taskId, "waiting-for-user");

    const { getAllByText } = render(
      <AgentCanvasBlock block={mockBlock as any} />,
    );
    expect(getAllByText("Approval Required").length).toBeGreaterThan(0);
    expect(getAllByText("Approve").length).toBeGreaterThan(0);
    expect(getAllByText("Reject").length).toBeGreaterThan(0);
  });

  describe("adversarial cases", () => {
    it("should handle rapid consecutive approvals/rejections safely", () => {
      useAgentTaskStore.setState({ tasks: [] });
      useAgentTaskStore.getState().addTask({
        agentId: "agent-1",
        intent: "Rapid clicks",
        scope: { type: "global" },
      });

      const taskId = useAgentTaskStore.getState().tasks[0].id;
      useAgentTaskStore.getState().updateTaskStatus(taskId, "waiting-for-user");

      const { getAllByText } = render(
        <AgentCanvasBlock block={mockBlock as any} />,
      );
      const approveBtn = getAllByText("Approve")[0];

      // Click rapidly
      approveBtn.click();
      approveBtn.click();
      approveBtn.click();

      // Should not throw, and state should be running
      const task = useAgentTaskStore
        .getState()
        .tasks.find((t) => t.id === taskId);
      expect(task?.status).toBe("running");
    });
  });
});
